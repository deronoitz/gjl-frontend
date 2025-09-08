import dotenv from 'dotenv';
import path from 'path';
import { supabase } from '../src/lib/supabase';
import bcrypt from 'bcryptjs';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

async function seedOrganizationalData() {
  console.log('Starting to seed organizational data...');

  try {
    // First, let's check if positions exist
    const { data: positions, error: positionsError } = await supabase
      .from('positions')
      .select('*')
      .order('order', { ascending: true });

    if (positionsError) {
      console.error('Error fetching positions:', positionsError);
      return;
    }

    console.log('Positions found:', positions?.length || 0);

    if (!positions || positions.length === 0) {
      console.log('No positions found, creating default positions...');
      const defaultPositions = [
        { position: 'Ketua RT', order: 1 },
        { position: 'Wakil Ketua RT', order: 2 },
        { position: 'Sekretaris', order: 3 },
        { position: 'Bendahara', order: 4 },
        { position: 'Koordinator Keamanan', order: 5 },
        { position: 'Koordinator Kebersihan', order: 6 },
        { position: 'Koordinator Sosial', order: 7 },
      ];

      const { data: newPositions, error: createError } = await supabase
        .from('positions')
        .insert(defaultPositions)
        .select();

      if (createError) {
        console.error('Error creating positions:', createError);
        return;
      }

      console.log('Created positions:', newPositions?.length);
    }

    // Fetch positions again after potential creation
    const { data: allPositions, error: fetchError } = await supabase
      .from('positions')
      .select('*')
      .order('order', { ascending: true });

    if (fetchError || !allPositions) {
      console.error('Error fetching positions after creation:', fetchError);
      return;
    }

    // Create test users with positions
    const testUsers = [
      { house_number: 'A01', name: 'Budi Santoso', phone_number: '081234567801', positionIndex: 0 },
      { house_number: 'A02', name: 'Siti Rahayu', phone_number: '081234567802', positionIndex: 1 },
      { house_number: 'A03', name: 'Ahmad Wijaya', phone_number: '081234567803', positionIndex: 2 },
      { house_number: 'A04', name: 'Dewi Lestari', phone_number: '081234567804', positionIndex: 3 },
      { house_number: 'A05', name: 'Hendra Kusuma', phone_number: '081234567805', positionIndex: 4 },
      { house_number: 'A06', name: 'Maya Sari', phone_number: '081234567806', positionIndex: 5 },
      { house_number: 'A07', name: 'Andi Pratama', phone_number: '081234567807', positionIndex: 6 },
    ];

    const hashedPassword = await bcrypt.hash('password123', 10);

    for (const userData of testUsers) {
      const position = allPositions[userData.positionIndex];
      if (!position) continue;

      const { error: userError } = await supabase
        .from('users')
        .upsert({
          house_number: userData.house_number,
          name: userData.name,
          phone_number: userData.phone_number,
          password_hash: hashedPassword,
          role: 'user',
          position_id: position.id,
        }, {
          onConflict: 'house_number',
        });

      if (userError) {
        console.error(`Error creating user ${userData.house_number}:`, userError);
      } else {
        console.log(`✓ Created/updated user ${userData.house_number} with position ${position.position}`);
      }
    }

    // Verify the data
    const { data: usersWithPositions, error: verifyError } = await supabase
      .from('users')
      .select(`
        house_number,
        name,
        phone_number,
        positions (
          position,
          order
        )
      `)
      .not('position_id', 'is', null)
      .order('positions(order)', { ascending: true });

    if (verifyError) {
      console.error('Error verifying data:', verifyError);
    } else {
      console.log('\nUsers with positions:');
      usersWithPositions?.forEach(user => {
        const position = Array.isArray(user.positions) ? user.positions[0] : user.positions;
        console.log(`${user.house_number} - ${user.name} - ${position?.position}`);
      });
    }

    console.log('\nSeeding completed successfully!');
  } catch (error) {
    console.error('Error during seeding:', error);
  }
}

// Run the seeding function
seedOrganizationalData();
