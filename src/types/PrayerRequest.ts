export type PrayerVisibility = 'public' | 'private';

export interface PrayerRequest {
  id: string;
  user_id: string;
  request: string;
  visibility: PrayerVisibility;
  created_at: string;
}