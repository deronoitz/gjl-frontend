-- Migrate users.position from TEXT to foreign key reference
-- Created: September 8, 2025

BEGIN;

-- Step 1: Add position_id column to users table
ALTER TABLE users 
ADD COLUMN position_id UUID REFERENCES positions(id);

-- Step 2: Create a mapping of existing position text to position IDs
-- First, let's see what positions we have and create them if they don't exist
INSERT INTO positions (position, "order") VALUES
    ('Ketua RT', 1),
    ('Wakil Ketua RT', 2),
    ('Sekretaris', 3),
    ('Bendahara', 4),
    ('Koordinator Keamanan', 5),
    ('Koordinator Kebersihan', 6),
    ('Koordinator Sosial', 7)
ON CONFLICT (position) DO NOTHING;

-- Step 3: Update existing users with position_id based on their current position text
UPDATE users SET position_id = (
    SELECT p.id FROM positions p 
    WHERE LOWER(p.position) = LOWER(users.position) 
    OR (LOWER(users.position) LIKE '%ketua%' AND LOWER(p.position) LIKE '%ketua%')
    OR (LOWER(users.position) LIKE '%sekretaris%' AND LOWER(p.position) LIKE '%sekretaris%')
    OR (LOWER(users.position) LIKE '%bendahara%' AND LOWER(p.position) LIKE '%bendahara%')
    OR (LOWER(users.position) LIKE '%keamanan%' AND LOWER(p.position) LIKE '%keamanan%')
    OR (LOWER(users.position) LIKE '%kebersihan%' AND LOWER(p.position) LIKE '%kebersihan%')
    OR (LOWER(users.position) LIKE '%sosial%' AND LOWER(p.position) LIKE '%sosial%')
    LIMIT 1
)
WHERE users.position IS NOT NULL AND users.position != '';

-- Step 4: Create index for the new foreign key
CREATE INDEX idx_users_position_id ON users(position_id);

-- Step 5: Add comment to document the new column
COMMENT ON COLUMN users.position_id IS 'Foreign key reference to positions table';

COMMIT;
