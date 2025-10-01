from django.contrib import admin
from django.urls import path, include, re_path
from django.conf import settings
from django.conf.urls.static import static
from django.views.generic import TemplateView
import os
from documents.views import lookup_document

urlpatterns = [
    path("admin/", admin.site.urls),

    # APIs de negocio
    path("api/invoices/", include("invoices.urls")),
    path("api/payments/", include("payments.urls")),
    path("api/returns/", include("returns.urls")),
    path("api/users/", include("users.urls")),
    path("api/kyc/", include("kyc.urls")),
    path("api/homepage/", include("homepage.urls")),
    path("api/documentos/<str:code>/", lookup_document, name="api-documentos-lookup"),
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
