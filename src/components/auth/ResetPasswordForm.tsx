import { useState, FormEvent } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Loader2, ArrowLeft } from 'lucide-react';

interface ResetPasswordFormProps {
  onBack?: () => void;
}

export function ResetPasswordForm({ onBack }: ResetPasswordFormProps) {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error } = await resetPassword(email);

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setSuccess(true);
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="w-full max-w-md mx-auto">
        <div className="bg-gray-800 rounded-lg shadow-xl p-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">
              Check Your Email
            </h2>
            <p className="text-gray-400 mb-6">
              We've sent password reset instructions to <strong className="text-white">{email}</strong>
            </p>
            <button
              onClick={onBack}
              className="text-blue-400 hover:text-blue-300 font-medium"
            >
              Back to Sign In
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-gray-800 rounded-lg shadow-xl p-8">
        <button
          onClick={onBack}
          className="flex items-center text-gray-400 hover:text-white mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </button>

        <h2 className="text-3xl font-bold text-white mb-2">
          Reset Password
        </h2>
        <p className="text-gray-400 mb-6">
          Enter your email and we'll send you instructions to reset your password.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="you@example.com"
              disabled={loading}
            />
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500 rounded-lg p-3 text-red-400 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Sending...
              </>
            ) : (
              'Send Reset Instructions'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
