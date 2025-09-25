from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import (
    CountryViewSet, RegionViewSet, CityViewSet, BankViewSet,
    DocumentTypeViewSet, KycFormSubmissionViewSet, IdTypesView   # <- Asegúrate de importar este nombre
)

router = DefaultRouter()
router.register(r"countries", CountryViewSet, basename="kyc-countries")
router.register(r"regions",   RegionViewSet,  basename="kyc-regions")
router.register(r"cities",    CityViewSet,    basename="kyc-cities")
router.register(r"banks",     BankViewSet,    basename="kyc-banks")
router.register(r"document-types", DocumentTypeViewSet, basename="kyc-document-types")
router.register(r"submissions",    KycFormSubmissionViewSet, basename="kyc-submissions")

urlpatterns = [
    path("id-types/", IdTypesView.as_view(), name="kyc-id-types"),
    path("", include(router.urls)),
]