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

    def get_invoices_documents(self, tipo_docto: str, nit: str) -> dict:
        """
        Llama a la consulta get_invoices_documents y
        devuelve el JSON ya parseado.
        """
        params = {
            "idCompania": self.COMPANY_ID,
            "descripcion": "get_invoices_documents",
            "parametros": f"TipoDocto={tipo_docto}|Nit={nit}",
        }
        resp = self.session.get(self.BASE_URL, params=params)
        resp.raise_for_status()
        return resp.json()
    
    def get_payments_documents(self, tipo_docto: str, nit: str) -> dict:
        """
        Llama a la consulta get_payments_documents y
        devuelve el JSON ya parseado.
        """
        params = {
            "idCompania": self.COMPANY_ID,
            "descripcion": "get_payments_documents",
            "parametros": f"TipoDocto={tipo_docto}|Nit={nit}",
        }
        resp = self.session.get(self.BASE_URL, params=params)
        resp.raise_for_status()
        return resp.json()
    
    def get_returns_documents(self, tipo_docto: str, nit: str) -> dict:
        """
        Llama a la consulta get_returns_documents y
        devuelve el JSON ya parseado.
        """
        params = {
            "idCompania": self.COMPANY_ID,
            "descripcion": "get_returns_documents",
            "parametros": f"TipoDocto={tipo_docto}|Nit={nit}",
        }
        resp = self.session.get(self.BASE_URL, params=params)
        resp.raise_for_status()
        return resp.json()

    def get_certificates_documents(self, tipo_docto: str, nit: str) -> dict:
        """
        Llama a la consulta get_certificates_documents y
        devuelve el JSON ya parseado.
        """
        params = {
            "idCompania": self.COMPANY_ID,
            "descripcion": "get_suppliers_documents",
            "parametros": f"TipoDocto={tipo_docto}|Nit={nit}",
        }
        resp = self.session.get(self.BASE_URL, params=params)
        resp.raise_for_status()
        return resp.json()
