import { NextResponse } from 'next/server';
import { z } from 'zod';
import { deleteSession } from '@/app/utils/session';

const logoutSchema = z.object({
  sessionToken: z.string().min(1, 'Session token is required'),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validatedData = logoutSchema.parse(body);

    // Delete session
    await deleteSession(validatedData.sessionToken);

    return NextResponse.json({
      message: 'Logged out successfully',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 