from django.db import models


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
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name_plural = 'information entries'
        ordering = ['-created_at']

    def __str__(self):
        return self.title
