# backend/users/authentication.py

from rest_framework_simplejwt.authentication import JWTAuthentication as BaseJWT
from rest_framework_simplejwt.exceptions import AuthenticationFailed
from django.conf import settings
from .models import PrvUsuario

class PrvUsuarioJWTAuthentication(BaseJWT):
    """
    Extrae del JWT el claim USER_ID_CLAIM y carga el PrvUsuario correspondiente.
    """
    def get_user(self, validated_token):
        # DEBUG: ver payload completo
        print(">> [PrvUsuarioJWTAuth] payload:", validated_token)

        # El claim por defecto es settings.SIMPLE_JWT['USER_ID_CLAIM'], normalmente 'user_id'
        claim = settings.SIMPLE_JWT.get('USER_ID_CLAIM', 'user_id')
        user_id = validated_token.get(claim)
        print(f">> [PrvUsuarioJWTAuth] {claim} = {user_id}")

        if user_id is None:
            raise AuthenticationFailed('Token válido pero sin user_id', code='no_user_id')

        try:
            user = PrvUsuario.objects.get(pk=user_id)
        except PrvUsuario.DoesNotExist:
            raise AuthenticationFailed(f'Usuario no existe (id={user_id})', code='user_not_found')
        return user
