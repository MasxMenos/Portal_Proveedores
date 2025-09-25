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


@dataclass
class RccDetailDTO:
    Auxiliar: str
    Razon_Social: str
    CO: str
    Tercero: str
    Docto_Cruce: str
    Debito: float
    Credito: float

    @classmethod
    def from_dict(cls, d: dict) -> "RccDetailDTO":
        return cls(
            Auxiliar     = d.get("Detail_Auxiliar", ""),
            Razon_Social = d.get("Detail_Razon_Social", ""),
            CO           = d.get("Detail_CO", ""),
            Tercero      = d.get("Detail_Tercero", ""),
            Docto_Cruce  = d.get("Detail_Docto_Cruce", ""),
            Debito       = d.get("Detail_Debito", ""),
            Credito      = d.get("Detail_Credito", ""),
        )

@dataclass
class RccFormatDTO:
    Header_Cia: str
    Header_Nit_Cia: str
    Header_Direccion_Cia: str
    Header_Nit: str
    Header_Nro: str
    Header_Fecha_Impresion: str
    Header_Razon_Social: str
    Header_Dir: str
    Header_Ciudad: str
    Header_Nit_Proveedor: str
    Header_Telefono: str
    Header_Correo: str
    Header_Fecha_Doc: str
    Footer_Notas: str
    Footer_Total_Db: float
    Footer_Total_Cr: float
    Detalle: List[RccDetailDTO]

    @classmethod
    def from_conekta(cls, data: dict) -> "RccFormatDTO":
        raw_det = data.get("Detalle", "[]")
        try:
            det_list = json.loads(raw_det)
        except json.JSONDecodeError:
            det_list = []
        details = [RccDetailDTO.from_dict(d) for d in det_list]

        return cls(
            Header_Cia            = data.get("Header_Cia", ""),
            Header_Nit_Cia        = data.get("Header_Nit_Cia", ""),
            Header_Direccion_Cia  = data.get("Header_Direccion_Cia", ""),
            Header_Nit            = data.get("Header_Nit", ""),
            Header_Nro            = data.get("Header_Nro", ""),
            Header_Fecha_Impresion= data.get("Header_Fecha_Impresion", ""),
            Header_Razon_Social   = data.get("Header_Razon_Social", ""),
            Header_Dir            = data.get("Header_Dir", ""),
            Header_Ciudad         = data.get("Header_Ciudad", ""),
            Header_Nit_Proveedor  = data.get("Header_Nit_Proveedor", ""),
            Header_Telefono       = data.get("Header_Telefono", ""),
            Header_Correo         = data.get("Header_Correo", ""),
            Header_Fecha_Doc      = data.get("Header_Fecha_Doc", ""),
            Footer_Notas          = data.get("Footer_Notas", ""),
            Footer_Total_Db       = float(data.get("Footer_Total_Db", 0)),
            Footer_Total_Cr       = float(data.get("Footer_Total_Cr", 0)),
            Detalle               = details,
        )

@dataclass
class CetDetailDTO:
    Auxiliar: str
    CO: str
    UN: str
    Tercero: str
    RazonSocial: str
    DCruce_MPago: str
    Debitos: float
    Creditos: float
    

    @classmethod
    def from_dict(cls, d: dict) -> "CetDetailDTO":
        return cls(
        Auxiliar    = d.get("Detail_Auxiliar", ""),
        CO  = d.get("Detail_CO", ""),
        UN= d.get("Detail_UN", ""),
        Tercero= d.get("Detail_Tercero", ""),
        RazonSocial= d.get("Detail_RazonSocial", ""),
        DCruce_MPago= d.get("Detail_DCruce_MPago", ""),
        Debitos= float(d.get("Detail_Debitos", 0)),
        Creditos= float(d.get("Detail_Creditos", 0)),
        )

@dataclass
class CetFormatDTO:
    Header_Cia: str
    Header_Nit_Cia: str
    Header_Dir_Cia: str
    Header_Doc: str
    Header_Nro_Doc: str
    Header_Fecha_Act: str
    Header_Prov: str
    Header_Dir_Prov: str
    Header_Tel_Prov: str
    Header_Nit_Prov: str
    Header_Ciudad: str
    Header_Fecha_Doc: str
    Header_Docto_Referencia: str
    Header_Cuenta: str
    Header_Cuenta_Bancaria: str
    Header_Valor_Consignacion: float
    Header_Banco: str
    Footer_SumaIgualCR: float
    Footer_SumaIgualDB: float
    Detalle: List[CetDetailDTO]

    @classmethod
    def from_conekta(cls, data: dict) -> "CetFormatDTO":
        raw_det = data.get("Detalle", "[]")
        try:
            det_list = json.loads(raw_det)
        except json.JSONDecodeError:
            det_list = []
        details = [CetDetailDTO.from_dict(d) for d in det_list]

        return cls(
            Header_Cia            = data.get("Header_Cia", ""),
            Header_Nit_Cia       = data.get("Header_Nit_Cia", ""),
            Header_Dir_Cia      = data.get("Header_Dir_Cia", ""),
            Header_Doc          = data.get("Header_Doc", ""),
            Header_Nro_Doc      = data.get("Header_Nro_Doc", ""),
            Header_Fecha_Act        = data.get("Header_Fecha_Act", ""),
            Header_Prov         = data.get("Header_Prov", ""),
            Header_Dir_Prov     = data.get("Header_Dir_Prov", ""),
            Header_Tel_Prov     = data.get("Header_Tel_Prov", ""),
            Header_Nit_Prov     = data.get("Header_Nit_Prov", ""),
            Header_Ciudad       = data.get("Header_Ciudad", ""),
            Header_Fecha_Doc        = data.get("Header_Fecha_Doc", ""),
            Header_Docto_Referencia     = data.get("Header_Docto_Referencia", ""),
            Header_Cuenta       = data.get("Header_Cuenta", ""),
            Header_Cuenta_Bancaria      = data.get("Header_Cuenta_Bancaria", ""),
            Header_Valor_Consignacion      = float(data.get("Header_Valor_Consignacion", 0)),
            Header_Banco        = data.get("Header_Banco", ""),
            Footer_SumaIgualCR     = float(data.get("Footer_SumaIgualCR", 0)),
            Footer_SumaIgualDB      = float(data.get("Footer_SumaIgualDB", 0)),
            Detalle               = details,
        )