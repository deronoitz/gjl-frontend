import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';

export async function POST() {
  try {
    const supabase = createServerSupabaseClient();
    
    console.log('Running financial records migration...');

    // Execute the migration SQL
    const migrationSQL = `
-- Create financial records table for income/expense tracking
CREATE TABLE IF NOT EXISTS financial_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
    category TEXT NOT NULL,
    amount DECIMAL(12,2) NOT NULL CHECK (amount > 0),
    description TEXT,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    proof_url TEXT,
    house_block TEXT,
    user_uuid UUID REFERENCES users(id) ON DELETE SET NULL,
    created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance (only if they don't exist)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_financial_records_type') THEN
        CREATE INDEX idx_financial_records_type ON financial_records(type);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_financial_records_category') THEN
        CREATE INDEX idx_financial_records_category ON financial_records(category);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_financial_records_date') THEN
        CREATE INDEX idx_financial_records_date ON financial_records(date);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_financial_records_user_uuid') THEN
        CREATE INDEX idx_financial_records_user_uuid ON financial_records(user_uuid);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_financial_records_created_by') THEN
        CREATE INDEX idx_financial_records_created_by ON financial_records(created_by);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_financial_records_house_block') THEN
        CREATE INDEX idx_financial_records_house_block ON financial_records(house_block);
    END IF;
END $$;

-- Enable RLS
ALTER TABLE financial_records ENABLE ROW LEVEL SECURITY;

-- Create trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_financial_records_updated_at') THEN
        CREATE TRIGGER update_financial_records_updated_at
            BEFORE UPDATE ON financial_records
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;`;

    const { error: sqlError } = await supabase.rpc('exec_sql', { 
      sql: migrationSQL 
    });

    if (sqlError) {
      console.error('SQL Migration failed:', sqlError);
      return NextResponse.json(
        { error: 'Migration failed', details: sqlError },
        { status: 500 }
      );
    }

    // Create RLS policies
    const policiesSQL = `
-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Admin can view all financial records" ON financial_records;
DROP POLICY IF EXISTS "Admin can manage financial records" ON financial_records;
DROP POLICY IF EXISTS "Users can view own financial records" ON financial_records;

-- Create new policies
CREATE POLICY "Admin can view all financial records" ON financial_records
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Admin can manage financial records" ON financial_records
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Users can view own financial records" ON financial_records
    FOR SELECT USING (
        user_uuid = auth.uid() OR 
        created_by = auth.uid()
    );`;

    const { error: policyError } = await supabase.rpc('exec_sql', { 
      sql: policiesSQL 
    });

    if (policyError) {
      console.error('Policy creation failed:', policyError);
      // Don't fail the migration for policy errors
    }

    // Create storage bucket for payment proofs
    try {
      const { error: bucketError } = await supabase.storage.createBucket('payment-proofs', {
        public: false,
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'],
        fileSizeLimit: 5242880, // 5MB
      });

      if (bucketError && !bucketError.message?.includes('already exists')) {
        console.error('Failed to create storage bucket:', bucketError);
      }
    } catch (bucketError) {
      console.error('Storage bucket creation error:', bucketError);
    }

    return NextResponse.json({
      message: 'Financial records migration completed successfully!',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error running migration:', error);
    return NextResponse.json(
      { error: 'Migration failed', details: error },
      { status: 500 }
    );
  }
}
