import { supabase } from './supabase';

export async function getAllEvents() {
  const { data, error } = await supabase
    .from('events')
    .select('*, profiles(full_name)')
    .order('event_date', { ascending: true });
  return { data, error };
}

export async function createEvent(
  title: string,
  description: string,
  location: string,
  eventDate: string,
  createdBy: string
) {
  const { data, error } = await supabase
    .from('events')
    .insert({ title, description, location, event_date: eventDate, created_by: createdBy })
    .select()
    .single();
  return { data, error };
}

export async function deleteEvent(id: string) {
  const { error } = await supabase.from('events').delete().eq('id', id);
  return { error };
}