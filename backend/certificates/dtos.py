# Certificates/dtos.py
from dataclasses import dataclass
from datetime   import datetime, date

@dataclass
class CertificatesDTO:
    documento:          str
    periodo:            str
    ciudad:             str
    valor_base:         float
    valor_retencion:    float
    co:                 str

    @classmethod
    def from_conekta(cls, data: dict) -> "CertificatesDTO":

        return cls(
            documento         = data["Documento"],
            periodo           = data["Periodo"],
            ciudad            = data["Ciudad"],
            valor_base      = float(data.get("ValorBase", 0)),
            valor_retencion      = float(data.get("ValorRetencion", 0)),
            co             = data.get("CO", "099"),
        )
