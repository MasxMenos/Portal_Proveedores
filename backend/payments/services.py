# payments/services.py
from .clients import PaymentsClient
from .dtos    import PaymentsDTO
from datetime import datetime
from typing import List

def get_payments(
    tipo_docto: str,
    nit:        str,
    from_date:  str = None,
    to_date:    str = None
) -> List[PaymentsDTO]:
    client = PaymentsClient()
    raw    = client.fetch_payments(tipo_docto, nit)

    # Extraemos la lista correcta:
    records = []
    if isinstance(raw, dict):
        detalle = raw.get("detalle") or raw.get("Detalle")  # 'detalle' o 'Detalle'
        if isinstance(detalle, dict):
            records = detalle.get("Table", [])

    results: List[PaymentsDTO] = []
    for item in records:
        # parsear fechas YYYY/MM/DD
        fp = datetime.strptime(item["FechaDocumento"], "%Y-%m-%d").date()

        # filtrar por rango
        if from_date and fp < datetime.fromisoformat(from_date).date():
            continue
        if to_date   and fp > datetime.fromisoformat(to_date).date():
            continue

        # crear DTO (co es fijo "099")
        dto = PaymentsDTO(
            documento         = item.get("Documento", ""),
            fecha_documento   = item.get("FechaDocumento", ""),
            valor_debito        = float(item.get("ValorDebito", 0)),
            valor_credito        = float(item.get("ValorCredito", 0)),
            co                 = item.get("CO", "099"),
        )
        results.append(dto)

    return results
