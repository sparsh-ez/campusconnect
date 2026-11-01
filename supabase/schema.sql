-- CampusConnect Database Schema
-- Production PostgreSQL Schema for Supabase

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Clubs Table
CREATE TABLE IF NOT EXISTS public.clubs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    handle TEXT NOT NULL UNIQUE,
    clean_handle TEXT NOT NULL UNIQUE,
    url TEXT NOT NULL,
    linkedin_url TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    last_scanned_at TIMESTAMPTZ,
    last_scan_status TEXT DEFAULT 'never_scanned' CHECK (last_scan_status IN ('never_scanned', 'scanning', 'success', 'login_wall', 'failed')),
    last_scan_message TEXT,
    event_count INT DEFAULT 0 NOT NULL
);

-- 3. Scan Jobs Table
CREATE TABLE IF NOT EXISTS public.scan_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    club_id UUID REFERENCES public.clubs(id) ON DELETE CASCADE,
    club_handle TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'running', 'completed', 'login_wall', 'failed', 'cancelled')),
    current_step INT DEFAULT 1 NOT NULL,
    step_name TEXT DEFAULT 'Connecting to TinyFish',
    logs JSONB DEFAULT '[]'::jsonb NOT NULL,
    events_extracted INT DEFAULT 0 NOT NULL,
    result JSONB,
    error TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    completed_at TIMESTAMPTZ
);

-- 4. Events Table
CREATE TABLE IF NOT EXISTS public.events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    club_id UUID REFERENCES public.clubs(id) ON DELETE CASCADE,
    club_name TEXT NOT NULL,
    club_handle TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    date TEXT,
    time TEXT,
    venue TEXT,
    category TEXT DEFAULT 'Campus Life' NOT NULL,
    registration_deadline TEXT,
    registration_url TEXT,
    source_post_url TEXT NOT NULL,
    source_caption TEXT,
    image TEXT,
    confidence NUMERIC,
    verification_status TEXT DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected')),
    classification TEXT DEFAULT 'upcoming' CHECK (classification IN ('ongoing', 'upcoming', 'past', 'unconfirmed')),
    is_published BOOLEAN DEFAULT false NOT NULL,
    discovered_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Event Sources Table
CREATE TABLE IF NOT EXISTS public.event_sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
    platform TEXT NOT NULL CHECK (platform IN ('instagram', 'linkedin', 'web')),
    source_url TEXT NOT NULL,
    caption TEXT,
    extracted_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_clubs_clean_handle ON public.clubs(clean_handle);
CREATE INDEX IF NOT EXISTS idx_events_club_id ON public.events(club_id);
CREATE INDEX IF NOT EXISTS idx_events_verification_status ON public.events(verification_status);
CREATE INDEX IF NOT EXISTS idx_events_classification ON public.events(classification);
CREATE INDEX IF NOT EXISTS idx_events_is_published ON public.events(is_published);
CREATE INDEX IF NOT EXISTS idx_scan_jobs_club_id ON public.scan_jobs(club_id);
CREATE INDEX IF NOT EXISTS idx_event_sources_event_id ON public.event_sources(event_id);

-- 7. Row Level Security (RLS)
ALTER TABLE public.clubs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scan_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_sources ENABLE ROW LEVEL SECURITY;

-- Allow public read access to verified & published events
CREATE POLICY "Public can view published events"
    ON public.events FOR SELECT
    USING (is_published = true OR verification_status = 'verified');

-- Allow authenticated / anon read access to monitored clubs
CREATE POLICY "Anyone can view monitored clubs"
    ON public.clubs FOR SELECT
    USING (true);

-- Allow backend service role full access
CREATE POLICY "Full access for service role on clubs"
    ON public.clubs FOR ALL
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Full access for service role on scan_jobs"
    ON public.scan_jobs FOR ALL
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Full access for service role on events"
    ON public.events FOR ALL
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Full access for service role on event_sources"
    ON public.event_sources FOR ALL
    USING (true)
    WITH CHECK (true);
