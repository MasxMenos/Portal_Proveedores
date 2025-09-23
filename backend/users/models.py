# backend/users/models.py

from django.db import models

class PrvUsuario(models.Model):
    id                 = models.AutoField(primary_key=True)
    usuario            = models.CharField(max_length=150, unique=True)
    clave              = models.CharField(max_length=128)
    bloqueado          = models.BooleanField(default=False)
    admin              = models.BooleanField(default=False)
    reset              = models.BooleanField(default=False)
    fecha_creacion     = models.DateTimeField()
    fecha_modificacion = models.DateTimeField()
    descripcion        = models.CharField(max_length=255, blank=True, null=True)
    correo             = models.CharField(max_length=255, blank=True, null=True)

    class Meta:
        db_table = 'prv_usuarios'
        managed  = False

    @property
    def is_authenticated(self):
        return True

    @property
    def is_anonymous(self):
        return False

    # ——— Sin hash: asignar y comparar texto plano ———
    def set_password(self, raw_password: str):
        # Guarda la contraseña tal cual en 'clave'
        self.clave = raw_password

    def check_password(self, raw_password: str) -> bool:
        # Compara texto plano
        return self.clave == raw_password
