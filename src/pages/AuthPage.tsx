import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { SignInForm } from '../components/auth/SignInForm';
import { SignUpForm } from '../components/auth/SignUpForm';
import { ResetPasswordForm } from '../components/auth/ResetPasswordForm';
import { Clock } from 'lucide-react';

type AuthMode = 'signin' | 'signup' | 'reset';

export function AuthPage() {
  const { user, loading } = useAuth();
  const [mode, setMode] = useState<AuthMode>('signin');

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-4">
      <div className="mb-8 text-center">
        <div className="flex items-center justify-center mb-4">
          <Clock className="w-12 h-12 text-blue-500" />
        </div>
        <h1 className="text-4xl font-bold text-white mb-2">Lean Screen</h1>
        <p className="text-gray-400">Track your screen time, compete with your team</p>
      </div>

      {mode === 'signin' && (
        <SignInForm
          onToggleMode={() => setMode('signup')}
          onForgotPassword={() => setMode('reset')}
        />
      )}

      {mode === 'signup' && (
        <SignUpForm onToggleMode={() => setMode('signin')} />
      )}

      {mode === 'reset' && (
        <ResetPasswordForm onBack={() => setMode('signin')} />
      )}
    </div>
  );
}
