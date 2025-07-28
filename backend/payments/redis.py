# payments/redis.py

from channels.layers import get_channel_layer
from django.conf import settings
import json, asyncio
import redis.asyncio as aioredis       # ← redis-py async

# Conexión global async
redis = aioredis.from_url(settings.REDIS_URL, decode_responses=True)

KEY = "chk:{tipo}:{doc}"          # plantilla de clave
TTL_SECONDS = 60 * 60 * 24        # 24 h (ajusta a gusto)

async def get_checks(tipo: str, doc: str) -> dict[int, bool]:
    res = await redis.hgetall(KEY.format(tipo=tipo, doc=doc))
    # Redis devuelve strings
    return {int(k): bool(int(v)) for k, v in res.items()}

async def save_check(tipo: str, doc: str, linea_id: int, checked: bool):
    key = KEY.format(tipo=tipo, doc=doc)
    await redis.hset(key, linea_id, int(checked))
    await redis.expire(key, TTL_SECONDS)

    # broadcast a todos en el grupo
    channel = get_channel_layer()
    await channel.group_send(
        f"checks_{tipo}_{doc}",
        {
            "type": "broadcast.check",
            "body": json.dumps({linea_id: checked}),
        },
    )
