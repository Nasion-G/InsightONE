import { NextResponse } from 'next/server';
import { supabase } from '@/app/lib/supabase';

// GET /api/usage - Get usage data for MSISDNs
export async function GET(request: Request) {
  try {
    const companyId = request.headers.get('x-company-id');
    if (!companyId) {
      return NextResponse.json(
        { error: 'Company ID is required' },
        { status: 400 }
      );
    }

    const { data: msisdns, error: msisdnError } = await supabase
      .from('msisdns')
      .select('id')
      .eq('company_id', companyId);

    if (msisdnError) {
      throw msisdnError;
    }

    const msisdnIds = msisdns.map(msisdn => msisdn.id);

    const { data: usage, error: usageError } = await supabase
      .from('usage')
      .select(`
        *,
        msisdn:msisdns(*)
      `)
      .in('msisdn_id', msisdnIds);

    if (usageError) {
      throw usageError;
    }

    return NextResponse.json(usage);
  } catch (error) {
    console.error('Error fetching usage:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/usage - Create usage record (for testing/mock data)
export async function POST(request: Request) {
  try {
    const companyId = request.headers.get('x-company-id');
    if (!companyId) {
      return NextResponse.json(
        { error: 'Company ID is required' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { msisdnId, month, year, voice, sms, data } = body;

    if (!msisdnId || !month || !year || !voice || !sms || !data) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const { data: usage, error } = await supabase
      .from('usage')
      .insert({
        msisdn_id: msisdnId,
        month,
        year,
        voice,
        sms,
        data,
      })
      .select(`
        *,
        msisdn:msisdns(*)
      `)
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json(usage);
  } catch (error) {
    console.error('Error creating usage record:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 