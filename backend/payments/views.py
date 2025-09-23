# invoices/views.py
from rest_framework.views    import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from .services  import get_payments
from .serializers import PaymentsSerializer
from .services   import get_payments_detail, get_rcc_format, get_cet_format
from .serializers import PaymentsDetailSerializer, RccFormatSerializer


class PaymentsListView(APIView):
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
        dtos = get_payments(
            tipo_docto = tipo_docto,
            nit        = nit,
            from_date  = date_from,
            to_date    = date_to
        )

        # serializa directamente las instancias de InvoiceDTO
        serializer = PaymentsSerializer(dtos, many=True)
        return Response(serializer.data)


class PaymentsDetailView(APIView):
    permission_classes = [AllowAny]   # o IsAuthenticated si tu JWT aplica

    def get(self, request):
        tipo_docto = request.query_params.get("tipoDocto")
        csc        = request.query_params.get("csc")

        if not tipo_docto or not csc:
            return Response(
                {"detail": "Debe enviar tipoDocto y csc"},
                status=400
            )

        dtos = get_payments_detail(tipo_docto, csc)
        data = PaymentsDetailSerializer(dtos, many=True).data
        return Response(data)

class RccFormatView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        csc = request.query_params.get("csc")
        if not csc:
            return Response({"detail": "Debe enviar csc"}, status=400)
        dto = get_rcc_format(None, csc)
        serializer = RccFormatSerializer(dto)
        return Response(serializer.data)

class CetFormatView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        csc = request.query_params.get("csc")
        if not csc:
            return Response({"detail": "Debe enviar csc"}, status=400)
        dto = get_cet_format(None, csc)
        serializer = RccFormatSerializer(dto)
        return Response(serializer.data)