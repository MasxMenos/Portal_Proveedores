from django.db import models

class Counter(models.Model):
    key = models.CharField(max_length=50, unique=True)
    value = models.BigIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "homepage_counter"  # opcional
        verbose_name = "Contador"
        verbose_name_plural = "Contadores"

    def __str__(self):
        return f"{self.key}={self.value}"