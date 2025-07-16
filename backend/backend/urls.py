from django.contrib import admin
from django.urls import path, include, re_path
from django.conf import settings
from django.conf.urls.static import static
from django.views.generic import TemplateView
import os

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/invoices/', include('invoices.urls')),
    #path('api/payments/', include('payments.urls')),
    #path('api/returns/', include('returns.urls')),
    #path('api/certificates/', include('certificates.urls')),
    
]


urlpatterns += static(
  settings.STATIC_URL,
  document_root=os.path.join(settings.BASE_DIR, 'frontend', 'dist')
)


urlpatterns += [
  re_path(r'^(?!api/).*$', TemplateView.as_view(template_name="index.html")),
]



