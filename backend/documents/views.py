import os, re
from django.conf import settings
from django.http import JsonResponse, Http404

def lookup_document(request, code):
    # 1) intenta usar DOCUMENTOS_ROOT si existe,
    #    si no, construye la ruta relativa a BASE_DIR
    carpeta = getattr(
        settings,
        'DOCUMENTOS_ROOT',
        os.path.abspath(os.path.join(settings.BASE_DIR, '..', 'documentos'))
    )

    # 2) buscamos con regex cualquier PDF que contenga el código
    patrón = re.compile(rf'.*{re.escape(code)}.*\.pdf$', re.IGNORECASE)
    try:
        for nombre in os.listdir(carpeta):
            if patrón.match(nombre):
                # devolvemos la URL pública (asumiendo que sirve /documentos/)
                return JsonResponse({'url': f'/documentos/{nombre}'})
    except FileNotFoundError:
        raise Http404("No se encontró la carpeta de documentos")

    # si no hay match
    raise Http404("Documento no encontrado")