# invoices/views.py
from rest_framework.views    import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from .services  import get_service_client
from .serializers import ServiceLevelSerializer


class ServerLevelView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        nitProveedor = request.query_params.get("nitProveedor", None)
        fechaInicial        = request.query_params.get("fechaInicial", None)
        fechaFinal  = request.query_params.get("fechaFinal", None)

        if not nitProveedor:
            return Response(
                {"detail": "Debe enviar nit proveedor"},
                status=400
            )

        # trae los DTOs ya mapeados y filtrados
        dtos = get_service_client(
            nitProveedor = nitProveedor,
            fechaInicial        = fechaInicial,
            fechaFinal  = fechaFinal,
        )

        # serializa directamente las instancias de InvoiceDTO
        serializer = ServiceLevelSerializer(dtos, many=True)
        return Response(serializer.data)