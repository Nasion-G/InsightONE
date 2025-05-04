import { NextResponse } from 'next/server';
import { z } from 'zod';
import { supabase } from '@/app/lib/supabase';
import { generateOTP } from '@/app/utils/otp';
import { hashPassword } from '@/app/utils/password';

const registerSchema = z.object({
  contractNumber: z.string().min(1, 'Contract number is required'),
  phoneNumber: z.string().min(1, 'Phone number is required'),
  username: z.string().min(3, 'Username must be at least 3 characters'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validatedData = registerSchema.parse(body);

    // Check if contract number exists in the system
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .select('id')
      .eq('contract_number', validatedData.contractNumber)
      .single();

    if (companyError || !company) {
      return NextResponse.json(
        { error: 'Invalid contract number' },
        { status: 400 }
      );
    }

    // Check if username is already taken
    const { data: existingUser, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('username', validatedData.username)
      .single();

    if (userError && userError.code !== 'PGRST116') { // PGRST116 is "no rows returned"
      throw userError;
    }

    if (existingUser) {
      return NextResponse.json(
        { error: 'Username already exists' },
        { status: 400 }
      );
    }

    // Generate OTP
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry

    // Create user with pending status
    const { data: user, error: createError } = await supabase
      .from('users')
      .insert({
        username: validatedData.username,
        phone_number: validatedData.phoneNumber,
        role: 'smea',
        company_id: company.id,
        password: hashPassword(validatedData.password),
        otp,
        otp_expiry: otpExpiry.toISOString(),
        status: 'pending',
      })
      .select()
      .single();

    if (createError) {
      throw createError;
    }

    // In production, send OTP via SMS
    console.log(`OTP for ${user.phone_number}: ${otp}`);

    return NextResponse.json({
      message: 'Registration successful. Please verify your phone number with the OTP sent.',
      userId: user.id,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 