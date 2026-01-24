import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Mail, Lock, Save, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export function Profile() {
  const navigate = useNavigate();
  const { user, updateProfile, changePassword, isGuest } = useAuth();

  // Profile form state
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');

  // Password form state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  // Loading state - user data not yet available
  if (!user && !isGuest) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="card" style={{ padding: 'var(--space-8)' }}>
          <div className="flex items-center justify-center py-12">
            <span className="spinner" style={{ width: '2rem', height: '2rem' }} />
          </div>
        </div>
      </div>
    );
  }

  // Guest mode - redirect to login
  if (isGuest) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="card" style={{ padding: 'var(--space-8)' }}>
          <div className="empty-state">
            <User className="empty-state-icon" />
            <h3 className="empty-state-title">로그인이 필요합니다</h3>
            <p className="empty-state-description">
              프로필 관리는 로그인한 사용자만 이용할 수 있습니다.
            </p>
            <button
              onClick={() => navigate('/login')}
              className="btn btn-primary"
            >
              로그인하기
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError('');
    setProfileSuccess('');

    if (!name.trim()) {
      setProfileError('이름을 입력해주세요.');
      return;
    }

    if (!email.trim()) {
      setProfileError('이메일을 입력해주세요.');
      return;
    }

    // Check if anything changed
    if (name === user?.name && email === user?.email) {
      setProfileError('변경된 내용이 없습니다.');
      return;
    }

    setProfileLoading(true);
    try {
      await updateProfile({ name: name.trim(), email: email.trim() });
      setProfileSuccess('프로필이 성공적으로 업데이트되었습니다.');
    } catch (err) {
      setProfileError(err instanceof Error ? err.message : '프로필 업데이트에 실패했습니다.');
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (!currentPassword) {
      setPasswordError('현재 비밀번호를 입력해주세요.');
      return;
    }

    if (!newPassword) {
      setPasswordError('새 비밀번호를 입력해주세요.');
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError('새 비밀번호는 6자 이상이어야 합니다.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('새 비밀번호가 일치하지 않습니다.');
      return;
    }

    if (currentPassword === newPassword) {
      setPasswordError('새 비밀번호는 현재 비밀번호와 달라야 합니다.');
      return;
    }

    setPasswordLoading(true);
    try {
      await changePassword(currentPassword, newPassword);
      setPasswordSuccess('비밀번호가 성공적으로 변경되었습니다.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setPasswordError(err instanceof Error ? err.message : '비밀번호 변경에 실패했습니다.');
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Back Link */}
      <div className="mb-6">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm font-medium transition-colors"
          style={{ color: 'var(--text-secondary)' }}
        >
          <ArrowLeft className="w-4 h-4" />
          대시보드로
        </Link>
      </div>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div
            className="section-icon"
            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
          >
            <User className="w-5 h-5" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
            프로필 관리
          </h1>
        </div>
        <p className="text-sm ml-12" style={{ color: 'var(--text-secondary)' }}>
          계정 정보를 확인하고 수정하세요
        </p>
      </div>

      {/* Profile Card */}
      <div className="card mb-6" style={{ padding: 'var(--space-6)' }}>
        <div className="flex items-center gap-4 mb-6 pb-6" style={{ borderBottom: '1px solid var(--border-default)' }}>
          <div
            className="avatar"
            style={{
              width: '4rem',
              height: '4rem',
              fontSize: 'var(--text-xl)',
              background: 'var(--gradient-primary)',
            }}
          >
            {user?.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
              {user?.name}
            </h2>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              {user?.email}
            </p>
            <p className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>
              가입일: {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('ko-KR') : '-'}
            </p>
          </div>
        </div>

        <h3 className="text-base font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
          기본 정보 수정
        </h3>

        {profileError && (
          <div className="flex items-center gap-2 p-3 mb-4 rounded-lg" style={{ backgroundColor: 'var(--color-error-50)', color: 'var(--color-error-700)' }}>
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span className="text-sm">{profileError}</span>
          </div>
        )}

        {profileSuccess && (
          <div className="flex items-center gap-2 p-3 mb-4 rounded-lg" style={{ backgroundColor: 'var(--color-success-50)', color: 'var(--color-success-700)' }}>
            <CheckCircle className="w-4 h-4 flex-shrink-0" />
            <span className="text-sm">{profileSuccess}</span>
          </div>
        )}

        <form onSubmit={handleProfileSubmit}>
          <div className="form-group">
            <label htmlFor="profile-name" className="form-label">
              <User className="w-4 h-4 inline mr-1" />
              이름
            </label>
            <input
              id="profile-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="이름을 입력하세요"
            />
          </div>

          <div className="form-group">
            <label htmlFor="profile-email" className="form-label">
              <Mail className="w-4 h-4 inline mr-1" />
              이메일
            </label>
            <input
              id="profile-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="이메일을 입력하세요"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={profileLoading}
              className="btn btn-primary"
            >
              {profileLoading ? (
                <span className="spinner" style={{ width: '1rem', height: '1rem' }} />
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span>저장</span>
            </button>
          </div>
        </form>
      </div>

      {/* Password Card */}
      <div className="card" style={{ padding: 'var(--space-6)' }}>
        <h3 className="text-base font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
          <Lock className="w-4 h-4 inline mr-2" />
          비밀번호 변경
        </h3>

        {passwordError && (
          <div className="flex items-center gap-2 p-3 mb-4 rounded-lg" style={{ backgroundColor: 'var(--color-error-50)', color: 'var(--color-error-700)' }}>
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span className="text-sm">{passwordError}</span>
          </div>
        )}

        {passwordSuccess && (
          <div className="flex items-center gap-2 p-3 mb-4 rounded-lg" style={{ backgroundColor: 'var(--color-success-50)', color: 'var(--color-success-700)' }}>
            <CheckCircle className="w-4 h-4 flex-shrink-0" />
            <span className="text-sm">{passwordSuccess}</span>
          </div>
        )}

        <form onSubmit={handlePasswordSubmit}>
          <div className="form-group">
            <label htmlFor="profile-current-password" className="form-label">현재 비밀번호</label>
            <div className="relative">
              <input
                id="profile-current-password"
                type={showCurrentPassword ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="현재 비밀번호를 입력하세요"
                style={{ paddingRight: '2.5rem' }}
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2"
                style={{ color: 'var(--text-tertiary)' }}
              >
                {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="profile-new-password" className="form-label">새 비밀번호</label>
            <div className="relative">
              <input
                id="profile-new-password"
                type={showNewPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="새 비밀번호를 입력하세요 (6자 이상)"
                style={{ paddingRight: '2.5rem' }}
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2"
                style={{ color: 'var(--text-tertiary)' }}
              >
                {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="profile-confirm-password" className="form-label">새 비밀번호 확인</label>
            <div className="relative">
              <input
                id="profile-confirm-password"
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="새 비밀번호를 다시 입력하세요"
                style={{ paddingRight: '2.5rem' }}
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

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={passwordLoading}
              className="btn btn-primary"
            >
              {passwordLoading ? (
                <span className="spinner" style={{ width: '1rem', height: '1rem' }} />
              ) : (
                <Lock className="w-4 h-4" />
              )}
              <span>비밀번호 변경</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
