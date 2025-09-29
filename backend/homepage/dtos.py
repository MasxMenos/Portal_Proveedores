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
            f420_proveedor        = data["f420_proveedor"],
            f420_cumplimiento             = float(data["f420_cumplimiento"]),
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

@dataclass
class TotalSalesMonthsDTO:
    f420_id_proveedor: str
    f420_proveedor: str
    month: str
    value: float
    @classmethod
    def from_conekta(cls, data: dict) -> "TotalSalesMonthsDTO":
        return cls(
            f420_id_proveedor         = data["f420_id_proveedor"],
            f420_proveedor        = data["f420_proveedor"],
            month             = data["month"],
            value             = float(data["value"]),
        )

@dataclass
class TopProductsDTO:
    descripcion: str
    reference: str
    quantity: float
    @classmethod
    def from_conekta(cls, data: dict) -> "TopProductsDTO":
        return cls(
            descripcion         = data["Descripcion"],
            reference        = data["Reference"],
            quantity             = float(data["Quantity"]),
        )

