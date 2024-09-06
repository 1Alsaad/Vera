import { supabase } from './supabaseClient';

export async function createNotification(userId: string, message: string) {
  const { data, error } = await supabase
    .from('notifications')
    .insert({ user_id: userId, message });

  if (error) {
    console.error('Error creating notification:', error);
  }
  return data;
}