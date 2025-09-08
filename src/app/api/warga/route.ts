import { NextRequest, NextResponse } from 'next/server';
import { CustomAuth } from '@/lib/custom-auth';
import { supabase } from '@/lib/supabase';

// GET /api/warga - Get all residents (accessible by all authenticated users)
export async function GET(request: NextRequest) {
  try {
    const sessionToken = request.cookies.get('session_token')?.value;

    if (!sessionToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const session = await CustomAuth.verifySession(sessionToken);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch residents - exclude password_hash and show only public info
    const { data: residents, error } = await supabase
      .from('users')
      .select(`
        id, 
        house_number, 
        name, 
        phone_number,
        positions (
          id,
          position,
          order
        )
      `)
      .order('house_number', { ascending: true });

    if (error) {
      console.error('Error fetching residents:', error);
      return NextResponse.json({ error: 'Failed to fetch residents' }, { status: 500 });
    }

    return NextResponse.json(residents);
  } catch (error) {
    console.error('Error in GET /api/warga:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
