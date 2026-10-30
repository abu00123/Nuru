"""Add the user-supplied electrification notice as an unpublished draft."""
import json
from datetime import date
from django.db import transaction
from information.models import Category, Destination, InformationEntry

title = 'Rural electrification partnership approved for Burunga and Buhumuza'
with transaction.atomic():
    existing = InformationEntry.objects.filter(title=title).first()
    if existing:
        print(json.dumps({'result': 'already exists', 'id': existing.pk, 'published': existing.is_published}))
    else:
        category, _ = Category.objects.get_or_create(name='Infrastructure / Electricity')
        destination, _ = Destination.objects.get_or_create(
            country='Burundi', province='Burunga and Buhumuza', commune='',
        )
        entry = InformationEntry.objects.create(
            title=title, category=category, destination=destination,
            summary='Burundi has approved a public–private partnership contract with Weza Power for a rural electrification programme, principally in Burunga and Buhumuza.',
            content=(
                'Decree No. 100/153, dated 15 October 2026, approves the partnership contract. '
                'This announcement concerns approval of the programme; it does not establish '
                'that electricity connections are currently available in a particular community.\n\n'
                'Destination coverage: Burunga and Buhumuza; specific communes not established by this decree.\n\n'
                'Limitations: The decree does not specify household connection dates, charges, '
                'application procedures or confirmed service availability in individual communes.\n\n'
                'Support contacts: Not provided in this decree.\n\n'
                'Last source check supplied by the contributor: 30 October 2026. '
                'An administrator source review has not yet been recorded in Nuru.'
            ),
            source_name='Presidency of the Republic of Burundi',
            source_publication_date=date(2026, 10, 26),
            last_verified=date(2026, 10, 30),
            verification_status='unverified', is_published=False,
        )
        entry.refresh_from_db()
        print(json.dumps({'result': 'created', 'id': entry.pk, 'published': entry.is_published,
                          'version': entry.content_version, 'revisions': entry.revisions.count()}))
