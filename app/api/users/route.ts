import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/app/lib/supabase';
import { hash } from 'bcrypt-ts';

// GET /api/users - List all users or search by phone
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const phone = searchParams.get('phone');
    let query = supabase
      .from('users')
      .select('id, msisdn, phone, role, company_id');
    if (phone) {
      query = query.ilike('phone', `%${phone}%`);
    }
    const { data: users, error: usersError } = await query;
    if (usersError) {
      console.error('Error fetching users:', usersError);
      return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
    }
    return NextResponse.json(users ?? []);
  } catch (err: any) {
    console.error('Unexpected error in GET /api/users:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/users - Create a new user
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { msisdn, phone, password, role, company_id } = body;

    if (!msisdn || !phone || !password || !role) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if msisdn exists
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('id')
      .eq('msisdn', msisdn)
      .single();

    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 is "no rows returned"
      console.error('Error checking existing user:', checkError);
      return NextResponse.json({ error: 'Error checking msisdn availability' }, { status: 500 });
    }

    if (existingUser) {
      return NextResponse.json(
        { error: 'MSISDN already exists' },
        { status: 409 }
      );
    }

    // Hash password and store as password_hash
    const password_hash = await hash(password, 10);

    // Create user
    const { data: user, error: createError } = await supabase
      .from('users')
      .insert({
        msisdn,
        phone,
        password_hash, // store as password_hash
        role,
        company_id
      })
      .select('id, msisdn, phone, role, company_id')
      .single();

    if (createError) {
      console.error('Error creating user:', createError);
      return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
    }

    // Log the action
    if (user && user.id) {
      const { error: logError } = await supabase
        .from('logs')
        .insert({
          user_id: user.id,
          action: 'user_created',
          details: { msisdn, phone, role, company_id },
          ip: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || null
        });
      if (logError) {
        console.error('Error logging user creation:', logError);
      }
    }

    return NextResponse.json(user);
  } catch (err: any) {
    console.error('Unexpected error in POST /api/users:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH /api/users - Update a user
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, msisdn, phone, role, company_id, password } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const updateFields: any = {};
    if (msisdn) updateFields.msisdn = msisdn;
    if (phone) updateFields.phone = phone;
    if (role) updateFields.role = role;
    if (company_id) updateFields.company_id = company_id;
    // If password is present, hash and update password_hash
    if (password) {
      updateFields.password_hash = await hash(password, 10);
    }

    const { data: user, error: updateError } = await supabase
      .from('users')
      .update(updateFields)
      .eq('id', id)
      .select('id, msisdn, phone, role, company_id')
      .single();

    if (updateError) {
      console.error('Error updating user:', updateError);
      return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
    }

    // Log the action
    const { error: logError } = await supabase
      .from('logs')
      .insert({
        user_id: id,
        action: 'user_updated',
        details: updateFields,
        ip: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || null
      });

    if (logError) {
      console.error('Error logging user update:', logError);
      // Don't fail the request if logging fails
    }

    return NextResponse.json(user);
  } catch (err: any) {
    console.error('Unexpected error in PATCH /api/users:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/users - Delete a user
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // First get user details for logging
    const { data: user, error: fetchError } = await supabase
      .from('users')
      .select('msisdn, phone, role, company_id')
      .eq('id', id)
      .single();

    if (fetchError) {
      console.error('Error fetching user for deletion:', fetchError);
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Delete user
    const { error: deleteError } = await supabase
      .from('users')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('Error deleting user:', deleteError);
      return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
    }

    // Log the action
    if (user) {
      const { error: logError } = await supabase
        .from('logs')
        .insert({
          user_id: id,
          action: 'user_deleted',
          details: { msisdn: user.msisdn, phone: user.phone, role: user.role, company_id: user.company_id },
          ip: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || null
        });
      if (logError) {
        console.error('Error logging user deletion:', logError);
        // Don't fail the request if logging fails
      }
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Unexpected error in DELETE /api/users:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 