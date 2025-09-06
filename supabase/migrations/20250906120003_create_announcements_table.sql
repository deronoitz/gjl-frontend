-- Create announcements table
CREATE TABLE announcements (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    author_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL
);

-- Create indexes for performance
CREATE INDEX idx_announcements_created_at ON announcements(created_at DESC);
CREATE INDEX idx_announcements_author_id ON announcements(author_id);

-- Enable RLS
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

-- RLS Policies for announcements table
-- Everyone can read announcements
CREATE POLICY "Anyone can view announcements" ON announcements
    FOR SELECT USING (true);

-- Only admins can create announcements
CREATE POLICY "Only admins can create announcements" ON announcements
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() 
            AND role = 'admin'
        )
    );

-- Only admins can update announcements
CREATE POLICY "Only admins can update announcements" ON announcements
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() 
            AND role = 'admin'
        )
    );

-- Only admins can delete announcements
CREATE POLICY "Only admins can delete announcements" ON announcements
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() 
            AND role = 'admin'
        )
    );

-- Create a function to update the updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_announcements_updated_at
    BEFORE UPDATE ON announcements
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert some sample announcements
INSERT INTO announcements (title, content, author_id) VALUES
    (
        'Selamat Datang di Portal GJL',
        'Portal komunitas Griya Jati Lestari telah resmi diluncurkan. Silakan gunakan nomor rumah dan password yang telah diberikan untuk login.',
        (SELECT id FROM users WHERE role = 'admin' LIMIT 1)
    ),
    (
        'Rapat Bulanan RT',
        'Rapat bulanan RT akan dilaksanakan pada hari Minggu, 15 September 2025 pukul 19.00 WIB di Aula RT. Seluruh warga diharapkan hadir.',
        (SELECT id FROM users WHERE role = 'admin' LIMIT 1)
    ),
    (
        'Jadwal Ronda',
        'Jadwal ronda malam telah diperbarui. Silakan cek di papan pengumuman atau hubungi ketua RT untuk informasi lebih lanjut.',
        (SELECT id FROM users WHERE role = 'admin' LIMIT 1)
    );
