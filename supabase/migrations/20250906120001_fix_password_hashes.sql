-- Fix demo user password hashes
-- This migration updates the password hashes to the correct bcrypt hash for "demo123"

UPDATE users SET password_hash = '$2b$12$3E7zsr.VX1JG/EEE7Nd2vuuwNApqSIpfcGwG6bCT5ViuiCcLLqu.i' 
WHERE house_number IN ('A-01', 'A-02', 'B-01', 'B-02', 'C-01');
