import { NextRequest, NextResponse } from 'next/server';
import { CustomAuth } from '@/lib/custom-auth';
import { supabaseService } from '@/lib/supabase';

// GET /api/settings - Get all settings
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

    // Only admins can view settings, but users can see some public settings
    let query = supabaseService.from('app_settings').select('*');
    
    if (session.role !== 'admin') {
      // Non-admin users can only see specific public settings
      query = query.in('setting_key', ['monthly_fee', 'qris_fee', 'app_name']);
    }

    const { data: settings, error } = await query;

    if (error) {
      console.error('Error fetching settings:', error);
      return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
    }

    // Transform to key-value object
    const settingsObject = settings?.reduce((acc: Record<string, unknown>, setting: { setting_key: string; setting_value: unknown }) => {
      acc[setting.setting_key] = setting.setting_value;
      return acc;
    }, {} as Record<string, unknown>) || {};

    return NextResponse.json(settingsObject);
  } catch (error) {
    console.error('Error in GET /api/settings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/settings - Update settings (admin only)
export async function PUT(request: NextRequest) {
  try {
    const sessionToken = request.cookies.get('session_token')?.value;

    if (!sessionToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const session = await CustomAuth.verifySession(sessionToken);
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized - Admin access required' }, { status: 403 });
    }

    const body = await request.json();
    const updates = [];

    // Process each setting update
    for (const [key, value] of Object.entries(body)) {
      if (key === 'monthly_fee') {
        // Validate monthly fee
        if (!value || typeof value !== 'object' || !('amount' in value) || 
            typeof (value as { amount: unknown }).amount !== 'number' || 
            (value as { amount: number }).amount < 0) {
          return NextResponse.json({ 
            error: 'Invalid monthly fee format. Expected: {amount: number, currency: string}' 
          }, { status: 400 });
        }
      }

      if (key === 'qris_fee') {
        // Validate QRIS fee
        if (!value || typeof value !== 'object' || !('percentage' in value) || 
            typeof (value as { percentage: unknown }).percentage !== 'number' || 
            (value as { percentage: number }).percentage < 0 || 
            (value as { percentage: number }).percentage > 100) {
          return NextResponse.json({ 
            error: 'Invalid QRIS fee format. Expected: {percentage: number} between 0-100' 
          }, { status: 400 });
        }
      }

      // Upsert setting
      console.log('Attempting to upsert setting:', { key, value, session_id: session.id });
      
      const { data, error } = await supabaseService
        .from('app_settings')
        .upsert({
          setting_key: key,
          setting_value: value,
          updated_by: session.id,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'setting_key'
        });

      if (error) {
        console.error(`Error updating setting ${key}:`, error);
        console.error('Error details:', JSON.stringify(error, null, 2));
        return NextResponse.json({ 
          error: `Failed to update setting: ${key}`,
          details: error.message
        }, { status: 500 });
      }

      console.log('Successfully upserted setting:', { key, data });
      updates.push(key);
    }

    return NextResponse.json({ 
      success: true, 
      message: `Successfully updated ${updates.length} setting(s)`,
      updated: updates
    });

  } catch (error) {
    console.error('Error in PUT /api/settings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
