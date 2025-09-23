# Returns/dtos.py
from dataclasses import dataclass
from datetime   import datetime, date
from typing import List, Optional
import json

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

@dataclass
class RetDetailDTO:
    Codigo: str
    Descripcion: str
    Recibido: float
    PCosto: float
    D1: float
    D2: float
    Iva: float
    Ibua: float
    Icui: float
    Ipolic: float
    SubTotal: float
    Observaciones: str

    @classmethod
    def from_dict(cls, d: dict) -> "RetDetailDTO":
        return cls(

            Codigo = d.get("Codigo", ""),
            Descripcion = d.get("Descripcion", ""),
            Recibido = float(d.get("Recibido", 0)),
            PCosto = float(d.get("PCosto", 0)),
            D1 = float(d.get("D1", 0)),
            D2 = float(d.get("D2", 0)),
            Iva = float(d.get("IVA", 0)),
            Ibua = float(d.get("IBUA", 0)),
            Icui = float(d.get("ICUI", 0)),
            Ipolic = float(d.get("IPOLIC", 0)),
            SubTotal = float(d.get("SubTotal", 0)),
            Observaciones = d.get("Observaciones", "Sin Notas"),
        )

@dataclass
class RetFormatDTO:
    Header_Cia: str
    Header_Nit_Cia: str
    Header_Direccion_Cia: str
    Header_Date: str
    Header_NroDocumento: str
    Header_FechaDoc: str
    Header_Proveedor: str
    Header_Proveedor_Nit: str
    Header_Nombre_PDV: str
    Header_Cod_PDV: str
    Header_Proveedor_Dir: str
    Header_Proveedor_Tel: str
    Header_PDV_Dir: str
    Header_PDV_tel: str
    Header_Proveedor_Ciud: str
    Header_PDV_Ciud: str
    Header_Fecha_Entrega: str
    FooterDsctoGlobla1: float
    FooterDsctoGlobal2: float
    FooterVlrComercial: float
    FooterDsctoComercial: float
    FooterTotalImp: float
    FooterTotalNeto: float

    Detalle: List[RetDetailDTO]

    @classmethod
    def from_conekta(cls, data: dict) -> "RetFormatDTO":
        raw_det = data.get("Detalle", "[]")
        try:
            det_list = json.loads(raw_det)
        except json.JSONDecodeError:
            det_list = []
        details = [RetDetailDTO.from_dict(d) for d in det_list]

        return cls(
            Header_Cia            = data.get("Header_Cia", ""),
            Header_Nit_Cia = data.get("Header_Nit_Cia",""),
            Header_Direccion_Cia = data.get("Header_Direccion_Cia",""),
            Header_Date = data.get("Header_Date",""),
            Header_NroDocumento = data.get("Header_NroDocumento",""),
            Header_FechaDoc = data.get("Header_FechaDoc",""),
            Header_Proveedor = data.get("Header_Proveedor",""),
            Header_Proveedor_Nit = data.get("Header_Proveedor_Nit",""),
            Header_Nombre_PDV = data.get("Header_Nombre_PDV",""),
            Header_Cod_PDV = data.get("Header_Cod_PDV",""),
            Header_Proveedor_Dir = data.get("Header_Proveedor_Dir",""),
            Header_Proveedor_Tel = data.get("Header_Proveedor_Tel",""),
            Header_PDV_Dir = data.get("Header_PDV_Dir",""),
            Header_PDV_tel = data.get("Header_PDV_tel",""),
            Header_Proveedor_Ciud = data.get("Header_Proveedor_Ciud",""),
            Header_PDV_Ciud = data.get("Header_PDV_Ciud",""),
            Header_Fecha_Entrega = data.get("Header_Fecha_Entrega",""),
            FooterDsctoGlobla1 = float(data.get("FooterDsctoGlobla1", 0)),
            FooterDsctoGlobal2 = float(data.get("FooterDsctoGlobal2", 0)),
            FooterVlrComercial = float(data.get("FooterVlrComercial", 0)),
            FooterDsctoComercial = float(data.get("FooterDsctoComercial", 0)),
            FooterTotalImp = float(data.get("FooterTotalImp", 0)),
            FooterTotalNeto = float(data.get("FooterTotalNeto", 0)),
            Detalle               = details,
        )