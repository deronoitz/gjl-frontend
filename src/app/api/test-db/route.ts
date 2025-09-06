import { NextResponse } from 'next/server';
import { supabaseService } from '@/lib/supabase';

export async function GET() {
  try {
    console.log('Testing payment_records table...');
    
    // Test 1: Check if table exists and has data
    const { data, error, count } = await supabaseService
      .from('payment_records')
      .select('*', { count: 'exact' })
      .limit(10);
    
    console.log('Payment records query result:', { data, error, count });
    
    // Test 2: Check users table
    const { data: users, error: usersError } = await supabaseService
      .from('users')
      .select('id, name, role')
      .limit(5);
      
    console.log('Users query result:', { users, usersError });

    return NextResponse.json({
      success: true,
      payment_records: { data, error, count },
      users: { data: users, error: usersError }
    });
    
  } catch (err) {
    console.error('Error in test endpoint:', err);
    return NextResponse.json({ 
      error: 'Test failed', 
      details: err instanceof Error ? err.message : String(err) 
    }, { status: 500 });
  }
}
