from django.contrib import admin
from django.urls import path, re_path
from django.conf import settings
from django.conf.urls.static import static
from django.views.generic import TemplateView
import os

urlpatterns = [
    path('admin/', admin.site.urls),
]

# Servir archivos estáticos generados por Vite
urlpatterns += static(
    settings.STATIC_URL,
    document_root=os.path.join(settings.BASE_DIR, 'frontend', 'dist')
)

# Fallback: cualquier otra ruta la maneja React
urlpatterns += [
    re_path(r'^.*$', TemplateView.as_view(template_name="index.html")),
]
