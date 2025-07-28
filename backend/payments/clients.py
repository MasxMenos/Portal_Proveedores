# payments/clients.py
from integrations.conekta_client import ConektaClient

class PaymentsClient:
    def __init__(self):
        self._client = ConektaClient()

    def fetch_payments(self, tipo_docto: str, nit: str) -> dict:
        return self._client.get_payments_documents(tipo_docto, nit)
    
    def fetch_payments_detail(self, tipo_docto: str, csc: str) -> dict:
        return self._client.get_payments_detail(tipo_docto, csc)
