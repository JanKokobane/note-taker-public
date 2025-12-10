export type NoteCategory =
  | 'work'
  | 'study'
  | 'personal'
  | 'finance'
  | 'health'
  | 'learning'
  | 'other';

export interface Note {
  id: string;
  user_id: string;
  title: string | null;
  content: string;
  category: NoteCategory;
  created_at: string;
  edited_at: string | null;
}
