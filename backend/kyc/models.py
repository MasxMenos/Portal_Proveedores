# backend/kyc/models.py
from django.db import models
from django.utils import timezone

# Modelo de usuarios existente
from users.models import PrvUsuario


# ==========================
# Catálogos normalizados
# ==========================
class GeoCountry(models.Model):
    id   = models.AutoField(primary_key=True)
    code = models.CharField(max_length=3)      # 'CO', 'US', etc.
    name = models.CharField(max_length=100)

    class Meta:
        db_table = 'geo_country'
        managed  = False
        indexes  = [
            models.Index(fields=['code']),
            models.Index(fields=['name']),
        ]

    def __str__(self):
        return f"{self.code} - {self.name}"


class GeoRegion(models.Model):
    id      = models.AutoField(primary_key=True)
    country = models.ForeignKey(
        GeoCountry,
        on_delete=models.DO_NOTHING,
        db_column='country_id',
        related_name='regions'
    )
    code = models.CharField(max_length=10, null=True, blank=True)  # DANE depto
    name = models.CharField(max_length=100)

    class Meta:
        db_table = 'geo_region'
        managed  = False
        indexes  = [
            models.Index(fields=['country', 'code']),
            models.Index(fields=['country', 'name']),
        ]

    def __str__(self):
        return f"{self.code or ''} {self.name}".strip()


class GeoCity(models.Model):
    id     = models.AutoField(primary_key=True)
    region = models.ForeignKey(
        GeoRegion,
        on_delete=models.DO_NOTHING,
        db_column='region_id',
        related_name='cities'
    )
    name = models.CharField(max_length=120)

    class Meta:
        db_table = 'geo_city'
        managed  = False
        indexes  = [
            models.Index(fields=['region', 'name']),
        ]

    def __str__(self):
        return self.name


class Bank(models.Model):
    id      = models.AutoField(primary_key=True)
    country = models.ForeignKey(
        GeoCountry,
        on_delete=models.DO_NOTHING,
        db_column='country_id',
        related_name='banks'
    )
    name = models.CharField(max_length=150)

    class Meta:
        db_table = 'bank'
        managed  = False
        indexes  = [
            models.Index(fields=['country', 'name']),
        ]

    def __str__(self):
        return self.name


# ==========================
# Tipos de documento KYC
# ==========================
class KycDocumentType(models.Model):
    # En tu tabla NO hay 'id', así que 'code' es la PK
    code             = models.CharField(max_length=40, primary_key=True)  # p.ej. 'RUT', 'CERT_CUENTA'
    name             = models.CharField(max_length=200)
    obligatorio      = models.BooleanField(default=False)
    #expires_at  = models.IntegerField(null=True, blank=True)

    class Meta:
        db_table = 'kyc_document_types'
        managed  = False

    def __str__(self):
        return f"{self.code} - {self.name}"


# ==========================
# Formulario / envío KYC
# ==========================
class KycFormSubmission(models.Model):
    id           = models.AutoField(primary_key=True)
    user         = models.ForeignKey(
        PrvUsuario,
        on_delete=models.DO_NOTHING,
        db_column='user_id',
        related_name='kyc_submissions'
    )
    version      = models.IntegerField(default=1)
    is_current   = models.BooleanField(default=True)
    created_at   = models.DateTimeField(default=timezone.now)
    completed_at = models.DateTimeField(null=True, blank=True)

    # --------- Persona natural (básica) ----------
    tipo_doc    = models.CharField(max_length=4, null=True, blank=True)  # '31', '13', etc.
    nit_base    = models.CharField(max_length=20, null=True, blank=True)
    nit_dv      = models.CharField(max_length=3, null=True, blank=True)

    primer_nombre    = models.CharField(max_length=100, null=True, blank=True)
    otros_nombres    = models.CharField(max_length=100, null=True, blank=True)
    primer_apellido  = models.CharField(max_length=100, null=True, blank=True)
    segundo_apellido = models.CharField(max_length=100, null=True, blank=True)
    direccion_fiscal = models.CharField(max_length=255, null=True, blank=True)

    # Ubicación normalizada
    country = models.ForeignKey(
        GeoCountry, on_delete=models.DO_NOTHING,
        db_column='country_id', null=True, blank=True
    )
    region = models.ForeignKey(
        GeoRegion, on_delete=models.DO_NOTHING,
        db_column='region_id', null=True, blank=True
    )
    city = models.ForeignKey(
        GeoCity, on_delete=models.DO_NOTHING,
        db_column='city_id', null=True, blank=True
    )

    telefono1 = models.CharField(max_length=40, null=True, blank=True)
    correo    = models.CharField(max_length=255, null=True, blank=True)

    activos_virtuales = models.BooleanField(null=True, blank=True)

    # --------- Contacto de pedidos ----------
    contacto_nombres         = models.CharField(max_length=150, null=True, blank=True)
    contacto_apellidos       = models.CharField(max_length=150, null=True, blank=True)
    contacto_tel_oficina     = models.CharField(max_length=40,  null=True, blank=True)
    contacto_cel_corporativo = models.CharField(max_length=40,  null=True, blank=True)
    contacto_correo_pedidos  = models.CharField(max_length=255, null=True, blank=True)

    # --------- PEP ----------
    pep_actual                         = models.BooleanField(null=True, blank=True)
    pep_ult2anios                      = models.BooleanField(null=True, blank=True)
    pep_parentesco                     = models.BooleanField(null=True, blank=True)
    pep_organizaciones_internacionales = models.BooleanField(null=True, blank=True)
    pep_extranjero                     = models.BooleanField(null=True, blank=True)

    # --------- Financiera ----------
    ingresos_anuales       = models.DecimalField(max_digits=18, decimal_places=2, null=True, blank=True)
    egresos_anuales        = models.DecimalField(max_digits=18, decimal_places=2, null=True, blank=True)
    otros_ingresos_anuales = models.DecimalField(max_digits=18, decimal_places=2, null=True, blank=True)
    concepto_otros_ingresos= models.CharField(max_length=255, null=True, blank=True)
    activos                = models.DecimalField(max_digits=18, decimal_places=2, null=True, blank=True)
    pasivos                = models.DecimalField(max_digits=18, decimal_places=2, null=True, blank=True)
    patrimonio             = models.DecimalField(max_digits=18, decimal_places=2, null=True, blank=True)

    # --------- Tributaria ----------
    ciiu_code                     = models.CharField(max_length=10,  null=True, blank=True)
    gran_contribuyente            = models.BooleanField(null=True, blank=True)
    gran_contribuyente_resolucion = models.CharField(max_length=100, null=True, blank=True)
    autoretenedor_renta           = models.BooleanField(null=True, blank=True)
    autoretenedor_renta_resolucion= models.CharField(max_length=100, null=True, blank=True)
    contribuyente_renta           = models.BooleanField(null=True, blank=True)
    regimen_esal                  = models.BooleanField(null=True, blank=True)
    responsable_iva               = models.BooleanField(null=True, blank=True)
    regimen_simple                = models.BooleanField(null=True, blank=True)
    responsable_ica               = models.BooleanField(null=True, blank=True)
    ica_codigo                    = models.CharField(max_length=40,  null=True, blank=True)
    ica_tarifa_millar             = models.DecimalField(max_digits=10, decimal_places=4, null=True, blank=True)
    ica_ciudad                    = models.CharField(max_length=120, null=True, blank=True)
    gran_contribuyente_ica_bogota = models.BooleanField(null=True, blank=True)
    obligado_fe                   = models.BooleanField(null=True, blank=True)
    correo_fe                     = models.CharField(max_length=255, null=True, blank=True)

    # --------- Bancaria ----------
    bank_country = models.ForeignKey(
        GeoCountry, on_delete=models.DO_NOTHING,
        db_column='bank_country_id', null=True, blank=True,
        related_name='bank_country_submissions'
    )
    bank = models.ForeignKey(
        Bank, on_delete=models.DO_NOTHING,
        db_column='bank_id', null=True, blank=True
    )
    banco_cuenta_numero  = models.CharField(max_length=60,  null=True, blank=True)
    banco_cuenta_titular = models.CharField(max_length=150, null=True, blank=True)
    banco_cuenta_tipo    = models.CharField(max_length=40,  null=True, blank=True)
    correo_tesoreria     = models.CharField(max_length=255, null=True, blank=True)

    # --------- Declaraciones ----------
    origen_recursos_desc       = models.TextField(null=True, blank=True)
    acepta_politicas           = models.BooleanField(default=False)
    acepta_otras_declaraciones = models.BooleanField(default=False)
    acepta_veracidad_info      = models.BooleanField(default=False)
    acepta_tratamiento_datos   = models.BooleanField(default=False)

    class Meta:
        db_table = 'kyc_form_submissions'
        managed  = False
        indexes  = [
            models.Index(fields=['user', 'is_current']),
            models.Index(fields=['created_at']),
        ]

    def __str__(self):
        return f"KYC #{self.id} - user:{self.user_id} v{self.version} ({'current' if self.is_current else 'old'})"


# ==========================
# Documentos KYC
# ==========================
class KycDocument(models.Model):
    id               = models.AutoField(primary_key=True)
    submission       = models.ForeignKey(
        KycFormSubmission, on_delete=models.DO_NOTHING,
        db_column='submission_id', related_name='documents'
    )
    # Ojo: en DB la col es "tipo" (int o FK?). Asumimos FK a kyc_document_types.id
    tipo             = models.ForeignKey(
        KycDocumentType, on_delete=models.DO_NOTHING,
        db_column='tipo', related_name='documents'
    )

    original_filename = models.CharField(max_length=255, null=True, blank=True)
    stored_filename   = models.CharField(max_length=255)
    url               = models.CharField(max_length=800)      # URL pública o relativa
    uploaded_at       = models.DateTimeField(default=timezone.now)
    doc_date          = models.DateField(null=True, blank=True)
    expires_at        = models.DateField(null=True, blank=True)
    is_valid          = models.BooleanField(default=True)

    class Meta:
        db_table = 'kyc_documents'
        managed  = False
        indexes  = [
            models.Index(fields=['submission']),
            models.Index(fields=['tipo']),
            models.Index(fields=['expires_at']),
        ]

    def __str__(self):
        return f"{self.stored_filename} -> {self.url}"
