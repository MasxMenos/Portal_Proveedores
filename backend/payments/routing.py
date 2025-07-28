# payments/routing.py  ←  corrige así
from django.urls import re_path
from .consumers import ChecksConsumer

websocket_urlpatterns = [
    re_path(
        r"^ws/checks/(?P<tipo>\w+)/(?P<doc>[-\w]+)/$",   # ← 1 solo backslash
        ChecksConsumer.as_asgi(),
    ),
]
