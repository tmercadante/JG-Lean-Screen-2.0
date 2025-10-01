import { useEffect, useState, FormEvent } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Plus, CreditCard as Edit2, Trash2, Save, X, Loader2 } from 'lucide-react';
import type { ScreenTimeLog } from '../types';

export function LogsPage() {
  const { user } = useAuth();
  const [logs, setLogs] = useState<ScreenTimeLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    hours: '0',
    minutes: '0',
    notes: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadLogs();
    }
  }, [user]);

  const loadLogs = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('screen_time_logs')
        .select('*')
        .eq('user_id', user.id)
        .is('deleted_at', null)
        .order('date', { ascending: false });

      if (error) throw error;
      setLogs(data || []);
    } catch (error) {
      console.error('Error loading logs:', error);
      setError('Failed to load logs');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setError(null);
    setSubmitting(true);

    const totalMinutes = parseInt(formData.hours) * 60 + parseInt(formData.minutes);

    if (totalMinutes <= 0 || totalMinutes > 1440) {
      setError('Please enter a valid time between 0 and 24 hours');
      setSubmitting(false);
      return;
    }

    try {
      if (editingId) {
        const { error } = await supabase
          .from('screen_time_logs')
          .update({
            date: formData.date,
            minutes: totalMinutes,
            notes: formData.notes || null,
          })
          .eq('id', editingId);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('screen_time_logs')
          .insert({
            user_id: user.id,
            date: formData.date,
            minutes: totalMinutes,
            notes: formData.notes || null,
          });

        if (error) throw error;
      }

      resetForm();
      await loadLogs();
    } catch (error: any) {
      console.error('Error saving log:', error);
      setError(error.message || 'Failed to save log');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (log: ScreenTimeLog) => {
    const hours = Math.floor(log.minutes / 60);
    const minutes = log.minutes % 60;

    setFormData({
      date: log.date,
      hours: hours.toString(),
      minutes: minutes.toString(),
      notes: log.notes || '',
    });
    setEditingId(log.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this log?')) return;

    try {
      const { error } = await supabase
        .from('screen_time_logs')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
      await loadLogs();
    } catch (error) {
      console.error('Error deleting log:', error);
      setError('Failed to delete log');
    }
  };

  const resetForm = () => {
    setFormData({
      date: new Date().toISOString().split('T')[0],
      hours: '0',
      minutes: '0',
      notes: '',
    });
    setEditingId(null);
    setShowForm(false);
    setError(null);
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
      weekday: 'short',
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
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Screen Time Logs</h1>
          <p className="text-gray-400">Track and manage your daily screen time</p>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>Add Log</span>
          </button>
        )}
      </div>

      {showForm && (
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white">
              {editingId ? 'Edit Log' : 'New Log'}
            </h2>
            <button
              onClick={resetForm}
              className="text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-300 mb-2">
                Date
              </label>
              <input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                max={new Date().toISOString().split('T')[0]}
                required
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="hours" className="block text-sm font-medium text-gray-300 mb-2">
                  Hours
                </label>
                <input
                  id="hours"
                  type="number"
                  min="0"
                  max="24"
                  value={formData.hours}
                  onChange={(e) => setFormData({ ...formData, hours: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label htmlFor="minutes" className="block text-sm font-medium text-gray-300 mb-2">
                  Minutes
                </label>
                <input
                  id="minutes"
                  type="number"
                  min="0"
                  max="59"
                  value={formData.minutes}
                  onChange={(e) => setFormData({ ...formData, minutes: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-300 mb-2">
                Notes (optional)
              </label>
              <textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Any additional notes..."
              />
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500 rounded-lg p-3 text-red-400 text-sm">
                {error}
              </div>
            )}

            <div className="flex space-x-3">
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    <span>{editingId ? 'Update' : 'Save'}</span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {logs.length === 0 ? (
        <div className="bg-gray-800 rounded-lg p-12 border border-gray-700 text-center">
          <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <Plus className="w-8 h-8 text-gray-500" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">No logs yet</h3>
          <p className="text-gray-400 mb-6">Start tracking your screen time by adding your first log</p>
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span>Add Your First Log</span>
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {logs.map((log) => (
            <div
              key={log.id}
              className="bg-gray-800 rounded-lg p-4 border border-gray-700 hover:border-gray-600 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <span className="text-white font-semibold">{formatDate(log.date)}</span>
                    <span className="px-3 py-1 bg-blue-600 text-white text-sm font-medium rounded-full">
                      {formatMinutes(log.minutes)}
                    </span>
                  </div>
                  {log.notes && (
                    <p className="text-gray-400 text-sm">{log.notes}</p>
                  )}
                </div>
                <div className="flex items-center space-x-2 ml-4">
                  <button
                    onClick={() => handleEdit(log)}
                    className="p-2 text-gray-400 hover:text-blue-400 hover:bg-gray-700 rounded-lg transition-colors"
                    aria-label="Edit log"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(log.id)}
                    className="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-700 rounded-lg transition-colors"
                    aria-label="Delete log"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
