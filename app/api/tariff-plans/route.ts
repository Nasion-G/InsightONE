import { NextResponse } from 'next/server';
import { supabase } from '@/app/lib/supabase';

// GET /api/tariff-plans - List all tariff plans
export async function GET() {
  try {
    const { data: plans, error } = await supabase
      .from('tariff_plans')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return NextResponse.json(plans);
  } catch (error) {
    console.error('Error fetching tariff plans:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/tariff-plans - Create a new tariff plan
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, description, voice_minutes, data_gb, sms_count, price, currency, validity_days } = body;

    if (!name || !price || !validity_days) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const { data: plan, error } = await supabase
      .from('tariff_plans')
      .insert({
        name,
        description,
        voice_minutes: voice_minutes || 0,
        data_gb: data_gb || 0,
        sms_count: sms_count || 0,
        price,
        currency: currency || 'ALL',
        validity_days,
        is_active: true,
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json(plan);
  } catch (error) {
    console.error('Error creating tariff plan:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH /api/tariff-plans - Update a tariff plan
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Plan ID is required' },
        { status: 400 }
      );
    }

    const { data: plan, error } = await supabase
      .from('tariff_plans')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json(plan);
  } catch (error) {
    console.error('Error updating tariff plan:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/tariff-plans - Delete a tariff plan
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Plan ID is required' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('tariff_plans')
      .delete()
      .eq('id', id);

  if (error) {
      throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting tariff plan:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 