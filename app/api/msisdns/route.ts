import { NextResponse } from 'next/server';
import { supabase } from '@/app/lib/supabase';

// GET /api/msisdns - List all users with MSISDNs and their usage/analytics fields
export async function GET() {
  try {
    const { data: users, error } = await supabase
      .from('users')
      .select('id, msisdn, unit, duration_volume, tariff_vat_incl');
    if (error) throw error;
    return NextResponse.json(users ?? []);
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/msisdns - Create a new user with MSISDN, plan, and usage limit
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { msisdn, tariff_plan_id, usage_limit } = body;

    if (!msisdn || !tariff_plan_id || !usage_limit) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if user already exists with this MSISDN
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('msisdn', msisdn)
      .single();

    let user;
    if (existingUser) {
      // Update existing user
      const { data, error } = await supabase
        .from('users')
        .update({ tariff_plan_id, usage_limit })
        .eq('id', existingUser.id)
        .select()
        .single();
      if (error) throw error;
      user = data;
    } else {
      // Create new user
      const { data, error } = await supabase
        .from('users')
        .insert({ msisdn, tariff_plan_id, usage_limit })
        .select()
        .single();
      if (error) throw error;
      user = data;
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error creating/updating user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH /api/msisdns - Update a user's plan or usage limit
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { msisdn, tariff_plan_id, usage_limit } = body;
    if (!msisdn) {
      return NextResponse.json(
        { error: 'MSISDN is required' },
        { status: 400 }
      );
    }
    const updateFields: any = {};
    if (tariff_plan_id) updateFields.tariff_plan_id = tariff_plan_id;
    if (usage_limit) updateFields.usage_limit = usage_limit;
    const { data, error } = await supabase
      .from('users')
      .update(updateFields)
      .eq('msisdn', msisdn)
      .select()
      .single();
    if (error) throw error;
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 