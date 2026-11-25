-- Sleep Cycle: Supabase PostgreSQL schema for the existing SQLAlchemy models.
-- IMPORTANT: Replace the password placeholder before running this script.
-- Creates tables only when absent; it does not DROP tables or delete records.

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'sleepcycle_app') THEN
        CREATE ROLE sleepcycle_app LOGIN PASSWORD 'subhani@8125647497' NOSUPERUSER NOCREATEDB NOCREATEROLE NOINHERIT NOREPLICATION NOBYPASSRLS;
    END IF;
END
$$;

CREATE TABLE IF NOT EXISTS public.users (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    email VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    avatar VARCHAR(500) DEFAULT 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256',
    plan VARCHAR(50) DEFAULT 'Celestial Pro',
    streak_days INTEGER DEFAULT 14,
    member_since VARCHAR(50) DEFAULT 'October 2024',
    target_sleep_minutes INTEGER DEFAULT 480,
    target_bedtime VARCHAR(10) DEFAULT '23:00',
    target_wake_time VARCHAR(10) DEFAULT '07:00',
    chronotype VARCHAR(20) DEFAULT 'bear',
    room_temp_preference DOUBLE PRECISION DEFAULT 19.0,
    smart_alarm_enabled BOOLEAN DEFAULT TRUE,
    haptic_feedback BOOLEAN DEFAULT TRUE,
    snore_detection BOOLEAN DEFAULT TRUE,
    sound_volume_default DOUBLE PRECISION DEFAULT 0.70,
    wind_down_reminder BOOLEAN DEFAULT TRUE,
    morning_briefing BOOLEAN DEFAULT TRUE,
    circadian_alerts BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.sleep_sessions (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id VARCHAR(36) NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    date VARCHAR(10) NOT NULL,
    day_of_week VARCHAR(10) NOT NULL,
    bedtime VARCHAR(10) NOT NULL,
    wake_time VARCHAR(10) NOT NULL,
    duration_minutes INTEGER NOT NULL,
    score INTEGER NOT NULL CHECK (score >= 0 AND score <= 100),
    efficiency INTEGER DEFAULT 90 CHECK (efficiency >= 0 AND efficiency <= 100),
    deep_minutes INTEGER DEFAULT 0,
    rem_minutes INTEGER DEFAULT 0,
    light_minutes INTEGER DEFAULT 0,
    awake_minutes INTEGER DEFAULT 0,
    avg_heart_rate INTEGER DEFAULT 55,
    hrv INTEGER DEFAULT 70,
    respiratory_rate DOUBLE PRECISION DEFAULT 14.2,
    snore_minutes INTEGER DEFAULT 5,
    sleep_debt_minutes INTEGER DEFAULT 0,
    notes TEXT,
    tags JSON DEFAULT '[]'::json,
    is_active BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.alarms (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id VARCHAR(36) NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    label VARCHAR(100) DEFAULT 'Gentle Rise',
    time VARCHAR(10) NOT NULL,
    period VARCHAR(5) DEFAULT 'AM',
    days JSON DEFAULT '["Mon", "Tue", "Wed", "Thu", "Fri"]'::json,
    enabled BOOLEAN DEFAULT TRUE,
    smart_window_minutes INTEGER DEFAULT 20,
    sound_track VARCHAR(50) DEFAULT 'forest_dawn',
    vibration BOOLEAN DEFAULT TRUE,
    snooze_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.sleep_goals (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id VARCHAR(36) NOT NULL UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
    target_duration_minutes INTEGER DEFAULT 480,
    target_bedtime VARCHAR(10) DEFAULT '23:00',
    target_wake_time VARCHAR(10) DEFAULT '07:00',
    target_consistency_percent INTEGER DEFAULT 90,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE UNIQUE INDEX IF NOT EXISTS ux_users_email_lower ON public.users (lower(email));
CREATE INDEX IF NOT EXISTS idx_sleep_sessions_user_id ON public.sleep_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sleep_sessions_date ON public.sleep_sessions(date);
CREATE INDEX IF NOT EXISTS idx_alarms_user_id ON public.alarms(user_id);
CREATE INDEX IF NOT EXISTS idx_sleep_goals_user_id ON public.sleep_goals(user_id);

-- This function is the only pre-login user lookup path. It returns the matching
-- row so the API can verify the password hash; execution is restricted below.
CREATE OR REPLACE FUNCTION public.auth_lookup_user_by_email(p_email TEXT)
RETURNS SETOF public.users
LANGUAGE SQL
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
    SELECT u.* FROM public.users AS u WHERE lower(u.email) = lower(p_email) LIMIT 1;
$$;

REVOKE ALL ON FUNCTION public.auth_lookup_user_by_email(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.auth_lookup_user_by_email(TEXT) TO sleepcycle_app;

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sleep_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alarms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sleep_goals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS sleepcycle_users_isolation ON public.users;
CREATE POLICY sleepcycle_users_isolation ON public.users
    FOR ALL TO sleepcycle_app
    USING (id = NULLIF(current_setting('app.current_user_id', true), ''))
    WITH CHECK (id = NULLIF(current_setting('app.current_user_id', true), ''));

DROP POLICY IF EXISTS sleepcycle_sessions_isolation ON public.sleep_sessions;
CREATE POLICY sleepcycle_sessions_isolation ON public.sleep_sessions
    FOR ALL TO sleepcycle_app
    USING (user_id = NULLIF(current_setting('app.current_user_id', true), ''))
    WITH CHECK (user_id = NULLIF(current_setting('app.current_user_id', true), ''));

DROP POLICY IF EXISTS sleepcycle_alarms_isolation ON public.alarms;
CREATE POLICY sleepcycle_alarms_isolation ON public.alarms
    FOR ALL TO sleepcycle_app
    USING (user_id = NULLIF(current_setting('app.current_user_id', true), ''))
    WITH CHECK (user_id = NULLIF(current_setting('app.current_user_id', true), ''));

DROP POLICY IF EXISTS sleepcycle_goals_isolation ON public.sleep_goals;
CREATE POLICY sleepcycle_goals_isolation ON public.sleep_goals
    FOR ALL TO sleepcycle_app
    USING (user_id = NULLIF(current_setting('app.current_user_id', true), ''))
    WITH CHECK (user_id = NULLIF(current_setting('app.current_user_id', true), ''));

GRANT USAGE ON SCHEMA public TO sleepcycle_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON
    public.users, public.sleep_sessions, public.alarms, public.sleep_goals
TO sleepcycle_app;

-- Ensure the app role cannot own tables or bypass row security.
ALTER ROLE sleepcycle_app NOSUPERUSER NOCREATEDB NOCREATEROLE NOINHERIT NOREPLICATION NOBYPASSRLS;
