from django.contrib import admin
from .models import Report


@admin.register(Report)
class ReportAdmin(admin.ModelAdmin):
    list_display = ['information_entry', 'reason', 'status', 'created_at']
    list_filter = ['status', 'reason']
    list_editable = ['status']
