import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

export async function initDb() {
  // Table is created via Supabase dashboard or migration — no-op here
}

export async function getUserByEmail(email: string) {
  const { data } = await supabase.from('users').select('*').eq('email', email).single();
  return data || null;
}

export async function getUserByToken(token: string) {
  const { data } = await supabase.from('users').select('*').eq('invite_token', token).single();
  return data || null;
}

export async function createUser(email: string, name: string, role: string, token: string) {
  const { data } = await supabase
    .from('users')
    .insert({ email, name, role, invite_token: token })
    .select()
    .single();
  return data;
}

export async function acceptInvite(token: string) {
  const { data } = await supabase
    .from('users')
    .update({ invite_accepted: true })
    .eq('invite_token', token)
    .select()
    .single();
  return data;
}

export async function getAllUsers() {
  const { data } = await supabase
    .from('users')
    .select('id, email, name, role, invite_accepted, created_at')
    .order('created_at', { ascending: false });
  return data || [];
}

export async function deleteUser(id: number) {
  await supabase.from('users').delete().eq('id', id);
}
