import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/app/lib/supabase';

// GET /api/logs - List all logs
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;

    // First get the logs
    const { data: logs, error: logsError, count } = await supabase
      .from('logs')
      .select('id, action, details, created_at, user_id')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (logsError) {
      console.error('Error fetching logs:', logsError);
      return NextResponse.json({ error: 'Failed to fetch logs' }, { status: 500 });
    }

    // Then get the user details for each log
    const logIds = logs?.map(log => log.user_id) || [];
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, msisdn')
      .in('id', logIds);

    if (usersError) {
      console.error('Error fetching users for logs:', usersError);
      return NextResponse.json({ error: 'Failed to fetch user details' }, { status: 500 });
    }

    // Combine the data
    const logsWithUsers = logs?.map(log => ({
      ...log,
      user: users?.find(user => user.id === log.user_id)
    })) || [];

    return NextResponse.json({
      logs: logsWithUsers,
      total: count ?? 0,
      page,
      limit
    });
  } catch (err: any) {
    console.error('Unexpected error in GET /api/logs:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/logs - Add a log entry
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { user_id, action, details } = body;

    if (!user_id || !action) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const { data: log, error: logError } = await supabase
      .from('logs')
      .insert({
        user_id,
        action,
        details,
        ip: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip')
      })
      .select('id, action, details, created_at, user_id')
      .single();

    if (logError) {
      console.error('Error creating log:', logError);
      return NextResponse.json({ error: 'Failed to create log' }, { status: 500 });
    }

    // Get user details
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, msisdn')
      .eq('id', user_id)
      .single();

    if (userError) {
      console.error('Error fetching user for log:', userError);
      return NextResponse.json({ error: 'Failed to fetch user details' }, { status: 500 });
    }

    return NextResponse.json({
      ...log,
      user
    });
  } catch (err: any) {
    console.error('Unexpected error in POST /api/logs:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 