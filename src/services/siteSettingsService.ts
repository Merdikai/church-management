import { supabase } from './supabase';

export async function getSiteSettings() {
  const { data, error } = await supabase
    .from('site_settings')
    .select('*')
    .order('section');
  return { data, error };
}

export async function updateSiteSetting(section: string, updates: Record<string, unknown>) {
  const { data, error } = await supabase
    .from('site_settings')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('section', section)
    .select()
    .single();
  return { data, error };
}

export async function uploadSiteImage(file: File, section: string) {
  const fileExt = file.name.split('.').pop();
  const fileName = `${section}_${Date.now()}.${fileExt}`;
  const filePath = `site_images/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from('public')
    .upload(filePath, file);

  if (uploadError) return { error: uploadError };

  const { data: { publicUrl } } = supabase.storage
    .from('public')
    .getPublicUrl(filePath);

  // Update the site setting with the image URL
  const { error: updateError } = await supabase
    .from('site_settings')
    .update({ image_url: publicUrl, updated_at: new Date().toISOString() })
    .eq('section', section);

  return { data: { publicUrl }, error: updateError };
}