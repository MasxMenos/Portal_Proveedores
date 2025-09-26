# invoices/dtos.py
from dataclasses import dataclass

@dataclass
class ServiceLevelDTO:
    f420_id_proveedor: str
    f420_proveedor: str
    f420_cumplimiento: float
    @classmethod
    def from_conekta(cls, data: dict) -> "ServiceLevelDTO":
        return cls(
            f420_id_proveedor         = data["f420_id_proveedor"],
            f420_proveedor        = data["f420_id_proveedor"],
            f420_cumplimiento             = float(data["f420_id_proveedor"]),
        )

@dataclass
class TotalSalesDTO:
    ventas: str
    @classmethod
    def from_conekta(cls, data: dict) -> "TotalSalesDTO":
        return cls(
            ventas         = data["Ventas"],
        )

@dataclass
class TotalSalesProductsDTO:
    quantity: str
    @classmethod
    def from_conekta(cls, data: dict) -> "TotalSalesProductsDTO":
        return cls(
            quantity         = data["Quantity"],
        )