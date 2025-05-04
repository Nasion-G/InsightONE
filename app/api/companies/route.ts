import { NextResponse } from 'next/server';
import { supabase } from '@/app/lib/supabase';

// GET /api/companies - List all companies
export async function GET() {
  try {
    const { data: companies, error } = await supabase
      .from('companies')
      .select('id, name')
      .order('name', { ascending: true });

    if (error) {
      throw error;
    }

    return NextResponse.json(companies ?? []);
  } catch (error) {
    console.error('Error fetching companies:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 