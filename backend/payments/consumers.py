# payments/consumers.py
import json
from channels.generic.websocket import AsyncWebsocketConsumer
from .redis import get_checks, save_check

class ChecksConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.tipo = self.scope["url_route"]["kwargs"]["tipo"]
        self.doc  = self.scope["url_route"]["kwargs"]["doc"]
        self.group_name = f"checks_{self.tipo}_{self.doc}"

        # Unirse al grupo
        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()

        # Enviar estado actual al nuevo cliente
        await self.send(text_data=json.dumps(await get_checks(self.tipo, self.doc)))

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.group_name, self.channel_name)

    # Mensajes del cliente → guardar + re-broadcast
    async def receive(self, text_data):
        try:
            data = json.loads(text_data)       # { line_id: true/false }
            (line_id, checked), = data.items()
            await save_check(self.tipo, self.doc, int(line_id), bool(checked))
        except (ValueError, json.JSONDecodeError):
            pass

    # Mensaje emitido por save_check → reenviar a cada socket
    async def broadcast_check(self, event):
        await self.send(text_data=event["body"])
