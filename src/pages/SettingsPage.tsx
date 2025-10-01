import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Settings as SettingsIcon, Bell, Eye, Loader2, CheckCircle } from 'lucide-react';
import type { UserSettings } from '../types';

export function SettingsPage() {
  const { user } = useAuth();
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (user) {
      loadSettings();
    }
  }, [user]);

  const loadSettings = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        const { data: newSettings, error: createError } = await supabase
          .from('user_settings')
          .insert({ user_id: user.id })
          .select()
          .single();

        if (createError) throw createError;
        setSettings(newSettings);
      } else {
        setSettings(data);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      setError('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (updates: Partial<UserSettings>) => {
    if (!user || !settings) return;

    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const { error } = await supabase
        .from('user_settings')
        .update(updates)
        .eq('user_id', user.id);

      if (error) throw error;

      setSettings({ ...settings, ...updates });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error('Error updating settings:', error);
      setError('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
        <p className="text-gray-400">Manage your preferences and privacy</p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500 rounded-lg p-4 text-red-400 text-sm mb-6">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-500/10 border border-green-500 rounded-lg p-4 text-green-400 text-sm flex items-center space-x-2 mb-6">
          <CheckCircle className="w-4 h-4" />
          <span>Settings saved successfully!</span>
        </div>
      )}

      <div className="space-y-6">
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center space-x-3 mb-4">
            <Eye className="w-5 h-5 text-blue-500" />
            <h2 className="text-xl font-semibold text-white">Privacy</h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-white font-medium">Show on Leaderboard</p>
                <p className="text-sm text-gray-400">
                  Display your stats and ranking on the team leaderboard
                </p>
              </div>
              <button
                onClick={() =>
                  handleUpdate({ show_on_leaderboard: !settings?.show_on_leaderboard })
                }
                disabled={saving}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800 ${
                  settings?.show_on_leaderboard ? 'bg-blue-600' : 'bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings?.show_on_leaderboard ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center space-x-3 mb-4">
            <Bell className="w-5 h-5 text-blue-500" />
            <h2 className="text-xl font-semibold text-white">Notifications</h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-white font-medium">Email Notifications</p>
                <p className="text-sm text-gray-400">
                  Receive weekly summaries and reminders via email
                </p>
              </div>
              <button
                onClick={() =>
                  handleUpdate({ email_notifications: !settings?.email_notifications })
                }
                disabled={saving}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800 ${
                  settings?.email_notifications ? 'bg-blue-600' : 'bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings?.email_notifications ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center space-x-3 mb-4">
            <SettingsIcon className="w-5 h-5 text-blue-500" />
            <h2 className="text-xl font-semibold text-white">Appearance</h2>
          </div>

          <div className="space-y-4">
            <div>
              <p className="text-white font-medium mb-3">Theme</p>
              <div className="grid grid-cols-3 gap-3">
                {(['system', 'dark', 'light'] as const).map((theme) => (
                  <button
                    key={theme}
                    onClick={() => handleUpdate({ theme })}
                    disabled={saving}
                    className={`px-4 py-3 rounded-lg font-medium transition-colors capitalize ${
                      settings?.theme === theme
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-700 text-gray-400 hover:bg-gray-600 hover:text-white'
                    }`}
                  >
                    {theme}
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Note: Only dark mode is currently implemented
              </p>
            </div>
          </div>
        </div>

        {saving && (
          <div className="flex items-center justify-center space-x-2 text-blue-400">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Saving changes...</span>
          </div>
        )}
      </div>
    </div>
  );
}
