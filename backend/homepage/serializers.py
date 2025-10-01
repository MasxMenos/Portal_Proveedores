# backend/homepage/serializers.py
from rest_framework import serializers
# --------- Catálogos ----------

class ServiceLevelSerializer(serializers.Serializer):
    f420_id_proveedor = serializers.CharField()
    f420_proveedor = serializers.CharField()
    f420_cumplimiento = serializers.FloatField()

class TotalSalesSerializer(serializers.Serializer):
    ventas = serializers.CharField()

class TotalSalesProductSerializer(serializers.Serializer):
    quantity = serializers.CharField()

class TotalSalesMonthsSerializer(serializers.Serializer):
    f420_id_proveedor = serializers.CharField()
    f420_proveedor = serializers.CharField()
    month = serializers.CharField()
    value = serializers.FloatField()

class TopProductsSerializer(serializers.Serializer):
    descripcion = serializers.CharField()
    reference = serializers.CharField()
    quantity = serializers.FloatField()