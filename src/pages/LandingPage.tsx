import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Sparkles, Compass } from 'lucide-react';

const LandingPage = () => {
  const navigate = useNavigate();
  const { continueAsGuest } = useAuth();

  const handleGuestLogin = () => {
    continueAsGuest();
    navigate('/');
  };

  const styles = {
    container: {
      display: 'flex',
      flexDirection: 'column' as 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      backgroundColor: 'var(--bg-default)',
      color: 'var(--text-primary)',
      textAlign: 'center' as 'center',
      padding: '2rem',
    },
    logoContainer: {
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
      marginBottom: '1rem',
    },
    logo: {
      width: '60px',
      height: '60px',
    },
    title: {
      fontSize: '3rem',
      fontWeight: 'bold',
      color: 'var(--text-bright)',
      letterSpacing: '-1px',
    },
    tagline: {
      fontSize: '1.25rem',
      color: 'var(--text-secondary)',
      marginBottom: '3rem',
      maxWidth: '500px',
    },
    buttonContainer: {
      display: 'flex',
      flexDirection: 'column' as 'column',
      gap: '1rem',
      width: '100%',
      maxWidth: '320px',
    },
    button: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0.5rem',
      padding: '0.75rem 1.5rem',
      fontSize: '1rem',
      fontWeight: '600',
      borderRadius: '0.75rem',
      border: 'none',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
    },
    primaryButton: {
      backgroundColor: 'var(--color-primary-500)',
      color: '#fff',
    },
    secondaryButton: {
      backgroundColor: 'var(--bg-subtle)',
      color: 'var(--text-primary)',
      border: '1px solid var(--border-default)',
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.logoContainer}>
        <img src="/idea-icon.svg" alt="Idea Manager Logo" style={styles.logo} />
        <h1 style={styles.title}>Idea Manager</h1>
      </div>
      <p style={styles.tagline}>
        반짝이는 아이디어를 체계적으로 관리하고, 인공지능과 함께 발전시키세요.
      </p>
      <div style={styles.buttonContainer}>
        <button
          style={{ ...styles.button, ...styles.primaryButton }}
          onClick={handleGuestLogin}
        >
          <Compass size={20} />
          비회원 둘러보기
        </button>
        <button
          style={{ ...styles.button, ...styles.secondaryButton }}
          onClick={() => navigate('/login')}
        >
          <Sparkles size={20} />
          로그인 / 서비스 시작
        </button>
      </div>
    </div>
  );
};

export default LandingPage;
