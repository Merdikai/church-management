import { supabase } from './supabase';

export async function getAllMembers() {
  const { data, error } = await supabase
    .from('profiles')
    .select(`
      *,
      team_roles(role, team_id),
      team_members(team_id, teams(name))
    `)
    .order('created_at', { ascending: false });

  return { data, error };
}

export async function getMemberById(id: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select(`
      *,
      team_roles(role, team_id),
      team_members(team_id, teams(name)),
      skills(name)
    `)
    .eq('id', id)
    .single();

  return { data, error };
}

export async function searchMembers(query: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .ilike('full_name', `%${query}%`);

  return { data, error };
}

export async function deleteMember(id: string) {
  const { error } = await supabase
    .from('profiles')
    .delete()
    .eq('id', id);

  return { error };
}
export async function getMemberRoles(userId: string) {
  const { data, error } = await supabase
    .from('team_roles')
    .select('*')
    .eq('user_id', userId);
  return { data, error };
}

export async function assignRole(userId: string, role: 'admin' | 'leader' | 'member') {
  const { data, error } = await supabase
    .from('team_roles')
    .upsert({ user_id: userId, team_id: null, role })
    .select()
    .single();
  return { data, error };
}

export async function assignTeamLeader(userId: string, teamId: string) {
  // Make them leader role
  await supabase
    .from('team_roles')
    .upsert({ user_id: userId, team_id: null, role: 'leader' });

  // Assign as leader of the specific team
  const { error } = await supabase
    .from('teams')
    .update({ leader_id: userId })
    .eq('id', teamId);

  // Add to team_members if not already
  await supabase
    .from('team_members')
    .upsert({ user_id: userId, team_id: teamId });

  return { error };
}

export async function removeTeamLeader(teamId: string) {
  const { data: team } = await supabase
    .from('teams')
    .select('leader_id')
    .eq('id', teamId)
    .single();

  if (team?.leader_id) {
    // Downgrade their role to member
    await supabase
      .from('team_roles')
      .upsert({ user_id: team.leader_id, team_id: null, role: 'member' });
  }

  const { error } = await supabase
    .from('teams')
    .update({ leader_id: null })
    .eq('id', teamId);

  return { error };
}