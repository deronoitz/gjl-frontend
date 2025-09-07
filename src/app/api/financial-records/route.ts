import { NextRequest, NextResponse } from 'next/server';
import { supabaseService } from '@/lib/supabase';
import { z } from 'zod';
import { getAuthenticatedUser, canAccessFinancialRecords } from '@/lib/auth-helpers';

// Validation schema untuk financial record
const createFinancialRecordSchema = z.object({
  type: z.enum(['income', 'expense']),
  category: z.string().min(1, 'Category is required'),
  amount: z.number().positive('Amount must be positive'),
  description: z.string().optional(),
  date: z.string().refine((date) => !isNaN(Date.parse(date)), 'Invalid date format'),
  house_block: z.string().optional(),
  user_uuid: z.string().uuid().optional(),
  proof_url: z.string().url().optional(),
  status: z.enum(['pending', 'done', 'expired']).optional(),
  payment_url: z.string().url().optional(),
});

// GET - List financial records with filtering
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const user = await getAuthenticatedUser(request);
    
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const category = searchParams.get('category');
    const month = searchParams.get('month');
    const year = searchParams.get('year');
    const house_block = searchParams.get('house_block');
    const show_all_status = searchParams.get('show_all_status'); // Parameter to show all statuses
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;
    
    // Users can only see their own records, admins can see all
    const isAdmin = canAccessFinancialRecords(user);
    
    if (!isAdmin) {
      // Regular users can only see records related to their house block/user
      if (!user || (!house_block || house_block !== user.houseNumber)) {
        return NextResponse.json(
          { error: 'Unauthorized. You can only view your own payment records.' },
          { status: 401 }
        );
      }
    }

    // Get user from session/JWT (implement your auth logic here)
    // For now, we'll use service client assuming admin access
    
    let query = supabaseService
      .from('financial_records')
      .select(`
        *,
        user:users!financial_records_user_uuid_fkey(
          id,
          name,
          house_number
        ),
        created_by_user:users!financial_records_created_by_fkey(
          id,
          name
        )
      `)
      .order('date', { ascending: false })
      .order('created_at', { ascending: false });

    // Apply filters
    if (type) {
      query = query.eq('type', type);
    }
    if (category) {
      query = query.eq('category', category);
    }
    if (house_block) {
      query = query.eq('house_block', house_block);
    }
    
    // Only show records with 'done' status for financial reports (admin users)
    // Regular users can see all their payment records regardless of status
    // Special case: if show_all_status is true, show all statuses even for admins (payment page)
    if (isAdmin && !show_all_status) {
      query = query.eq('status', 'done');
    }
    if (month && year) {
      const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
      const endDate = new Date(parseInt(year), parseInt(month), 0);
      query = query.gte('date', startDate.toISOString().split('T')[0])
                  .lte('date', endDate.toISOString().split('T')[0]);
    } else if (year) {
      const startDate = new Date(parseInt(year), 0, 1);
      const endDate = new Date(parseInt(year), 11, 31);
      query = query.gte('date', startDate.toISOString().split('T')[0])
                  .lte('date', endDate.toISOString().split('T')[0]);
    }

    // Get total count for pagination
    const countQuery = supabaseService
      .from('financial_records')
      .select('*', { count: 'exact', head: true });
    
    // Apply same filters to count query
    if (type) countQuery.eq('type', type);
    if (category) countQuery.eq('category', category);
    if (house_block) countQuery.eq('house_block', house_block);
    
    // Only count records with 'done' status for financial reports (admin users)
    if (isAdmin && !show_all_status) {
      countQuery.eq('status', 'done');
    }
    
    // Apply date filters to count query
    if (month && year) {
      const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
      const endDate = new Date(parseInt(year), parseInt(month), 0);
      countQuery.gte('date', startDate.toISOString().split('T')[0])
               .lte('date', endDate.toISOString().split('T')[0]);
    } else if (year) {
      const startDate = new Date(parseInt(year), 0, 1);
      const endDate = new Date(parseInt(year), 11, 31);
      countQuery.gte('date', startDate.toISOString().split('T')[0])
               .lte('date', endDate.toISOString().split('T')[0]);
    }
    if (month && year) {
      const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
      const endDate = new Date(parseInt(year), parseInt(month), 0);
      countQuery.gte('date', startDate.toISOString().split('T')[0])
               .lte('date', endDate.toISOString().split('T')[0]);
    } else if (year) {
      const startDate = new Date(parseInt(year), 0, 1);
      const endDate = new Date(parseInt(year), 11, 31);
      countQuery.gte('date', startDate.toISOString().split('T')[0])
               .lte('date', endDate.toISOString().split('T')[0]);
    }

    const { data: records, error } = await query.range(offset, offset + limit - 1);
    const { count } = await countQuery;

    if (error) {
      console.error('Error fetching financial records:', error);
      return NextResponse.json(
        { error: 'Failed to fetch financial records' },
        { status: 500 }
      );
    }

    // Calculate summary statistics
    const summaryQuery = supabaseService
      .from('financial_records')
      .select('type, amount');
    
    // Apply same status filtering for summary
    if (isAdmin && !show_all_status) {
      summaryQuery.eq('status', 'done');
    }
    
    // Apply other filters to summary if provided
    if (type) summaryQuery.eq('type', type);
    if (category) summaryQuery.eq('category', category);
    if (house_block) summaryQuery.eq('house_block', house_block);
    
    // Apply date filters to summary query
    if (month && year) {
      const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
      const endDate = new Date(parseInt(year), parseInt(month), 0);
      summaryQuery.gte('date', startDate.toISOString().split('T')[0])
                  .lte('date', endDate.toISOString().split('T')[0]);
    } else if (year) {
      const startDate = new Date(parseInt(year), 0, 1);
      const endDate = new Date(parseInt(year), 11, 31);
      summaryQuery.gte('date', startDate.toISOString().split('T')[0])
                  .lte('date', endDate.toISOString().split('T')[0]);
    }
    
    const { data: summaryData } = await summaryQuery;
    
    const summary = {
      total_income: summaryData?.filter(r => r.type === 'income')
                               .reduce((sum, r) => sum + parseFloat(r.amount), 0) || 0,
      total_expense: summaryData?.filter(r => r.type === 'expense')
                                .reduce((sum, r) => sum + parseFloat(r.amount), 0) || 0,
      net_balance: 0,
    };
    summary.net_balance = summary.total_income - summary.total_expense;

    return NextResponse.json({
      data: records,
      pagination: {
        page,
        limit,
        total: count || 0,
        total_pages: Math.ceil((count || 0) / limit),
      },
      summary,
    });

  } catch (error) {
    console.error('Error in GET /api/financial-records:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Create new financial record
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const user = await getAuthenticatedUser(request);
    if (!canAccessFinancialRecords(user)) {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    
    // Validate input
    const validatedData = createFinancialRecordSchema.parse(body);
    
    const { data: record, error } = await supabaseService
      .from('financial_records')
      .insert({
        ...validatedData,
        created_by: user!.id,
        // Set default status to 'done' for manual input if not specified
        status: validatedData.status || 'done',
      })
      .select(`
        *,
        user:users!financial_records_user_uuid_fkey(
          id,
          name,
          house_number
        ),
        created_by_user:users!financial_records_created_by_fkey(
          id,
          name
        )
      `)
      .single();

    if (error) {
      console.error('Error creating financial record:', error);
      return NextResponse.json(
        { error: 'Failed to create financial record' },
        { status: 500 }
      );
    }

    return NextResponse.json(record, { status: 201 });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      );
    }
    
    console.error('Error in POST /api/financial-records:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
