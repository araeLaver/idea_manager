import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Mail, Send, CheckCircle, AlertCircle } from 'lucide-react';
import api from '../services/api';

export function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('이메일을 입력해주세요.');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('유효한 이메일 주소를 입력해주세요.');
      return;
    }

    setLoading(true);
    try {
      await api.requestPasswordReset(email.trim());
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : '비밀번호 재설정 요청에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

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
              이메일을 확인해주세요
            </h1>
            <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
              <strong>{email}</strong>로 비밀번호 재설정 링크를 보냈습니다.
              <br />
              이메일이 도착하지 않았다면 스팸 폴더를 확인해주세요.
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => {
                  setSuccess(false);
                  setEmail('');
                }}
                className="btn btn-secondary w-full"
              >
                다른 이메일로 다시 시도
              </button>
              <Link to="/login" className="btn btn-primary w-full">
                로그인으로 돌아가기
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
            <Mail className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
            비밀번호 찾기
          </h1>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            가입 시 사용한 이메일을 입력하면
            <br />
            비밀번호 재설정 링크를 보내드립니다.
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
            <label className="form-label">이메일</label>
            <div className="relative">
              <Mail
                className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5"
                style={{ color: 'var(--text-tertiary)' }}
              />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@email.com"
                style={{ paddingLeft: '2.5rem' }}
                autoFocus
              />
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
                <Send className="w-4 h-4" />
                <span>재설정 링크 보내기</span>
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="text-center mt-6 pt-6" style={{ borderTop: '1px solid var(--border-default)' }}>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            계정이 없으신가요?{' '}
            <Link
              to="/register"
              className="font-medium"
              style={{ color: 'var(--accent-primary)' }}
            >
              회원가입
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
