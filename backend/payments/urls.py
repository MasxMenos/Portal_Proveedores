from django.urls import path
from .views import PaymentsListView
from .views import PaymentsListView, PaymentsDetailView, RccFormatView, CetFormatView

urlpatterns = [
    path('', PaymentsListView.as_view(), name='payments-list'),
    path('detail/', PaymentsDetailView.as_view(), name='payments-detail'),
    path('rcc-format/', RccFormatView.as_view(), name='rcc-format'),
    path('cet-format/', CetFormatView.as_view(), name='cet-format'),
    
]
