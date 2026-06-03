export type JoinRequestStatus = 'pending' | 'approved' | 'rejected';

export interface JoinRequest {
  id: string;
  user_id: string;
  team_id: string;
  status: JoinRequestStatus;
  created_at: string;
}