export interface Report {
  id: number;
  information_entry: number;
  information_title: string;
  reason: 'outdated' | 'incorrect' | 'incomplete' | 'other';
  comment: string;
  status: 'pending' | 'reviewed' | 'resolved';
  created_at: string;
}
