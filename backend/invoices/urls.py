# invoices/urls.py
from django.urls import path
from .views import InvoiceListView, NacFormatView

urlpatterns = [
    path('', InvoiceListView.as_view(), name='invoice-list'),
    path('nac-format/', NacFormatView.as_view(), name='Nac-format'),

]
