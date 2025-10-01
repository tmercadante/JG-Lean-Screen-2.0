import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Clock, TrendingUp, Calendar, Flame } from 'lucide-react';
import type { ScreenTimeLog, UserStreak } from '../types';

export function DashboardPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [todayMinutes, setTodayMinutes] = useState(0);
  const [weekMinutes, setWeekMinutes] = useState(0);
  const [monthMinutes, setMonthMinutes] = useState(0);
  const [streak, setStreak] = useState<UserStreak | null>(null);
  const [recentLogs, setRecentLogs] = useState<ScreenTimeLog[]>([]);

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    if (!user) return;

    try {
      const today = new Date().toISOString().split('T')[0];
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      const [todayResult, weekResult, monthResult, streakResult, logsResult] = await Promise.all([
        supabase
          .from('screen_time_logs')
          .select('minutes')
          .eq('user_id', user.id)
          .eq('date', today)
          .is('deleted_at', null)
          .maybeSingle(),
        supabase
          .from('screen_time_logs')
          .select('minutes')
          .eq('user_id', user.id)
          .gte('date', weekAgo)
          .is('deleted_at', null),
        supabase
          .from('screen_time_logs')
          .select('minutes')
          .eq('user_id', user.id)
          .gte('date', monthAgo)
          .is('deleted_at', null),
        supabase
          .from('user_streaks')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle(),
        supabase
          .from('screen_time_logs')
          .select('*')
          .eq('user_id', user.id)
          .is('deleted_at', null)
          .order('date', { ascending: false })
          .limit(5),
      ]);

      setTodayMinutes(todayResult.data?.minutes || 0);
      setWeekMinutes(weekResult.data?.reduce((sum, log) => sum + log.minutes, 0) || 0);
      setMonthMinutes(monthResult.data?.reduce((sum, log) => sum + log.minutes, 0) || 0);
      setStreak(streakResult.data);
      setRecentLogs(logsResult.data || []);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatMinutes = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(date);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
        <p className="text-gray-400">Track your screen time and stay consistent</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Today</span>
            <Clock className="w-5 h-5 text-blue-500" />
          </div>
          <p className="text-3xl font-bold text-white">{formatMinutes(todayMinutes)}</p>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">This Week</span>
            <TrendingUp className="w-5 h-5 text-green-500" />
          </div>
          <p className="text-3xl font-bold text-white">{formatMinutes(weekMinutes)}</p>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">This Month</span>
            <Calendar className="w-5 h-5 text-purple-500" />
          </div>
          <p className="text-3xl font-bold text-white">{formatMinutes(monthMinutes)}</p>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Current Streak</span>
            <Flame className="w-5 h-5 text-orange-500" />
          </div>
          <p className="text-3xl font-bold text-white">{streak?.current_streak || 0} days</p>
          <p className="text-xs text-gray-500 mt-1">Best: {streak?.longest_streak || 0} days</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white">Recent Logs</h2>
            <Link
              to="/logs"
              className="text-sm text-blue-400 hover:text-blue-300"
            >
              View All
            </Link>
          </div>

          {recentLogs.length === 0 ? (
            <div className="text-center py-8">
              <Clock className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400 mb-4">No logs yet</p>
              <Link
                to="/logs"
                className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                Log Your First Entry
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {recentLogs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg"
                >
                  <div>
                    <p className="text-white font-medium">{formatDate(log.date)}</p>
                    {log.notes && (
                      <p className="text-sm text-gray-400 truncate max-w-xs">{log.notes}</p>
                    )}
                  </div>
                  <span className="text-blue-400 font-semibold">{formatMinutes(log.minutes)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h2 className="text-xl font-bold text-white mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <Link
              to="/logs"
              className="block p-4 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-semibold">Log Screen Time</p>
                  <p className="text-sm text-blue-200">Add today's screen time</p>
                </div>
                <Clock className="w-6 h-6 text-white" />
              </div>
            </Link>
            <Link
              to="/leaderboard"
              className="block p-4 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-semibold">View Leaderboard</p>
                  <p className="text-sm text-gray-400">See how you rank</p>
                </div>
                <TrendingUp className="w-6 h-6 text-gray-400" />
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
