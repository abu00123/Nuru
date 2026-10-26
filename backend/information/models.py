from django.conf import settings
from django.db import models
from .guides import validate_guide, validate_guide_translations

SUBSTANTIVE_FIELDS = {'title', 'summary', 'content', 'source_name', 'source_url', 'translations', 'guide', 'guide_translations'}


class Category(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)

    class Meta:
        verbose_name_plural = 'categories'

    def __str__(self):
        return self.name


class Destination(models.Model):
    country = models.CharField(max_length=100)
    province = models.CharField(max_length=100, blank=True)
    commune = models.CharField(max_length=100, blank=True)

    def __str__(self):
        parts = [self.commune, self.province, self.country]
        return ', '.join(p for p in parts if p)


class InformationEntry(models.Model):
    STATUS_CHOICES = [
        ('verified', 'Verified'),
        ('unverified', 'Unverified'),
        ('outdated', 'Outdated'),
    ]

    guide = models.JSONField(default=dict, blank=True, validators=[validate_guide], help_text='Optional eligibility, documents, ordered steps and useful contacts.')
    guide_translations = models.JSONField(default=dict, blank=True, validators=[validate_guide_translations], help_text='Translated guides by rn/rw/sw, each containing guide and reviewed.')
    translations = models.JSONField(default=dict, blank=True, help_text='Reviewed article translations by language code: rn, rw, sw. Each needs title, summary, content and reviewed: true.')
    title = models.CharField(max_length=255)
    summary = models.TextField()
    content = models.TextField()
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, related_name='entries')
    destination = models.ForeignKey(Destination, on_delete=models.SET_NULL, null=True, related_name='entries')
    source_name = models.CharField(max_length=255, blank=True)
    source_url = models.URLField(blank=True)
    verification_status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='unverified')
    last_verified = models.DateField(null=True, blank=True)
    is_published = models.BooleanField(default=False)
    content_version = models.PositiveIntegerField(default=1, editable=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name_plural = 'information entries'
        ordering = ['-created_at']

    def __str__(self):
        return self.title

    def save(self, *args, **kwargs):
        if self.pk:
            old = InformationEntry.objects.filter(pk=self.pk).values(*SUBSTANTIVE_FIELDS).first()
            if old and any(getattr(self, f) != old[f] for f in SUBSTANTIVE_FIELDS):
                self.content_version += 1
        super().save(*args, **kwargs)


class SourceReview(models.Model):
    OUTCOME_CHOICES = [
        ('suitable', 'Suitable for publication'),
        ('revision_required', 'Revision required'),
    ]

    entry = models.ForeignKey(InformationEntry, on_delete=models.CASCADE, related_name='source_reviews')
    entry_version = models.PositiveIntegerField()
    reviewed_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT, related_name='source_reviews')
    reviewed_at = models.DateTimeField(auto_now_add=True)
    outcome = models.CharField(max_length=30, choices=OUTCOME_CHOICES)
    notes = models.TextField()

    class Meta:
        ordering = ['-reviewed_at']

    def __str__(self):
        return f'{self.entry.title} — version {self.entry_version}: {self.outcome}'
