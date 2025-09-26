# invoices/views.py
from rest_framework.views    import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from .services  import get_service_level, get_total_sales, get_total_sales_products
from .serializers import ServiceLevelSerializer, TotalSalesSerializer, TotalSalesProductSerializer


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
        dtos = get_service_level(
            nitProveedor = nitProveedor,
            fechaInicial        = fechaInicial,
            fechaFinal  = fechaFinal,
        )

        # serializa directamente las instancias de InvoiceDTO
        serializer = ServiceLevelSerializer(dtos, many=True)
        return Response(serializer.data)

class TotalSalesView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        nit = request.query_params.get("nit", None)
        fechaIni        = request.query_params.get("fechaIni", None)
        fechaFin  = request.query_params.get("fechaFin", None)
        if not nit:
            return Response(
                {"detail": "Debe enviar nit proveedor"},
                status=400
            )

        dtos = get_total_sales(
            nit = nit,
            fechaIni        = fechaIni,
            fechaFin  = fechaFin,
        )

        serializer = TotalSalesSerializer(dtos, many=True)
        return Response(serializer.data)

class TotalSalesProductsView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        nit = request.query_params.get("nit", None)
        if not nit:
            return Response(
                {"detail": "Debe enviar nit proveedor"},
                status=400
            )

        dtos = get_total_sales_products(
            nit = nit,
        )

        serializer = TotalSalesProductSerializer(dtos, many=True)
        return Response(serializer.data)