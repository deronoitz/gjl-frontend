-- Drop table if exists to avoid type conflicts
DROP TABLE IF EXISTS payment_status CASCADE;

-- Create payment status table for tracking successful monthly fee payments
CREATE TABLE payment_status (
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
CREATE INDEX idx_payment_status_user_uuid ON payment_status(user_uuid);
CREATE INDEX idx_payment_status_bulan_tahun ON payment_status(bulan, tahun);
CREATE INDEX idx_payment_status_created_by ON payment_status(created_by);

-- Enable RLS
ALTER TABLE payment_status ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Admin can see all payment status
CREATE POLICY "Admin can view all payment status" ON payment_status
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Admin can insert/update/delete payment status
CREATE POLICY "Admin can manage payment status" ON payment_status
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Users can only view their own payment status
CREATE POLICY "Users can view own payment status" ON payment_status
    FOR SELECT USING (user_uuid = auth.uid());