from django.db import models
from information.models import InformationEntry


class Report(models.Model):
    REASON_CHOICES = [
        ('outdated', 'Information appears outdated'),
        ('incorrect', 'Information is incorrect'),
        ('incomplete', 'Information is incomplete'),
        ('other', 'Other'),
    ]

    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('reviewed', 'Reviewed'),
        ('resolved', 'Resolved'),
    ]

    information_entry = models.ForeignKey(InformationEntry, on_delete=models.CASCADE, related_name='reports')
    reason = models.CharField(max_length=50, choices=REASON_CHOICES)
    comment = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'Report on "{self.information_entry.title}" - {self.reason}'
