-- ============================================
-- STORAGE BUCKET SETUP FOR UPLOADS
-- Run this in Supabase SQL Editor
-- ============================================

-- Create the uploads bucket (public)
INSERT INTO storage.buckets (id, name, public)
VALUES ('uploads', 'uploads', true)
ON CONFLICT (id) DO NOTHING;

-- Policy: Allow public read access to uploads bucket
CREATE POLICY "Public read access for uploads"
ON storage.objects FOR SELECT
USING (bucket_id = 'uploads');

-- Policy: Allow authenticated users to upload to uploads bucket
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'uploads');

-- Policy: Allow authenticated users to update their uploads
CREATE POLICY "Authenticated users can update own uploads"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'uploads' AND auth.uid() = owner)
WITH CHECK (bucket_id = 'uploads' AND auth.uid() = owner);

-- Policy: Allow authenticated users to delete their uploads
CREATE POLICY "Authenticated users can delete own uploads"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'uploads' AND auth.uid() = owner);

-- ============================================
-- ENABLE ROW LEVEL SECURITY ON ALL TABLES
-- ============================================

ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE causes ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_settings ENABLE ROW LEVEL SECURITY;

-- ============================================
-- POLICIES FOR AUTHENTICATED USERS (ADMIN)
-- ============================================

-- Services: Authenticated users can do everything
CREATE POLICY "Admin full access services" ON services FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Causes: Authenticated users can do everything
CREATE POLICY "Admin full access causes" ON causes FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Team Members: Authenticated users can do everything
CREATE POLICY "Admin full access team_members" ON team_members FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Blog Posts: Authenticated users can do everything
CREATE POLICY "Admin full access blog_posts" ON blog_posts FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Events: Authenticated users can do everything
CREATE POLICY "Admin full access events" ON events FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Testimonials: Authenticated users can do everything
CREATE POLICY "Admin full access testimonials" ON testimonials FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Gallery: Authenticated users can do everything
CREATE POLICY "Admin full access gallery" ON gallery FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Contact Messages: Authenticated users can read/delete
CREATE POLICY "Admin read delete contact_messages" ON contact_messages FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Donations: Authenticated users can read
CREATE POLICY "Admin read donations" ON donations FOR SELECT TO authenticated USING (true);

-- Page Settings: Authenticated users can do everything
CREATE POLICY "Admin full access page_settings" ON page_settings FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ============================================
-- PUBLIC READ POLICIES (for website frontend)
-- ============================================

-- Allow public read on services
CREATE POLICY "Public read services" ON services FOR SELECT USING (true);

-- Allow public read on causes
CREATE POLICY "Public read causes" ON causes FOR SELECT USING (true);

-- Allow public read on team_members
CREATE POLICY "Public read team_members" ON team_members FOR SELECT USING (true);

-- Allow public read on blog_posts
CREATE POLICY "Public read blog_posts" ON blog_posts FOR SELECT USING (true);

-- Allow public read on events
CREATE POLICY "Public read events" ON events FOR SELECT USING (true);

-- Allow public read on testimonials
CREATE POLICY "Public read testimonials" ON testimonials FOR SELECT USING (true);

-- Allow public read on gallery
CREATE POLICY "Public read gallery" ON gallery FOR SELECT USING (true);

-- Allow public read on page_settings
CREATE POLICY "Public read page_settings" ON page_settings FOR SELECT USING (true);

-- Allow public INSERT on contact_messages (from website contact form)
CREATE POLICY "Public insert contact_messages" ON contact_messages FOR INSERT WITH CHECK (true);

-- Allow public INSERT on donations (from website donation form)
CREATE POLICY "Public insert donations" ON donations FOR INSERT WITH CHECK (true);