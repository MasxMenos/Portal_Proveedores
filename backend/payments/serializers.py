# payments/serializers.py
from rest_framework import serializers

class PaymentsSerializer(serializers.Serializer):
    co               = serializers.CharField()
    documento        = serializers.CharField()
    fechaDocumento   = serializers.DateField(source="fecha_documento")
    valorDebito        = serializers.FloatField(source="valor_debito")
    valorCredito        = serializers.FloatField(source="valor_credito")
