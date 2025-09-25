import os
import requests

class ConektaClient:
    BASE_URL = "https://serviciosconnekta.siesacloud.com/api/v3/ejecutarconsulta"
    COMPANY_ID = 7929

    def __init__(self):
        self.session = requests.Session()
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
            "descripcion": "get_cet_format",
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