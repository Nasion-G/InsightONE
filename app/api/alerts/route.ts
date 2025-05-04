import { NextResponse } from 'next/server';
import { supabase } from '@/app/lib/supabase';

// GET /api/alerts - Get alerts for MSISDNs
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

    const { data: alerts, error: alertError } = await supabase
      .from('alerts')
      .select(`
        *,
        msisdn:msisdns(*)
      `)
      .in('msisdn_id', msisdnIds)
      .order('triggered_at', { ascending: false });

    if (alertError) {
      throw alertError;
    }

    return NextResponse.json(alerts);
  } catch (error) {
    console.error('Error fetching alerts:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/alerts - Configure alerts for MSISDNs
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
    const { msisdnId, type, threshold } = body;

    if (!msisdnId || !type || !threshold) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Verify MSISDN belongs to company
    const { data: msisdn, error: msisdnError } = await supabase
      .from('msisdns')
      .select('id')
      .eq('id', msisdnId)
      .eq('company_id', companyId)
      .single();

    if (msisdnError || !msisdn) {
      return NextResponse.json(
        { error: 'MSISDN not found or not authorized' },
        { status: 404 }
      );
    }

    const { data: alert, error: alertError } = await supabase
      .from('alerts')
      .insert({
        msisdn_id: msisdnId,
        type,
        threshold,
        triggered_at: new Date().toISOString(),
        status: 'pending',
      })
      .select(`
        *,
        msisdn:msisdns(*)
      `)
      .single();

    if (alertError) {
      throw alertError;
    }

    return NextResponse.json(alert);
  } catch (error) {
    console.error('Error creating alert:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH /api/alerts - Update alert status
export async function PATCH(request: Request) {
  try {
    const companyId = request.headers.get('x-company-id');
    if (!companyId) {
      return NextResponse.json(
        { error: 'Company ID is required' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { alertId, status } = body;

    if (!alertId || !status) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Verify alert belongs to company
    const { data: alert, error: alertError } = await supabase
      .from('alerts')
      .select(`
        *,
        msisdn:msisdns(*)
      `)
      .eq('id', alertId)
      .eq('msisdn.company_id', companyId)
      .single();

    if (alertError || !alert) {
      return NextResponse.json(
        { error: 'Alert not found or not authorized' },
        { status: 404 }
      );
    }

    const { data: updatedAlert, error: updateError } = await supabase
      .from('alerts')
      .update({
        status,
      })
      .eq('id', alertId)
      .select(`
        *,
        msisdn:msisdns(*)
      `)
      .single();

    if (updateError) {
      throw updateError;
    }

    return NextResponse.json(updatedAlert);
  } catch (error) {
    console.error('Error updating alert:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 