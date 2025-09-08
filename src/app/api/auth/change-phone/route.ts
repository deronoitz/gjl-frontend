import { NextRequest, NextResponse } from 'next/server';
import { CustomAuth } from '@/lib/custom-auth';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const sessionToken = request.cookies.get('session_token')?.value;

    if (!sessionToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const session = await CustomAuth.verifySession(sessionToken);
    if (!session) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }

    const body = await request.json();
    const { phoneNumber } = body;

    if (!phoneNumber || phoneNumber.trim() === '') {
      return NextResponse.json(
        { error: 'Nomor handphone tidak boleh kosong' },
        { status: 400 }
      );
    }

    // Validate phone number format (basic Indonesian phone number validation)
    const phoneRegex = /^(\+62|62|0)8[1-9][0-9]{6,9}$/;
    if (!phoneRegex.test(phoneNumber.trim())) {
      return NextResponse.json(
        { error: 'Format nomor handphone tidak valid. Contoh: 08123456789' },
        { status: 400 }
      );
    }

    // Normalize phone number (remove +62, 62, or 0 prefix and add 62)
    let normalizedPhone = phoneNumber.trim();
    if (normalizedPhone.startsWith('+62')) {
      normalizedPhone = normalizedPhone.substring(3);
    } else if (normalizedPhone.startsWith('62')) {
      normalizedPhone = normalizedPhone.substring(2);
    } else if (normalizedPhone.startsWith('0')) {
      normalizedPhone = normalizedPhone.substring(1);
    }
    normalizedPhone = '62' + normalizedPhone;

    // Check if phone number already exists for another user
    const { data: existingUser } = await supabase
      .from('users')
      .select('id, phone_number')
      .eq('phone_number', normalizedPhone)
      .neq('id', session.id)
      .single();

    if (existingUser) {
      return NextResponse.json(
        { error: 'Nomor handphone sudah digunakan oleh pengguna lain' },
        { status: 400 }
      );
    }

    // Update user's phone number
    const { data: updatedUser, error: updateError } = await supabase
      .from('users')
      .update({
        phone_number: normalizedPhone,
        updated_at: new Date().toISOString(),
      })
      .eq('id', session.id)
      .select('id, house_number, name, phone_number, role')
      .single();

    if (updateError || !updatedUser) {
      console.error('Error updating phone number:', updateError);
      return NextResponse.json(
        { error: 'Gagal mengubah nomor handphone' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Nomor handphone berhasil diubah',
      user: {
        id: updatedUser.id,
        houseNumber: updatedUser.house_number,
        name: updatedUser.name,
        phoneNumber: updatedUser.phone_number,
        role: updatedUser.role,
      },
    });
  } catch (error) {
    console.error('Error in change phone:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
