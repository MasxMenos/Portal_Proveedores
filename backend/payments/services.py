# payments/services.py
from .clients import PaymentsClient
from .dtos    import PaymentsDTO
from datetime import datetime
from typing import Optional, Dict, Any, List, Union
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




def _parse_movements(raw: Union[str, dict], parent_co: str) -> List[MovementDTO]:
    """
    raw puede ser un JSON string o un dict ya parseado.
    parent_co es el CO del ítem padre (item.get("CO")).
    """
    # 1) Asegurar que data sea lista
    if isinstance(raw, str):
        try:
            data = json.loads(raw or "[]")
        except json.JSONDecodeError:
            data = []
    else:
        data = raw or []

    if isinstance(data, dict):
        data = [data]

    movements: List[MovementDTO] = []
    # 2) Iterar
    for mov in data:
        detalle_list = mov.get("Detalle", [])
        if isinstance(detalle_list, list) and detalle_list:
            # por cada detalle, generamos un MovementDTO
            for det in detalle_list:
                movements.append(
                    MovementDTO(
                        CO=parent_co,
                        Descripcion= det.get("Descripcion", "-"),
                        Debitos=float(det.get("Debito", 0)),
                        Creditos=float(det.get("Credito", 0)),
                    )
                )
        else:
            # fallback: sin detalle, tomamos los valores directos
            movements.append(
                MovementDTO(
                    CO=parent_co,
                    Descripcion     = mov.get("Descripcion", "-"),
                    Debitos=float(mov.get("Debitos", 0)),
                    Creditos=float(mov.get("Creditos", 0)),
                )
            ) 

    return movements

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

def _safe_number(json_str: str, field: str) -> float:
    """
    Extrae un número del JSON que puede venir como:
     - Una lista de objetos: [{ "Debitos": 123, "Creditos": 456 }]
     - Un único objeto:   { "Debitos": 123, "Creditos": 456 }
    """
    try:
        parsed = json.loads(json_str or "{}")
    except json.JSONDecodeError:
        return 0.0

    # si es lista, toma el primer elemento
    if isinstance(parsed, list):
        parsed = parsed[0] if parsed else {}

    # si es dict, extrae el campo
    if isinstance(parsed, dict):
        return float(parsed.get(field, 0))

    return 0.0

def get_payments_detail(tipo_docto: str, csc: str) -> list[PaymentsDetailDTO]:
    client = PaymentsClient()
    raw    = client.fetch_payments_detail(tipo_docto, csc)
    records = raw.get("detalle", {}).get("Table", [])

    dtos: list[PaymentsDetailDTO] = []
    for item in records:
        co = item.get("CO", "099")
        dto = PaymentsDetailDTO(
            CO        = co,
            documento = item.get("Documento_Cruce_Proveedor", ""),
            fecha     = item.get("Fecha_Inicial", ""),
            debitos   = _safe_number(item.get("Totales_Inicial_JSON"), "Debitos"),
            creditos  = _safe_number(item.get("Totales_Inicial_JSON"), "Creditos"),
            movements = _parse_movements(item.get("Movimiento_Contable"), co),
            retencion = _parse_retenciones(item.get("Retencion_JSON")),
        )
        dtos.append(dto)

    return dtos


