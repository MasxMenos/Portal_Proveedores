from django.contrib import admin
from django.urls import path, include, re_path
from django.conf import settings
from django.conf.urls.static import static
from django.views.generic import TemplateView
from documentos.views import lookup_document
import os

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/invoices/', include('invoices.urls')),
    path('api/payments/', include('payments.urls')),
    path('api/returns/', include('returns.urls')),
    path('api/users/', include('users.urls')),
     path('api/documentos/<str:code>/', lookup_document),
    #path('api/certificates/', include('certificates.urls')),
   
    
]

DOCUMENTOS_ROOT = os.path.abspath(os.path.join(settings.BASE_DIR, '../', 'documentos'))
urlpatterns += static(
    prefix='documentos/',
    document_root=DOCUMENTOS_ROOT
)


urlpatterns += static(
  settings.STATIC_URL,
  document_root=os.path.join(settings.BASE_DIR, 'frontend', 'dist')
)


urlpatterns += [
  re_path(r'^(?!api/).*$', TemplateView.as_view(template_name="index.html")),
]



