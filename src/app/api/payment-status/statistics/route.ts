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

// GET - Get payment statistics
export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser(request);
    
    if (!currentUser || currentUser.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized - Admin access required' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const bulan = searchParams.get('bulan');
    const tahun = searchParams.get('tahun');

    if (!bulan || !tahun) {
      return NextResponse.json({ error: 'Month (bulan) and year (tahun) are required' }, { status: 400 });
    }

    // Get total users count
    const { count: totalUsers, error: usersError } = await supabaseService
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'user');

    if (usersError) {
      console.error('Error counting users:', usersError);
      return NextResponse.json({ error: 'Failed to get user count' }, { status: 500 });
    }

    // Get payment status count for the specified month/year
    const { count: paidUsers, error: paidError } = await supabaseService
      .from('payment_records')
      .select('*', { count: 'exact', head: true })
      .eq('bulan', parseInt(bulan))
      .eq('tahun', parseInt(tahun));

    if (paidError) {
      console.error('Error counting paid users:', paidError);
      return NextResponse.json({ error: 'Failed to get payment count' }, { status: 500 });
    }

    // Get list of users who haven't paid
    const { data: paidUserIds, error: paidIdsError } = await supabaseService
      .from('payment_records')
      .select('user_uuid')
      .eq('bulan', parseInt(bulan))
      .eq('tahun', parseInt(tahun));

    if (paidIdsError) {
      console.error('Error getting paid user IDs:', paidIdsError);
      return NextResponse.json({ error: 'Failed to get paid user IDs' }, { status: 500 });
    }

    const paidIds = paidUserIds.map((p: { user_uuid: string }) => p.user_uuid);
    
    let unpaidUsersQuery = supabaseService
      .from('users')
      .select('id, name, house_number')
      .eq('role', 'user');

    if (paidIds.length > 0) {
      unpaidUsersQuery = unpaidUsersQuery.not('id', 'in', `(${paidIds.join(',')})`);
    }

    const { data: unpaidUsers, error: unpaidError } = await unpaidUsersQuery;

    if (unpaidError) {
      console.error('Error getting unpaid users:', unpaidError);
      return NextResponse.json({ error: 'Failed to get unpaid users' }, { status: 500 });
    }

    // Get recent payment records
    const { data: recentPayments, error: recentError } = await supabaseService
      .from('payment_records')
      .select(`
        id,
        bulan,
        tahun,
        created_at,
        users!payment_records_user_uuid_fkey(name, house_number),
        created_by_user:users!payment_records_created_by_fkey(name)
      `)
      .eq('bulan', parseInt(bulan))
      .eq('tahun', parseInt(tahun))
      .order('created_at', { ascending: false })
      .limit(10);

    if (recentError) {
      console.error('Error getting recent payments:', recentError);
      return NextResponse.json({ error: 'Failed to get recent payments' }, { status: 500 });
    }

    const statistics = {
      totalUsers: totalUsers || 0,
      paidUsers: paidUsers || 0,
      unpaidUsers: (totalUsers || 0) - (paidUsers || 0),
      paymentPercentage: totalUsers ? Math.round(((paidUsers || 0) / totalUsers) * 100) : 0,
      unpaidUsersList: unpaidUsers || [],
      recentPayments: recentPayments || [],
      month: parseInt(bulan),
      year: parseInt(tahun),
    };

    return NextResponse.json({ data: statistics });

  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
