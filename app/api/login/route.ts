import { NextRequest, NextResponse } from 'next/server';
import { compare } from 'bcrypt-ts';
import { createClient } from '@supabase/supabase-js';
import jwt from 'jsonwebtoken';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_key';

export async function POST(req: NextRequest) {
  try {
    const { identifier, password } = await req.json();
    if (!identifier || !password) {
      return NextResponse.json({ error: 'Identifier and password are required.' }, { status: 400 });
    }
    // Fetch user by phone or msisdn
    const { data: user, error } = await supabase
      .from('users')
      .select('id, phone, msisdn, password_hash, created_at, role')
      .or(`phone.eq.${identifier},msisdn.eq.${identifier}`)
      .single();
    if (error || !user) {
      return NextResponse.json({ error: 'Invalid phone/MSISDN or password.' }, { status: 401 });
    }
    // Compare password
    const valid = await compare(password, user.password_hash);
    if (!valid) {
      return NextResponse.json({ error: 'Invalid phone/MSISDN or password.' }, { status: 401 });
    }
    // Create JWT
    const token = jwt.sign(
      { id: user.id, phone: user.phone, msisdn: user.msisdn, role: user.role, created_at: user.created_at },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    return NextResponse.json({ token, user: { id: user.id, phone: user.phone, msisdn: user.msisdn, role: user.role, created_at: user.created_at } });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal server error.' }, { status: 500 });
  }
} 