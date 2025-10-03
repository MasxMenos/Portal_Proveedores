# invoices/services.py
from .clients import HomePageClient
from .dtos    import ServiceLevelDTO,TotalSalesDTO, TotalSalesProductsDTO,TotalSalesMonthsDTO, TopProductsDTO, GrowthPorcentDTO,CategorySupplierDTO
from typing import List

def get_records(raw: dict) -> List[dict]:
    records = []
    if isinstance(raw, dict):
        detalle = raw.get("detalle") or raw.get("Detalle") 
        if isinstance(detalle, dict):
            records = detalle.get("Table",[])
        elif isinstance(detalle, str):
            records = []
        else:
            records = detalle  
    return records

def get_service_level(
    nitProveedor: str,
    fechaInicial: str = None,
    fechaFinal:  str = None,
) -> List[ServiceLevelDTO]:
    client = HomePageClient(version='v4')
    raw    = client.fetch_service_level(nitProveedor, fechaInicial, fechaFinal)
    # Extraemos la lista correcta:
    records = get_records(raw)

    results: List[ServiceLevelDTO] = []
    for item in records:
        dto = ServiceLevelDTO(
            f420_id_proveedor         = item["f420_id_proveedor"],
            f420_proveedor        = item["f420_proveedor"],
            f420_cumplimiento             = float(item["f420_cumplimiento"]),
        )
        results.append(dto)

    return results

def get_total_sales(
    nit: str,
    fechaIni: str = None,
    fechaFin:  str = None,
) -> List[TotalSalesDTO]:
    client = HomePageClient()
    raw    = client.fetch_total_sales(nit, fechaIni, fechaFin)
    records = get_records(raw)

    results: List[TotalSalesDTO] = []
    for item in records:
        dto = TotalSalesDTO(
            ventas         = item["Ventas"],
        )
        results.append(dto)

    return results

def get_total_sales_products(
    nit: str,
    fechaIni: str = None,
    fechaFin:  str = None,
) -> List[TotalSalesProductsDTO]:
    client = HomePageClient()
    raw    = client.fetch_total_sales_products(nit, fechaIni, fechaFin)
    records = get_records(raw)

    results: List[TotalSalesProductsDTO] = []
    for item in records:
        dto = TotalSalesProductsDTO(
            quantity         = item["Quantity"],
        )
        results.append(dto)

    return results


def get_total_sales_months(
    nitProveedor: str,
    fechaInicial: str = None,
    fechaFinal:  str = None,
) -> List[TotalSalesMonthsDTO]:
    client = HomePageClient(version='v4')
    raw    = client.fetch_total_sales_months(nitProveedor, fechaInicial, fechaFinal)
    # Extraemos la lista correcta:
    records = get_records(raw)

    results: List[TotalSalesMonthsDTO] = []
    for item in records:
        dto = TotalSalesMonthsDTO(
            f420_id_proveedor         = item["f420_id_proveedor"],
            f420_proveedor        = item["f420_proveedor"],
            month             = item["month"],
            value             = float(item["value"]),
        )
        results.append(dto)

    return results

def get_top_products(
    nit: str,
    fechaIni: str = None,
    fechaFin:  str = None,
) -> List[TopProductsDTO]:
    client = HomePageClient()
    raw    = client.fetch_top_products(nit, fechaIni, fechaFin)
    # Extraemos la lista correcta:
    records = get_records(raw)

    results: List[TopProductsDTO] = []
    for item in records:
        dto = TopProductsDTO(
            descripcion         = item["Descripcion"],
            reference        = item["Reference"],
            quantity             = float(item["Quantity"]),
        )
        results.append(dto)

    return results

def get_growth_porcent(
    nit: str
    , pastDateStart: str = None
    , pastDateEnd:str= None
    , currDateStart:str = None
    , currDateEnd:str = None
) -> List[GrowthPorcentDTO]:
    client = HomePageClient()
    raw    = client.fetch_growth_porcent(nit, pastDateStart, pastDateEnd, currDateStart, currDateEnd)
    # Extraemos la lista correcta:
    records = get_records(raw)

    results: List[GrowthPorcentDTO] = []
    for item in records:
        dto = GrowthPorcentDTO(
            porcent         = item["Porcent"],
        )
        results.append(dto)

    return results

def get_category_supplier(
    nit: str
) -> List[CategorySupplierDTO]:
    client = HomePageClient()
    raw    = client.fetch_category_supplier(nit)
    # Extraemos la lista correcta:
    records = get_records(raw)

    results: List[CategorySupplierDTO] = []
    for item in records:
        dto = CategorySupplierDTO(
            lineaCompra         = item["LineaCompra"],
        )
        results.append(dto)

    return results