from django.urls import path
from .views import ProfileViewSet, LoginView

profile = ProfileViewSet.as_view({
    'get': 'list',
    'put': 'update',
})

urlpatterns = [
    path('login/',   LoginView.as_view(), name='login'),
    path('profile/', profile,               name='profile'),
]
