import { NextRequest, NextResponse } from 'next/server';
import { hash } from 'bcrypt-ts';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const { msisdn, password } = await req.json();
    if (!msisdn || !password) {
      return NextResponse.json({ error: 'MSISDN and password are required.' }, { status: 400 });
    }
    // Check if user exists
    const { data: user, error } = await supabase
      .from('users')
      .select('id')
      .eq('msisdn', msisdn)
      .single();
    if (error || !user) {
      return NextResponse.json({ error: 'User not found.' }, { status: 404 });
    }
    // Hash and set password
    const password_hash = await hash(password, 10);
    const { error: updateError } = await supabase
      .from('users')
      .update({ password_hash })
      .eq('id', user.id);
    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal server error.' }, { status: 500 });
  }
} 