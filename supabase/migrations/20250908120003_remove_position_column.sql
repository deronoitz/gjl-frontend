-- Remove unused position column from users table
-- Created: September 8, 2025

BEGIN;

-- Drop the old position column since we now use position_id foreign key
ALTER TABLE users DROP COLUMN position;

-- Drop the associated index if it exists
DROP INDEX IF EXISTS idx_users_position;

COMMIT;
