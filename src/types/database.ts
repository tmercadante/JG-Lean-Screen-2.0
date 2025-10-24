export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          display_name: string;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id: string;
          email: string;
          display_name: string;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: {
          id?: string;
          email?: string;
          display_name?: string;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
      };
      screen_time_logs: {
        Row: {
          id: string;
          user_id: string;
          week_start_date: string;
          minutes: number;
          notes: string | null;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          week_start_date: string;
          minutes: number;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          week_start_date?: string;
          minutes?: number;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
      };
      user_settings: {
        Row: {
          id: string;
          user_id: string;
          theme: 'system' | 'dark' | 'light';
          show_on_leaderboard: boolean;
          email_notifications: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          theme?: 'system' | 'dark' | 'light';
          show_on_leaderboard?: boolean;
          email_notifications?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          theme?: 'system' | 'dark' | 'light';
          show_on_leaderboard?: boolean;
          email_notifications?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      user_streaks: {
        Row: {
          id: string;
          user_id: string;
          current_streak: number;
          longest_streak: number;
          last_log_week_start: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          current_streak?: number;
          longest_streak?: number;
          last_log_week_start?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          current_streak?: number;
          longest_streak?: number;
          last_log_week_start?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: Record<string, never>;
    Functions: {
      get_leaderboard: {
        Args: {
          period: 'daily' | 'weekly' | 'monthly' | 'all_time';
          limit_count?: number;
        };
        Returns: Array<{
          user_id: string;
          display_name: string;
          avatar_url: string | null;
          total_minutes: number;
          current_streak: number;
          rank: number;
        }>;
      };
    };
    Enums: Record<string, never>;
  };
}
