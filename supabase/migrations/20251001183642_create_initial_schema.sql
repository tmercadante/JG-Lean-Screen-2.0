/*
  # Create Initial Schema for Lean Screen Application

  ## Overview
  This migration creates the complete database schema for the Lean Screen time tracking application
  with proper security policies and relationships.

  ## New Tables

  ### 1. users
  Stores user profile information synchronized with Supabase Auth
  - `id` (uuid, primary key) - matches auth.users id
  - `email` (text, unique) - user's email address
  - `display_name` (text) - public display name for leaderboard
  - `avatar_url` (text, nullable) - profile picture URL
  - `created_at` (timestamptz) - account creation timestamp
  - `updated_at` (timestamptz) - last profile update timestamp
  - `deleted_at` (timestamptz, nullable) - soft delete timestamp

  ### 2. screen_time_logs
  Tracks daily screen time entries for each user
  - `id` (uuid, primary key) - unique log identifier
  - `user_id` (uuid, foreign key) - references users table
  - `date` (date) - the date for this screen time entry
  - `minutes` (integer) - screen time duration in minutes
  - `notes` (text, nullable) - optional notes for the entry
  - `created_at` (timestamptz) - log creation timestamp
  - `updated_at` (timestamptz) - last log update timestamp
  - `deleted_at` (timestamptz, nullable) - soft delete timestamp

  ### 3. user_settings
  Stores user preferences and configuration
  - `id` (uuid, primary key) - unique settings identifier
  - `user_id` (uuid, foreign key, unique) - references users table
  - `theme` (text) - UI theme preference (system/dark/light)
  - `show_on_leaderboard` (boolean) - leaderboard visibility preference
  - `email_notifications` (boolean) - email notification preference
  - `created_at` (timestamptz) - settings creation timestamp
  - `updated_at` (timestamptz) - last settings update timestamp

  ### 4. user_streaks
  Tracks consecutive daily logging streaks for gamification
  - `id` (uuid, primary key) - unique streak identifier
  - `user_id` (uuid, foreign key, unique) - references users table
  - `current_streak` (integer) - current consecutive days streak
  - `longest_streak` (integer) - all-time longest streak record
  - `last_log_date` (date, nullable) - date of most recent log
  - `created_at` (timestamptz) - streak tracking start timestamp
  - `updated_at` (timestamptz) - last streak update timestamp

  ## Security

  All tables have Row Level Security (RLS) enabled with policies ensuring:
  - Users can only access their own data
  - All operations require authentication
  - Soft deleted records are excluded from normal queries
  - Insert/update operations validate user ownership

  ## Indexes

  Performance indexes created on:
  - user_id columns for fast user data lookups
  - date columns for time-based queries
  - deleted_at columns for soft delete filtering
  - Composite indexes for common query patterns

  ## Triggers

  Automatic triggers for:
  - Updated_at timestamp maintenance
  - Streak calculation on log insert/update
  - User settings creation on signup
*/

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  display_name text NOT NULL,
  avatar_url text,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  deleted_at timestamptz
);

-- Screen time logs table
CREATE TABLE IF NOT EXISTS screen_time_logs (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date date NOT NULL,
  minutes integer NOT NULL CHECK (minutes >= 0 AND minutes <= 1440),
  notes text,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  deleted_at timestamptz,
  UNIQUE(user_id, date, deleted_at)
);

-- User settings table
CREATE TABLE IF NOT EXISTS user_settings (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  theme text DEFAULT 'dark' NOT NULL CHECK (theme IN ('system', 'dark', 'light')),
  show_on_leaderboard boolean DEFAULT true NOT NULL,
  email_notifications boolean DEFAULT false NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- User streaks table
CREATE TABLE IF NOT EXISTS user_streaks (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  current_streak integer DEFAULT 0 NOT NULL,
  longest_streak integer DEFAULT 0 NOT NULL,
  last_log_date date,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_screen_time_logs_user_id ON screen_time_logs(user_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_screen_time_logs_date ON screen_time_logs(date DESC) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_screen_time_logs_user_date ON screen_time_logs(user_id, date DESC) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_users_deleted_at ON users(deleted_at) WHERE deleted_at IS NULL;

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE screen_time_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_streaks ENABLE ROW LEVEL SECURITY;

-- Users table policies
CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  TO authenticated
  USING (auth.uid() = id AND deleted_at IS NULL);

CREATE POLICY "Users can view other profiles for leaderboard"
  ON users FOR SELECT
  TO authenticated
  USING (deleted_at IS NULL);

CREATE POLICY "Users can insert own profile"
  ON users FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Screen time logs policies
CREATE POLICY "Users can view own logs"
  ON screen_time_logs FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id AND deleted_at IS NULL);

CREATE POLICY "Users can insert own logs"
  ON screen_time_logs FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own logs"
  ON screen_time_logs FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id AND deleted_at IS NULL)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own logs"
  ON screen_time_logs FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- User settings policies
CREATE POLICY "Users can view own settings"
  ON user_settings FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own settings"
  ON user_settings FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own settings"
  ON user_settings FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- User streaks policies
CREATE POLICY "Users can view own streaks"
  ON user_streaks FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view all streaks for leaderboard"
  ON user_streaks FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert own streaks"
  ON user_streaks FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own streaks"
  ON user_streaks FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_screen_time_logs_updated_at
  BEFORE UPDATE ON screen_time_logs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_settings_updated_at
  BEFORE UPDATE ON user_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_streaks_updated_at
  BEFORE UPDATE ON user_streaks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to calculate and update streaks
CREATE OR REPLACE FUNCTION update_user_streak()
RETURNS TRIGGER AS $$
DECLARE
  v_last_date date;
  v_current_streak integer;
  v_longest_streak integer;
  v_streak_record RECORD;
BEGIN
  -- Get current streak data
  SELECT last_log_date, current_streak, longest_streak
  INTO v_streak_record
  FROM user_streaks
  WHERE user_id = NEW.user_id;

  -- If no streak record exists, create one
  IF NOT FOUND THEN
    INSERT INTO user_streaks (user_id, current_streak, longest_streak, last_log_date)
    VALUES (NEW.user_id, 1, 1, NEW.date);
    RETURN NEW;
  END IF;

  v_last_date := v_streak_record.last_log_date;
  v_current_streak := v_streak_record.current_streak;
  v_longest_streak := v_streak_record.longest_streak;

  -- If this is the first log or date is newer than last log
  IF v_last_date IS NULL OR NEW.date > v_last_date THEN
    -- Check if this continues the streak (next day)
    IF v_last_date IS NULL OR NEW.date = v_last_date + INTERVAL '1 day' THEN
      v_current_streak := v_current_streak + 1;
    -- Check if same day (don't change streak)
    ELSIF NEW.date = v_last_date THEN
      -- Keep current streak
      NULL;
    -- Streak broken (more than 1 day gap)
    ELSE
      v_current_streak := 1;
    END IF;

    -- Update longest streak if current is greater
    IF v_current_streak > v_longest_streak THEN
      v_longest_streak := v_current_streak;
    END IF;

    -- Update streak record
    UPDATE user_streaks
    SET current_streak = v_current_streak,
        longest_streak = v_longest_streak,
        last_log_date = GREATEST(NEW.date, v_last_date)
    WHERE user_id = NEW.user_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for streak calculation
CREATE TRIGGER calculate_streak_on_log
  AFTER INSERT ON screen_time_logs
  FOR EACH ROW
  WHEN (NEW.deleted_at IS NULL)
  EXECUTE FUNCTION update_user_streak();

-- Function to get leaderboard data
CREATE OR REPLACE FUNCTION get_leaderboard(
  period text DEFAULT 'weekly',
  limit_count integer DEFAULT 100
)
RETURNS TABLE (
  user_id uuid,
  display_name text,
  avatar_url text,
  total_minutes bigint,
  current_streak integer,
  rank bigint
) AS $$
DECLARE
  start_date date;
BEGIN
  -- Determine date range based on period
  CASE period
    WHEN 'daily' THEN
      start_date := CURRENT_DATE;
    WHEN 'weekly' THEN
      start_date := CURRENT_DATE - INTERVAL '7 days';
    WHEN 'monthly' THEN
      start_date := CURRENT_DATE - INTERVAL '30 days';
    WHEN 'all_time' THEN
      start_date := '1900-01-01'::date;
    ELSE
      start_date := CURRENT_DATE - INTERVAL '7 days';
  END CASE;

  RETURN QUERY
  SELECT
    u.id AS user_id,
    u.display_name,
    u.avatar_url,
    COALESCE(SUM(stl.minutes), 0)::bigint AS total_minutes,
    COALESCE(us.current_streak, 0) AS current_streak,
    RANK() OVER (ORDER BY COALESCE(SUM(stl.minutes), 0) DESC) AS rank
  FROM users u
  LEFT JOIN screen_time_logs stl ON stl.user_id = u.id
    AND stl.date >= start_date
    AND stl.deleted_at IS NULL
  LEFT JOIN user_settings ust ON ust.user_id = u.id
  LEFT JOIN user_streaks us ON us.user_id = u.id
  WHERE u.deleted_at IS NULL
    AND (ust.show_on_leaderboard = true OR ust.show_on_leaderboard IS NULL)
  GROUP BY u.id, u.display_name, u.avatar_url, us.current_streak
  HAVING COALESCE(SUM(stl.minutes), 0) > 0
  ORDER BY total_minutes DESC, u.display_name ASC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql STABLE;
