import { NextResponse } from 'next/server';
import { z } from 'zod';
import { supabase } from '@/app/lib/supabase';
import { generateOTP } from '@/app/utils/otp';
import { verifyPassword } from '@/app/utils/password';

const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validatedData = loginSchema.parse(body);

    // Find user by username
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('username', validatedData.username)
      .single();

    if (userError) {
      if (userError.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Invalid username or password' },
          { status: 401 }
        );
      }
      throw userError;
    }

    // Verify password
    if (!verifyPassword(validatedData.password, user.password)) {
      return NextResponse.json(
        { error: 'Invalid username or password' },
        { status: 401 }
      );
    }

    // Check if user is verified
    if (user.status !== 'verified') {
      return NextResponse.json(
        { error: 'Please verify your account first' },
        { status: 403 }
      );
    }

    // Generate new OTP for 2FA
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry

    // Update user with new OTP
    const { error: updateError } = await supabase
      .from('users')
      .update({
        otp,
        otp_expiry: otpExpiry.toISOString(),
      })
      .eq('id', user.id);

    if (updateError) {
      throw updateError;
    }

    // In production, send OTP via SMS
    console.log(`OTP for ${user.phone_number}: ${otp}`);

    // After successful login, log the event
    if (user && user.id) {
      const { error: logError } = await supabase
        .from('logs')
        .insert({
          user_id: user.id,
          action: 'user_login',
          details: { msisdn: user.msisdn, phone: user.phone },
          ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || null
        });
      if (logError) {
        console.error('Error logging user login:', logError);
      }
    }

    return NextResponse.json({
      message: 'OTP sent to your phone number',
      userId: user.id,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 