import { useState, FormEvent } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Loader2 } from 'lucide-react';

interface SignInFormProps {
  onSuccess?: () => void;
  onToggleMode?: () => void;
  onForgotPassword?: () => void;
}

export function SignInForm({ onSuccess, onToggleMode, onForgotPassword }: SignInFormProps) {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error } = await signIn(email, password);

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      onSuccess?.();
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-gray-800 rounded-lg shadow-xl p-8">
        <h2 className="text-3xl font-bold text-white mb-6 text-center">
          Welcome Back
        </h2>

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

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Your password"
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
                Signing In...
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <div className="mt-4 text-center">
          <button
            onClick={onForgotPassword}
            className="text-sm text-blue-400 hover:text-blue-300"
          >
            Forgot password?
          </button>
        </div>

        <div className="mt-6 text-center text-gray-400">
          Don't have an account?{' '}
          <button
            onClick={onToggleMode}
            className="text-blue-400 hover:text-blue-300 font-medium"
          >
            Sign Up
          </button>
        </div>
      </div>
    </div>
  );
}
