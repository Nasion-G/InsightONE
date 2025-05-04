import { supabase } from '@/app/lib/supabase';

export async function createSession(userId: string): Promise<string> {
  const sessionToken = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  const { error } = await supabase
    .from('sessions')
    .insert({
      user_id: userId,
      token: sessionToken,
      expires_at: expiresAt.toISOString(),
    });

  if (error) {
    throw error;
  }

  return sessionToken;
}

export async function validateSession(sessionToken: string): Promise<{
  userId: string;
  role: string;
  companyId: string;
}> {
  const { data: session, error: sessionError } = await supabase
    .from('sessions')
    .select('*')
    .eq('token', sessionToken)
    .single();

  if (sessionError || !session) {
    throw new Error('Invalid session');
  }

  if (new Date(session.expires_at) < new Date()) {
    // Delete expired session
    await supabase
      .from('sessions')
      .delete()
      .eq('token', sessionToken);

    throw new Error('Session expired');
  }

  const { data: user, error: userError } = await supabase
    .from('users')
    .select('*')
    .eq('id', session.user_id)
    .single();

  if (userError || !user) {
    throw new Error('User not found');
  }

  return {
    userId: user.id,
    role: user.role,
    companyId: user.company_id,
  };
}

export async function deleteSession(sessionToken: string): Promise<void> {
  const { error } = await supabase
    .from('sessions')
    .delete()
    .eq('token', sessionToken);

  if (error) {
    throw error;
  }
} 