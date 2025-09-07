-- Create financial records table for income/expense tracking
CREATE TABLE IF NOT EXISTS financial_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
    category TEXT NOT NULL,
    amount DECIMAL(12,2) NOT NULL CHECK (amount > 0),
    description TEXT,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    proof_url TEXT, -- URL for uploaded proof/receipt
    house_block TEXT, -- For manual input - which house block
    user_uuid UUID REFERENCES users(id) ON DELETE SET NULL, -- For linking to specific user
    created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_financial_records_type ON financial_records(type);
CREATE INDEX idx_financial_records_category ON financial_records(category);
CREATE INDEX idx_financial_records_date ON financial_records(date);
CREATE INDEX idx_financial_records_user_uuid ON financial_records(user_uuid);
CREATE INDEX idx_financial_records_created_by ON financial_records(created_by);
CREATE INDEX idx_financial_records_house_block ON financial_records(house_block);

-- Enable RLS
ALTER TABLE financial_records ENABLE ROW LEVEL SECURITY;

-- Create trigger to update updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_financial_records_updated_at
    BEFORE UPDATE ON financial_records
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies
-- Admin can view all financial records
CREATE POLICY "Admin can view all financial records" ON financial_records
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Admin can insert/update/delete financial records
CREATE POLICY "Admin can manage financial records" ON financial_records
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Users can only view financial records related to them
CREATE POLICY "Users can view own financial records" ON financial_records
    FOR SELECT USING (
        user_uuid = auth.uid() OR 
        created_by = auth.uid()
    );
