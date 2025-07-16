# invoices/services.py
from .clients import InvoiceClient
from .dtos    import InvoiceDTO
from datetime import datetime
from typing import List

def get_invoices(
    tipo_docto: str,
    nit:        str,
    from_date:  str = None,
    to_date:    str = None
) -> List[InvoiceDTO]:
    client = InvoiceClient()
    raw    = client.fetch_invoices(tipo_docto, nit)

    # Extraemos la lista correcta:
    records = []
    if isinstance(raw, dict):
        detalle = raw.get("detalle") or raw.get("Detalle")  # 'detalle' o 'Detalle'
        if isinstance(detalle, dict):
            records = detalle.get("Table", [])

    results: List[InvoiceDTO] = []
    for item in records:
        # parsear fechas YYYY/MM/DD
        fp = datetime.strptime(item["FechaProveedor"], "%Y-%m-%d").date()
        fv = datetime.strptime(item["FechaVencimiento"], "%Y-%m-%d").date()


        # filtrar por rango
        if from_date and fp < datetime.fromisoformat(from_date).date():
            continue
        if to_date   and fp > datetime.fromisoformat(to_date).date():
            continue

        # crear DTO (co es fijo "099")
        dto = InvoiceDTO(
            documento         = item.get("Documento", ""),
            fecha_proveedor   = item.get("FechaProveedor", ""),
            fecha_vencimiento = item.get("FechaVencimiento", ""),
            valor_pago        = float(item.get("ValorPago", 0)),
            saldo             = float(item.get("Saldo", 0)),
            co                 = "099",
        )
        results.append(dto)

    return results
