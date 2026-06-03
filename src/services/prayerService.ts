import { supabase } from './supabase';

export async function getPrayerRequests() {
  const { data, error } = await supabase
    .from('prayer_requests')
    .select(`*, profiles(full_name)`)
    .eq('visibility', 'public')
    .order('created_at', { ascending: false });
  return { data, error };
}

export async function getMyPrayerRequests(userId: string) {
  const { data, error } = await supabase
    .from('prayer_requests')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  return { data, error };
}

export async function submitPrayerRequest(
  userId: string,
  request: string,
  visibility: 'public' | 'private'
) {
  const { data, error } = await supabase
    .from('prayer_requests')
    .insert({ user_id: userId, request, visibility })
    .select()
    .single();
  return { data, error };
}

export async function deletePrayerRequest(id: string) {
  const { error } = await supabase
    .from('prayer_requests')
    .delete()
    .eq('id', id);
  return { error };
}