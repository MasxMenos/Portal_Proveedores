# returns/urls.py
from django.urls import path
from .views import ReturnsListView, DpaFormatView, DpcFormatView

urlpatterns = [
    path('', ReturnsListView.as_view(), name='returns-list'),
    path('dpa-format/', DpaFormatView.as_view(), name='dpa-format'),
    path('dpc-format/', DpcFormatView.as_view(), name='dpc-format'),
]
