from rest_framework import serializers
from .models import Report


class ReportSerializer(serializers.ModelSerializer):
    information_title = serializers.CharField(source='information_entry.title', read_only=True)
    resolved_by_name = serializers.StringRelatedField(source='resolved_by', read_only=True)

    def validate(self, attrs):
        if self.instance is None:
            if attrs.get('status', 'pending') != 'pending' or attrs.get('resolution_notes'):
                raise serializers.ValidationError('New reports must be open and cannot contain resolution details.')
        elif attrs.get('status', self.instance.status) == 'resolved':
            notes = attrs.get('resolution_notes', self.instance.resolution_notes)
            if not notes.strip():
                raise serializers.ValidationError({'resolution_notes': 'Explain the outcome before resolving this report.'})
        return attrs

    def update(self, instance, validated_data):
        for field, value in validated_data.items():
            setattr(instance, field, value)
        instance.record_resolution(self.context['request'].user)
        instance.save()
        return instance

    class Meta:
        model = Report
        fields = '__all__'
        read_only_fields = ['resolved_by', 'resolved_at']
