-- Reset and Custom Auth Migration
-- This migration safely resets existing objects and creates the custom auth system

-- Simply drop everything in the correct order (CASCADE will handle dependencies)
DROP TABLE IF EXISTS user_sessions CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TYPE IF EXISTS user_role CASCADE;

-- Create custom types
CREATE TYPE user_role AS ENUM ('admin', 'user');

-- Create users table with house_number as primary identifier
CREATE TABLE users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    house_number TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    role user_role DEFAULT 'user' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create user sessions table for custom authentication
CREATE TABLE user_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    session_token TEXT UNIQUE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create indexes for performance
CREATE INDEX idx_users_house_number ON users(house_number);
CREATE INDEX idx_user_sessions_token ON user_sessions(session_token);
CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_expires_at ON user_sessions(expires_at);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Users can view their own profile" ON users
    FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Users can update their own profile" ON users
    FOR UPDATE USING (auth.uid()::text = id::text);

CREATE POLICY "Admins can view all users" ON users
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id::text = auth.uid()::text 
            AND role = 'admin'
        )
    );

CREATE POLICY "Admins can update all users" ON users
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id::text = auth.uid()::text 
            AND role = 'admin'
        )
    );

-- RLS Policies for user_sessions table
CREATE POLICY "Users can manage their own sessions" ON user_sessions
    FOR ALL USING (user_id::text = auth.uid()::text);

CREATE POLICY "Admins can view all sessions" ON user_sessions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id::text = auth.uid()::text 
            AND role = 'admin'
        )
    );

-- Insert demo users with hashed passwords (bcrypt with salt rounds 12)
-- Password for all demo users: "demo123"
-- Hash: $2b$12$rQJ8.RwxssWJ0jH7/hRsEeUFZJJl8gMQx9O5XEK7nfK5n2Xf4hNYK

INSERT INTO users (house_number, name, password_hash, role) VALUES
    ('A-01', 'John Administrator', '$2b$12$rQJ8.RwxssWJ0jH7/hRsEeUFZJJl8gMQx9O5XEK7nfK5n2Xf4hNYK', 'admin'),
    ('A-02', 'Jane Smith', '$2b$12$rQJ8.RwxssWJ0jH7/hRsEeUFZJJl8gMQx9O5XEK7nfK5n2Xf4hNYK', 'user'),
    ('B-01', 'Bob Johnson', '$2b$12$rQJ8.RwxssWJ0jH7/hRsEeUFZJJl8gMQx9O5XEK7nfK5n2Xf4hNYK', 'user'),
    ('B-02', 'Alice Brown', '$2b$12$rQJ8.RwxssWJ0jH7/hRsEeUFZJJl8gMQx9O5XEK7nfK5n2Xf4hNYK', 'user'),
    ('C-01', 'Charlie Wilson', '$2b$12$rQJ8.RwxssWJ0jH7/hRsEeUFZJJl8gMQx9O5XEK7nfK5n2Xf4hNYK', 'user');

-- Create a function to clean up expired sessions automatically
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS trigger AS $$
BEGIN
    DELETE FROM user_sessions WHERE expires_at < now();
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to clean up expired sessions
CREATE TRIGGER cleanup_expired_sessions_trigger
    AFTER INSERT ON user_sessions
    EXECUTE FUNCTION cleanup_expired_sessions();
