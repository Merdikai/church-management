export type AnnouncementScope = 'global' | 'team';

export interface Announcement {
  id: string;
  title: string;
  body: string;
  scope: AnnouncementScope;
  team_id?: string;       // null if global
  created_by: string;
  created_at: string;
}