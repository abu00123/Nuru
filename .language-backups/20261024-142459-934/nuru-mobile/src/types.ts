export interface Category { id: number; name: string; description: string }
export interface Destination { id: number; country: string; province: string; commune: string }
export interface Information {
  id: number; title: string; summary: string; content: string;
  category: number | null; category_name: string | null;
  destination: number | null; destination_name: string | null;
  source_name: string; source_url: string;
  verification_status: 'verified' | 'unverified' | 'outdated';
  last_verified: string | null; updated_at: string; is_published: boolean;
}
export type Reason = 'outdated' | 'incorrect' | 'incomplete' | 'other';
