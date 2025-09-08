import { NextRequest, NextResponse } from 'next/server';
import { CustomAuth } from '@/lib/custom-auth';
import { supabase } from '@/lib/supabase';
import bcrypt from 'bcryptjs';

// GET /api/users/[id] - Get single user (admin only)
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
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: user, error } = await supabase
      .from('users')
      .select(`
        id, 
        house_number, 
        role, 
        name, 
        phone_number, 
        position_id,
        created_at, 
        updated_at,
        positions (
          id,
          position,
          order
        )
      `)
      .eq('id', resolvedParams.id)
      .single();

    if (error || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error in GET /api/users/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/users/[id] - Update user (admin only)
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
    const { houseNumber, password, role, name, phoneNumber, position_id } = body;

    if (!houseNumber || !name) {
      return NextResponse.json(
        { error: 'House number and name are required' },
        { status: 400 }
      );
    }

    // Check if house number already exists for other users
    const { data: existingUser } = await supabase
      .from('users')
      .select('house_number, id')
      .eq('house_number', houseNumber)
      .neq('id', resolvedParams.id)
      .single();

    if (existingUser) {
      return NextResponse.json(
        { error: 'House number already exists' },
        { status: 400 }
      );
    }

    // Prepare update data
    interface UpdateData {
      house_number: string;
      name: string;
      phone_number?: string | null;
      position_id?: string | null;
      role: string;
      updated_at: string;
      password_hash?: string;
    }

    const updateData: UpdateData = {
      house_number: houseNumber,
      name: name,
      phone_number: phoneNumber || null,
      role: role,
      updated_at: new Date().toISOString(),
    };

    // Set position_id or clear it if not provided
    if (position_id) {
      updateData.position_id = position_id;
    } else {
      updateData.position_id = null;
    }

    // Only update password if provided
    if (password && password.trim() !== '') {
      updateData.password_hash = await bcrypt.hash(password, 12);
    }

    // Update user
    const { data: updatedUser, error: updateError } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', resolvedParams.id)
      .select(`
        id, 
        house_number, 
        name, 
        phone_number, 
        position_id,
        role, 
        created_at, 
        updated_at,
        positions (
          id,
          position,
          order
        )
      `)
      .single();

    if (updateError || !updatedUser) {
      console.error('Error updating user:', updateError);
      return NextResponse.json(
        { error: 'Failed to update user' },
        { status: 500 }
      );
    }

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Error in PUT /api/users/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/users/[id] - Delete user (admin only)
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

    // Don't allow deleting yourself
    if (session.id === resolvedParams.id) {
      return NextResponse.json(
        { error: 'Cannot delete your own account' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', resolvedParams.id);

    if (error) {
      console.error('Error deleting user:', error);
      return NextResponse.json(
        { error: 'Failed to delete user' },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error in DELETE /api/users/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
