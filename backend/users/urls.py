from django.urls import path
from .views import ProfileViewSet, LoginView,PasswordResetView

profile = ProfileViewSet.as_view({
    'get': 'list',
    'put': 'update',
})

urlpatterns = [
    path('login/',   LoginView.as_view(), name='login'),
    path('profile/', profile,               name='profile'),
    path("password-reset/", PasswordResetView.as_view(), name="password-reset"),
]
