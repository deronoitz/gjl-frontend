import { NextRequest, NextResponse } from 'next/server';
import { supabaseService } from '@/lib/supabase';
import { getAuthenticatedUser, canAccessFinancialRecords } from '@/lib/auth-helpers';

// GET - Get house blocks and users for dropdown
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const user = await getAuthenticatedUser(request);
    if (!canAccessFinancialRecords(user)) {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'all'; // 'blocks', 'users', or 'all'

    const response: {
      blocks?: Array<{ value: string; label: string }>;
      users?: Array<{ 
        id: string; 
        name: string; 
        house_block: string; 
        value: string; 
        label: string; 
      }>;
    } = {};

    // Get unique house blocks
    if (type === 'blocks' || type === 'all') {
      const { data: blocks, error: blocksError } = await supabaseService
        .from('users')
        .select('house_number')
        .not('house_number', 'is', null)
        .order('house_number');

      if (blocksError) {
        console.error('Error fetching house blocks:', blocksError);
        return NextResponse.json(
          { error: 'Failed to fetch house blocks' },
          { status: 500 }
        );
      }

      // Get unique house blocks
      const uniqueBlocks = [...new Set(blocks?.map(b => b.house_number))].filter(Boolean);
      response.blocks = uniqueBlocks.map(block => ({
        value: block,
        label: `Blok ${block}`
      }));
    }

    // Get users with house blocks
    if (type === 'users' || type === 'all') {
      const { data: users, error: usersError } = await supabaseService
        .from('users')
        .select('id, name, house_number')
        .not('house_number', 'is', null)
        .order('house_number')
        .order('name');

      if (usersError) {
        console.error('Error fetching users:', usersError);
        return NextResponse.json(
          { error: 'Failed to fetch users' },
          { status: 500 }
        );
      }

      response.users = users?.map(user => ({
        id: user.id,
        name: user.name,
        house_block: user.house_number,
        value: user.id,
        label: `${user.name} - Blok ${user.house_number}`
      })) || [];
    }

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error in GET /api/house-blocks:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
