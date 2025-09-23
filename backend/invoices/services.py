# invoices/services.py
from .clients import InvoiceClient
from .dtos    import InvoiceDTO
from datetime import datetime
from typing import List
from .dtos import NacFormatDTO

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
        fp = datetime.strptime(item["FechaEmision"], "%Y-%m-%d").date()
        fv = datetime.strptime(item["FechaVencimiento"], "%Y-%m-%d").date()


        # filtrar por rango
        if from_date and fp < datetime.fromisoformat(from_date).date():
            continue
        if to_date   and fp > datetime.fromisoformat(to_date).date():
            continue

        # crear DTO (co es fijo "099")
        dto = InvoiceDTO(
            documento         = item.get("Documento", ""),
            fecha_emision   = fp,
            fecha_vencimiento = fv,
            valor_pago        = float(item.get("ValorPago", 0)),
            descuentos             = float(item.get("Descuento", 0)),
            co                 = item.get("f350_id_co", "099"),
        )
        results.append(dto)
        results.sort(key=lambda dto: dto.fecha_emision, reverse=True)

    return results

def get_nac_format(tipo_docto: str, csc: str) -> NacFormatDTO:
    """
    Llama a PaymentsClient.get_rcc_format y normaliza a RccFormatDTO.
    """
    client = InvoiceClient()
    raw    = client.fetch_nac_format(csc)
    # la respuesta va en raw["detalle"]["Table"][0]
    row = {}
    try:
        row = raw.get("detalle", {}).get("Table", [])[0] or {}
    except Exception:
        row = {}
    return NacFormatDTO.from_conekta(row)