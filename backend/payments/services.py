# payments/services.py
from .clients import PaymentsClient
from .dtos    import PaymentsDTO
from datetime import datetime
from typing import Optional, Dict, Any, List
import json
from .dtos import PaymentsDetailDTO, MovementDTO, RetencionDTO

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
        results.sort(key=lambda dto: dto.fecha_documento, reverse=True)

    return results




def _parse_movements(raw: str):
    data = json.loads(raw or "[]")
    return [
        MovementDTO(
            CO="099",
            Documento=m.get("Documento", "-"),
            Debitos=float(m.get("Debitos", 0)),
            Creditos=float(m.get("Creditos", 0)),
        )
        for m in data
    ]

def _parse_retenciones(raw: str):
    data = json.loads(raw or "[]")
    return [
        RetencionDTO(
            CO="099",
            Clase=r.get("Clase", "-"),
            Descripcion=r.get("Descripcion", "-"),
            Total_Retencion=float(r.get("Total_Retencion", 0)),
        )
        for r in data
    ]

def _safe_number(json_str: str, field: str):
    data = json.loads(json_str or "[]")
    if data:
        return float(data[0].get(field, 0))
    return 0.0

def get_payments_detail(tipo_docto: str, csc: str) -> list[PaymentsDetailDTO]:
    client = PaymentsClient()
    raw    = client.fetch_payments_detail(tipo_docto, csc)
    records = raw.get("detalle", {}).get("Table", [])

    dtos: list[PaymentsDetailDTO] = []
    for item in records:
        dto = PaymentsDetailDTO(
            CO        = item.get("CO", "099"),
            documento = item.get("Documento_Cruce_Proveedor", ""),
            fecha     = item.get("Fecha_Inicial", ""),
            debitos   = _safe_number(item.get("Totales_Inicial_JSON"), "Debitos"),
            creditos  = _safe_number(item.get("Totales_Inicial_JSON"), "Creditos"),
            movements = _parse_movements(item.get("Movimiento_Contable")),
            retencion = _parse_retenciones(item.get("Retencion_JSON")),
        )
        dtos.append(dto)

    return dtos