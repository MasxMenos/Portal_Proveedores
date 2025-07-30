# payments/serializers.py
from rest_framework import serializers


class PaymentsSerializer(serializers.Serializer):
    co               = serializers.CharField()
    documento        = serializers.CharField()
    fechaDocumento   = serializers.DateField(source="fecha_documento")
    valorDebito        = serializers.FloatField(source="valor_debito")
    valorCredito        = serializers.FloatField(source="valor_credito")


class MovementSerializer(serializers.Serializer):
    CO        = serializers.CharField()
    Descripcion     = serializers.CharField()
    Debitos   = serializers.FloatField()
    Creditos  = serializers.FloatField()

class RetencionSerializer(serializers.Serializer):
    CO              = serializers.CharField()
    Clase           = serializers.CharField()
    Descripcion     = serializers.CharField()
    Total_Retencion = serializers.FloatField()

class PaymentsDetailSerializer(serializers.Serializer):
    CO        = serializers.CharField()
    documento = serializers.CharField()
    fecha     = serializers.DateField(format="%Y-%m-%d")
    debitos   = serializers.FloatField()
    creditos  = serializers.FloatField()
    movements = MovementSerializer(many=True)
    retencion = RetencionSerializer(many=True)