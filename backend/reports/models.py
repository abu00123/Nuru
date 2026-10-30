from django.db import models
from django.conf import settings
from django.core.exceptions import ValidationError
from django.utils import timezone
from information.models import InformationEntry


class Report(models.Model):
    REASON_CHOICES = [
        ('outdated', 'Information appears outdated'),
        ('incorrect', 'Information is incorrect'),
        ('incomplete', 'Information is incomplete'),
        ('other', 'Other'),
    ]

    STATUS_CHOICES = [
        ('pending', 'Open'),
        ('reviewed', 'In progress'),
        ('resolved', 'Resolved'),
    ]

    information_entry = models.ForeignKey(InformationEntry, on_delete=models.CASCADE, related_name='reports')
    reason = models.CharField(max_length=50, choices=REASON_CHOICES)
    comment = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    resolution_notes = models.TextField(blank=True)
    resolved_by = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True,
                                    on_delete=models.PROTECT, related_name='resolved_reports')
    resolved_at = models.DateTimeField(null=True, blank=True)

    def clean(self):
        super().clean()
        if self.status == 'resolved' and not self.resolution_notes.strip():
            raise ValidationError({'resolution_notes': 'Explain the outcome before resolving this report.'})

    def record_resolution(self, administrator):
        """Set server-owned attribution when resolving; clear it when reopening."""
        if self.status == 'resolved':
            previous = type(self).objects.filter(pk=self.pk).first() if self.pk else None
            if (not previous or previous.status != 'resolved'
                    or previous.resolution_notes != self.resolution_notes
                    or not previous.resolved_by_id):
                self.resolved_by = administrator
                self.resolved_at = timezone.now()
        else:
            self.resolution_notes = ''
            self.resolved_by = None
            self.resolved_at = None

    def __str__(self):
        return f'Report on "{self.information_entry.title}" - {self.reason}'
