# users/serializers.py
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.exceptions import AuthenticationFailed
from django.contrib.auth import authenticate
from .backends import PrvUsuarioBackend
from rest_framework import serializers
from .models import PrvUsuario
from django.contrib.auth.hashers import check_password, make_password


class PrvTokenObtainPairSerializer(TokenObtainPairSerializer):
    """
    Validación a medida: solo chequea que PrvUsuarioBackend
    devuelva un user != None, sin mirar is_active.
    """
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        # opcional: añade datos al token
        token["usuario"] = user.username
        return token

    def validate(self, attrs):
        username = attrs.get(self.username_field)
        password = attrs.get("password")

        # Autenticar directamente con tu backend
        user = PrvUsuarioBackend().authenticate(
            request=self.context.get("request"),
            username=username,
            password=password
        )
        if user is None:
            raise AuthenticationFailed("Credenciales inválidas", "no_active_account")

        # Creamos el refresh & access
        refresh = self.get_token(user)
        data = {
            "refresh": str(refresh),
            "access":  str(refresh.access_token),
        }
        return data



class ProfileSerializer(serializers.Serializer):
    usuario           = serializers.CharField(required=True)
    descripcion       = serializers.CharField(required=False, allow_blank=True)
    correo             = serializers.EmailField(required=False, allow_blank=True)
    current_password  = serializers.CharField(write_only=True, required=False)
    new_password      = serializers.CharField(write_only=True, required=False)

    def update(self, instance: PrvUsuario, validated_data):
        cur = validated_data.get('current_password')
        new = validated_data.get('new_password')

        # Si solicitan cambio de password, ambos campos son obligatorios
        if cur or new:
            if not cur or not new:
                raise serializers.ValidationError(
                    "Para cambiar contraseña debes proveer la actual y la nueva."
                )
            # Comparamos sin espacios
            if instance.clave.strip() != cur.strip():
                raise serializers.ValidationError({
                    'current_password': "Contraseña actual incorrecta."
                })
            # Asignamos la nueva (también sin espacios)
            instance.clave = new.strip()

        # Actualizamos los demás campos
        instance.usuario     = validated_data.get('usuario', instance.usuario).strip()
        instance.descripcion = validated_data.get('descripcion', instance.descripcion)
        instance.correo       = validated_data.get('correo', instance.correo)



        # Como tu modelo es managed=False, usamos update()
        PrvUsuario.objects.filter(pk=instance.id).update(
            usuario=instance.usuario,
            descripcion=instance.descripcion,
            correo=instance.correo,
            clave=instance.clave,
            fecha_modificacion=instance.fecha_modificacion
        )

        return instance
