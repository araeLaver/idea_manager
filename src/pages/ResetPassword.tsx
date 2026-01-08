import { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Lock, Eye, EyeOff, CheckCircle, AlertCircle, XCircle } from 'lucide-react';
import api from '../services/api';

export function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(true);
  const [error, setError] = useState('');
  const [tokenValid, setTokenValid] = useState(false);
  const [success, setSuccess] = useState(false);

  // Verify token on mount
  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setVerifying(false);
        return;
      }

      try {
        const result = await api.verifyPasswordResetToken(token);
        setTokenValid(result.valid);
      } catch {
        setTokenValid(false);
      } finally {
        setVerifying(false);
      }
    };

    verifyToken();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!password) {
      setError('새 비밀번호를 입력해주세요.');
      return;
    }

    if (password.length < 6) {
      setError('비밀번호는 6자 이상이어야 합니다.');
      return;
    }

    if (password !== confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }

    setLoading(true);
    try {
      await api.confirmPasswordReset(token!, password);
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : '비밀번호 재설정에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // Loading state
  if (verifying) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: 'var(--bg-default)' }}>
        <div className="text-center">
          <div className="spinner mx-auto mb-4" style={{ width: '3rem', height: '3rem' }} />
          <p style={{ color: 'var(--text-secondary)' }}>링크를 확인하는 중...</p>
        </div>
      </div>
    );
  }

  // No token or invalid token
  if (!token || !tokenValid) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: 'var(--bg-default)' }}>
        <div className="card w-full max-w-md" style={{ padding: 'var(--space-8)' }}>
          <div className="text-center">
            <div
              className="mx-auto mb-4 flex items-center justify-center"
              style={{
                width: '4rem',
                height: '4rem',
                borderRadius: '50%',
                backgroundColor: 'var(--color-error-100)',
              }}
            >
              <XCircle className="w-8 h-8" style={{ color: 'var(--color-error-600)' }} />
            </div>
            <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
              유효하지 않은 링크
            </h1>
            <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
              비밀번호 재설정 링크가 만료되었거나 유효하지 않습니다.
              <br />
              새로운 링크를 요청해주세요.
            </p>
            <div className="flex flex-col gap-3">
              <Link to="/forgot-password" className="btn btn-primary w-full">
                새 링크 요청하기
              </Link>
              <Link to="/login" className="btn btn-secondary w-full">
                로그인으로 돌아가기
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Success state
  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: 'var(--bg-default)' }}>
        <div className="card w-full max-w-md" style={{ padding: 'var(--space-8)' }}>
          <div className="text-center">
            <div
              className="mx-auto mb-4 flex items-center justify-center"
              style={{
                width: '4rem',
                height: '4rem',
                borderRadius: '50%',
                backgroundColor: 'var(--color-success-100)',
              }}
            >
              <CheckCircle className="w-8 h-8" style={{ color: 'var(--color-success-600)' }} />
            </div>
            <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
              비밀번호 변경 완료
            </h1>
            <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
              비밀번호가 성공적으로 변경되었습니다.
              <br />
              새 비밀번호로 로그인해주세요.
            </p>
            <button
              onClick={() => navigate('/login')}
              className="btn btn-primary w-full"
            >
              로그인하기
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Reset password form
  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: 'var(--bg-default)' }}>
      <div className="card w-full max-w-md" style={{ padding: 'var(--space-8)' }}>
        {/* Back Link */}
        <Link
          to="/login"
          className="inline-flex items-center gap-2 text-sm font-medium mb-6 transition-colors"
          style={{ color: 'var(--text-secondary)' }}
        >
          <ArrowLeft className="w-4 h-4" />
          로그인으로 돌아가기
        </Link>

        {/* Header */}
        <div className="text-center mb-6">
          <div
            className="mx-auto mb-4 flex items-center justify-center"
            style={{
              width: '4rem',
              height: '4rem',
              borderRadius: '50%',
              background: 'var(--gradient-primary)',
            }}
          >
            <Lock className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
            새 비밀번호 설정
          </h1>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            사용하실 새 비밀번호를 입력해주세요.
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div
            className="flex items-center gap-2 p-3 mb-4 rounded-lg"
            style={{
              backgroundColor: 'var(--color-error-50)',
              color: 'var(--color-error-700)',
            }}
          >
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">새 비밀번호</label>
            <div className="relative">
              <Lock
                className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5"
                style={{ color: 'var(--text-tertiary)' }}
              />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="6자 이상 입력"
                style={{ paddingLeft: '2.5rem', paddingRight: '2.5rem' }}
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2"
                style={{ color: 'var(--text-tertiary)' }}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">비밀번호 확인</label>
            <div className="relative">
              <Lock
                className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5"
                style={{ color: 'var(--text-tertiary)' }}
              />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="비밀번호를 다시 입력"
                style={{ paddingLeft: '2.5rem', paddingRight: '2.5rem' }}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2"
                style={{ color: 'var(--text-tertiary)' }}
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary w-full"
            style={{ marginTop: 'var(--space-4)' }}
          >
            {loading ? (
              <span className="spinner" style={{ width: '1.25rem', height: '1.25rem' }} />
            ) : (
              <>
                <Lock className="w-4 h-4" />
                <span>비밀번호 변경</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
