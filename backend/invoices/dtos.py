# invoices/dtos.py
from dataclasses import dataclass
from datetime   import datetime, date

@dataclass
class InvoiceDTO:
    documento:         str
    fecha_proveedor:   date
    fecha_vencimiento: date
    valor_pago:        float
    saldo:             float
    co:                str = "099"

    @classmethod
    def from_conekta(cls, data: dict) -> "InvoiceDTO":
        # convierte el JSON de Conekta en nuestro DTO
        fp = datetime.strptime(data["FechaProveedor"], "%Y/%m/%d").date()
        fv = datetime.strptime(data["FechaVencimiento"], "%Y/%m/%d").date()
        return cls(
            documento         = data["Documento"],
            fecha_proveedor   = fp,
            fecha_vencimiento = fv,
            valor_pago        = float(data.get("ValorPago", 0)),
            saldo             = float(data.get("Saldo", 0)),
        )
