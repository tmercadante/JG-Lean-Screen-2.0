/*
  # Update Schema for Weekly Screen Time Tracking

  ## Overview
  This migration updates the database schema to support weekly tracking instead of daily entries.
  Weeks start on Sunday and end on Saturday.

  ## Changes

  ### 1. Modified screen_time_logs Table
  - Replace `date` column with `week_start_date` (date) - Sunday of the week
  - Update constraint to allow larger minute values for weekly totals
  - Update unique constraint to be per-week instead of per-day
  - Drop old indexes and create new ones for weekly queries

  ### 2. Updated user_streaks Table
  - Rename `last_log_date` to `last_log_week_start` to reflect weekly tracking
  - Update streak calculation logic to work with weeks instead of days

  ### 3. Updated Functions
  - Modify `update_user_streak()` to calculate weekly streaks
  - Modify `get_leaderboard()` to work with weekly data

  ## Important Notes
  - Week start date is always a Sunday (start of week)
  - Week end date is always a Saturday (end of week)
  - Screen time minutes can now be up to 10,080 (7 days × 24 hours × 60 minutes)
  - Existing daily data will be preserved but needs manual migration if needed
*/

-- Step 1: Drop existing triggers and functions that depend on the schema
DROP TRIGGER IF EXISTS calculate_streak_on_log ON screen_time_logs;
DROP FUNCTION IF EXISTS update_user_streak();
DROP FUNCTION IF EXISTS get_leaderboard(text, integer);

-- Step 2: Modify screen_time_logs table structure
DO $$
BEGIN
  -- Add new week_start_date column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'screen_time_logs' AND column_name = 'week_start_date'
  ) THEN
    ALTER TABLE screen_time_logs ADD COLUMN week_start_date date;
  END IF;

  -- Drop old date column if it exists and week_start_date is populated
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'screen_time_logs' AND column_name = 'date'
  ) THEN
    -- Copy date to week_start_date if needed (convert to week start - Sunday)
    UPDATE screen_time_logs
    SET week_start_date = date - (EXTRACT(DOW FROM date)::integer || ' days')::interval
    WHERE week_start_date IS NULL AND date IS NOT NULL;
    
    -- Drop old unique constraint
    ALTER TABLE screen_time_logs DROP CONSTRAINT IF EXISTS screen_time_logs_user_id_date_deleted_at_key;
    
    -- Drop the old date column
    ALTER TABLE screen_time_logs DROP COLUMN IF EXISTS date;
  END IF;

  -- Make week_start_date NOT NULL if it isn't already
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'screen_time_logs' 
    AND column_name = 'week_start_date' 
    AND is_nullable = 'YES'
  ) THEN
    ALTER TABLE screen_time_logs ALTER COLUMN week_start_date SET NOT NULL;
  END IF;
END $$;

-- Drop old minutes constraint and add new one for weekly totals (max 7 days)
ALTER TABLE screen_time_logs DROP CONSTRAINT IF EXISTS screen_time_logs_minutes_check;
ALTER TABLE screen_time_logs ADD CONSTRAINT screen_time_logs_minutes_check 
  CHECK (minutes >= 0 AND minutes <= 10080);

-- Add unique constraint for weekly entries
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'screen_time_logs_user_id_week_deleted_at_key'
  ) THEN
    ALTER TABLE screen_time_logs 
    ADD CONSTRAINT screen_time_logs_user_id_week_deleted_at_key 
    UNIQUE(user_id, week_start_date, deleted_at);
  END IF;
END $$;

-- Step 3: Update indexes for weekly queries
DROP INDEX IF EXISTS idx_screen_time_logs_date;
DROP INDEX IF EXISTS idx_screen_time_logs_user_date;

CREATE INDEX IF NOT EXISTS idx_screen_time_logs_week_start 
  ON screen_time_logs(week_start_date DESC) 
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_screen_time_logs_user_week 
  ON screen_time_logs(user_id, week_start_date DESC) 
  WHERE deleted_at IS NULL;

-- Step 4: Update user_streaks table
DO $$
BEGIN
  -- Rename last_log_date to last_log_week_start if needed
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_streaks' AND column_name = 'last_log_date'
  ) THEN
    ALTER TABLE user_streaks RENAME COLUMN last_log_date TO last_log_week_start;
  END IF;
END $$;

-- Step 5: Recreate the streak calculation function for weekly tracking
CREATE OR REPLACE FUNCTION update_user_streak()
RETURNS TRIGGER AS $$
DECLARE
  v_last_week date;
  v_current_streak integer;
  v_longest_streak integer;
  v_streak_record RECORD;
BEGIN
  -- Get current streak data
  SELECT last_log_week_start, current_streak, longest_streak
  INTO v_streak_record
  FROM user_streaks
  WHERE user_id = NEW.user_id;

  -- If no streak record exists, create one
  IF NOT FOUND THEN
    INSERT INTO user_streaks (user_id, current_streak, longest_streak, last_log_week_start)
    VALUES (NEW.user_id, 1, 1, NEW.week_start_date);
    RETURN NEW;
  END IF;

  v_last_week := v_streak_record.last_log_week_start;
  v_current_streak := v_streak_record.current_streak;
  v_longest_streak := v_streak_record.longest_streak;

  -- If this is the first log or week is newer than last log
  IF v_last_week IS NULL OR NEW.week_start_date > v_last_week THEN
    -- Check if this continues the streak (next week = last week + 7 days)
    IF v_last_week IS NULL OR NEW.week_start_date = v_last_week + INTERVAL '7 days' THEN
      v_current_streak := v_current_streak + 1;
    -- Check if same week (don't change streak)
    ELSIF NEW.week_start_date = v_last_week THEN
      NULL;
    -- Streak broken (gap of more than 1 week)
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
        last_log_week_start = GREATEST(NEW.week_start_date, v_last_week)
    WHERE user_id = NEW.user_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recreate trigger for weekly streak calculation
CREATE TRIGGER calculate_streak_on_log
  AFTER INSERT ON screen_time_logs
  FOR EACH ROW
  WHEN (NEW.deleted_at IS NULL)
  EXECUTE FUNCTION update_user_streak();

-- Step 6: Recreate leaderboard function for weekly data
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
      -- For daily, show current week
      start_date := CURRENT_DATE - (EXTRACT(DOW FROM CURRENT_DATE)::integer || ' days')::interval;
    WHEN 'weekly' THEN
      -- Last 4 weeks
      start_date := CURRENT_DATE - (EXTRACT(DOW FROM CURRENT_DATE)::integer || ' days')::interval - INTERVAL '21 days';
    WHEN 'monthly' THEN
      -- Last ~12 weeks (3 months)
      start_date := CURRENT_DATE - INTERVAL '84 days';
    WHEN 'all_time' THEN
      start_date := '1900-01-01'::date;
    ELSE
      start_date := CURRENT_DATE - INTERVAL '28 days';
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
    AND stl.week_start_date >= start_date
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