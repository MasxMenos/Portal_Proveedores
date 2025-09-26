from django.contrib import admin
from django.urls import path, include, re_path
from django.conf import settings
from django.conf.urls.static import static
from django.views.generic import TemplateView
import os

# Import opcional del endpoint de documentos:
# si la app `documentos` no existe, no rompemos el arranque.
try:
    from documentos.views import lookup_document as documentos_lookup
    HAS_DOCUMENTOS_APP = True
except Exception:
    HAS_DOCUMENTOS_APP = False
    documentos_lookup = None

urlpatterns = [
    path("admin/", admin.site.urls),

    # APIs de negocio
    path("api/invoices/", include("invoices.urls")),
    path("api/payments/", include("payments.urls")),
    path("api/returns/", include("returns.urls")),
    path("api/users/", include("users.urls")),
    path("api/kyc/", include("kyc.urls")),
    path("api/homepage/", include("homepage.urls")),
]

# Endpoint /api/documentos/<code>/ SOLO si la app existe
if HAS_DOCUMENTOS_APP and documentos_lookup:
    urlpatterns += [
        path("api/documentos/<str:code>/", documentos_lookup, name="api-documentos-lookup"),
    ]

# --- Archivos estáticos y media en DEV ---
# Sirve MEDIA_URL desde MEDIA_ROOT (no dupliques con otro `static()` a 'documentos/')
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    # Si sirves el build del frontend directamente como estático adicional:
    urlpatterns += static(
        settings.STATIC_URL,
        document_root=os.path.join(settings.BASE_DIR, "../frontend/dist")
    )


urlpatterns += [
    re_path(r"^(?!api/).*$", TemplateView.as_view(template_name="index.html")),
]
