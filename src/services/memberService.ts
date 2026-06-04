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
  // First delete any existing church-wide role
  const { error: deleteError } = await supabase
    .from('team_roles')
    .delete()
    .eq('user_id', userId)
    .is('team_id', null);

  if (deleteError) {
    console.error('Delete failed:', deleteError);
    return { data: null, error: deleteError };
  }

  // Insert the new role
  const { data, error } = await supabase
    .from('team_roles')
    .insert({ user_id: userId, team_id: null, role })
    .select()
    .single();

  return { data, error };
}

export async function assignTeamLeader(userId: string, teamId: string) {
  // Update church-wide role to leader
  await assignRole(userId, 'leader');

  // Assign as leader of the specific team
  const { error: teamError } = await supabase
    .from('teams')
    .update({ leader_id: userId })
    .eq('id', teamId);

  if (teamError) return { error: teamError };

  // Only insert if not already a member
  const { data: existing, error: checkError } = await supabase
    .from('team_members')
    .select('id')
    .eq('user_id', userId)
    .eq('team_id', teamId);

  if (checkError) return { error: checkError };

  if (!existing || existing.length === 0) {
    const { error: insertError } = await supabase
      .from('team_members')
      .insert({ user_id: userId, team_id: teamId });
    
    // Ignore 409 conflict (row already exists due to race condition)
    if (insertError && insertError.code !== '23505') {
      return { error: insertError };
    }
  }

  return { error: null };
}

export async function removeTeamLeader(teamId: string) {
  const { data: team } = await supabase
    .from('teams')
    .select('leader_id')
    .eq('id', teamId)
    .single();

  if (team?.leader_id) {
    await assignRole(team.leader_id, 'member');
  }

  const { error } = await supabase
    .from('teams')
    .update({ leader_id: null })
    .eq('id', teamId);

  return { error };
}