# invoices/clients.py
from integrations.conekta_client import ConektaClient

class InvoiceClient:
    def __init__(self):
        self._client = ConektaClient()

    def fetch_invoices(self, tipo_docto: str, nit: str) -> dict:
        return self._client.get_invoices_documents(tipo_docto, nit)
