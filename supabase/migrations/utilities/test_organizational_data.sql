-- Add test users with positions for organizational structure
-- This will create users with positions assigned

-- First, insert test users if they don't exist
INSERT INTO users (house_number, name, password_hash, role, phone_number, position_id) 
SELECT 
  unnest(ARRAY['A01', 'A02', 'A03', 'A04', 'A05', 'A06', 'A07']),
  unnest(ARRAY['Budi Santoso', 'Siti Rahayu', 'Ahmad Wijaya', 'Dewi Lestari', 'Hendra Kusuma', 'Maya Sari', 'Andi Pratama']),
  '$2a$10$dummy.hash.for.testing.only.not.real.password', -- Dummy hash
  'user',
  unnest(ARRAY['081234567801', '081234567802', '081234567803', '081234567804', '081234567805', '081234567806', '081234567807']),
  (SELECT p.id FROM positions p WHERE p."order" = unnest(ARRAY[1, 2, 3, 4, 5, 6, 7]) LIMIT 1)
ON CONFLICT (house_number) DO UPDATE SET
  position_id = EXCLUDED.position_id,
  phone_number = EXCLUDED.phone_number;

-- Verify the data
SELECT 
  u.house_number,
  u.name,
  u.phone_number,
  p.position,
  p."order"
FROM users u
JOIN positions p ON u.position_id = p.id
ORDER BY p."order" ASC;
