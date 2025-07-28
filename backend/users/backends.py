# backend/users/backends.py

from django.contrib.auth.backends import BaseBackend
from .models import PrvUsuario

class PrvUsuarioBackend(BaseBackend):
    """
    Autentica contra la tabla prv_usuarios usando campos 'usuario' y 'clave' en texto plano.
    """
    def authenticate(self, request, username=None, password=None, **kwargs):
        
        try:
            u = PrvUsuario.objects.get(usuario=username)
        except PrvUsuario.DoesNotExist:
            print(f"[PrvUsuarioBackend] No existe usuario {username!r}")
            return None

        if u.clave.strip() != password.strip():
            print(f"Clave inválida para {username!r} (DB={u.clave!r}, input={password!r})")
            return None

        if u.bloqueado:
            print(f"[PrvUsuarioBackend] Usuario {username!r} está bloqueado")
            return None

        print(f"[PrvUsuarioBackend] Autenticación exitosa para {username!r}")
        u.is_active = True
        u.is_staff  = u.admin
        u.is_superuser = u.admin
        return u

    def get_user(self, user_id):
        try:
            return PrvUsuario.objects.get(pk=user_id)
        except PrvUsuario.DoesNotExist:
            return None
