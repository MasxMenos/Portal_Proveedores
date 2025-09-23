# payments/clients.py
from integrations.conekta_client import ConektaClient

class usersClient:
    def __init__(self):
        self._client = ConektaClient()

    def fetch_users(self, Usuarios: str) -> dict:
        return self._client.get_users(Usuarios)
