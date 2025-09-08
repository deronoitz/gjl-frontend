-- Create positions table
-- Created: September 8, 2025

-- Create the positions table
CREATE TABLE positions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    position TEXT NOT NULL UNIQUE,
    "order" INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create indexes for better query performance
CREATE INDEX idx_positions_order ON positions("order");
CREATE INDEX idx_positions_position ON positions(position);

-- Enable RLS
ALTER TABLE positions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for positions table
-- All authenticated users can view positions
CREATE POLICY "All users can view positions" ON positions
    FOR SELECT USING (auth.uid() IS NOT NULL);

-- Only admins can insert, update, and delete positions
CREATE POLICY "Admins can insert positions" ON positions
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id::text = auth.uid()::text 
            AND role = 'admin'
        )
    );

CREATE POLICY "Admins can update positions" ON positions
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id::text = auth.uid()::text 
            AND role = 'admin'
        )
    );

CREATE POLICY "Admins can delete positions" ON positions
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id::text = auth.uid()::text 
            AND role = 'admin'
        )
    );

-- Insert some default positions with order
INSERT INTO positions (position, "order") VALUES
    ('Ketua RT', 1),
    ('Wakil Ketua RT', 2),
    ('Sekretaris', 3),
    ('Bendahara', 4),
    ('Koordinator Keamanan', 5),
    ('Koordinator Kebersihan', 6),
    ('Koordinator Sosial', 7);

-- Add comments to document the table and columns
COMMENT ON TABLE positions IS 'Daftar jabatan/posisi dalam lingkungan perumahan';
COMMENT ON COLUMN positions.id IS 'Primary key UUID';
COMMENT ON COLUMN positions.position IS 'Nama jabatan/posisi';
COMMENT ON COLUMN positions."order" IS 'Urutan hierarki jabatan (semakin kecil semakin tinggi)';
