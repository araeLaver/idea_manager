import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Lightbulb, Mail, Lock } from 'lucide-react';
import { Button } from '../components/Button';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, continueAsGuest } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  const handleGuestMode = () => {
    continueAsGuest();
    navigate('/');
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE2YTQgNCAwIDEgMSAwIDggNCA0IDAgMCAxIDAtOHptLTggMGE0IDQgMCAxIDEgMCA4IDQgNCAwIDAgMSAwLTh6bS04IDBhNCA0IDAgMSAxIDAgOCA0IDQgMCAwIDEgMC04em0tOCAwYTQgNCAwIDEgMSAwIDggNCA0IDAgMCAxIDAtOHptLTggMGE0IDQgMCAxIDEgMCA4IDQgNCAwIDAgMSAwLTh6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30"></div>
        <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Header with glassmorphism */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-400 to-pink-400 rounded-3xl blur-2xl opacity-75 group-hover:opacity-100 transition duration-300"></div>
              <div className="relative p-5 bg-white/20 backdrop-blur-md rounded-3xl border border-white/30 shadow-2xl">
                <Lightbulb className="h-12 w-12 text-white drop-shadow-lg" />
              </div>
            </div>
          </div>
          <h1 className="text-4xl font-bold mb-3 text-white drop-shadow-lg">
            Welcome Back
          </h1>
          <p className="text-base text-white/90">
            Sign in to manage your creative ideas
          </p>
        </div>

        {/* Glassmorphism form container */}
        <div className="bg-white/10 backdrop-blur-xl p-8 rounded-2xl shadow-2xl border border-white/20">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="px-4 py-3.5 rounded-xl text-sm font-medium bg-red-500/20 border border-red-400/30 text-white backdrop-blur-sm flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-red-300"></div>
                {error}
              </div>
            )}

            {/* Email Input */}
            <div>
              <label htmlFor="email" className="block text-sm font-bold mb-2.5 text-white">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-white/60" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full px-4 py-4 pl-12 bg-white/10 border-2 border-white/20 rounded-xl text-base text-white placeholder-white/50
                           focus:outline-none focus:border-white/40 focus:bg-white/15 focus:ring-4 focus:ring-white/10 transition-all backdrop-blur-sm"
                  placeholder="your@email.com"
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label htmlFor="password" className="block text-sm font-bold mb-2.5 text-white">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-white/60" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full px-4 py-4 pl-12 bg-white/10 border-2 border-white/20 rounded-xl text-base text-white placeholder-white/50
                           focus:outline-none focus:border-white/40 focus:bg-white/15 focus:ring-4 focus:ring-white/10 transition-all backdrop-blur-sm"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <Button
                type="submit"
                variant="glass"
                size="lg"
                fullWidth
                disabled={loading}
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>
            </div>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-sm text-white/80">
              Don't have an account?{' '}
              <Link
                to="/register"
                className="font-bold text-white hover:text-white/90 hover:underline transition-colors"
              >
                Sign Up
              </Link>
            </p>
          </div>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/20"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 text-xs font-medium text-white/90">
                or
              </span>
            </div>
          </div>

          {/* Guest Mode Button */}
          <div>
            <Button
              type="button"
              variant="glass"
              size="md"
              fullWidth
              onClick={handleGuestMode}
            >
              Continue as Guest
            </Button>
            <p className="mt-3 text-xs text-center text-white/70">
              Try it out without logging in. Your data stays in your browser.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
