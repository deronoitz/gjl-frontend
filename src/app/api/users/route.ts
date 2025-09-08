import { NextRequest, NextResponse } from 'next/server';
import { CustomAuth } from '@/lib/custom-auth';
import { supabase } from '@/lib/supabase';
import bcrypt from 'bcryptjs';

// GET /api/users - Get all users (admin only)
export async function GET(request: NextRequest) {
  try {
    const sessionToken = request.cookies.get('session_token')?.value;

    if (!sessionToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const session = await CustomAuth.verifySession(sessionToken);
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: users, error } = await supabase
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
      .order('house_number', { ascending: true });

    if (error) {
      console.error('Error fetching users:', error);
      return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
    }

    return NextResponse.json(users);
  } catch (error) {
    console.error('Error in GET /api/users:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/users - Create new user (admin only)
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
    const { houseNumber, password, role = 'user', name, phoneNumber, position_id } = body;

    if (!houseNumber || !password || !name) {
      return NextResponse.json(
        { error: 'House number, password, and name are required' },
        { status: 400 }
      );
    }

    // Check if house number already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('house_number')
      .eq('house_number', houseNumber)
      .single();

    if (existingUser) {
      return NextResponse.json(
        { error: 'House number already exists' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Prepare user data
    interface UserData {
      house_number: string;
      name: string;
      phone_number: string | null;
      password_hash: string;
      role: string;
      position_id?: string;
    }

    const userData: UserData = {
      house_number: houseNumber,
      name: name,
      phone_number: phoneNumber || null,
      password_hash: hashedPassword,
      role: role,
    };

    // Use position_id if provided
    if (position_id) {
      userData.position_id = position_id;
    }

    // Create user in our custom users table
    const { data: newUser, error: userError } = await supabase
      .from('users')
      .insert(userData)
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
      .single();

    if (userError || !newUser) {
      console.error('Error creating user:', userError);
      return NextResponse.json(
        { error: 'Failed to create user' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      id: newUser.id,
      house_number: newUser.house_number,
      name: newUser.name,
      phone_number: newUser.phone_number,
      position_id: newUser.position_id,
      positions: newUser.positions,
      role: newUser.role,
      created_at: newUser.created_at,
    }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/users:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
