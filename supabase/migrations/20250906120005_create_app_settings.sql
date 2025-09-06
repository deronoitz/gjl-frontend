-- Create app_settings table for storing application-wide settings
-- This migration creates a settings table for storing app configuration

CREATE TABLE app_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    setting_key TEXT UNIQUE NOT NULL,
    setting_value JSONB NOT NULL,
    description TEXT,
    updated_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create indexes
CREATE INDEX idx_app_settings_key ON app_settings(setting_key);
CREATE INDEX idx_app_settings_updated_by ON app_settings(updated_by);

-- Enable RLS
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for app_settings table
CREATE POLICY "Admins can view all settings" ON app_settings
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid()::uuid 
            AND users.role = 'admin'
        )
    );

CREATE POLICY "Admins can insert settings" ON app_settings
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid()::uuid 
            AND users.role = 'admin'
        )
    );

CREATE POLICY "Admins can update settings" ON app_settings
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid()::uuid 
            AND users.role = 'admin'
        )
    );

-- Insert default settings
INSERT INTO app_settings (setting_key, setting_value, description) VALUES 
('monthly_fee', '{"amount": 150000, "currency": "IDR"}', 'Default monthly fee for residents'),
('app_name', '"Griya Jannatin Leyangan"', 'Application name'),
('contact_info', '{"phone": "", "email": "", "address": ""}', 'Contact information for the housing complex');

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_app_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger
CREATE TRIGGER update_app_settings_updated_at_trigger
    BEFORE UPDATE ON app_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_app_settings_updated_at();
