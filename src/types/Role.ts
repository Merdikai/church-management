export type RoleName =
  | 'admin'
  | 'leader'
  | 'member';

export interface Role {
  id: string;
  user_id: string;
  team_id?: string;       // null = church-wide role (admin)
  role: RoleName;
}