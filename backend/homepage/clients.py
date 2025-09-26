# invoices/clients.py
from integrations.conekta_client import ConektaClient

class ServiceLevelClient:
    def __init__(self):
        self._client = ConektaClient(version='v4')

    def fetch_service_level(self, nitProveedor: str, fechaInicial: str = None, fechaFinal:str= None) -> dict:
        return self._client.get_service_level(nitProveedor, fechaInicial, fechaFinal)