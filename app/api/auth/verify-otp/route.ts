import { NextResponse } from 'next/server';
import { z } from 'zod';
import { supabase } from '@/app/lib/supabase';
import { createSession } from '@/app/utils/session';

const verifyOtpSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  otp: z.string().min(6, 'OTP must be 6 digits').max(6, 'OTP must be 6 digits'),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validatedData = verifyOtpSchema.parse(body);

    // Find user and verify OTP
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', validatedData.userId)
      .single();

    if (userError) {
      if (userError.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }
      throw userError;
    }

    // Check if OTP is expired
    if (new Date(user.otp_expiry) < new Date()) {
      return NextResponse.json(
        { error: 'OTP has expired' },
        { status: 400 }
      );
    }

    // Verify OTP
    if (user.otp !== validatedData.otp) {
      return NextResponse.json(
        { error: 'Invalid OTP' },
        { status: 400 }
      );
    }

    // If this is a registration verification, update user status
    if (user.status === 'pending') {
      const { error: updateError } = await supabase
        .from('users')
        .update({
          status: 'verified',
          otp: null,
          otp_expiry: null,
        })
        .eq('id', user.id);

      if (updateError) {
        throw updateError;
      }
    }

    // Create session
    const sessionToken = await createSession(user.id);

    return NextResponse.json({
      message: 'OTP verified successfully',
      sessionToken,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        companyId: user.company_id,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error('OTP verification error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 