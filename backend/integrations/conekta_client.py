import os
import requests
from datetime import datetime, date
class ConektaClient:
    BASE_URL = "https://serviciosconnekta.siesacloud.com/api/version/ejecutarconsulta"
    COMPANY_ID = 7929

    def __init__(self, version:str='v3'):
        self.session = requests.Session()
        self.BASE_URL=self.BASE_URL.replace("version", version)
        self.session.headers.update({
            "conniKey":   "Connikey-maspormenos-WTHTNKQX", #os.getenv("CONN_KEY"),
            "conniToken":  "WTHTNKQXTZVWN081TDNSNLK4UZZIMLG4QJBAOEIWSJNONEEWUZZPNA", #os.getenv("CONN_TOKEN"),
            "Content-Type": "application/json",
        })

    def _safe_get(self, params):
        try:
            resp = self.session.get(self.BASE_URL, params=params, timeout=70)
            resp.raise_for_status()
            return resp.json()
        except requests.exceptions.Timeout:
            raise Exception("El servicio externo tardó demasiado. Intente más tarde.")
        except requests.exceptions.RequestException as e:
            if resp.json().get("detalle"):
                return resp.json()
            raise Exception(f"Ocurrió un error al consultar el servicio externo: {str(e)}")

    def get_invoices_documents(self, tipo_docto: str, nit: str) -> dict:
        params = {
            "idCompania": self.COMPANY_ID,
            "descripcion": "get_invoices_documents",
            "parametros": f"TipoDocto={tipo_docto}|Nit={nit}",
        }
        return self._safe_get(params)
    
    def get_payments_documents(self, tipo_docto: str, nit: str) -> dict:
        params = {
            "idCompania": self.COMPANY_ID,
            "descripcion": "get_payments_documents",
            "parametros": f"TipoDocto={tipo_docto}|Nit={nit}",
        }
        return self._safe_get(params)
    
    def get_returns_documents(self, tipo_docto: str, nit: str) -> dict:
        params = {
            "idCompania": self.COMPANY_ID,
            "descripcion": "get_returns_documents",
            "parametros": f"TipoDocto={tipo_docto}|Nit={nit}",
        }
        return self._safe_get(params)

    def get_certificates_documents(self, tipo_docto: str, nit: str) -> dict:
        params = {
            "idCompania": self.COMPANY_ID,
            "descripcion": "get_suppliers_documents",
            "parametros": f"TipoDocto={tipo_docto}|Nit={nit}",
        }
        return self._safe_get(params)

    def get_payments_detail(self, tipo_docto: str, csc: str) -> dict:
        descripcion = "get_payments_rcc_detail" if tipo_docto == "RCC" else "get_payments_detail"
        params = {
            "idCompania": self.COMPANY_ID,
            "descripcion": descripcion,
            "parametros": f"TipoDocto={tipo_docto}|ConsecDocto={csc}",
        }
        return self._safe_get(params)

    def get_users(self, Usuario: str) -> dict:
        params = {
            "idCompania": self.COMPANY_ID,
            "descripcion": "get_users",
            "parametros": f"Usuario={Usuario}",
        }
        return self._safe_get(params)

    
    def get_nac_format(self, csc: str) -> dict:
        params = {
            "idCompania": self.COMPANY_ID,
            "descripcion": "get_nac_format",
            "parametros": f"ConsecDocto={csc}|TipoDocto=NAC",
        }
        return self._safe_get(params)

    def get_rcc_format(self, csc: str) -> dict:
        params = {
            "idCompania": self.COMPANY_ID,
            "descripcion": "get_rcc_format",
            "parametros": f"ConsecDocto={csc}|TipoDocto=RCC",
        }
        return self._safe_get(params)

    def get_cet_format(self, csc: str) -> dict:
        params = {
            "idCompania": self.COMPANY_ID,
            "descripcion": "get_rcc_format",
            "parametros": f"ConsecDocto={csc}|TipoDocto=CET",
        }
        return self._safe_get(params)


    def get_dpa_format(self,co:str, csc: str, tipo=None) -> dict:
        params = {
            "idCompania": self.COMPANY_ID,
            "descripcion": "get_dpc_format",
            "parametros": f"CO={co}|ConsecDocto={csc}|TipoDocto=DPA",
        }
        return self._safe_get(params)

    def get_dpc_format(self,co:str, csc: str, tipo=None) -> dict:
        params = {
            "idCompania": self.COMPANY_ID,
            "descripcion": "get_dpc_format",
            "parametros": f"CO={co}|ConsecDocto={csc}|TipoDocto=DPC",
        }
        return self._safe_get(params)
    
    def get_service_level(self, nitProveedor: str, fechaInicial: str = None, fechaFinal:str= None) -> dict:
        anio_actual = date.today().year

        if fechaInicial is None:
            fechaInicial = date(anio_actual, 1, 1).isoformat().replace('-','')

        if fechaFinal is None:
            fechaFinal = date(anio_actual, 12, 31).isoformat().replace('-','')

        params = {
            "idCompania": self.COMPANY_ID,
            "descripcion": "LOGIX_CUMPLIMIENTO_PROVEEDOR",
            "parametros": f"numPagina=1|numRegistros=9999|nitProveedor={nitProveedor}|fechaInicial={fechaInicial}|fechaFinal={fechaFinal}"
        }
        return self._safe_get(params)
    
    def get_total_sales(self, nit: str, fechaIni: str = None, fechaFin:str= None) -> dict:
        anio_actual = date.today().year

        if fechaIni is None:
            fechaIni = date(anio_actual, 1, 1).isoformat().replace('-','')

        if fechaFin is None:
            fechaFin = date(anio_actual, 12, 31).isoformat().replace('-','')

        params = {
            "idCompania": self.COMPANY_ID,
            "descripcion": "GET_TOTAL_SALES",
            "parametros": f"NIT={nit}|FechaIni={fechaIni}|FechaFin={fechaFin}"
        }
        return self._safe_get(params)
    
    def get_total_sales_products(self, nit: str, fechaIni: str = None, fechaFin:str= None) -> dict:
        anio_actual = date.today().year

        if fechaIni is None:
            fechaIni = date(anio_actual, 1, 1).isoformat().replace('-','')

        if fechaFin is None:
            fechaFin = date(anio_actual, 12, 31).isoformat().replace('-','')
        params = {
            "idCompania": self.COMPANY_ID,
            "descripcion": "GET_TOTAL_SALES_PRODUCTS",
            "parametros": f"NIT={nit}|FechaIni={fechaIni}|FechaFin={fechaFin}"
        }
        return self._safe_get(params)
    
    def get_total_sales_months(self, nitProveedor: str, fechaInicial: str = None, fechaFinal:str= None) -> dict:
        anio_actual = date.today().year

        if fechaInicial is None:
            fechaInicial = date(anio_actual, 1, 1).isoformat().replace('-','')

        if fechaFinal is None:
            fechaFinal = date(anio_actual, 12, 31).isoformat().replace('-','')

        params = {
            "idCompania": self.COMPANY_ID,
            "descripcion": "GET_SUPPLIER_PAYMENT_HISTORY",
            "parametros": f"numPagina=1|numRegistros=9999|nitProveedor={nitProveedor}|fechaInicial={fechaInicial}|fechaFinal={fechaFinal}"
        }
        return self._safe_get(params)
    
    def get_top_products(self,  nit: str, fechaIni: str = None, fechaFin:str= None) -> dict:
        anio_actual = date.today().year

        if fechaIni is None:
            fechaIni = date(anio_actual, 1, 1).isoformat().replace('-','')

        if fechaFin is None:
            fechaFin = date(anio_actual, 12, 31).isoformat().replace('-','')

        params = {
            "idCompania": self.COMPANY_ID,
            "descripcion": "GET_TOP_PRODUCTS",
            "parametros": f"numPagina=1|numRegistros=9999|NIT={nit}|FechaIni={fechaIni}|FechaFin={fechaFin}"
        }
        return self._safe_get(params)