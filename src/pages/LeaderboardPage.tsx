import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Trophy, Medal, Award, Flame, TrendingUp } from 'lucide-react';
import type { LeaderboardEntry, LeaderboardPeriod } from '../types';

export function LeaderboardPage() {
  const { user } = useAuth();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<LeaderboardPeriod>('weekly');

  useEffect(() => {
    loadLeaderboard();
  }, [period]);

  const loadLeaderboard = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('get_leaderboard', {
        period,
        limit_count: 100,
      });

      if (error) throw error;
      setLeaderboard(data || []);
    } catch (error) {
      console.error('Error loading leaderboard:', error);
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

  const getPeriodLabel = (p: LeaderboardPeriod) => {
    const labels = {
      daily: 'Current Week',
      weekly: 'Last 4 Weeks',
      monthly: 'Last 12 Weeks',
      all_time: 'All Time',
    };
    return labels[p];
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-6 h-6 text-yellow-400" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-300" />;
      case 3:
        return <Award className="w-6 h-6 text-amber-600" />;
      default:
        return null;
    }
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-yellow-500/10 border-yellow-500';
      case 2:
        return 'bg-gray-400/10 border-gray-400';
      case 3:
        return 'bg-amber-600/10 border-amber-600';
      default:
        return 'bg-gray-800 border-gray-700';
    }
  };

  const periods: LeaderboardPeriod[] = ['daily', 'weekly', 'monthly', 'all_time'];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Leaderboard</h1>
        <p className="text-gray-400">See how you rank against your team</p>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {periods.map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              period === p
                ? 'bg-blue-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
            }`}
          >
            {getPeriodLabel(p)}
          </button>
        ))}
      </div>

      {leaderboard.length === 0 ? (
        <div className="bg-gray-800 rounded-lg p-12 border border-gray-700 text-center">
          <TrendingUp className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No data yet</h3>
          <p className="text-gray-400">
            Start logging screen time to appear on the leaderboard
          </p>
        </div>
      ) : (
        <>
          {leaderboard.slice(0, 3).length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {leaderboard.slice(0, 3).map((_entry, index) => {
                const actualRank = [2, 1, 3][index];
                const actualEntry = leaderboard.find((e) => e.rank === actualRank);
                if (!actualEntry) return null;

                return (
                  <div
                    key={actualEntry.user_id}
                    className={`${getRankColor(actualRank)} rounded-lg p-6 border ${
                      actualEntry.user_id === user?.id ? 'ring-2 ring-blue-500' : ''
                    } ${actualRank === 1 ? 'md:col-start-1 md:row-start-1' : ''} ${
                      actualRank === 2 ? 'md:col-start-2 md:row-start-1' : ''
                    } ${actualRank === 3 ? 'md:col-start-3 md:row-start-1' : ''}`}
                  >
                    <div className="text-center">
                      <div className="flex justify-center mb-3">
                        {getRankIcon(actualRank)}
                      </div>
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-bold text-xl mx-auto mb-3">
                        {actualEntry.display_name.charAt(0).toUpperCase()}
                      </div>
                      <p className="text-white font-bold text-lg mb-1">
                        {actualEntry.display_name}
                        {actualEntry.user_id === user?.id && (
                          <span className="text-blue-400 text-sm ml-2">(You)</span>
                        )}
                      </p>
                      <p className="text-2xl font-bold text-white mb-2">
                        {formatMinutes(actualEntry.total_minutes)}
                      </p>
                      {actualEntry.current_streak > 0 && (
                        <div className="flex items-center justify-center space-x-1 text-orange-400">
                          <Flame className="w-4 h-4" />
                          <span className="text-sm font-medium">
                            {actualEntry.current_streak} week streak
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-700/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Rank
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Screen Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Streak
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {leaderboard.map((entry) => (
                    <tr
                      key={entry.user_id}
                      className={`${
                        entry.user_id === user?.id
                          ? 'bg-blue-600/10'
                          : 'hover:bg-gray-700/50'
                      } transition-colors`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {entry.rank <= 3 ? (
                            getRankIcon(entry.rank)
                          ) : (
                            <span className="text-gray-400 font-semibold">
                              #{entry.rank}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-bold mr-3">
                            {entry.display_name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-white font-medium">
                              {entry.display_name}
                              {entry.user_id === user?.id && (
                                <span className="text-blue-400 text-sm ml-2">
                                  (You)
                                </span>
                              )}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-white font-semibold">
                          {formatMinutes(entry.total_minutes)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {entry.current_streak > 0 ? (
                          <div className="flex items-center space-x-1 text-orange-400">
                            <Flame className="w-4 h-4" />
                            <span className="font-medium">
                              {entry.current_streak} weeks
                            </span>
                          </div>
                        ) : (
                          <span className="text-gray-500">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
