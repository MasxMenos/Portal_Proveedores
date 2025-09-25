# backend/kyc/serializers.py
from rest_framework import serializers
from .models import (
    GeoCountry, GeoRegion, GeoCity, Bank,
    KycDocumentType, KycDocument, KycFormSubmission
)

# --------- Catálogos ----------
class GeoCountrySerializer(serializers.ModelSerializer):
    class Meta:
        model = GeoCountry
        fields = ("id", "code", "name")


class GeoRegionSerializer(serializers.ModelSerializer):
    # OJO: NO usar source='country_id'. DRF accede al atributo country_id del modelo.
    class Meta:
        model = GeoRegion
        fields = ("id", "country_id", "code", "name")


class GeoCitySerializer(serializers.ModelSerializer):
    # Igual aquí: nada de source.
    class Meta:
        model = GeoCity
        fields = ("id", "region_id", "name")


class BankSerializer(serializers.ModelSerializer):
    class Meta:
        model = Bank
        fields = ("id", "country_id", "name")


class KycDocumentTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = KycDocumentType
        fields = ("id", "code", "name", "obligatorio", "expires_in_days")


class KycDocumentSerializer(serializers.ModelSerializer):
    tipo_code = serializers.CharField(source="tipo.code", read_only=True)
    tipo_name = serializers.CharField(source="tipo.name", read_only=True)

    class Meta:
        model = KycDocument
        fields = ("id", "submission_id", "tipo_id", "tipo_code", "tipo_name",
                  "filename", "url", "uploaded_at", "expires_at")


# --------- KYC Submission ----------
class KycFormSubmissionSerializer(serializers.ModelSerializer):
    # Exponemos los *_id directamente (sin source).
    class Meta:
        model = KycFormSubmission
        fields = (
            "id", "user_id", "version", "is_current", "created_at", "completed_at",

            "tipo_doc", "nit_base", "nit_dv",
            "primer_nombre", "otros_nombres", "primer_apellido", "segundo_apellido",
            #"nombres", "apellidos",
            "direccion_fiscal",

            "country_id", "region_id", "city_id",
            "telefono1", "correo",
            "activos_virtuales",

            "contacto_nombres", "contacto_apellidos",
            "contacto_tel_oficina", "contacto_cel_corporativo",
            "contacto_correo_pedidos",

            "pep_actual", "pep_ult2anios", "pep_parentesco",
            "pep_organizaciones_internacionales", "pep_extranjero",

            "ingresos_anuales", "egresos_anuales", "otros_ingresos_anuales",
            "concepto_otros_ingresos", "activos", "pasivos", "patrimonio",

            "ciiu_code", "gran_contribuyente", "gran_contribuyente_resolucion",
            "autoretenedor_renta", "autoretenedor_renta_resolucion",
            "contribuyente_renta", "regimen_esal", "responsable_iva",
            "regimen_simple", "responsable_ica",
            "ica_codigo", "ica_tarifa_millar", "ica_ciudad",
            "gran_contribuyente_ica_bogota", "obligado_fe", "correo_fe",

            "bank_country_id", "bank_id",
            "banco_cuenta_numero", "banco_cuenta_titular", "banco_cuenta_tipo",
            "correo_tesoreria",

            "origen_recursos_desc",
            "acepta_politicas", "acepta_otras_declaraciones",
            "acepta_veracidad_info", "acepta_tratamiento_datos",
        )
        read_only_fields = ("id", "user_id", "version", "is_current", "created_at", "completed_at")
