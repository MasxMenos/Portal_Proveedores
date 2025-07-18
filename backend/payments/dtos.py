# Payments/dtos.py
from dataclasses import dataclass
from datetime   import datetime, date

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
