# Returns/dtos.py
from dataclasses import dataclass
from datetime   import datetime, date

@dataclass
class ReturnsDTO:
    documento:         str
    fecha_emision:   date
    motivo:             str
    co:                str 
    saldo:             float

    @classmethod
    def from_conekta(cls, data: dict) -> "ReturnsDTO":
        # convierte el JSON de Conekta en nuestro DTO
        fp = datetime.strptime(data["FechaEmision"], "%Y/%m/%d").date()

        return cls(
            documento         = data["Documento"],
            fecha_emision   = fp,
            motivo        = data.get("Observaciones", "-"),
            saldo         = float(data.get("Saldo", 0)),
            co            = data.get("co", "099")
            
        )
