# invoices/serializers.py
from rest_framework import serializers

class InvoiceSerializer(serializers.Serializer):
    co               = serializers.CharField()
    documento        = serializers.CharField()
    fechaProveedor   = serializers.DateField(source="fecha_emision")
    fechaVencimiento = serializers.DateField(source="fecha_vencimiento")
    valorPago        = serializers.FloatField(source="valor_pago")
    descuentos       = serializers.FloatField()
