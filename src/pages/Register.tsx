import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Lightbulb, Mail, Lock, User, Database, CheckCircle } from 'lucide-react';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [migrateData, setMigrateData] = useState(true);
  const [migrationResult, setMigrationResult] = useState<{ ideas: number; memos: number } | null>(null);
  const { register, isGuest, hasGuestData, getGuestDataInfo } = useAuth();
  const navigate = useNavigate();

  const guestDataExists = isGuest && hasGuestData();
  const guestDataInfo = guestDataExists ? getGuestDataInfo() : null;

  // Password validation matching server requirements
  const validatePassword = (pwd: string): string[] => {
    const errors: string[] = [];
    if (pwd.length < 8) {
      errors.push('8자 이상');
    }
    if (!/[A-Z]/.test(pwd)) {
      errors.push('대문자 포함');
    }
    if (!/[a-z]/.test(pwd)) {
      errors.push('소문자 포함');
    }
    if (!/[0-9]/.test(pwd)) {
      errors.push('숫자 포함');
    }
    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('비밀번호가 일치하지 않습니다');
      return;
    }

    const passwordErrors = validatePassword(password);
    if (passwordErrors.length > 0) {
      setError(`비밀번호 요구사항: ${passwordErrors.join(', ')}`);
      return;
    }

    setLoading(true);

    try {
      const result = await register(email, password, name, guestDataExists && migrateData);
      if (result) {
        setMigrationResult(result);
        // Show success briefly then navigate
        setTimeout(() => navigate('/'), 2000);
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '회원가입에 실패했습니다');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-6"
      style={{ backgroundColor: 'var(--bg-base)' }}
    >
      <div className="w-full max-w-md">
        {/* Logo & Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <div
              className="flex items-center justify-center"
              style={{
                width: '4rem',
                height: '4rem',
                borderRadius: 'var(--radius-xl)',
                background: 'var(--gradient-primary)',
                boxShadow: 'var(--shadow-glow)',
              }}
            >
              <Lightbulb className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1
            className="text-3xl font-bold mb-2"
            style={{ color: 'var(--text-primary)', letterSpacing: '-0.025em' }}
          >
            회원가입
          </h1>
          <p className="text-base" style={{ color: 'var(--text-secondary)' }}>
            새로운 계정을 만드세요
          </p>
        </div>

        {/* Form Card */}
        <div
          className="card"
          style={{
            padding: 'var(--space-8)',
            boxShadow: 'var(--shadow-lg)',
          }}
        >
          <form onSubmit={handleSubmit}>
            {/* Error Message */}
            {error && (
              <div
                className="alert alert-error mb-6"
                style={{ fontSize: 'var(--text-sm)' }}
              >
                {error}
              </div>
            )}

            {/* Name Field */}
            <div className="form-group">
              <label htmlFor="name" className="form-label">
                이름
              </label>
              <div className="relative">
                <div
                  className="absolute left-0 top-0 bottom-0 flex items-center"
                  style={{
                    paddingLeft: 'var(--space-4)',
                    pointerEvents: 'none',
                  }}
                >
                  <User
                    className="w-5 h-5"
                    style={{ color: 'var(--text-tertiary)' }}
                  />
                </div>
                <input
                  id="name"
                  type="text"
                  autoComplete="name"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="홍길동"
                  style={{ paddingLeft: '2.75rem' }}
                />
              </div>
            </div>

            {/* Email Field */}
            <div className="form-group">
              <label htmlFor="email" className="form-label">
                이메일
              </label>
              <div className="relative">
                <div
                  className="absolute left-0 top-0 bottom-0 flex items-center"
                  style={{
                    paddingLeft: 'var(--space-4)',
                    pointerEvents: 'none',
                  }}
                >
                  <Mail
                    className="w-5 h-5"
                    style={{ color: 'var(--text-tertiary)' }}
                  />
                </div>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  style={{ paddingLeft: '2.75rem' }}
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="form-group">
              <label htmlFor="password" className="form-label">
                비밀번호
              </label>
              <div className="relative">
                <div
                  className="absolute left-0 top-0 bottom-0 flex items-center"
                  style={{
                    paddingLeft: 'var(--space-4)',
                    pointerEvents: 'none',
                  }}
                >
                  <Lock
                    className="w-5 h-5"
                    style={{ color: 'var(--text-tertiary)' }}
                  />
                </div>
                <input
                  id="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="8자 이상, 대소문자+숫자"
                  style={{ paddingLeft: '2.75rem' }}
                />
              </div>
            </div>

            {/* Confirm Password Field */}
            <div className="form-group">
              <label htmlFor="confirm-password" className="form-label">
                비밀번호 확인
              </label>
              <div className="relative">
                <div
                  className="absolute left-0 top-0 bottom-0 flex items-center"
                  style={{
                    paddingLeft: 'var(--space-4)',
                    pointerEvents: 'none',
                  }}
                >
                  <Lock
                    className="w-5 h-5"
                    style={{ color: 'var(--text-tertiary)' }}
                  />
                </div>
                <input
                  id="confirm-password"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="비밀번호 재입력"
                  style={{ paddingLeft: '2.75rem' }}
                />
              </div>
            </div>

            {/* Guest Data Migration Option */}
            {guestDataExists && guestDataInfo && (
              <div
                className="p-4 rounded-lg mb-4"
                style={{ backgroundColor: 'var(--bg-subtle)', border: '1px solid var(--border-secondary)' }}
              >
                <div className="flex items-start gap-3">
                  <Database className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: 'var(--accent-primary)' }} />
                  <div className="flex-1">
                    <p className="text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
                      게스트 데이터 발견
                    </p>
                    <p className="text-xs mb-3" style={{ color: 'var(--text-secondary)' }}>
                      아이디어 {guestDataInfo.ideaCount}개, 메모 {guestDataInfo.memoCount}개가 있습니다.
                    </p>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={migrateData}
                        onChange={(e) => setMigrateData(e.target.checked)}
                        className="w-4 h-4 rounded"
                        style={{ accentColor: 'var(--accent-primary)' }}
                      />
                      <span className="text-sm" style={{ color: 'var(--text-primary)' }}>
                        계정으로 데이터 이전하기
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Migration Success Message */}
            {migrationResult && (
              <div
                className="p-4 rounded-lg mb-4 flex items-center gap-3"
                style={{ backgroundColor: 'var(--color-success-50)', border: '1px solid var(--color-success-200)' }}
              >
                <CheckCircle className="w-5 h-5" style={{ color: 'var(--color-success-500)' }} />
                <div>
                  <p className="text-sm font-medium" style={{ color: 'var(--color-success-700)' }}>
                    데이터 이전 완료!
                  </p>
                  <p className="text-xs" style={{ color: 'var(--color-success-600)' }}>
                    아이디어 {migrationResult.ideas}개, 메모 {migrationResult.memos}개가 이전되었습니다.
                  </p>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !!migrationResult}
              className="btn btn-primary w-full mt-2"
              style={{
                padding: 'var(--space-4)',
                fontSize: 'var(--text-base)',
              }}
            >
              {loading ? '가입 처리 중...' : migrationResult ? '이동 중...' : '계정 만들기'}
            </button>
          </form>

          {/* Login Link */}
          <p
            className="text-center mt-6"
            style={{
              fontSize: 'var(--text-sm)',
              color: 'var(--text-secondary)',
            }}
          >
            이미 계정이 있으신가요?{' '}
            <Link
              to="/login"
              style={{
                color: 'var(--accent-primary)',
                fontWeight: 600,
              }}
            >
              로그인
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
