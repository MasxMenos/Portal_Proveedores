# backend/users/views.py

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import viewsets, status
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.permissions import IsAuthenticated
from .models import PrvUsuario
from .serializers import ProfileSerializer
from users.backends import PrvUsuarioBackend
from .authentication import PrvUsuarioJWTAuthentication



class LoginView(APIView):
    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
       

        user = authenticate(request, username=username, password=password)
        

        if not user:
            return Response(
                {'detail': 'Credenciales inválidas o usuario bloqueado.'},
                status=status.HTTP_401_UNAUTHORIZED
            )

        refresh = RefreshToken.for_user(user)
        return Response({
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user': {
                'id': user.id,
                'username': user.usuario,
                'is_admin': user.admin,
            }
        })

class ProfileViewSet(viewsets.ViewSet):
    authentication_classes = [PrvUsuarioJWTAuthentication]
    permission_classes     = [IsAuthenticated]

    def list(self, request):
        # GET /api/users/profile/
        instance: PrvUsuario = request.user  # viene de tu PrvUsuarioBackend
        return Response({
            'usuario':     instance.usuario.strip(),
            'descripcion': instance.descripcion,
            'correo':       instance.correo,
        })

    def update(self, request, pk=None):
        # PUT /api/users/profile/
        instance: PrvUsuario = request.user
        serializer = ProfileSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.update(instance, serializer.validated_data)
        return Response({'detail': 'Perfil actualizado'})