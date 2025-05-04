import { NextRequest, NextResponse } from 'next/server';
import { hash } from 'bcrypt-ts';
import { createClient } from '@supabase/supabase-js';
import jwt from 'jsonwebtoken';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_key';

export async function POST(req: NextRequest) {
  try {
    const { identifier, password, contract_number } = await req.json();
    if (!identifier || !password || !contract_number) {
      return NextResponse.json({ error: 'Contract number, phone/MSISDN, and password are required.' }, { status: 400 });
    }

    // Determine if identifier is phone or msisdn
    let phone = null;
    let msisdn = null;
    if (identifier.startsWith('35569')) {
      phone = identifier;
    } else {
      msisdn = identifier;
    }

    // First check if user exists
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('id')
      .or(`phone.eq.${identifier},msisdn.eq.${identifier}`)
      .single();

    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 is "no rows returned"
      return NextResponse.json({ error: 'Error checking for existing account' }, { status: 500 });
    }

    if (existingUser) {
      return NextResponse.json({ error: 'An account with this phone number or MSISDN already exists' }, { status: 409 });
    }

    // Hash the password
    const password_hash = await hash(password, 10);
    
    // Insert user into the database
    const { data, error } = await supabase
      .from('users')
      .insert([{ 
        phone,
        msisdn,
        contract_number,
        password_hash, 
        role: 'user' 
      }])
      .select('id, phone, msisdn, contract_number, role, created_at')
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // After successful signup, log the event
    if (data && data.id) {
      const { error: logError } = await supabase
        .from('logs')
        .insert({
          user_id: data.id,
          action: 'user_signup',
          details: { msisdn: data.msisdn, phone: data.phone },
          ip: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || null
        });
      if (logError) {
        console.error('Error logging user signup:', logError);
      }
    }

    // Create JWT
    const token = jwt.sign(
      { id: data.id, phone: data.phone, msisdn: data.msisdn, contract_number: data.contract_number, role: data.role, created_at: data.created_at },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    return NextResponse.json({ token, user: data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal server error.' }, { status: 500 });
  }
} 