-- Add QRIS fee setting to app_settings table
-- This migration adds the default QRIS fee setting of 0.7%

INSERT INTO app_settings (setting_key, setting_value, description) VALUES 
('qris_fee', '{"percentage": 0.7}', 'QRIS payment fee percentage (default 0.7%)');
