import { NextRequest, NextResponse } from 'next/server';
import { supabaseService } from '@/lib/supabase';
import { getAuthenticatedUser } from '@/lib/auth-helpers';
import { z } from 'zod';

// Validation schema for payment request
const createPaymentSchema = z.object({
  months: z.array(z.string()).min(1, 'At least one month is required'),
  year: z.string().min(4, 'Year is required'),
});

interface PaymentItem {
  name: string;
  price: number;
  quantity: number;
  desc: string | number;
}

interface PaymentRequest {
  title: string;
  type: 'single';
  step: 'checkout_seamless';
  reference_id: string;
  sender_name: string;
  sender_email: string;
  item_details: PaymentItem[];
}

interface PaymentResponse {
  link_id: number;
  link_url: string;
  title: string;
  type: string;
  amount: number;
  redirect_url: string;
  expired_date: string | null;
  created_from: string;
  status: string;
  is_address_required: boolean;
  is_phone_number_required: boolean;
  step: string;
  customer: {
    name: string;
    email: string;
    address: string | null;
    phone: string | null;
  };
  company_code: string;
  product_code: string;
  reference_id: string;
  item_details: Array<{
    name: string;
    price: number;
    quantity: number;
    desc: string;
    id: string;
    image_url: string | null;
  }>;
}

// POST - Create payment through payment gateway
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse request body
    const body = await request.json();
    const validatedData = createPaymentSchema.parse(body);

    // Get settings for monthly fee amount
    const settingsResponse = await fetch(`${request.nextUrl.origin}/api/settings`, {
      headers: {
        'Cookie': request.headers.get('cookie') || '', // Forward cookies for authentication
      },
    });

    if (!settingsResponse.ok) {
      console.error('Failed to fetch settings:', settingsResponse.status);
      return NextResponse.json({ error: 'Failed to fetch monthly fee configuration' }, { status: 500 });
    }

    const settings = await settingsResponse.json();
    const monthlyFeeAmount = settings?.monthly_fee?.amount;

    if (!monthlyFeeAmount || typeof monthlyFeeAmount !== 'number') {
      console.error('Monthly fee amount not found in app settings:', settings);
      return NextResponse.json({ error: 'Monthly fee configuration not found' }, { status: 500 });
    }

    // Map month numbers to month names
    const monthNames = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];

    // Generate reference ID
    const timestamp = Date.now();
    const referenceId = `GJL-${user.houseNumber}-${timestamp}`;

    // Prepare item details for payment gateway
    const itemDetails: PaymentItem[] = validatedData.months.map((monthNumber) => {
      const monthIndex = parseInt(monthNumber) - 1;
      const monthName = monthNames[monthIndex];
      return {
        name: monthName,
        price: monthlyFeeAmount,
        quantity: 1,
        desc: validatedData.year
      };
    });

    // Generate title
    const monthNamesSelected = validatedData.months.map((monthNumber) => {
      const monthIndex = parseInt(monthNumber) - 1;
      return monthNames[monthIndex];
    });
    const title = `${user.houseNumber} ${monthNamesSelected.join('-')}`;

    // Prepare payment request
    const paymentRequest: PaymentRequest = {
      title,
      type: 'single',
      step: 'checkout_seamless',
      reference_id: referenceId,
      sender_name: user.name,
      sender_email: `${user.houseNumber}@gjl.com`, // Generate email from house number
      item_details: itemDetails
    };

    // Get FLIP auth key from environment
    const flipAuthKey = process.env.FLIP_AUTH_KEY;
    if (!flipAuthKey) {
      console.error('FLIP_AUTH_KEY not found in environment variables');
      return NextResponse.json({ error: 'Payment gateway configuration error' }, { status: 500 });
    }

    // Call payment gateway API
    const response = await fetch('https://bigflip.id/api/v3/pwf/bill', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${flipAuthKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(paymentRequest),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Payment gateway error:', response.status, errorText);
      return NextResponse.json(
        { error: 'Failed to create payment link', details: errorText },
        { status: response.status }
      );
    }

    const paymentResponse: PaymentResponse = await response.json();

    // Create financial records for each month
    const financialRecords = validatedData.months.map((monthNumber) => {
      const monthIndex = parseInt(monthNumber) - 1;
      const monthName = monthNames[monthIndex];
      const description = `Iuran Bulanan ${monthName} ${validatedData.year}`;

      return {
        type: 'income',
        category: 'Iuran Bulanan',
        amount: monthlyFeeAmount,
        description,
        date: new Date().toISOString().split('T')[0], // Today's date
        house_block: user.houseNumber,
        user_uuid: user.id,
        created_by: user.id,
        status: 'pending',
        payment_url: paymentResponse.link_url,
        reference_id: paymentResponse.reference_id,
      };
    });

    // Insert financial records
    const { error: insertError } = await supabaseService
      .from('financial_records')
      .insert(financialRecords);

    if (insertError) {
      console.error('Error inserting financial records:', insertError);
      return NextResponse.json(
        { error: 'Failed to create payment records', details: insertError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      payment_url: paymentResponse.link_url,
      amount: paymentResponse.amount,
      reference_id: paymentResponse.reference_id,
      link_id: paymentResponse.link_id,
      title: paymentResponse.title,
      status: paymentResponse.status,
    });

  } catch (error) {
    console.error('Error creating payment:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
