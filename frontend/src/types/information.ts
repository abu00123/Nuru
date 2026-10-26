import type {Guide,GuideTranslations} from '../features/core';
import type {ArticleTranslations} from '../i18n/core';

export interface SourceReview {
  id: number;
  entry_version: number;
  reviewed_by: string;
  reviewed_at: string;
  outcome: 'suitable' | 'revision_required';
  notes: string;
}

export interface InformationEntry {
  translations?: ArticleTranslations;
  guide?: Guide;
  guide_translations?: GuideTranslations;
  id: number;
  title: string;
  summary: string;
  content: string;
  category: number;
  category_name: string;
  destination: number;
  destination_name: string;
  source_name: string;
  source_url: string;
  verification_status: 'verified' | 'unverified' | 'outdated';
  last_verified: string | null;
  is_published: boolean;
  content_version: number;
  latest_review: SourceReview | null;
  created_at: string;
  updated_at: string;
}
