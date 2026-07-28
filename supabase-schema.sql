-- ============================================
-- SOUL WINNERS MINISTRIES PAKISTAN
-- SUPABASE SQL SCHEMA
-- Run this in Supabase SQL Editor
-- ============================================

-- Services Table
CREATE TABLE IF NOT EXISTS services (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    icon TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Causes Table
CREATE TABLE IF NOT EXISTS causes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    goal DECIMAL(12,2) DEFAULT 0,
    raised DECIMAL(12,2) DEFAULT 0,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Team Members Table
CREATE TABLE IF NOT EXISTS team_members (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    position TEXT NOT NULL,
    photo_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Blog Posts Table
CREATE TABLE IF NOT EXISTS blog_posts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    author TEXT DEFAULT 'Admin',
    category TEXT,
    content TEXT,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Events Table
CREATE TABLE IF NOT EXISTS events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    event_date DATE NOT NULL,
    location TEXT,
    description TEXT,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Testimonials Table
CREATE TABLE IF NOT EXISTS testimonials (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    designation TEXT,
    quote TEXT,
    photo_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Gallery Table
CREATE TABLE IF NOT EXISTS gallery (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    image_url TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Contact Messages Table
CREATE TABLE IF NOT EXISTS contact_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    subject TEXT,
    message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Donations Table
CREATE TABLE IF NOT EXISTS donations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT,
    email TEXT,
    amount DECIMAL(12,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Page Settings Table (Hero, About, etc.)
CREATE TABLE IF NOT EXISTS page_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    setting_key TEXT UNIQUE NOT NULL,
    setting_value TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default page settings
INSERT INTO page_settings (setting_key, setting_value) VALUES
('hero_subtitle', 'Change The World.'),
('hero_title', 'Need Your Big Hand For Change The World.'),
('hero_amount', '$1M'),
('about_title', 'Soul Winners Ministries Pakistan'),
('about_description', 'We are dedicated to serving humanity with love and compassion.'),
('about_mission', 'Our mission is to uplift the lives of underprivileged communities.'),
('about_vision', 'Our vision is to build a brighter future for everyone.')
ON CONFLICT (setting_key) DO NOTHING;

-- Insert default services
INSERT INTO services (title, description, icon) VALUES
('Clean Water', 'We provide clean and safe drinking water to communities in need, bringing hope and health to families across Pakistan.', 'fas fa-tint'),
('Healthy Food', 'We distribute nutritious meals and food packages to underprivileged families, ensuring no one goes hungry', 'fas fa-utensils'),
('Medical Help', 'We offer free medical camps and healthcare services to remote areas, bringing healing and care to those who need it most.', 'fas fa-heartbeat')
ON CONFLICT DO NOTHING;

-- Enable Row Level Security (optional)
-- ALTER TABLE services ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE causes ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE events ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE gallery ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE donations ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE page_settings ENABLE ROW LEVEL SECURITY;

-- Create storage bucket for uploads
-- Run this in Supabase Dashboard > Storage > New Bucket
-- Bucket name: uploads
-- Public: true
