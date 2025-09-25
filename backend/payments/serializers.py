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

class RccDetailSerializer(serializers.Serializer):
    Auxiliar     = serializers.CharField()
    Razon_Social = serializers.CharField()
    CO           = serializers.CharField()
    Tercero      = serializers.CharField()
    Docto_Cruce  = serializers.CharField()
    Debito = serializers.FloatField()
    Credito = serializers.FloatField()


class RccFormatSerializer(serializers.Serializer):
    Header_Cia            = serializers.CharField()
    Header_Nit_Cia        = serializers.CharField()
    Header_Direccion_Cia  = serializers.CharField()
    Header_Nit            = serializers.CharField()
    Header_Nro            = serializers.CharField()
    Header_Fecha_Impresion= serializers.CharField()
    Header_Razon_Social   = serializers.CharField()
    Header_Dir            = serializers.CharField()
    Header_Ciudad         = serializers.CharField()
    Header_Nit_Proveedor  = serializers.CharField()
    Header_Telefono       = serializers.CharField()
    Header_Correo         = serializers.CharField()
    Header_Fecha_Doc      = serializers.CharField()
    Footer_Notas          = serializers.CharField()
    Footer_Total_Db       = serializers.FloatField()
    Footer_Total_Cr       = serializers.FloatField()
    Detalle               = RccDetailSerializer(many=True)


class CetDetailSerializer(serializers.Serializer):
    Auxiliar       = serializers.CharField()
    CO             = serializers.CharField()
    UN             = serializers.CharField()
    Tercero        = serializers.CharField()
    RazonSocial    = serializers.CharField()
    DCruce_MPago   = serializers.CharField()
    Debitos        = serializers.FloatField()
    Creditos       = serializers.FloatField()


class CetFormatSerializer(serializers.Serializer):
    Header_Cia               = serializers.CharField()
    Header_Nit_Cia           = serializers.CharField()
    Header_Dir_Cia           = serializers.CharField()
    Header_Doc               = serializers.CharField()
    Header_Nro_Doc           = serializers.CharField()
    Header_Fecha_Act         = serializers.CharField()
    Header_Prov              = serializers.CharField()
    Header_Dir_Prov          = serializers.CharField()
    Header_Tel_Prov          = serializers.CharField()
    Header_Nit_Prov          = serializers.CharField()
    Header_Ciudad            = serializers.CharField()
    Header_Fecha_Doc         = serializers.CharField()
    Header_Docto_Referencia  = serializers.CharField()
    Header_Cuenta            = serializers.CharField()
    Header_Cuenta_Bancaria   = serializers.CharField()
    Header_Valor_Consignacion= serializers.FloatField()
    Header_Banco             = serializers.CharField()
    Footer_SumaIgualCR     = serializers.FloatField()
    Footer_SumaIgualDB      = serializers.FloatField()
    Detalle                  = CetDetailSerializer(many=True)