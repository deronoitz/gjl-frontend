import { NextRequest, NextResponse } from 'next/server';
import { supabaseService } from '@/lib/supabase';
import { CustomAuth } from '@/lib/custom-auth';

// Helper function to get current user from session
async function getCurrentUser(request: NextRequest) {
  const sessionToken = request.cookies.get('session_token')?.value;
  if (!sessionToken) {
    return null;
  }
  return await CustomAuth.verifySession(sessionToken);
}

// POST - Create payment status for multiple users at once
export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser(request);
    
    if (!currentUser || currentUser.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized - Admin access required' }, { status: 401 });
    }

    const { user_uuids, bulan, tahun } = await request.json();

    // Validate required fields
    if (!user_uuids || !Array.isArray(user_uuids) || user_uuids.length === 0 || !bulan || !tahun) {
      return NextResponse.json(
        { error: 'Missing required fields: user_uuids (array), bulan, tahun' },
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

    // Prepare bulk insert data
    const insertData = user_uuids.map(user_uuid => ({
      user_uuid,
      bulan: parseInt(bulan),
      tahun: parseInt(tahun),
      created_by: currentUser.id,
    }));

    const { data, error } = await supabaseService
      .from('payment_records')
      .insert(insertData)
      .select(`
        id,
        user_uuid,
        bulan,
        tahun,
        created_at,
        created_by,
        users!payment_records_user_uuid_fkey(name, house_number)
      `);

    if (error) {
      console.error('Error creating bulk payment status:', error);
      return NextResponse.json({ error: 'Failed to create payment status records' }, { status: 500 });
    }

    return NextResponse.json({ 
      data, 
      message: `Successfully created ${data.length} payment status records` 
    }, { status: 201 });

  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
