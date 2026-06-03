import { supabase } from './supabase';

export async function getAllTeams() {
  const { data, error } = await supabase
    .from('teams')
    .select(`
      *,
      team_members(count)
    `)
    .order('name');

  return { data, error };
}

export async function getTeamById(id: string) {
  const { data, error } = await supabase
    .from('teams')
    .select(`
      *,
      team_members(user_id, profiles(full_name, avatar_url))
    `)
    .eq('id', id)
    .single();

  return { data, error };
}

export async function createTeam(name: string, description: string) {
  const { data, error } = await supabase
    .from('teams')
    .insert({ name, description })
    .select()
    .single();

  return { data, error };
}

export async function updateTeam(id: string, updates: Record<string, unknown>) {
  const { data, error } = await supabase
    .from('teams')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  return { data, error };
}
export async function getMyTeam(leaderId: string) {
  const { data, error } = await supabase
    .from('teams')
    .select(`*, team_members(count)`)
    .eq('leader_id', leaderId)
    .single();
  return { data, error };
}

export async function getTeamMembers(teamId: string) {
  const { data, error } = await supabase
    .from('team_members')
    .select(`*, profiles(id, full_name, phone, gender, created_at)`)
    .eq('team_id', teamId);
  return { data, error };
}

export async function removeMemberFromTeam(userId: string, teamId: string) {
  const { error } = await supabase
    .from('team_members')
    .delete()
    .eq('user_id', userId)
    .eq('team_id', teamId);
  return { error };
}