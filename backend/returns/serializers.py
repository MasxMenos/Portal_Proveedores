# returns/serializers.py
from rest_framework import serializers
from core.serializers_mixins import CoLabelMixin


class ReturnsSerializer(CoLabelMixin, serializers.Serializer):
    co_label_mode = "replace"
    co               = serializers.CharField()
    documento        = serializers.CharField()
    fechaEmision = serializers.DateField(source="fecha_emision")
    motivo            = serializers.CharField()
    saldo            = serializers.FloatField()
    
class RetDetailSerializer(CoLabelMixin, serializers.Serializer):
    co_label_mode = "replace"
    Codigo = serializers.CharField()
    Descripcion = serializers.CharField()
    Recibido = serializers.FloatField() 
    PCosto = serializers.FloatField()     
    D1 = serializers.FloatField()             
    D2 = serializers.FloatField()
    Iva = serializers.FloatField()
    Ibua = serializers.FloatField()
    Icui = serializers.FloatField()
    Ipolic = serializers.FloatField()
    SubTotal = serializers.FloatField()
    Observaciones = serializers.CharField()



class RetFormatSerializer(serializers.Serializer):
    Header_Cia = serializers.CharField()
    Header_Nit_Cia = serializers.CharField()
    Header_Direccion_Cia = serializers.CharField()
    Header_Date = serializers.CharField()
    Header_NroDocumento = serializers.CharField()
    Header_FechaDoc = serializers.CharField()
    Header_Proveedor = serializers.CharField()
    Header_Proveedor_Nit = serializers.CharField()
    Header_Nombre_PDV = serializers.CharField()
    Header_Cod_PDV = serializers.CharField()
    Header_Proveedor_Dir = serializers.CharField()
    Header_Proveedor_Tel = serializers.CharField()
    Header_PDV_Dir = serializers.CharField()
    Header_PDV_tel = serializers.CharField()
    Header_Proveedor_Ciud = serializers.CharField()
    Header_PDV_Ciud = serializers.CharField()
    Header_Fecha_Entrega = serializers.CharField()
    FooterDsctoGlobla1 = serializers.FloatField()
    FooterDsctoGlobal2 = serializers.FloatField()
    FooterVlrComercial = serializers.FloatField()
    FooterDsctoComercial = serializers.FloatField()
    FooterTotalImp = serializers.FloatField()
    FooterTotalNeto = serializers.FloatField()
    Detalle               = RetDetailSerializer(many=True)