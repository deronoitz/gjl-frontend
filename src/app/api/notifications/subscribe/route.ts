import { NextRequest, NextResponse } from 'next/server';
import { CustomAuth } from '@/lib/custom-auth';
import { supabaseService } from '@/lib/supabase';
import webpush from 'web-push';

// Configure VAPID keys - you'll need to set these environment variables
if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    'mailto:admin@gjl.com',
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
}

// POST /api/notifications/subscribe - Subscribe to push notifications
export async function POST(request: NextRequest) {
  try {
    const sessionToken = request.cookies.get('session_token')?.value;

    if (!sessionToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const session = await CustomAuth.verifySession(sessionToken);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { subscription } = body;

    if (!subscription) {
      return NextResponse.json({ error: 'Missing subscription data' }, { status: 400 });
    }

    // Save subscription to database
    const { error } = await supabaseService
      .from('push_subscriptions')
      .upsert({
        user_id: session.id,
        endpoint: subscription.endpoint,
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      });

    if (error) {
      console.error('Error saving subscription:', error);
      return NextResponse.json({ error: 'Failed to save subscription' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in POST /api/notifications/subscribe:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/notifications/subscribe - Unsubscribe from push notifications
export async function DELETE(request: NextRequest) {
  try {
    const sessionToken = request.cookies.get('session_token')?.value;

    if (!sessionToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const session = await CustomAuth.verifySession(sessionToken);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Remove subscription from database
    const { error } = await supabaseService
      .from('push_subscriptions')
      .delete()
      .eq('user_id', session.id);

    if (error) {
      console.error('Error removing subscription:', error);
      return NextResponse.json({ error: 'Failed to remove subscription' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/notifications/subscribe:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
