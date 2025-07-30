# Payments/dtos.py
from dataclasses import dataclass
from datetime   import datetime, date
from typing import List, Optional
import json


@dataclass
class PaymentsDTO:
    documento:         str
    fecha_documento:   date
    valor_debito:        float
    valor_credito:        float
    co:                str

    @classmethod
    def from_conekta(cls, data: dict) -> "PaymentsDTO":
        # convierte el JSON de Conekta en nuestro DTO
        fp = datetime.strptime(data["FechaDocumento"], "%Y/%m/%d").date()
        return cls(
            documento         = data["Documento"],
            fecha_documento   = fp,
            valor_debito      = float(data.get("ValorDebito", 0)),
            valor_credito      = float(data.get("ValorCredito", 0)),
            co             = data.get("CO", "099"),
        )


@dataclass
class MovementDTO:
    CO: str
    Descripcion: str
    Debitos: float
    Creditos: float

@dataclass
class RetencionDTO:
    CO: str
    Clase: str
    Descripcion: str
    Total_Retencion: float

@dataclass
class PaymentsDetailDTO:
    CO: str
    documento: str
    fecha: str           # yyyy-mm-dd
    debitos: float
    creditos: float
    movements: List[MovementDTO]
    retencion: List[RetencionDTO]