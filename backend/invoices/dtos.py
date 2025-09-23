# invoices/dtos.py
from dataclasses import dataclass
from datetime   import datetime, date
from typing import List, Optional
import json

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


@dataclass
class NacDetailDTO:
    CentroCosto: str
    DescripcionArticulo: str
    Tasa: str
    ValorImpuesto: str
    ValorDescuento: str
    ValorUnd: float
    ValorTotal: float

    @classmethod
    def from_dict(cls, d: dict) -> "NacDetailDTO":
        return cls(
            CentroCosto     = d.get("Detail_Centro_Costo", ""),
            DescripcionArticulo = d.get("Detail_Descripcion_Articulo", ""),
            Tasa           = d.get("Detail_Tasa", ""),
            ValorImpuesto      = d.get("Detail_ValorImpuesto", ""),
            ValorDescuento  = d.get("Detail_ValorDescuento", ""),
            ValorUnd       = d.get("Detail_ValorUnd", ""),
            ValorTotal      = d.get("Detail_ValorTotal", ""),
        )

@dataclass
class NacFormatDTO:
    Header_Cia: str
    Header_Nit_Cia: str
    Header_Direccion_Cia: str
    Header_Fecha_Impresion: str
    Header_Documento: str
    Header_Nit: str
    Header_Razon_Social: str
    Header_Ciudad: str
    Header_Correo: str
    Header_Telefono: str
    Header_Fecha_Doc: str
    Header_Fecha_Vec: str
    Footer_Vendedor: str
    Footer_BaseRetencion: float
    Footer_ValorRetencion: float
    Footer_Observaciones: str
    Footer_VentaTotal: float
    Footer_Iva: float
    Footer_Retencion: float
    Footer_NetoPagar: float

    Detalle: List[NacDetailDTO]

    @classmethod
    def from_conekta(cls, data: dict) -> "NacFormatDTO":
        raw_det = data.get("Detalle", "[]")
        try:
            det_list = json.loads(raw_det)
        except json.JSONDecodeError:
            det_list = []
        details = [NacDetailDTO.from_dict(d) for d in det_list]

        return cls(
            Header_Cia            = data.get("Header_Cia", ""),
            Header_Nit_Cia        = data.get("Header_Nit_Cia", ""),
            Header_Direccion_Cia  = data.get("Header_Direccion_Cia", ""),
            Header_Fecha_Impresion= data.get("Header_Fecha_Impresion", ""),
            Header_Documento      = data.get("Header_Documento", ""),
            Header_Nit            = data.get("Header_Nit", ""),
            Header_Razon_Social   = data.get("Header_Razon_Social", ""),
            Header_Ciudad         = data.get("Header_Ciudad", ""),
            Header_Correo         = data.get("Header_Correo", ""),
            Header_Telefono       = data.get("Header_Telefono", ""),
            Header_Fecha_Doc      = data.get("Header_Fecha_Doc", ""),
            Header_Fecha_Vec      = data.get("Header_Fecha_Vec", ""),
            Footer_Vendedor       = data.get("Footer_Vendedor", ""),
            Footer_BaseRetencion  = float(data.get("Footer_BaseRetencion", 0)),
            Footer_ValorRetencion = float(data.get("Footer_ValorRetencion",0)),
            Footer_Observaciones  = data.get("Footer_Observaciones", ""),
            Footer_VentaTotal     = float(data.get("Footer_VentaTotal",0)),
            Footer_Iva            = float(data.get("Footer_Iva",0)),
            Footer_Retencion      = float(data.get("Footer_Retencion", 0)),
            Footer_NetoPagar      = float(data.get("Footer_NetoPagar",0)),
            Detalle               = details,
        )