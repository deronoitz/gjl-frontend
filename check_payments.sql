SELECT 
  id, 
  user_uuid, 
  bulan, 
  tahun, 
  created_at,
  created_by
FROM payment_records 
ORDER BY created_at DESC 
LIMIT 10;
