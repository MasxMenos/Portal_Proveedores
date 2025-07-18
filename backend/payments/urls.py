# payments/urls.py
from django.urls import path
from .views import PaymentsListView

urlpatterns = [
    path('', PaymentsListView.as_view(), name='payments-list'),

]
