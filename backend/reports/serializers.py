from rest_framework import serializers
from .models import Report


class ReportSerializer(serializers.ModelSerializer):
    information_title = serializers.CharField(source='information_entry.title', read_only=True)

    class Meta:
        model = Report
        fields = '__all__'
