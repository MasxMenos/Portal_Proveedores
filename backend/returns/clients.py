# returns/clients.py
from integrations.conekta_client import ConektaClient

class ReturnsClient:
    def __init__(self):
        self._client = ConektaClient()

    def fetch_returns(self, tipo_docto: str, nit: str) -> dict:
        return self._client.get_returns_documents(tipo_docto, nit)


    def fetch_dpa_format(self, co: str, csc: str) -> dict:
        return self._client.get_dpa_format(co, csc)

    def fetch_dpc_format(self, co: str, csc: str) -> dict:
        return self._client.get_dpc_format(co, csc)