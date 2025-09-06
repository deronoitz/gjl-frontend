-- Create payment records table for tracking successful monthly fee payments
-- Using different name to avoid conflict with enum type
CREATE TABLE payment_records (
    id SERIAL PRIMARY KEY,
    user_uuid UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    bulan INTEGER NOT NULL CHECK (bulan >= 1 AND bulan <= 12),
    tahun INTEGER NOT NULL CHECK (tahun >= 2024),
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Unique constraint to prevent duplicate entries for same user, month, year
    UNIQUE(user_uuid, bulan, tahun)
);

-- Create indexes for faster queries
CREATE INDEX idx_payment_records_user_uuid ON payment_records(user_uuid);
CREATE INDEX idx_payment_records_bulan_tahun ON payment_records(bulan, tahun);
CREATE INDEX idx_payment_records_created_by ON payment_records(created_by);

-- Enable RLS
ALTER TABLE payment_records ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Admin can see all payment records
CREATE POLICY "Admin can view all payment records" ON payment_records
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Admin can insert/update/delete payment records
CREATE POLICY "Admin can manage payment records" ON payment_records
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Users can only view their own payment records
CREATE POLICY "Users can view own payment records" ON payment_records
    FOR SELECT USING (user_uuid = auth.uid());
