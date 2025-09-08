import { NextRequest, NextResponse } from 'next/server';
import { supabaseService } from '@/lib/supabase';
import { getAuthenticatedUser } from '@/lib/auth-helpers';

// POST - Expire old pending payments (admin only)
export async function POST(request: NextRequest) {
  try {
    // Check authentication and admin role
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    // Call the database function to expire old pending payments
    const { data, error } = await supabaseService.rpc('expire_old_pending_payments');

    if (error) {
      console.error('Error expiring old payments:', error);
      return NextResponse.json(
        { error: 'Failed to expire old payments', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      expired_count: data || 0,
      message: `Successfully expired ${data || 0} old pending payment(s)`
    });

  } catch (error) {
    console.error('Error in expire-payments API:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// GET - Check for old pending payments (admin only)
export async function GET(request: NextRequest) {
  try {
    // Check authentication and admin role
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    // Query for old pending payments without updating them
    const { data, error } = await supabaseService
      .from('financial_records')
      .select('id, reference_id, amount, description, created_at, house_block')
      .eq('status', 'pending')
      .lt('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

    if (error) {
      console.error('Error querying old payments:', error);
      return NextResponse.json(
        { error: 'Failed to query old payments', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      old_pending_count: data?.length || 0,
      old_pending_payments: data || []
    });

  } catch (error) {
    console.error('Error in expire-payments GET API:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
