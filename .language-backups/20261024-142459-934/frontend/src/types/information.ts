export interface InformationEntry {
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
  created_at: string;
  updated_at: string;
}
