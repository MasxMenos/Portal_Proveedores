# invoices/urls.py
from django.urls import path
from .views import ServerLevelView,TotalSalesView,TotalSalesProductsView,TotalSalesMonthsView,TopProductsView, GrowthPorcenView,CategorySupplierView,VisitsView

urlpatterns = [
    path('service_level', ServerLevelView.as_view(), name='server-level'),
    path('total_sales',  TotalSalesView.as_view(), name='total-sales'),
    path('total_sales/products',  TotalSalesProductsView.as_view(), name='total-sales-products'),
    path('total_sales/months',  TotalSalesMonthsView.as_view(), name='total-sales-months'),
    path('top_products',  TopProductsView.as_view(), name='top-products'),
    path('growth_porcent',  GrowthPorcenView.as_view(), name='growth-porcent'),
    path('category_supplier',  CategorySupplierView.as_view(), name='category-supplier'),
    path("visits", VisitsView.as_view(), name="visits"),
]
