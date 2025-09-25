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
    nit_base           = models.CharField(max_length=20, blank=True, null=True, unique=True)
    nit_dv             = models.SmallIntegerField(blank=True, null=True)
    tipo_doc           = models.CharField(max_length=2, default='31')
    form_last_completed = models.DateField(blank=True, null=True)
    require_form       = models.BooleanField(default=True)
    form_next_due      = models.DateField(blank=True, null=True, editable=False)

    class Meta:
        db_table = 'prv_usuarios'
        managed  = False   # <- lo dejas como está, porque esa tabla ya existe
        # índices que ya creaste en SQL; aquí solo referencia (Django no los creará con managed=False)
        indexes = [
            models.Index(fields=['require_form'], name='ix_prv_usuarios_require_form'),
            models.Index(fields=['form_next_due'], name='ix_prv_usuarios_form_next_due'),
        ]

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

    def __str__(self):
        return self.usuario or f'prv_user_{self.id}'
