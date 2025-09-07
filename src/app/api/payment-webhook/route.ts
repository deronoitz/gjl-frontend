import { NextRequest, NextResponse } from 'next/server';
import { supabaseService } from '@/lib/supabase';
import crypto from 'crypto';

// Webhook interface for Flip payment gateway
interface FlipWebhookData {
  id: string;
  bill_link_id: number;
  bill_title: string;
  sender_name: string;
  sender_email: string;
  sender_phone_number?: string;
  status: 'SUCCESSFUL' | 'FAILED' | 'PENDING';
  amount: number;
  reference_id: string;
  created_at: string;
  updated_at: string;
  bill_short_url: string;
}

// POST - Handle payment webhook from Flip
export async function POST(request: NextRequest) {
  try {
    // Get the raw body for signature verification
    const rawBody = await request.text();
    const webhookData: FlipWebhookData = JSON.parse(rawBody);

    console.log('Received webhook data:', webhookData);

    // Verify webhook signature (optional, depending on Flip's implementation)
    const signature = request.headers.get('x-flip-signature');
    if (signature) {
      const flipSecret = process.env.FLIP_WEBHOOK_SECRET;
      if (flipSecret) {
        const expectedSignature = crypto
          .createHmac('sha256', flipSecret)
          .update(rawBody)
          .digest('hex');
        
        if (signature !== expectedSignature) {
          console.error('Invalid webhook signature');
          return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
        }
      }
    }

    // Update financial records based on payment status
    if (webhookData.status === 'SUCCESSFUL') {
      // Find financial records by reference_id
      const { data: records, error: findError } = await supabaseService
        .from('financial_records')
        .select('*')
        .eq('reference_id', webhookData.reference_id)
        .eq('status', 'pending');

      if (findError) {
        console.error('Error finding financial records:', findError);
        return NextResponse.json({ error: 'Database error' }, { status: 500 });
      }

      if (records && records.length > 0) {
        // Update all related records to 'done' status
        const { error: updateError } = await supabaseService
          .from('financial_records')
          .update({ 
            status: 'done',
            updated_at: new Date().toISOString(),
          })
          .eq('reference_id', webhookData.reference_id)
          .eq('status', 'pending');

        if (updateError) {
          console.error('Error updating financial records:', updateError);
          return NextResponse.json({ error: 'Failed to update payment status' }, { status: 500 });
        }

        console.log(`Updated ${records.length} financial records to 'done' status for reference: ${webhookData.reference_id}`);
      } else {
        console.log(`No pending records found for reference: ${webhookData.reference_id}`);
      }
    } else if (webhookData.status === 'FAILED') {
      // Update status to 'expired' for failed payments
      const { error: updateError } = await supabaseService
        .from('financial_records')
        .update({ 
          status: 'expired',
          updated_at: new Date().toISOString(),
        })
        .eq('reference_id', webhookData.reference_id)
        .eq('status', 'pending');

      if (updateError) {
        console.error('Error updating failed payment records:', updateError);
      } else {
        console.log(`Updated payment status to 'expired' for reference: ${webhookData.reference_id}`);
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Webhook processed successfully',
      reference_id: webhookData.reference_id,
      status: webhookData.status,
    });

  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// GET - Health check for webhook endpoint
export async function GET() {
  return NextResponse.json({ 
    status: 'ok', 
    message: 'Webhook endpoint is active',
    timestamp: new Date().toISOString(),
  });
}
