import { NextRequest, NextResponse } from 'next/server';
import { CustomAuth } from '@/lib/custom-auth';
import { supabase } from '@/lib/supabase';

// GET /api/positions/[id] - Get single position
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const sessionToken = request.cookies.get('session_token')?.value;

    if (!sessionToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const session = await CustomAuth.verifySession(sessionToken);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: position, error } = await supabase
      .from('positions')
      .select('*')
      .eq('id', resolvedParams.id)
      .single();

    if (error || !position) {
      return NextResponse.json({ error: 'Position not found' }, { status: 404 });
    }

    return NextResponse.json(position);
  } catch (error) {
    console.error('Error in GET /api/positions/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/positions/[id] - Update position (admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
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

    if (!position && order === undefined) {
      return NextResponse.json(
        { error: 'At least one field (position or order) is required' },
        { status: 400 }
      );
    }

    // Check if position name already exists for other positions
    if (position) {
      const { data: existingPosition } = await supabase
        .from('positions')
        .select('position, id')
        .eq('position', position)
        .neq('id', resolvedParams.id)
        .single();

      if (existingPosition) {
        return NextResponse.json(
          { error: 'Position name already exists' },
          { status: 400 }
        );
      }
    }

    // Check if order already exists for other positions
    if (order !== undefined) {
      const { data: existingOrder } = await supabase
        .from('positions')
        .select('order, id')
        .eq('order', order)
        .neq('id', resolvedParams.id)
        .single();

      if (existingOrder) {
        return NextResponse.json(
          { error: 'Order number already exists' },
          { status: 400 }
        );
      }
    }

    // Prepare update data
    const updateData: {
      position?: string;
      order?: number;
      updated_at: string;
    } = {
      updated_at: new Date().toISOString(),
    };

    if (position) updateData.position = position;
    if (order !== undefined) updateData.order = order;

    // Update position
    const { data: updatedPosition, error: updateError } = await supabase
      .from('positions')
      .update(updateData)
      .eq('id', resolvedParams.id)
      .select('*')
      .single();

    if (updateError || !updatedPosition) {
      console.error('Error updating position:', updateError);
      return NextResponse.json(
        { error: 'Failed to update position' },
        { status: 500 }
      );
    }

    return NextResponse.json(updatedPosition);
  } catch (error) {
    console.error('Error in PUT /api/positions/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/positions/[id] - Delete position (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const sessionToken = request.cookies.get('session_token')?.value;

    if (!sessionToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const session = await CustomAuth.verifySession(sessionToken);
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if position exists
    const { data: position, error: positionError } = await supabase
      .from('positions')
      .select('id')
      .eq('id', resolvedParams.id)
      .single();

    if (positionError || !position) {
      return NextResponse.json({ error: 'Position not found' }, { status: 404 });
    }

    // Delete position
    const { error: deleteError } = await supabase
      .from('positions')
      .delete()
      .eq('id', resolvedParams.id);

    if (deleteError) {
      console.error('Error deleting position:', deleteError);
      return NextResponse.json(
        { error: 'Failed to delete position' },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: 'Position deleted successfully' });
  } catch (error) {
    console.error('Error in DELETE /api/positions/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
