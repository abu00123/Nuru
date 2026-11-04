from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase

from .models import InformationEntry, SourceReview
from django.test import TestCase
from django.urls import reverse


class SourceDateTests(APITestCase):
    def setUp(self):
        self.admin = get_user_model().objects.create_user('date-admin', is_staff=True)
        self.entry = InformationEntry.objects.create(
            title='Date test', summary='Summary', content='Content', source_name='Test source',
            last_verified='2000-01-01',
        )
        self.url = f'/api/information/{self.entry.pk}/'
        self.client.force_authenticate(self.admin)

    def test_unknown_publication_date_and_legacy_check_date(self):
        response = self.client.get(self.url)
        self.assertIsNone(response.data['source_publication_date'])
        self.assertIsNone(response.data['last_verified'])

    def test_current_suitable_review_sets_check_date_and_edit_invalidates_it(self):
        review = SourceReview.objects.create(entry=self.entry, entry_version=1,
            reviewed_by=self.admin, outcome='suitable', notes='Checked source')
        self.assertEqual(self.client.get(self.url).data['last_verified'], review.reviewed_at.date().isoformat())
        response = self.client.patch(self.url, {'content': 'Updated content'}, format='json')
        self.assertEqual(response.status_code, 200)
        self.assertIsNone(response.data['last_verified'])

    def test_publication_date_is_saved_in_snapshot_and_requires_new_review(self):
        response = self.client.patch(self.url, {'source_publication_date': '2026-09-01'}, format='json')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['source_publication_date'], '2026-09-01')
        self.entry.refresh_from_db()
        self.assertEqual(self.entry.content_version, 2)
        self.assertEqual(self.entry.revisions.get(version=2).snapshot['source_publication_date'], '2026-09-01')

    def test_invalid_date_rejected_and_manual_check_date_ignored(self):
        self.assertEqual(self.client.patch(self.url, {'source_publication_date': 'invalid'}).status_code, 400)
        response = self.client.patch(self.url, {'last_verified': '2026-10-28'})
        self.assertEqual(response.status_code, 200)
        self.assertIsNone(response.data['last_verified'])


class InformationSearchTests(APITestCase):
    def create_entry(self, **overrides):
        fields = dict(title='General guidance', summary='Overview', content='Body text', is_published=True)
        fields.update(overrides)
        return InformationEntry.objects.create(**fields)

    def search_ids(self, keyword):
        response = self.client.get('/api/information/', {'search': keyword})
        self.assertEqual(response.status_code, 200)
        return [entry['id'] for entry in response.data]

    def test_search_matches_title_summary_and_body_case_insensitively(self):
        for field in ('title', 'summary', 'content'):
            with self.subTest(field=field):
                entry = self.create_entry(**{field: 'Contains NeedleWord here'})
                self.assertIn(entry.pk, self.search_ids('needleword'))

    def test_reviewed_translation_body_is_searchable_in_each_language(self):
        for language in ('rn', 'rw', 'sw'):
            with self.subTest(language=language):
                entry = self.create_entry(translations={language: {
                    'title': 'Translated title', 'summary': 'Translated summary',
                    'content': 'Translated body NeedleWord', 'reviewed': True,
                }})
                self.assertIn(entry.pk, self.search_ids('needleword'))

    def test_unreviewed_translations_and_drafts_are_not_public_search_results(self):
        self.create_entry(content='NeedleWord', is_published=False)
        self.create_entry(translations={'rn': {
            'title': 'NeedleWord', 'summary': 'NeedleWord',
            'content': 'NeedleWord', 'reviewed': False,
        }})
        self.assertEqual(self.search_ids('needleword'), [])

    def test_no_match_returns_empty_results(self):
        self.create_entry()
        self.assertEqual(self.search_ids('unmatched-word'), [])


class RevisionHistoryTests(TestCase):
    def setUp(self):
        self.entry = InformationEntry.objects.create(
            title='History test', summary='Original summary', content='Original text',
            source_name='Original source', guide={'documents': ['Document A']},
        )

    def test_edits_preserve_old_content_and_nested_guide(self):
        self.entry.content = 'Updated text'
        self.entry.guide['documents'].append('Document B')
        self.entry.save()
        self.assertEqual(self.entry.content_version, 2)
        old = self.entry.revisions.get(version=1)
        self.assertEqual(old.snapshot['content'], 'Original text')
        self.assertEqual(old.snapshot['guide']['documents'], ['Document A'])
        self.assertEqual(self.entry.revisions.get(version=2).snapshot['content'], 'Updated text')

    def test_unchanged_save_does_not_duplicate_history(self):
        self.entry.save()
        self.assertEqual(self.entry.revisions.count(), 1)

    def test_upgrade_captures_current_version_without_inventing_past_versions(self):
        from importlib import import_module
        from django.apps import apps
        from django.db import connection
        self.entry.revisions.all().delete()
        InformationEntry.objects.filter(pk=self.entry.pk).update(content_version=3)
        migration = import_module('information.migrations.0005_entryrevision')
        migration.capture_current_versions(apps, connection.schema_editor())
        self.assertEqual(list(self.entry.revisions.values_list('version', flat=True)), [3])
        self.assertEqual(self.entry.revisions.get().snapshot['content'], 'Original text')

    def test_partial_save_captures_only_persisted_changes(self):
        self.entry.title = 'Unsaved title'
        self.entry.content = 'Updated text'
        self.entry.save(update_fields=['content'])
        revision = self.entry.revisions.get(version=2)
        self.assertEqual(revision.snapshot['title'], 'History test')
        self.assertEqual(revision.snapshot['content'], 'Updated text')

    def test_admin_can_inspect_snapshot_and_matching_review(self):
        admin = get_user_model().objects.create_superuser('history-admin', password='test-password')
        SourceReview.objects.create(
            entry=self.entry, entry_version=1, reviewed_by=admin,
            outcome='suitable', notes='Review of original text',
        )
        self.entry.content = 'Updated text'
        self.entry.save()
        self.client.force_login(admin)
        old = self.entry.revisions.get(version=1)
        url = reverse('admin:information_entryrevision_change', args=[old.pk])
        response = self.client.get(url)
        self.assertContains(response, 'Original text')
        self.assertContains(response, 'Review of original text')
        self.assertContains(response, 'history-admin')
        self.assertEqual(self.client.post(url, {'snapshot': {}}).status_code, 403)
        self.client.logout()
        self.assertEqual(self.client.get(url).status_code, 302)


class PublicationWorkflowTests(APITestCase):
    """Test the source review and publication workflow through the API, including permissions and public access."""

    @classmethod
    def setUpTestData(cls):
        cls.admin = get_user_model().objects.create_user(username='editor', is_staff=True)
        cls.reader = get_user_model().objects.create_user(username='reader')

    def setUp(self):
        self.entry = InformationEntry.objects.create(
            title='Test guidance', summary='Test summary', content='Original content',
            source_name='Test source', source_url='https://example.org/guidance',
        )
        self.detail_url = f'/api/information/{self.entry.pk}/'
        self.review_url = f'{self.detail_url}reviews/'
        self.client.force_authenticate(self.admin)

    def review(self, outcome='suitable'):
        response = self.client.post(self.review_url, {
            'outcome': outcome, 'notes': 'Compared the entry against its cited source.',
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        return response

    def publish(self):
        return self.client.patch(self.detail_url, {'is_published': True}, format='json')

    def test_new_entry_cannot_be_created_published(self):
        response = self.client.post('/api/information/', {
            'title': 'New entry', 'summary': 'Summary', 'content': 'Content',
            'source_name': 'Test source', 'is_published': True,
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('is_published', response.data)

    def test_publication_without_review_is_rejected(self):
        response = self.publish()
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.entry.refresh_from_db()
        self.assertFalse(self.entry.is_published)

    def test_suitable_review_records_identity_and_allows_publication(self):
        self.review()
        review = SourceReview.objects.get(entry=self.entry)
        self.assertEqual(review.reviewed_by, self.admin)
        self.assertEqual(review.entry_version, self.entry.content_version)
        self.assertIsNotNone(review.reviewed_at)
        self.assertEqual(self.publish().status_code, status.HTTP_200_OK)
        self.client.force_authenticate(None)
        self.assertEqual(self.client.get(self.detail_url).status_code, status.HTTP_200_OK)

    def test_unsuitable_review_does_not_allow_publication(self):
        self.review('revision_required')
        self.assertEqual(self.publish().status_code, status.HTTP_400_BAD_REQUEST)

    def test_source_is_required_even_with_suitable_review(self):
        self.review()
        response = self.client.patch(self.detail_url, {
            'source_name': '', 'is_published': True,
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('source_name', response.data)

    def test_published_edit_cannot_reuse_previous_review(self):
        self.review()
        self.assertEqual(self.publish().status_code, status.HTTP_200_OK)
        response = self.client.patch(self.detail_url, {'content': 'Changed content'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.entry.refresh_from_db()
        self.assertEqual(self.entry.content, 'Original content')
        self.assertEqual(self.entry.content_version, 1)

    def test_draft_edit_requires_new_review_before_republication(self):
        self.review()
        self.assertEqual(self.publish().status_code, status.HTTP_200_OK)
        response = self.client.patch(self.detail_url, {
            'content': 'Changed content', 'is_published': False,
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.entry.refresh_from_db()
        self.assertEqual(self.entry.content_version, 2)
        self.assertEqual(self.publish().status_code, status.HTTP_400_BAD_REQUEST)
        self.review()
        self.assertEqual(self.publish().status_code, status.HTTP_200_OK)

    def test_public_cannot_list_or_retrieve_drafts(self):
        self.client.force_authenticate(None)
        response = self.client.get('/api/information/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertNotIn(self.entry.pk, [entry['id'] for entry in response.data])
        self.assertEqual(self.client.get(self.detail_url).status_code, status.HTTP_404_NOT_FOUND)

    def test_non_admin_cannot_review_or_publish(self):
        for user, expected in ((None, status.HTTP_401_UNAUTHORIZED),
                               (self.reader, status.HTTP_403_FORBIDDEN)):
            with self.subTest(user=user):
                self.client.force_authenticate(user)
                response = self.client.post(self.review_url, {
                    'outcome': 'suitable', 'notes': 'Unauthorized review',
                }, format='json')
                self.assertEqual(response.status_code, expected)
                self.assertEqual(self.publish().status_code, expected)
        self.assertFalse(SourceReview.objects.filter(entry=self.entry).exists())
