# returns/services.py
from .clients import ReturnsClient
from .dtos    import ReturnsDTO
from datetime import datetime
from typing import List

def get_returns(
    tipo_docto: str,
    nit:        str,
    from_date:  str = None,
    to_date:    str = None
) -> List[ReturnsDTO]:
    client = ReturnsClient()
    raw    = client.fetch_returns(tipo_docto, nit)

    # Extraemos la lista correcta:
    records = []
    if isinstance(raw, dict):
        detalle = raw.get("detalle") or raw.get("Detalle")  # 'detalle' o 'Detalle'
        if isinstance(detalle, dict):
            records = detalle.get("Table", [])

    results: List[ReturnsDTO] = []
    for item in records:
        # parsear fechas YYYY/MM/DD
        fp = datetime.strptime(item["FechaEmision"], "%Y-%m-%d").date()
        

        # filtrar por rango
        if from_date and fp < datetime.fromisoformat(from_date).date():
            continue
        if to_date   and fp > datetime.fromisoformat(to_date).date():
            continue

        # crear DTO (co es fijo "099")
        dto = ReturnsDTO(
            documento         = item.get("Documento", ""),
            fecha_emision   = item.get("FechaEmision", ""),
            motivo             = item.get("Observaciones", "-"),
            co                 = item.get("CO", "099"),
            saldo             = float(item.get("Saldo",0))
        )
        results.append(dto)

    return results


