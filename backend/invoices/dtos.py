# invoices/dtos.py
from dataclasses import dataclass
from datetime   import datetime, date

@dataclass
class InvoiceDTO:
    documento:         str
    fecha_emision:     date
    fecha_vencimiento: date
    valor_pago:        float
    co:                str
    descuentos:        float

    @classmethod
    def from_conekta(cls, data: dict) -> "InvoiceDTO":
        # convierte el JSON de Conekta en nuestro DTO
        fp = datetime.strptime(data["FechaEmision"], "%Y/%m/%d").date()
        fv = datetime.strptime(data["FechaVencimiento"], "%Y/%m/%d").date()
        return cls(
            documento         = data["Documento"],
            fecha_emision   = fp,
            fecha_vencimiento = fv,
            descuentos        = float(data.get("Descuentos", 0)),
            saldo             = float(data.get("Saldo", 0)),
            co                = data["f350_id_co"]
        )
