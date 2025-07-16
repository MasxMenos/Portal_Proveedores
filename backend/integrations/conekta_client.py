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

    def get_suppliers_documents(self, tipo_docto: str, nit: str) -> dict:
        """
        Llama a la consulta GET_SUPPLIERS_DOCUMENTS y
        devuelve el JSON ya parseado.
        """
        params = {
            "idCompania": self.COMPANY_ID,
            "descripcion": "GET_SUPPLIERS_DOCUMENTS",
            "parametros": f"TipoDocto={tipo_docto}|Nit={nit}",
        }
        resp = self.session.get(self.BASE_URL, params=params)
        resp.raise_for_status()
        return resp.json()
