import { createClient } from '@/lib/supabase/server';

// Returns the logged-in user's id, or null if nobody is logged in.
export async function getUserId(): Promise<string | null> {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  return data.user?.id ?? null;
}
