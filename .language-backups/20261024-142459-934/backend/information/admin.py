from django.contrib import admin
from .models import Category, Destination, InformationEntry


@admin.register(InformationEntry)
class InformationEntryAdmin(admin.ModelAdmin):
    list_display = ['title', 'category', 'destination', 'verification_status', 'is_published', 'last_verified']
    list_filter = ['verification_status', 'is_published', 'category']
    search_fields = ['title', 'summary', 'content']
    list_editable = ['is_published']


admin.site.register(Category)
admin.site.register(Destination)
