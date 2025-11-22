import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Lightbulb, Mail, Lock, User } from 'lucide-react';
import { Button } from '../components/Button';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('비밀번호가 일치하지 않습니다');
      return;
    }

    if (password.length < 6) {
      setError('비밀번호는 6자 이상이어야 합니다');
      return;
    }

    setLoading(true);

    try {
      await register(email, password, name);
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to register');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8" style={{ background: 'linear-gradient(135deg, #f472b6 0%, #f43f5e 50%, #f97316 100%)' }}>
      <div className="w-full max-w-md mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-400 to-pink-400 rounded-3xl blur-xl opacity-75 group-hover:opacity-100 transition"></div>
              <div className="relative p-5 bg-gradient-to-br from-purple-500 to-pink-500 rounded-3xl">
                <Lightbulb className="h-14 w-14 text-white" />
              </div>
            </div>
          </div>
          <h1 className="text-4xl font-extrabold mb-3 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            회원가입
          </h1>
          <p className="text-base text-gray-600">
            창의적인 아이디어를 함께 관리해보세요
          </p>
        </div>

        {/* Form Container */}
        <div className="bg-white/80 backdrop-blur-xl p-10 rounded-3xl shadow-2xl border border-gray-100">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="px-4 py-3.5 rounded-xl text-sm font-medium bg-red-50 border border-red-200 text-red-600 flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
                {error}
              </div>
            )}

            {/* Name Input */}
            <div>
              <label htmlFor="name" className="block text-sm font-bold mb-2.5 text-gray-800">
                이름
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="block w-full px-4 py-4 pl-12 bg-gray-50 border-2 border-gray-200 rounded-xl text-base text-gray-900 placeholder-gray-400
                           focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all"
                  placeholder="홍길동"
                />
              </div>
            </div>

            {/* Email Input */}
            <div>
              <label htmlFor="email" className="block text-sm font-bold mb-2.5 text-gray-800">
                이메일
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full px-4 py-4 pl-12 bg-gray-50 border-2 border-gray-200 rounded-xl text-base text-gray-900 placeholder-gray-400
                           focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all"
                  placeholder="your@email.com"
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label htmlFor="password" className="block text-sm font-bold mb-2.5 text-gray-800">
                비밀번호
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full px-4 py-4 pl-12 bg-gray-50 border-2 border-gray-200 rounded-xl text-base text-gray-900 placeholder-gray-400
                           focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all"
                  placeholder="최소 6자 이상"
                />
              </div>
            </div>

            {/* Confirm Password Input */}
            <div>
              <label htmlFor="confirm-password" className="block text-sm font-bold mb-2.5 text-gray-800">
                비밀번호 확인
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="confirm-password"
                  name="confirm-password"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="block w-full px-4 py-4 pl-12 bg-gray-50 border-2 border-gray-200 rounded-xl text-base text-gray-900 placeholder-gray-400
                           focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all"
                  placeholder="비밀번호 재입력"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                disabled={loading}
              >
                {loading ? '가입 처리 중...' : '계정 만들기'}
              </Button>
            </div>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              이미 계정이 있으신가요?{' '}
              <Link
                to="/login"
                className="font-bold text-purple-600 hover:text-purple-700 hover:underline transition-colors"
              >
                로그인
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
