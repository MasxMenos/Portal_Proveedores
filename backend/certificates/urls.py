# Certificates/urls.py
from django.urls import path
from .views import CertificatesListView

urlpatterns = [
    path('', CertificatesListView.as_view(), name='Certificates-list'),

]
