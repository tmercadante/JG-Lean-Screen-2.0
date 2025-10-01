export interface User {
  id: string;
  email: string;
  display_name: string;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface ScreenTimeLog {
  id: string;
  user_id: string;
  date: string;
  minutes: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface UserSettings {
  id: string;
  user_id: string;
  theme: 'system' | 'dark' | 'light';
  show_on_leaderboard: boolean;
  email_notifications: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserStreak {
  id: string;
  user_id: string;
  current_streak: number;
  longest_streak: number;
  last_log_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface LeaderboardEntry {
  user_id: string;
  display_name: string;
  avatar_url: string | null;
  total_minutes: number;
  current_streak: number;
  rank: number;
}

export type LeaderboardPeriod = 'daily' | 'weekly' | 'monthly' | 'all_time';
