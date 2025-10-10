# backend/users/views.py

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import viewsets, status
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.permissions import IsAuthenticated
from .models import PrvUsuario
from .authentication import PrvUsuarioJWTAuthentication
from users.clients import usersClient
from django.utils import timezone
import random
import string
from django.db.models import F
from homepage.models import Counter
from .serializers import ProviderLiteSerializer
from django.db.models import Q




class LoginView(APIView):
    def post(self, request):
        username = request.data.get("username", "").strip()
        password = request.data.get("password", "").strip()

        # 1) Llamo a Siesa
        client = usersClient()
        try:
            raw = client.fetch_users(username)
        except Exception:
            return Response(
                {"detail": "Error al validar usuario en Siesa."},
                status=status.HTTP_503_SERVICE_UNAVAILABLE
            )

        tabla = raw.get("detalle", {}).get("Table", [])

        # 2) Sincronizo con BD local
        try:
            user = PrvUsuario.objects.get(usuario=username)
            # ... lógica de actualización/bloqueo igual que antes ...
        except PrvUsuario.DoesNotExist:
            if tabla:
                info = tabla[0]
                sis_user = info.get("Usuario", "").strip()
                if sis_user != username:
                    # Si el usuario de Siesa no coincide con el ingresado, rechazamos
                    return Response(
                        {"detail": "El usuario ingresado no coincide con el registro en Siesa."},
                        status=status.HTTP_401_UNAUTHORIZED
                    )
                # Coincide → creamos en la BD con clave "0000"
                user = PrvUsuario.objects.create(
                    usuario          = username,
                    descripcion      = info.get("Descripcion", ""),
                    correo           = info.get("Correo", ""),
                    clave            = "0000",
                    bloqueado        = False,
                    admin            = False,
                    reset            = True,
                    fecha_creacion   = timezone.now(),
                    fecha_modificacion = timezone.now(),
                )
            else:
                # No existe en ningún lado → rechazo
                return Response(
                    {"detail": "Usuario no existe."},
                    status=status.HTTP_401_UNAUTHORIZED,
                )

        # 3) Autentico contra la BD local
        user = authenticate(request, username=username, password=password)
        if not user or getattr(user, "bloqueado", False):
            return Response(
                {'detail': 'Credenciales inválidas o usuario bloqueado.'},
                status=status.HTTP_401_UNAUTHORIZED
            )

        # 4) Genero tokens JWT
        refresh = RefreshToken.for_user(user)
        username_lower = (getattr(user, "usuario", "") or "").strip().lower()
        if not getattr(user, "admin", False) and username_lower != "admin":
            obj, created = Counter.objects.get_or_create(key="visits", defaults={"value": 0})
            Counter.objects.filter(pk=obj.pk).update(value=F("value") + 1)
        
        return Response({
            'access':  str(refresh.access_token),
            'refresh': str(refresh),
            'user': {
                'id':       user.id,
                'username': user.usuario,
                'is_admin': user.admin,
            }
        })


class ProfileViewSet(viewsets.ViewSet):
    authentication_classes = [PrvUsuarioJWTAuthentication]
    permission_classes     = [IsAuthenticated]

    def list(self, request):
        user: PrvUsuario = request.user
        return Response({
            'usuario':     user.usuario.strip(),
            'descripcion': user.descripcion,
            'correo':      user.correo,
        })

    def update(self, request, pk=None):
        user: PrvUsuario = request.user
        current = request.data.get("current_password", "").strip()
        new_pw  = request.data.get("new_password",    "").strip()

        # 1) Verificar que no haya espacios en blanco en la nueva contraseña
        if " " in new_pw:
            return Response(
                {"detail": "La nueva contraseña no puede contener espacios en blanco."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Validación: nueva contraseña de al menos 4 caracteres
        if len(new_pw) < 4:
            return Response(
                {"detail": "La nueva contraseña debe tener al menos 4 caracteres."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # (Opcional) Podrías reactivar la verificación de la contraseña actual:
        if not current.strip() or current.strip() != user.clave.strip():
            return Response(
                {"detail": "Contraseña actual incorrecta."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Solo actualizo la contraseña (sin hashing)
        user.clave = new_pw
        user.fecha_modificacion = timezone.now()
        user.save(update_fields=["clave", "fecha_modificacion"])

        return Response({"detail": "Contraseña actualizada con éxito"})

class PasswordResetView(APIView):
    """
    POST /api/users/password-reset/
    Body: { "username": "...", "correo": "usuario@dominio.com" }
    """

    def post(self, request):
        username    = request.data.get("username", "").strip()
        correo_input = request.data.get("correo", "").strip().lower()

        # 1) Buscamos el usuario por username
        try:
            user = PrvUsuario.objects.get(usuario=username)
        except PrvUsuario.DoesNotExist:
            return Response(
                {"detail": "Usuario no existe."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # 2) Comparamos el correo proporcionado con el registrado
        correo_reg = (user.correo or "").strip().lower()
        if correo_input != correo_reg:
            # construimos la pista: últimos 2 dígitos antes de @
            local_part, _, domain = correo_reg.partition("@")
            suffix = local_part[-2:] if len(local_part) >= 2 else local_part
            hint = f"**{suffix}@{domain}"
            return Response(
                {
                    "detail": (
                        "El correo ingresado no coincide con el registrado, "
                        f"termina en {hint}"
                    )
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # 3) Generamos nueva clave de 4 caracteres alfanuméricos
        new_pw = "".join(
            random.choices(string.ascii_letters + string.digits, k=4)
        )

        # 4) Guardamos en la BD
        user.clave = new_pw
        user.fecha_modificacion = timezone.now()
        user.save(update_fields=["clave", "fecha_modificacion"])

        # 5) Respondemos al cliente con la nueva contraseña
        return Response(
            {
                "detail": "Contraseña restablecida con éxito",
                "new_password": new_pw
            }
        )

class ProvidersListView(APIView):
    """
    GET /api/users/providers?q=texto
    Solo admin. Devuelve [{usuario, descripcion}, ...]
    """
    authentication_classes = [PrvUsuarioJWTAuthentication]
    permission_classes     = [IsAuthenticated]

    def get(self, request):
        # Solo administradores
        req_user = request.user
        if not getattr(req_user, "admin", False):
            return Response({"detail": "No autorizado."}, status=status.HTTP_403_FORBIDDEN)

        q = (request.query_params.get("q") or "").strip()

        qs = (
            PrvUsuario.objects
            .filter(bloqueado=False)
            .exclude(usuario__iexact="admin")
        )

        if q:
            qs = qs.filter(
                Q(descripcion__icontains=q) |
                Q(usuario__icontains=q)
            )

        # Orden sugerido: por descripcion y respaldo por usuario
        qs = qs.order_by("descripcion", "usuario")[:50]

        data = ProviderLiteSerializer(qs, many=True).data
        return Response(data)