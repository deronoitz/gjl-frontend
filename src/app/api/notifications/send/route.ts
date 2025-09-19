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

// POST /api/notifications/send - Send push notification (admin only)
export async function POST(request: NextRequest) {
  try {
    const sessionToken = request.cookies.get('session_token')?.value;

    if (!sessionToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const session = await CustomAuth.verifySession(sessionToken);
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const body = await request.json();
    const { title, body: messageBody, icon, badge, url } = body;

    if (!title || !messageBody) {
      return NextResponse.json({ error: 'Missing required fields: title and body are required' }, { status: 400 });
    }

    // Get all active push subscriptions
    console.log('📋 Fetching push subscriptions from database...');
    const { data: subscriptions, error } = await supabaseService
      .from('push_subscriptions')
      .select('*');

    if (error) {
      console.error('❌ Error fetching subscriptions:', error);
      return NextResponse.json({ error: 'Failed to fetch subscriptions' }, { status: 500 });
    }

    console.log('📊 Found subscriptions:', subscriptions?.length || 0);
    if (subscriptions && subscriptions.length > 0) {
      console.log('👥 Subscriber user IDs:', subscriptions.map(s => s.user_id));
    }

    if (!subscriptions || subscriptions.length === 0) {
      console.log('⚠️ No active subscriptions found');
      return NextResponse.json({ message: 'No active subscriptions found' }, { status: 200 });
    }

    // Prepare notification payload
    const notificationPayload = JSON.stringify({
      title,
      body: messageBody,
      icon: icon || '/android-chrome-192x192.png',
      badge: badge || '/favicon-32x32.png',
      url: url || '/',
      timestamp: Date.now(),
      requireInteraction: false,
      actions: [
        {
          action: 'view',
          title: 'Lihat',
        },
        {
          action: 'close',
          title: 'Tutup',
        }
      ]
    });

    // Send notifications to all subscribers
    const promises = subscriptions.map(async (subscription) => {
      try {
        const pushSubscription = {
          endpoint: subscription.endpoint,
          keys: {
            p256dh: subscription.p256dh,
            auth: subscription.auth
          }
        };

        await webpush.sendNotification(pushSubscription, notificationPayload);
        return { success: true, userId: subscription.user_id };
      } catch (error) {
        console.error(`Failed to send notification to user ${subscription.user_id}:`, error);
        
        // If subscription is invalid, remove it from database
        if (error instanceof webpush.WebPushError && error.statusCode === 410) {
          await supabaseService
            .from('push_subscriptions')
            .delete()
            .eq('user_id', subscription.user_id);
        }
        
        return { success: false, userId: subscription.user_id, error: error instanceof Error ? error.message : String(error) };
      }
    });

    const results = await Promise.all(promises);
    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;

    return NextResponse.json({
      message: `Notifications sent successfully`,
      stats: {
        total: subscriptions.length,
        successful,
        failed
      },
      results
    });
  } catch (error) {
    console.error('Error in POST /api/notifications/send:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
