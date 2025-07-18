# returns/clients.py
from integrations.conekta_client import ConektaClient

class ReturnsClient:
    def __init__(self):
        self._client = ConektaClient()

    def fetch_returns(self, tipo_docto: str, nit: str) -> dict:
        return self._client.get_returns_documents(tipo_docto, nit)
