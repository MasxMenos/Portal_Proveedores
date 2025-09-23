# invoices/views.py
from rest_framework.views    import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from .services  import get_returns, get_dpa_format, get_dpc_format
from .serializers import ReturnsSerializer, RetFormatSerializer

class ReturnsListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        tipo_docto = request.query_params.get("tipoDocto")
        nit        = request.query_params.get("nit")
        date_from  = request.query_params.get("from")
        date_to    = request.query_params.get("to")

        if not tipo_docto or not nit:
            return Response(
                {"detail": "Debe enviar tipoDocto y nit"},
                status=400
            )

        # trae los DTOs ya mapeados y filtrados
        dtos = get_returns(
            tipo_docto = tipo_docto,
            nit        = nit,
            from_date  = date_from,
            to_date    = date_to
        )

        # serializa directamente las instancias de InvoiceDTO
        serializer = ReturnsSerializer(dtos, many=True)
        return Response(serializer.data)

class DpaFormatView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        csc = request.query_params.get("csc")
        co  = request.query_params.get("co")
        if not csc or not co:
            return Response({"detail": "Debe enviar csc y co"}, status=400)

        # firma correcta: (co, csc)
        dto = get_dpa_format(co, csc)
        serializer = RetFormatSerializer(dto)
        return Response(serializer.data)


class DpcFormatView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        csc = request.query_params.get("csc")
        co  = request.query_params.get("co")
        if not csc or not co:
            return Response({"detail": "Debe enviar csc y co"}, status=400)

        # firma correcta: (co, csc)
        dto = get_dpc_format(co, csc)
        serializer = RetFormatSerializer(dto)
        return Response(serializer.data)