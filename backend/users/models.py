# backend/users/models.py

from django.db import models

class PrvUsuario(models.Model):
    id                = models.AutoField(primary_key=True)
    usuario           = models.CharField(max_length=150, unique=True)
    clave             = models.CharField(max_length=128)
    bloqueado         = models.BooleanField(default=False)
    admin             = models.BooleanField(default=False)
    reset             = models.BooleanField(default=False)
    fecha_creacion    = models.DateTimeField()
    fecha_modificacion= models.DateTimeField()
    descripcion       = models.CharField(max_length=255, blank=True, null=True)
    correo             = models.CharField(max_length=255, blank=True, null=True)

    class Meta:
        db_table = 'prv_usuarios'
        managed = False   # Django no creará ni alterará esta tabla

    # Añade estos métodos/properties para que DRF los reconozca:
    @property
    def is_authenticated(self):
        # Siempre True: este objeto ya vino de tu JWTAuth con éxito
        return True

    @property
    def is_anonymous(self):
        return False