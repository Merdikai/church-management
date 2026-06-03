import { supabase } from './supabase';

export async function getTeamFeedback(teamId: string) {
  const { data, error } = await supabase
    .from('feedback')
    .select(`*, profiles(full_name)`)
    .eq('to_team_id', teamId)
    .order('created_at', { ascending: false });
  return { data, error };
}

export async function submitFeedback(
  fromUserId: string,
  toTeamId: string,
  message: string
) {
  const { data, error } = await supabase
    .from('feedback')
    .insert({ from_user_id: fromUserId, to_team_id: toTeamId, message })
    .select()
    .single();
  return { data, error };
}