# invoices/urls.py
from django.urls import path
from .views import ServerLevelView,TotalSalesView

urlpatterns = [
    path('service_level', ServerLevelView.as_view(), name='server-level'),
    path('total_sales',  TotalSalesView.as_view(), name='total-sales'),

]
