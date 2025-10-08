import os
import re
import uuid
from datetime import timedelta, date
from django.conf import settings
from django.db import transaction
from django.utils.timezone import now

from .models import (
    KycFormSubmission, KycDocument, KycDocumentType,
    GeoCountry, GeoRegion, GeoCity, Bank
)

# ================
# Config de archivos (URL por nombre de archivo)
# ================
# Puedes sobreescribir estas rutas/URLs en settings.py
# por ejemplo:
# KYC_DOCS_FILESYSTEM_DIR = "/var/www/html/documatic/php/documentos"
# KYC_DOCS_PUBLIC_BASE_URL = "http://152.200.181.42/documatic/php/documentos"
FILESYSTEM_DIR   = getattr(settings, "KYC_DOCS_FILESYSTEM_DIR", "/var/www/html/documatic/php/documentos")
PUBLIC_BASE_URL  = getattr(settings, "KYC_DOCS_PUBLIC_BASE_URL", "http://152.200.181.42/documatic/php/documentos")

SAFE_NAME_RE = re.compile(r"[^A-Za-z0-9._-]+")


def _safe_filename(original_name: str) -> str:
    """
    Genera un nombre de archivo seguro con prefijo UUID para evitar colisiones.
    """
    name = os.path.basename(original_name or "").strip()
    name = SAFE_NAME_RE.sub("_", name)
    unique = uuid.uuid4().hex[:12]
    if "." in name:
        root, ext = os.path.splitext(name)
        return f"{unique}_{root}{ext}"
    return f"{unique}_{name or 'file'}"


def _ensure_dir(path: str):
    os.makedirs(path, exist_ok=True)


# ==========================
# Crear nueva versión del formulario
# ==========================
@transaction.atomic
def create_new_submission(user, data: dict) -> KycFormSubmission:
    """
    - Marca como no vigentes las versiones anteriores.
    - Crea una versión nueva con version = max + 1 (o 1 si no hay).
    - La marca como current.
    - Actualiza prv_usuarios.form_last_completed y form_next_due (+6 meses).
    """
    # 1) Desactivar current anteriores
    KycFormSubmission.objects.filter(user=user, is_current=True).update(is_current=False)

    # 2) Calcular versión siguiente
    last = KycFormSubmission.objects.filter(user=user).order_by("-version").first()
    next_version = (last.version + 1) if last else 1

    # 3) Crear nueva
    sub = KycFormSubmission.objects.create(
        user=user,
        version=next_version,
        is_current=True,
        # Campos del payload
        tipo_doc=data.get("tipo_doc"),
        nit_base=data.get("nit_base"),
        nit_dv=data.get("nit_dv"),

        primer_nombre=data.get("primer_nombre"),
        otros_nombres=data.get("otros_nombres"),
        primer_apellido=data.get("primer_apellido"),
        segundo_apellido=data.get("segundo_apellido"),

        direccion_fiscal=data.get("direccion_fiscal"),

        country_id=data.get("country_id"),
        region_id=data.get("region_id"),
        city_id=data.get("city_id"),

        telefono1=data.get("telefono1"),
        correo=data.get("correo"),
        activos_virtuales=data.get("activos_virtuales"),

        contacto_nombres=data.get("contacto_nombres"),
        contacto_apellidos=data.get("contacto_apellidos"),
        contacto_tel_oficina=data.get("contacto_tel_oficina"),
        contacto_cel_corporativo=data.get("contacto_cel_corporativo"),
        contacto_correo_pedidos=data.get("contacto_correo_pedidos"),

        pep_actual=data.get("pep_actual"),
        pep_ult2anios=data.get("pep_ult2anios"),
        pep_parentesco=data.get("pep_parentesco"),
        pep_organizaciones_internacionales=data.get("pep_organizaciones_internacionales"),
        pep_extranjero=data.get("pep_extranjero"),

        ingresos_anuales=data.get("ingresos_anuales"),
        egresos_anuales=data.get("egresos_anuales"),
        otros_ingresos_anuales=data.get("otros_ingresos_anuales"),
        concepto_otros_ingresos=data.get("concepto_otros_ingresos"),
        activos=data.get("activos"),
        pasivos=data.get("pasivos"),
        patrimonio=data.get("patrimonio"),

        ciiu_code=data.get("ciiu_code"),
        gran_contribuyente=data.get("gran_contribuyente"),
        gran_contribuyente_resolucion=data.get("gran_contribuyente_resolucion"),
        autoretenedor_renta=data.get("autoretenedor_renta"),
        autoretenedor_renta_resolucion=data.get("autoretenedor_renta_resolucion"),
        contribuyente_renta=data.get("contribuyente_renta"),
        regimen_esal=data.get("regimen_esal"),
        responsable_iva=data.get("responsable_iva"),
        regimen_simple=data.get("regimen_simple"),
        responsable_ica=data.get("responsable_ica"),
        ica_codigo=data.get("ica_codigo"),
        ica_tarifa_millar=data.get("ica_tarifa_millar"),
        ica_ciudad=data.get("ica_ciudad"),
        gran_contribuyente_ica_bucaramanga=data.get("gran_contribuyente_ica_bucaramanga"),
        obligado_fe=data.get("obligado_fe"),
        lleva_contabilidad=data.get("lleva_contabilidad"),
        cargo=data.get("cargo"),
        correo_fe=data.get("correo_fe"),

        bank_country_id=data.get("bank_country_id"),
        bank_id=data.get("bank_id"),
        banco_cuenta_numero=data.get("banco_cuenta_numero"),
        banco_cuenta_titular=data.get("banco_cuenta_titular"),
        banco_cuenta_tipo=data.get("banco_cuenta_tipo"),
        correo_tesoreria=data.get("correo_tesoreria"),

        origen_recursos_desc=data.get("origen_recursos_desc"),
        acepta_politicas=bool(data.get("acepta_politicas")),
        acepta_otras_declaraciones=bool(data.get("acepta_otras_declaraciones")),
        acepta_veracidad_info=bool(data.get("acepta_veracidad_info")),
        acepta_tratamiento_datos=bool(data.get("acepta_tratamiento_datos")),
        completed_at=None,
    )

    # 4) Actualizar prv_usuarios (no toco el resto de columnas)
    #    - form_last_completed = hoy
    #    - form_next_due = hoy + 6 meses (≈ 180 días)
    user.nit_dv = data.get("nit_dv")
    user.correo = (data.get("correo") or "").upper()
    user.save(update_fields=["nit_dv", "correo"])

    return sub


# ==========================
# Guardar documento físico y registro
# ==========================
def save_uploaded_document(submission: KycFormSubmission, tipo_code: str, in_memory_file, fecha: str | None = None) -> KycDocument:
    """
    - Resuelve el tipo por code (ej: 'RUT', 'CERT_CUENTA', etc.)
    - Guarda archivo en FILESYSTEM_DIR con nombre seguro
    - Genera URL pública basada en PUBLIC_BASE_URL
    - Calcula expires_at si aplica (fecha explícita o por expires_in_days)
    """
    tipo = KycDocumentType.objects.filter(code=tipo_code).first()
    if not tipo:
        raise ValueError(f"Tipo de documento '{tipo_code}' no configurado.")

    # seguridad nombre
    safe_name = _safe_filename(getattr(in_memory_file, "name", "documento.pdf"))

    # guardar a disco
    _ensure_dir(FILESYSTEM_DIR)
    full_path = os.path.join(FILESYSTEM_DIR, safe_name)

    with open(full_path, "wb") as out:
        for chunk in getattr(in_memory_file, "chunks", lambda: [in_memory_file.read()])():
            out.write(chunk)

    # URL pública
    public_url = f"{PUBLIC_BASE_URL.rstrip('/')}/{safe_name}"

    # Vencimiento
    expires_at = None
    # 1) Si llega 'fecha' (string 'YYYY-MM-DD') úsala como expires_at
    if fecha:
        try:
            y, m, d = fecha.split("-")
            expires_at = date(int(y), int(m), int(d))
        except Exception:
            expires_at = None
    # 2) Si no, y el tipo tiene expires_in_days, calcular desde hoy
    if not expires_at and tipo.expires_in_days:
        expires_at = (now() + timedelta(days=int(tipo.expires_in_days))).date()

    # Crear registro
    doc = KycDocument.objects.create(
        submission=submission,
        tipo=tipo,
        filename=safe_name,
        url=public_url,
        expires_at=expires_at
    )
    return doc
