from django.contrib import admin
from .models import Report


@admin.register(Report)
class ReportAdmin(admin.ModelAdmin):
    list_display = ['information_entry', 'reason', 'status', 'created_at', 'resolved_by', 'resolved_at']
    list_filter = ['status', 'reason']
    readonly_fields = ['resolved_by', 'resolved_at', 'created_at']

    def save_model(self, request, obj, form, change):
        obj.record_resolution(request.user)
        super().save_model(request, obj, form, change)
