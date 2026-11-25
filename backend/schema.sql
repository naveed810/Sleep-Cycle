-- ==========================================================
-- SLEEP CYCLE™ - Supabase PostgreSQL Database Schema
-- ==========================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. USERS TABLE
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    avatar VARCHAR(500) DEFAULT 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256',
    plan VARCHAR(50) DEFAULT 'Celestial Pro',
    streak_days INTEGER DEFAULT 14,
    member_since VARCHAR(50) DEFAULT 'October 2024',
    
    -- Targets
    target_sleep_minutes INTEGER DEFAULT 480,
    target_bedtime VARCHAR(10) DEFAULT '23:00',
    target_wake_time VARCHAR(10) DEFAULT '07:00',
    chronotype VARCHAR(20) DEFAULT 'bear',
    room_temp_preference NUMERIC(4, 1) DEFAULT 19.0,
    
    -- Preferences
    smart_alarm_enabled BOOLEAN DEFAULT TRUE,
    haptic_feedback BOOLEAN DEFAULT TRUE,
    snore_detection BOOLEAN DEFAULT TRUE,
    sound_volume_default NUMERIC(3, 2) DEFAULT 0.70,
    wind_down_reminder BOOLEAN DEFAULT TRUE,
    morning_briefing BOOLEAN DEFAULT TRUE,
    circadian_alerts BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- 2. SLEEP SESSIONS TABLE
CREATE TABLE IF NOT EXISTS sleep_sessions (
    id VARCHAR(36) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    user_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    date VARCHAR(10) NOT NULL,
    day_of_week VARCHAR(10) NOT NULL,
    bedtime VARCHAR(10) NOT NULL,
    wake_time VARCHAR(10) NOT NULL,
    duration_minutes INTEGER NOT NULL,
    score INTEGER NOT NULL CHECK (score >= 0 AND score <= 100),
    efficiency INTEGER DEFAULT 90 CHECK (efficiency >= 0 AND efficiency <= 100),
    
    -- Sleep Stage Breakdown (minutes)
    deep_minutes INTEGER DEFAULT 0,
    rem_minutes INTEGER DEFAULT 0,
    light_minutes INTEGER DEFAULT 0,
    awake_minutes INTEGER DEFAULT 0,
    
    -- Biometrics
    avg_heart_rate INTEGER DEFAULT 55,
    hrv INTEGER DEFAULT 70,
    respiratory_rate NUMERIC(4, 1) DEFAULT 14.2,
    snore_minutes INTEGER DEFAULT 0,
    sleep_debt_minutes INTEGER DEFAULT 0,
    
    notes TEXT,
    tags JSONB DEFAULT '[]'::jsonb,
    is_active BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_sleep_sessions_user_id ON sleep_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sleep_sessions_date ON sleep_sessions(date);

-- 3. ALARMS TABLE
CREATE TABLE IF NOT EXISTS alarms (
    id VARCHAR(36) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    user_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    label VARCHAR(100) DEFAULT 'Gentle Rise',
    time VARCHAR(10) NOT NULL,
    period VARCHAR(5) DEFAULT 'AM',
    days JSONB DEFAULT '["Mon", "Tue", "Wed", "Thu", "Fri"]'::jsonb,
    enabled BOOLEAN DEFAULT TRUE,
    smart_window_minutes INTEGER DEFAULT 20,
    sound_track VARCHAR(50) DEFAULT 'forest_dawn',
    vibration BOOLEAN DEFAULT TRUE,
    snooze_count INTEGER DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_alarms_user_id ON alarms(user_id);

-- 4. SLEEP GOALS TABLE
CREATE TABLE IF NOT EXISTS sleep_goals (
    id VARCHAR(36) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    user_id VARCHAR(36) UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    target_duration_minutes INTEGER DEFAULT 480,
    target_bedtime VARCHAR(10) DEFAULT '23:00',
    target_wake_time VARCHAR(10) DEFAULT '07:00',
    target_consistency_percent INTEGER DEFAULT 90,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_sleep_goals_user_id ON sleep_goals(user_id);

-- 5. ROW LEVEL SECURITY (RLS) FOR SUPABASE
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE sleep_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE alarms ENABLE ROW LEVEL SECURITY;
ALTER TABLE sleep_goals ENABLE ROW LEVEL SECURITY;

-- Service role bypass or authenticated user isolation
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view their own profile') THEN
        CREATE POLICY "Users can view their own profile" ON users
            FOR SELECT USING (auth.uid()::text = id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view their own sleep sessions') THEN
        CREATE POLICY "Users can view their own sleep sessions" ON sleep_sessions
            FOR ALL USING (auth.uid()::text = user_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view their own alarms') THEN
        CREATE POLICY "Users can view their own alarms" ON alarms
            FOR ALL USING (auth.uid()::text = user_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view their own goals') THEN
        CREATE POLICY "Users can view their own goals" ON sleep_goals
            FOR ALL USING (auth.uid()::text = user_id);
    END IF;
END $$;
