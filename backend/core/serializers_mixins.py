from rest_framework import serializers
# core/constants.py
CO_CHOICES = [
    ("099", "Dir General"),
    ("001", "Comercio"),
    ("002", "Florida"),
    ("003", "San Francisco"),
    ("004", "Colombia"),
    ("005", "Provenza"),
    ("006", "Bucarica"),
    ("007", "K27"),
    ("008", "Ruitoque"),
    ("009", "Ciudadela"),
    ("010", "Piedecuesta"),
    ("011", "Cabecera"),
    ("012", "Giron"),
    ("013", "Coltabaco"),
    ("014", "Guarin"),
    ("015", "Caracoli"),
    ("016", "Rosita"),
    ("017", "Floresta"),
    ("018", "Gaira"),
    ("019", "Poblado"),
    ("020", "Novena"),
    ("021", "Soleri"),
    ("022", "Cumbre"),
    ("023", "Puerta del sol"),
    ("024", "La 200"),
    ("088", "Web barranca"),
    ("089", "Web Bmanga"),
    ("091", "Cedi"),
    ("092", "Fruver"),
    ("093", "Carnes"),
]
CO_MAP = dict(CO_CHOICES)


class CoLabelMixin(serializers.Serializer):
    co_label_mode = "replace"    # "add" | "replace"

    def to_representation(self, instance):
        data = super().to_representation(instance)
        for key in ("co", "CO", "Codigo", "CentroCosto"):
            if key in data:
                label = CO_MAP.get(data[key], data[key])
                if self.co_label_mode == "replace":
                    data[key] = label
                else:  # add
                    data[f"{key}_label"] = label
        return data
