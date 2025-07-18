# certificates/clients.py
from integrations.conekta_client import ConektaClient

class CertificatesClient:
    def __init__(self):
        self._client = ConektaClient()

    def fetch_certificates(self, tipo_docto: str, nit: str) -> dict:
        return self._client.get_certificates_documents(tipo_docto, nit)
