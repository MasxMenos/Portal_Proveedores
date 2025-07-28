from django.urls import path
from .views import PaymentsListView
from .views import PaymentsListView, PaymentsDetailView

urlpatterns = [
    path('', PaymentsListView.as_view(), name='payments-list'),
    path('detail/', PaymentsDetailView.as_view(), name='payments-detail'),
]
