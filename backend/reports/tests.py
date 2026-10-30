from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework.test import APITestCase
from information.models import InformationEntry
from .models import Report


class ReportResolutionTests(APITestCase):
    def setUp(self):
        self.admin = get_user_model().objects.create_superuser('report-admin', password='test-password')
        self.entry = InformationEntry.objects.create(title='Test', summary='Summary', content='Content')
        self.report = Report.objects.create(information_entry=self.entry, reason='outdated')
        self.url = f'/api/reports/{self.report.pk}/'
        self.client.force_authenticate(self.admin)

    def test_resolution_requires_nonblank_notes(self):
        for notes in ('', '   '):
            response = self.client.patch(self.url, {'status': 'resolved', 'resolution_notes': notes})
            self.assertEqual(response.status_code, 400)
        self.report.refresh_from_db()
        self.assertEqual(self.report.status, 'pending')

    def test_resolution_records_server_owned_identity_and_date(self):
        response = self.client.patch(self.url, {
            'status': 'resolved', 'resolution_notes': 'Corrected the source date.',
            'resolved_by': 9999, 'resolved_at': '2000-01-01T00:00:00Z',
        })
        self.assertEqual(response.status_code, 200)
        self.report.refresh_from_db()
        self.assertEqual(self.report.resolved_by, self.admin)
        self.assertIsNotNone(self.report.resolved_at)
        self.assertNotEqual(self.report.resolved_at.year, 2000)
        self.assertEqual(response.data['resolved_by_name'], 'report-admin')
        timestamp = self.report.resolved_at
        self.client.patch(self.url, {'status': 'resolved'})
        self.report.refresh_from_db()
        self.assertEqual(self.report.resolved_at, timestamp)

    def test_reopening_clears_resolution(self):
        self.client.patch(self.url, {'status': 'resolved', 'resolution_notes': 'Checked source.'})
        response = self.client.patch(self.url, {'status': 'reviewed'})
        self.assertEqual(response.status_code, 200)
        self.report.refresh_from_db()
        self.assertIsNone(self.report.resolved_by)
        self.assertIsNone(self.report.resolved_at)
        self.assertEqual(self.report.resolution_notes, '')

    def test_public_cannot_resolve_or_submit_already_resolved_report(self):
        self.client.force_authenticate(None)
        self.assertEqual(self.client.patch(self.url, {'status': 'resolved'}).status_code, 401)
        response = self.client.post('/api/reports/', {
            'information_entry': self.entry.pk, 'reason': 'outdated',
            'status': 'resolved', 'resolution_notes': 'Forged outcome',
        })
        self.assertEqual(response.status_code, 400)
        response = self.client.post('/api/reports/', {
            'information_entry': self.entry.pk, 'reason': 'outdated',
        })
        self.assertEqual(response.status_code, 201)

    def test_django_admin_requires_notes_and_records_resolution(self):
        self.client.force_login(self.admin)
        url = reverse('admin:reports_report_change', args=[self.report.pk])
        data = {'information_entry': self.entry.pk, 'reason': 'outdated',
                'comment': '', 'status': 'resolved', 'resolution_notes': '', '_save': 'Save'}
        response = self.client.post(url, data)
        self.assertContains(response, 'Explain the outcome')
        data['resolution_notes'] = 'Confirmed and corrected the source.'
        self.assertEqual(self.client.post(url, data).status_code, 302)
        self.report.refresh_from_db()
        self.assertEqual(self.report.resolved_by, self.admin)
        self.assertIsNotNone(self.report.resolved_at)

    def test_django_admin_creating_resolved_report_records_attribution(self):
        self.client.force_login(self.admin)
        response = self.client.post(reverse('admin:reports_report_add'), {
            'information_entry': self.entry.pk, 'reason': 'outdated',
            'status': 'resolved', 'resolution_notes': 'Test workflow only.', '_save': 'Save',
        })
        self.assertEqual(response.status_code, 302)
        report = Report.objects.exclude(pk=self.report.pk).get()
        self.assertEqual(report.resolved_by, self.admin)
        self.assertIsNotNone(report.resolved_at)
