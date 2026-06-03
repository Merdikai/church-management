import { supabase } from './supabase';

export async function getTeamJoinRequests(teamId: string) {
  const { data, error } = await supabase
    .from('join_requests')
    .select(`*, profiles(full_name, phone, gender)`)
    .eq('team_id', teamId)
    .eq('status', 'pending')
    .order('created_at', { ascending: false });
  return { data, error };
}

export async function updateJoinRequest(
  id: string,
  status: 'approved' | 'rejected',
  userId: string,
  teamId: string
) {
  const { error } = await supabase
    .from('join_requests')
    .update({ status })
    .eq('id', id);

  if (!error && status === 'approved') {
    await supabase
      .from('team_members')
      .insert({ user_id: userId, team_id: teamId });

    await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        message: `Your request to join the team has been approved! 🎉`,
      });
  }

  if (!error && status === 'rejected') {
    await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        message: `Your request to join the team was not approved this time.`,
      });
  }

  return { error };
}

export async function submitJoinRequest(userId: string, teamId: string) {
  const { data, error } = await supabase
    .from('join_requests')
    .insert({ user_id: userId, team_id: teamId, status: 'pending' })
    .select()
    .single();
  return { data, error };
}