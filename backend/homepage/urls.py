# invoices/urls.py
from django.urls import path
from .views import ServerLevelView

urlpatterns = [
    path('service_level', ServerLevelView.as_view(), name='server-level'),

]
