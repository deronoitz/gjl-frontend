-- Create Albums Table and Storage Bucket
-- Migration untuk tabel albums dan storage untuk cover images

-- Create albums table
CREATE TABLE albums (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    cover_image_url TEXT,
    drive_url TEXT NOT NULL,
    author_id UUID REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create indexes for performance
CREATE INDEX idx_albums_author_id ON albums(author_id);
CREATE INDEX idx_albums_created_at ON albums(created_at DESC);

-- Enable RLS
ALTER TABLE albums ENABLE ROW LEVEL SECURITY;

-- RLS Policies for albums table
-- Allow all authenticated users to read albums
CREATE POLICY "Anyone can view albums" ON albums
    FOR SELECT TO authenticated USING (true);

-- Only admins can insert albums
CREATE POLICY "Only admins can create albums" ON albums
    FOR INSERT TO authenticated WITH CHECK (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
        )
    );

-- Only admins can update albums
CREATE POLICY "Only admins can update albums" ON albums
    FOR UPDATE TO authenticated USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
        )
    );

-- Only admins can delete albums
CREATE POLICY "Only admins can delete albums" ON albums
    FOR DELETE TO authenticated USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
        )
    );

-- Create storage bucket for album cover images
INSERT INTO storage.buckets (id, name, public) VALUES ('album-covers', 'album-covers', true);

-- Storage policies for album-covers bucket
-- Allow authenticated users to view images
CREATE POLICY "Anyone can view album covers" ON storage.objects
    FOR SELECT TO authenticated USING (bucket_id = 'album-covers');

-- Only admins can upload images
CREATE POLICY "Only admins can upload album covers" ON storage.objects
    FOR INSERT TO authenticated WITH CHECK (
        bucket_id = 'album-covers' AND
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
        )
    );

-- Only admins can update images
CREATE POLICY "Only admins can update album covers" ON storage.objects
    FOR UPDATE TO authenticated USING (
        bucket_id = 'album-covers' AND
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
        )
    );

-- Only admins can delete images
CREATE POLICY "Only admins can delete album covers" ON storage.objects
    FOR DELETE TO authenticated USING (
        bucket_id = 'album-covers' AND
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
        )
    );

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add trigger to update updated_at
CREATE TRIGGER update_albums_updated_at
    BEFORE UPDATE ON albums
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
