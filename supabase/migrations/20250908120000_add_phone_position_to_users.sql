-- Add phone number and position columns to users table
-- Created: September 8, 2025

-- Add the new columns to the users table
ALTER TABLE users 
ADD COLUMN phone_number TEXT,
ADD COLUMN position TEXT;

-- Create indexes for better query performance
CREATE INDEX idx_users_phone_number ON users(phone_number) WHERE phone_number IS NOT NULL;
CREATE INDEX idx_users_position ON users(position) WHERE position IS NOT NULL;

-- Update existing records with some sample data (optional)
-- These can be updated later through the admin interface
UPDATE users SET 
    phone_number = CASE 
        WHEN house_number = 'A-01' THEN '+62-812-3456-7890'
        WHEN house_number = 'A-02' THEN '+62-813-4567-8901'
        WHEN house_number = 'B-01' THEN '+62-814-5678-9012'
        WHEN house_number = 'B-02' THEN '+62-815-6789-0123'
        WHEN house_number = 'C-01' THEN '+62-816-7890-1234'
        ELSE NULL
    END,
    position = CASE 
        WHEN role = 'admin' THEN 'Ketua RT'
        ELSE NULL
    END;

-- Add comments to document the new columns
COMMENT ON COLUMN users.phone_number IS 'Nomor telepon warga';
COMMENT ON COLUMN users.position IS 'Jabatan atau posisi dalam lingkungan perumahan';
