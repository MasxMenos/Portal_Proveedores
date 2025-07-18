# returns/serializers.py
from rest_framework import serializers

class ReturnsSerializer(serializers.Serializer):
    co               = serializers.CharField()
    documento        = serializers.CharField()
    fechaEmision = serializers.DateField(source="fecha_emision")
    motivo            = serializers.CharField()
    saldo            = serializers.FloatField()
    
