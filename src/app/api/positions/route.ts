import { NextRequest, NextResponse } from 'next/server';
import { CustomAuth } from '@/lib/custom-auth';
import { supabase } from '@/lib/supabase';

// GET /api/positions - Get all positions
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

    const { data: positions, error } = await supabase
      .from('positions')
      .select('*')
      .order('order', { ascending: true });

    if (error) {
      console.error('Error fetching positions:', error);
      return NextResponse.json({ error: 'Failed to fetch positions' }, { status: 500 });
    }

    return NextResponse.json(positions);
  } catch (error) {
    console.error('Error in GET /api/positions:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/positions - Create new position (admin only)
export async function POST(request: NextRequest) {
  try {
    const sessionToken = request.cookies.get('session_token')?.value;

    if (!sessionToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const session = await CustomAuth.verifySession(sessionToken);
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { position, order } = body;

    if (!position || order === undefined) {
      return NextResponse.json(
        { error: 'Position name and order are required' },
        { status: 400 }
      );
    }

    // Check if position name already exists
    const { data: existingPosition } = await supabase
      .from('positions')
      .select('position')
      .eq('position', position)
      .single();

    if (existingPosition) {
      return NextResponse.json(
        { error: 'Position name already exists' },
        { status: 400 }
      );
    }

    // Check if order already exists
    const { data: existingOrder } = await supabase
      .from('positions')
      .select('order')
      .eq('order', order)
      .single();

    if (existingOrder) {
      return NextResponse.json(
        { error: 'Order number already exists' },
        { status: 400 }
      );
    }

    // Create position
    const { data: newPosition, error: positionError } = await supabase
      .from('positions')
      .insert({
        position: position,
        order: order,
      })
      .select()
      .single();

    if (positionError || !newPosition) {
      console.error('Error creating position:', positionError);
      return NextResponse.json(
        { error: 'Failed to create position' },
        { status: 500 }
      );
    }

    return NextResponse.json(newPosition, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/positions:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
