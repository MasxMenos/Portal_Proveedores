import os
import uuid
from datetime import datetime, timedelta

from django.conf import settings
from django.db import transaction
from django.utils import timezone
from django.utils.timezone import now

from rest_framework import viewsets, mixins, permissions, status
from rest_framework.decorators import action
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from rest_framework.views import APIView

from users.authentication import PrvUsuarioJWTAuthentication

from .models import (
    GeoCountry, GeoRegion, GeoCity, Bank,
    KycDocumentType, KycDocument, KycFormSubmission
)
from .serializers import (
    GeoCountrySerializer, GeoRegionSerializer, GeoCitySerializer, BankSerializer,
    KycDocumentTypeSerializer, KycDocumentSerializer, KycFormSubmissionSerializer
)
from .services import create_new_submission


# ========== Permisos ==========
class IsAuthenticatedSimple(permissions.IsAuthenticated):
    pass


# ========== Catálogos ==========
class CountryViewSet(mixins.ListModelMixin, viewsets.GenericViewSet):
    queryset = GeoCountry.objects.all().order_by("name")
    serializer_class = GeoCountrySerializer
    authentication_classes = [PrvUsuarioJWTAuthentication]
    permission_classes = [IsAuthenticatedSimple]


class RegionViewSet(mixins.ListModelMixin, viewsets.GenericViewSet):
    serializer_class = GeoRegionSerializer
    authentication_classes = [PrvUsuarioJWTAuthentication]
    permission_classes = [IsAuthenticatedSimple]

    def get_queryset(self):
        qs = GeoRegion.objects.all().order_by("name")
        country_id = self.request.query_params.get("country_id")
        if country_id:
            qs = qs.filter(country_id=country_id)
        return qs


class CityViewSet(mixins.ListModelMixin, viewsets.GenericViewSet):
    serializer_class = GeoCitySerializer
    authentication_classes = [PrvUsuarioJWTAuthentication]
    permission_classes = [IsAuthenticatedSimple]

    def get_queryset(self):
        qs = GeoCity.objects.all().order_by("name")
        region_id = self.request.query_params.get("region_id")
        if region_id:
            qs = qs.filter(region_id=region_id)
        return qs


class BankViewSet(mixins.ListModelMixin, viewsets.GenericViewSet):
    serializer_class = BankSerializer
    authentication_classes = [PrvUsuarioJWTAuthentication]
    permission_classes = [IsAuthenticatedSimple]

    def get_queryset(self):
        qs = Bank.objects.all().order_by("name")
        country_id = self.request.query_params.get("country_id")
        if country_id:
            qs = qs.filter(country_id=country_id)
        q = self.request.query_params.get("q")
        if q:
            qs = qs.filter(name__icontains=q)
        return qs


class DocumentTypeViewSet(mixins.ListModelMixin, viewsets.GenericViewSet):
    queryset = KycDocumentType.objects.all().order_by("code")
    serializer_class = KycDocumentTypeSerializer
    authentication_classes = [PrvUsuarioJWTAuthentication]
    permission_classes = [IsAuthenticatedSimple]


class IdTypesView(APIView):
    authentication_classes = [PrvUsuarioJWTAuthentication]
    permission_classes = [IsAuthenticatedSimple]

    def get(self, request):
        data = [
            {"code": "31", "name": "31 - NIT - RUT"},
            {"code": "13", "name": "13 - Cédula de Ciudadanía"},
            {"code": "22", "name": "22 - Cédula de Extranjería"},
            {"code": "41", "name": "41 - Pasaporte"},
        ]
        return Response(data)


# ========== KYC Core ==========
class KycFormSubmissionViewSet(viewsets.GenericViewSet,
                               mixins.RetrieveModelMixin,
                               mixins.CreateModelMixin):
    """
    - POST /api/kyc/submissions/                       -> crear nueva versión (current)
    - GET  /api/kyc/submissions/{id}/                  -> recuperar detalle
    - GET  /api/kyc/submissions/status/                -> estado KYC
    - POST /api/kyc/submissions/documents/upload/      -> subir documento (multipart)
    """
    queryset = KycFormSubmission.objects.all()
    serializer_class = KycFormSubmissionSerializer
    authentication_classes = [PrvUsuarioJWTAuthentication]
    permission_classes = [IsAuthenticatedSimple]

    def get_queryset(self):
        return KycFormSubmission.objects.filter(user_id=self.request.user.id)

    @action(detail=False, methods=["get"], url_path="status")
    def status(self, request):
        user = request.user
        current = (
            KycFormSubmission.objects
            .filter(user=user, is_current=True)
            .order_by("-version")
            .first()
        )

        due_date = getattr(user, "form_next_due", None)
        must_fill = (getattr(user, "form_last_completed", None) is None) or (
            bool(due_date) and due_date <= now().date()
        ) or bool(getattr(user, "require_form", False))

        required_codes = set(
            KycDocumentType.objects.filter(obligatorio=True).values_list("code", flat=True)
        )

        have_codes = set()
        expired = []
        if current:
            docs = KycDocument.objects.filter(submission=current).select_related("tipo")
            for d in docs:
                if d.tipo and d.tipo.code:
                    have_codes.add(d.tipo.code)
                if d.expires_at and d.expires_at < now().date():
                    expired.append({
                        "tipo_code": d.tipo.code if d.tipo else None,
                        "tipo_name": d.tipo.name if d.tipo else None,
                        "expires_at": d.expires_at,
                        "url": d.url,
                    })

        missing = sorted(list(required_codes - have_codes))
        payload = {
            "must_fill": bool(must_fill),
            "last_completed": getattr(user, "form_last_completed", None),
            "next_due": due_date,
            "current_submission_id": current.id if current else None,
            "missing_required_docs": missing,
            "expired_docs": expired,
        }
        return Response(payload)

    def create(self, request, *args, **kwargs):
        user = request.user
        ser = self.get_serializer(data=request.data)
        ser.is_valid(raise_exception=True)
        sub = create_new_submission(user, ser.validated_data)
        return Response(self.get_serializer(sub).data, status=status.HTTP_201_CREATED)

    @action(
        detail=False,
        methods=["post"],
        url_path="documents/upload",
        parser_classes=[MultiPartParser, FormParser],
        permission_classes=[IsAuthenticatedSimple],
    )
    def upload_document(self, request):
        """
        multipart/form-data:
          - submission_id (int, opcional)
          - tipo (code o id del KycDocumentType)
          - file (archivo) [OBLIGATORIO]
          - fecha (YYYY-MM-DD) opcional -> doc_date
        Guarda en: MEDIA_ROOT/<KYC_UPLOADS_FOLDER>/<user>/<submission>/<code>/
        """
        user = request.user
        tipo_code_or_id = request.data.get("tipo")
        file = request.FILES.get("file")
        fecha_str = request.data.get("fecha")  # opcional

        if not file or not tipo_code_or_id:
            return Response({"detail": "tipo y file son requeridos."},
                            status=status.HTTP_400_BAD_REQUEST)

        # 1) obtener/crear submission actual
        submission_id = request.data.get("submission_id")
        with transaction.atomic():
            if submission_id:
                try:
                    current = KycFormSubmission.objects.select_for_update().get(
                        id=int(submission_id), user=user
                    )
                except KycFormSubmission.DoesNotExist:
                    return Response({"detail": "Submission no encontrada."}, status=404)
            else:
                current = (
                    KycFormSubmission.objects.select_for_update()
                    .filter(user=user, is_current=True)
                    .order_by("-version")
                    .first()
                )
                if not current:
                    last_ver = (KycFormSubmission.objects
                                .filter(user=user)
                                .aggregate_max('version') or 0)
                    # aggregate_max helper no existe: reemplazamos:
                    last_ver = (KycFormSubmission.objects.filter(user=user)
                                .order_by('-version').values_list('version', flat=True).first() or 0)

                    current = KycFormSubmission.objects.create(
                        user=user,
                        version=last_ver + 1,
                        is_current=True,
                        created_at=now(),
                        completed_at=None,
                    )
                    if not getattr(user, "require_form", False):
                        user.require_form = True
                        user.save(update_fields=["require_form"])

        # 2) resolver tipo por id o code
        try:
            if str(tipo_code_or_id).isdigit():
                tipo_inst = KycDocumentType.objects.get(id=int(tipo_code_or_id))
            else:
                tipo_inst = KycDocumentType.objects.get(code=tipo_code_or_id)
        except KycDocumentType.DoesNotExist:
            return Response({"detail": "Tipo de documento no válido."},
                            status=status.HTTP_400_BAD_REQUEST)

        # 3) ruta de almacenamiento
        base_folder = getattr(settings, "KYC_UPLOADS_FOLDER", "kyc")
        media_root = getattr(settings, "MEDIA_ROOT", ".")
        target_dir = os.path.join(
            media_root, base_folder, str(user.id), str(current.id), tipo_inst.code
        )
        os.makedirs(target_dir, exist_ok=True)

        # 4) renombrar y guardar
        _, ext = os.path.splitext(file.name)
        stored_filename = f"{user.id}_{tipo_inst.code}_{uuid.uuid4().hex}{ext.lower()}"
        full_path = os.path.join(target_dir, stored_filename)
        with open(full_path, "wb+") as dest:
            for chunk in file.chunks():
                dest.write(chunk)

        # 5) URL pública
        media_url = getattr(settings, "MEDIA_URL", "/media/")
        rel_path = os.path.join(base_folder, str(user.id), str(current.id), tipo_inst.code, stored_filename).replace("\\", "/")
        url = f"{media_url}{rel_path}"

        # 6) fechas
        doc_date = None
        if fecha_str:
            try:
                doc_date = datetime.strptime(fecha_str, "%Y-%m-%d").date()
            except ValueError:
                return Response({"detail": "Fecha inválida. Formato yyyy-mm-dd."}, status=400)

        expires_at = None
        if getattr(tipo_inst, "expires_in_days", None):
            base = doc_date or now().date()
            expires_at = base + timedelta(days=int(tipo_inst.expires_in_days))

        # 7) persistir documento (modelo alíneado a tu tabla)
        doc = KycDocument.objects.create(
            submission=current,
            tipo=tipo_inst,  # FK con db_column='tipo' en el modelo
            original_filename=file.name,
            stored_filename=stored_filename,
            url=url,
            uploaded_at=now(),
            doc_date=doc_date,
            expires_at=expires_at,
            is_valid=True,
        )

        return Response({
            "id": doc.id,
            "submission_id": current.id,
            "tipo": tipo_inst.code,
            "original_filename": doc.original_filename,
            "stored_filename": doc.stored_filename,
            "url": doc.url,
            "doc_date": doc.doc_date,
            "expires_at": doc.expires_at,
        }, status=201)
