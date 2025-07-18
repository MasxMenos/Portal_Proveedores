# Certificates/serializers.py
from rest_framework import serializers

class CertificatesSerializer(serializers.Serializer):
    co               = serializers.CharField()
    documento        = serializers.CharField()
    ciudad   = serializers.CharField()
    valorDebito        = serializers.FloatField(source="valor_debito")
    valorCredito        = serializers.FloatField(source="valor_credito")

            