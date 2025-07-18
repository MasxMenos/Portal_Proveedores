# returns/urls.py
from django.urls import path
from .views import ReturnsListView

urlpatterns = [
    path('', ReturnsListView.as_view(), name='returns-list'),

]
