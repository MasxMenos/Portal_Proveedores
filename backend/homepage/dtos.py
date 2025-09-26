# invoices/dtos.py
from dataclasses import dataclass
from datetime   import datetime, date
from typing import List, Optional
import json

@dataclass
class ServiceLevelDTO:
    f420_id_proveedor: str
    f420_proveedor: str
    f420_cumplimiento: float
    @classmethod
    def from_conekta(cls, data: dict) -> "ServiceLevelDTO":
        # convierte el JSON de Conekta en nuestro DTO
        return cls(
            f420_id_proveedor         = data["f420_id_proveedor"],
            f420_proveedor        = data["f420_id_proveedor"],
            f420_cumplimiento             = float(data["f420_id_proveedor"]),
        )