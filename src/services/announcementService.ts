import { supabase } from './supabase';

export async function getAnnouncements(teamId?: string) {
  let query = supabase
    .from('announcements')
    .select(`*, profiles(full_name)`)
    .order('created_at', { ascending: false });

  if (teamId) {
    query = query.eq('team_id', teamId);
  }

  const { data, error } = await query;
  return { data, error };
}

export async function createAnnouncement(
  title: string,
  body: string,
  scope: 'global' | 'team',
  createdBy: string,
  teamId?: string
) {
  const { data, error } = await supabase
    .from('announcements')
    .insert({ title, body, scope, created_by: createdBy, team_id: teamId ?? null })
    .select()
    .single();

  return { data, error };
}

export async function deleteAnnouncement(id: string) {
  const { error } = await supabase
    .from('announcements')
    .delete()
    .eq('id', id);

  return { error };
}
export async function getTeamAnnouncements(teamId: string) {
  const { data, error } = await supabase
    .from('announcements')
    .select(`*, profiles(full_name)`)
    .eq('team_id', teamId)
    .order('created_at', { ascending: false });
  return { data, error };
}