# invoices/clients.py
from integrations.conekta_client import ConektaClient

class HomePageClient:
    def __init__(self, version='v3'):
        self._client = ConektaClient(version=version)

    def fetch_service_level(self, nitProveedor: str, fechaInicial: str = None, fechaFinal:str= None) -> dict:
        return self._client.get_service_level(nitProveedor, fechaInicial, fechaFinal)

    def fetch_total_sales(self, nit: str, fechaIni: str = None, fechaFin:str= None) -> dict:
        return self._client.get_total_sales(nit, fechaIni, fechaFin)
    
    def fetch_total_sales_products(self, nit: str, fechaIni: str = None, fechaFin:str= None) -> dict:
        return self._client.get_total_sales_products(nit,fechaIni,fechaFin)
    
    def fetch_total_sales_months(self, nitProveedor: str, fechaInicial: str = None, fechaFinal:str= None) -> dict:
        return self._client.get_total_sales_months(nitProveedor, fechaInicial, fechaFinal)
    
    def fetch_top_products(self, nit: str, fechaIni: str = None, fechaFin:str= None) -> dict:
        return self._client.get_top_products(nit, fechaIni, fechaFin)