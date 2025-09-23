# invoices/serializers.py
from rest_framework import serializers

class InvoiceSerializer(serializers.Serializer):
    co               = serializers.CharField()
    documento        = serializers.CharField()
    fechaProveedor   = serializers.DateField(source="fecha_emision")
    fechaVencimiento = serializers.DateField(source="fecha_vencimiento")
    valorPago        = serializers.FloatField(source="valor_pago")
    descuentos       = serializers.FloatField()

class NacDetailSerializer(serializers.Serializer):
    CentroCosto =  serializers.CharField()
    DescripcionArticulo =  serializers.CharField()
    Tasa = serializers.CharField()
    ValorImpuesto = serializers.FloatField()
    ValorDescuento =  serializers.FloatField()
    ValorUnd = serializers.FloatField()
    ValorTotal = serializers.FloatField()


class NacFormatSerializer(serializers.Serializer):
    Header_Cia            = serializers.CharField()
    Header_Nit_Cia          = serializers.CharField()
    Header_Direccion_Cia            = serializers.CharField()
    Header_Fecha_Impresion          = serializers.CharField()
    Header_Documento            = serializers.CharField()
    Header_Nit          = serializers.CharField()
    Header_Razon_Social         = serializers.CharField()
    Header_Ciudad           = serializers.CharField()
    Header_Correo           = serializers.CharField()
    Header_Telefono         = serializers.CharField()
    Header_Fecha_Doc            = serializers.CharField()
    Header_Fecha_Vec            = serializers.CharField()
    Footer_Vendedor         = serializers.CharField()
    Footer_BaseRetencion            = serializers.FloatField()
    Footer_ValorRetencion           = serializers.FloatField()
    Footer_Observaciones            = serializers.CharField()
    Footer_VentaTotal           = serializers.FloatField()
    Footer_Iva          = serializers.FloatField()
    Footer_Retencion            = serializers.FloatField()
    Footer_NetoPagar            = serializers.FloatField()
    Detalle               = NacDetailSerializer(many=True)