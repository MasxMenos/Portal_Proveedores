# invoices/urls.py
from django.urls import path
from .views import ServerLevelView,TotalSalesView,TotalSalesProductsView

urlpatterns = [
    path('service_level', ServerLevelView.as_view(), name='server-level'),
    path('total_sales',  TotalSalesView.as_view(), name='total-sales'),
    path('total_sales_products',  TotalSalesProductsView.as_view(), name='total-sales-products'),

]
