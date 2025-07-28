# Certificates/services.py
from .clients import CertificatesClient
from .dtos    import CertificatesDTO
from datetime import datetime
from typing import List

def get_certificates(
    tipo_docto: str,
    nit:        str,
    from_date:  str = None,
    to_date:    str = None
) -> List[CertificatesDTO]:
    client = CertificatesClient()
    raw    = client.fetch_Certificates(tipo_docto, nit)

    # Extraemos la lista correcta:
    records = []
    if isinstance(raw, dict):
        detalle = raw.get("detalle") or raw.get("Detalle")  # 'detalle' o 'Detalle'
        if isinstance(detalle, dict):
            records = detalle.get("Table", [])

    results: List[CertificatesDTO] = []
    for item in records:
        # parsear fechas YYYY/MM/DD
        fp = datetime.strptime(item["FechaDocumento"], "%Y-%m-%d").date()

        # filtrar por rango
        if from_date and fp < datetime.fromisoformat(from_date).date():
            continue
        if to_date   and fp > datetime.fromisoformat(to_date).date():
            continue

        # crear DTO (co es fijo "099")
        dto = CertificatesDTO(
            documento         = item.get("Documento", ""),
            fecha_documento   = item.get("FechaDocumento", ""),
            valor_debito        = float(item.get("ValorDebito", 0)),
            valor_credito        = float(item.get("ValorCredito", 0)),
            co                 = item.get("CO", "099"),
        )
        results.append(dto)
        results.sort(key=lambda dto: dto.fecha_documento, reverse=True)

    return results
