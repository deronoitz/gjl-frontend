import { NextRequest, NextResponse } from 'next/server';
import { supabaseService } from '@/lib/supabase';
import { CustomAuth } from '@/lib/custom-auth';

// Helper function to get current user from session
async function getCurrentUser(request: NextRequest) {
  const sessionToken = request.cookies.get('session_token')?.value;
  console.log('Session token in payment-status API:', sessionToken);
  
  if (!sessionToken) {
    console.log('No session token found');
    return null;
  }
  
  const user = await CustomAuth.verifySession(sessionToken);
  console.log('Verified user:', user);
  return user;
}

// GET - Retrieve payment status records
export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser(request);
    
    console.log('Current user in payment-status API:', currentUser);
    
    if (!currentUser) {
      console.log('No current user found, returning unauthorized');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    const bulan = searchParams.get('bulan');
    const tahun = searchParams.get('tahun');

    let query = supabaseService
      .from('payment_records')
      .select(`
        id,
        user_uuid,
        bulan,
        tahun,
        created_at,
        created_by,
        users!payment_records_user_uuid_fkey(name),
        created_by_user:users!payment_records_created_by_fkey(name)
      `);

    // If not admin, only show own payment status
    if (currentUser.role !== 'admin') {
      query = query.eq('user_uuid', currentUser.id);
    }

    // Apply filters if provided
    if (userId) {
      query = query.eq('user_uuid', userId);
    }
    if (bulan) {
      query = query.eq('bulan', parseInt(bulan));
    }
    if (tahun) {
      query = query.eq('tahun', parseInt(tahun));
    }

    // Order by most recent first
    query = query.order('created_at', { ascending: false });

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching payment status:', error);
      return NextResponse.json({ error: 'Failed to fetch payment status' }, { status: 500 });
    }

    return NextResponse.json({ data });

  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Create new payment status record
export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser(request);
    
    if (!currentUser || currentUser.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized - Admin access required' }, { status: 401 });
    }

    const { user_uuid, bulan, tahun } = await request.json();

    // Validate required fields
    if (!user_uuid || !bulan || !tahun) {
      return NextResponse.json(
        { error: 'Missing required fields: user_uuid, bulan, tahun' },
        { status: 400 }
      );
    }

    // Validate month and year
    if (bulan < 1 || bulan > 12 || tahun < 2024) {
      return NextResponse.json(
        { error: 'Invalid bulan (1-12) or tahun (>=2024)' },
        { status: 400 }
      );
    }

    // Check if user exists
    const { data: userExists } = await supabaseService
      .from('users')
      .select('id')
      .eq('id', user_uuid)
      .single();

    if (!userExists) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { data, error } = await supabaseService
      .from('payment_records')
      .insert({
        user_uuid,
        bulan: parseInt(bulan),
        tahun: parseInt(tahun),
        created_by: currentUser.id,
      })
      .select(`
        id,
        user_uuid,
        bulan,
        tahun,
        created_at,
        created_by,
        users!payment_records_user_uuid_fkey(name)
      `)
      .single();

    if (error) {
      if (error.code === '23505') { // Unique constraint violation
        return NextResponse.json(
          { error: 'Payment status already exists for this user, month, and year' },
          { status: 409 }
        );
      }
      console.error('Error creating payment status:', error);
      return NextResponse.json({ error: 'Failed to create payment status' }, { status: 500 });
    }

    return NextResponse.json({ data }, { status: 201 });

  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - Remove payment status record
export async function DELETE(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser(request);
    
    if (!currentUser || currentUser.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized - Admin access required' }, { status: 401 });
    }

    const { id } = await request.json();

    if (!id) {
      return NextResponse.json({ error: 'Payment status ID is required' }, { status: 400 });
    }

    const { data, error } = await supabaseService
      .from('payment_records')
      .delete()
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error deleting payment status:', error);
      return NextResponse.json({ error: 'Failed to delete payment status' }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ error: 'Payment status not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Payment status deleted successfully' });

  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
