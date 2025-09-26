# invoices/services.py
from .clients import ServiceLevelClient
from .dtos    import ServiceLevelDTO
from datetime import datetime
from typing import List

def get_service_client(
    nitProveedor: str,
    fechaInicial: str = None,
    fechaFinal:  str = None,
) -> List[ServiceLevelDTO]:
    client = ServiceLevelClient()
    raw    = client.fetch_service_level(nitProveedor, fechaInicial, fechaFinal)
    # Extraemos la lista correcta:
    records = []
    if isinstance(raw, dict):
        detalle = raw.get("detalle") or raw.get("Detalle") 
        if isinstance(detalle, dict):
            records = detalle.get("Table",[])
        else:
            records = []  
            

    results: List[ServiceLevelDTO] = []
    for item in records:
        dto = ServiceLevelDTO(
            f420_id_proveedor         = item["f420_id_proveedor"],
            f420_proveedor        = item["f420_proveedor"],
            f420_cumplimiento             = float(item["f420_cumplimiento"]),
        )
        results.append(dto)

    return results
