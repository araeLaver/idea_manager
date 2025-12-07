import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  Sparkles,
  Compass,
  Lightbulb,
  LayoutGrid,
  Brain,
  Calendar,
  Search,
  Shield,
  Zap,
  ArrowRight,
  CheckCircle2,
  User
} from 'lucide-react';

const LandingPage = () => {
  const navigate = useNavigate();
  const { continueAsGuest } = useAuth();

  const handleGuestLogin = () => {
    // 튜토리얼 플래그 설정 후 게스트 모드 진입
    localStorage.setItem('showTutorial', 'true');
    continueAsGuest();
    navigate('/');
  };

  const features = [
    {
      icon: Lightbulb,
      title: '아이디어 관리',
      description: '반짝이는 아이디어를 카테고리별로 체계적으로 정리하고 관리하세요.',
    },
    {
      icon: LayoutGrid,
      title: '칸반 보드',
      description: '드래그 앤 드롭으로 아이디어 진행 상태를 시각적으로 관리하세요.',
    },
    {
      icon: Brain,
      title: 'AI 어시스턴트',
      description: '인공지능이 아이디어 발전과 피드백을 도와드립니다.',
    },
    {
      icon: Calendar,
      title: '데일리 메모',
      description: '매일의 생각과 영감을 기록하고 아이디어로 발전시키세요.',
    },
    {
      icon: Search,
      title: '강력한 검색',
      description: '태그, 카테고리, 키워드로 원하는 아이디어를 빠르게 찾으세요.',
    },
    {
      icon: Shield,
      title: '안전한 저장',
      description: '클라우드 동기화로 어디서든 안전하게 접근할 수 있습니다.',
    },
  ];

  const stats = [
    { value: '무제한', label: '아이디어 저장' },
    { value: 'AI', label: '피드백 지원' },
    { value: '실시간', label: '클라우드 동기화' },
  ];

  return (
    <div style={styles.container}>
      {/* Header */}
      <header style={styles.header}>
        <div style={styles.headerContent}>
          <div style={styles.logoContainer}>
            <div style={styles.logoIcon}>
              <Lightbulb size={20} color="white" />
            </div>
            <span style={styles.logoText}>Idea Manager</span>
          </div>
          <div style={styles.headerButtons}>
            <button
              style={styles.headerLoginBtn}
              onClick={() => navigate('/login')}
            >
              로그인
            </button>
            <button
              style={styles.headerGetStartedBtn}
              onClick={() => navigate('/register')}
            >
              시작하기
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section style={styles.heroSection}>
        <div style={styles.heroContent}>
          <div style={styles.badge}>
            <Zap size={14} />
            <span>AI 기반 아이디어 관리</span>
          </div>
          <h1 style={styles.heroTitle}>
            아이디어를<br />
            <span style={styles.heroTitleHighlight}>현실로 만드세요</span>
          </h1>
          <p style={styles.heroDescription}>
            반짝이는 아이디어를 체계적으로 관리하고,<br />
            AI와 함께 발전시켜 실현 가능한 프로젝트로 만들어보세요.
          </p>

          {/* Stats */}
          <div style={styles.statsContainer}>
            {stats.map((stat, index) => (
              <div key={index} style={styles.statItem}>
                <div style={styles.statValue}>{stat.value}</div>
                <div style={styles.statLabel}>{stat.label}</div>
              </div>
            ))}
          </div>

          {/* CTA Buttons */}
          <div style={styles.ctaContainer}>
            <button
              style={styles.primaryCta}
              onClick={handleGuestLogin}
            >
              <Compass size={20} />
              <span>체험하기</span>
              <ArrowRight size={18} />
            </button>
            <button
              style={styles.secondaryCta}
              onClick={() => navigate('/register')}
            >
              <User size={20} />
              <span>무료 회원가입</span>
            </button>
          </div>

          <p style={styles.ctaNote}>
            <CheckCircle2 size={14} />
            <span>비회원도 모든 기능을 체험할 수 있습니다</span>
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section style={styles.featuresSection}>
        <div style={styles.sectionContent}>
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>주요 기능</h2>
            <p style={styles.sectionSubtitle}>
              아이디어 관리에 필요한 모든 것을 제공합니다
            </p>
          </div>
          <div style={styles.featuresGrid}>
            {features.map((feature, index) => (
              <div key={index} style={styles.featureCard}>
                <div style={styles.featureIcon}>
                  <feature.icon size={24} />
                </div>
                <h3 style={styles.featureTitle}>{feature.title}</h3>
                <p style={styles.featureDescription}>{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section style={styles.howItWorksSection}>
        <div style={styles.sectionContent}>
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>사용 방법</h2>
            <p style={styles.sectionSubtitle}>
              3단계로 시작하는 아이디어 관리
            </p>
          </div>
          <div style={styles.stepsContainer}>
            <div style={styles.stepCard}>
              <div style={styles.stepNumber}>1</div>
              <h3 style={styles.stepTitle}>아이디어 기록</h3>
              <p style={styles.stepDescription}>
                떠오르는 아이디어를 바로 기록하세요. 카테고리와 태그로 정리할 수 있습니다.
              </p>
            </div>
            <div style={styles.stepCard}>
              <div style={styles.stepNumber}>2</div>
              <h3 style={styles.stepTitle}>AI와 발전</h3>
              <p style={styles.stepDescription}>
                AI 어시스턴트가 아이디어를 분석하고 개선 방향을 제안합니다.
              </p>
            </div>
            <div style={styles.stepCard}>
              <div style={styles.stepNumber}>3</div>
              <h3 style={styles.stepTitle}>실행하기</h3>
              <p style={styles.stepDescription}>
                칸반 보드로 진행 상태를 관리하며 아이디어를 현실로 만드세요.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section style={styles.finalCtaSection}>
        <div style={styles.finalCtaContent}>
          <h2 style={styles.finalCtaTitle}>지금 바로 시작하세요</h2>
          <p style={styles.finalCtaDescription}>
            회원가입 없이도 모든 기능을 체험할 수 있습니다
          </p>
          <div style={styles.finalCtaButtons}>
            <button
              style={styles.finalPrimaryCta}
              onClick={handleGuestLogin}
            >
              <Compass size={20} />
              <span>둘러보기 시작</span>
            </button>
            <button
              style={styles.finalSecondaryCta}
              onClick={() => navigate('/login')}
            >
              <Sparkles size={20} />
              <span>로그인</span>
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={styles.footer}>
        <div style={styles.footerContent}>
          <div style={styles.footerLogo}>
            <Lightbulb size={20} />
            <span>Idea Manager</span>
          </div>
          <p style={styles.footerText}>
            © 2024 Idea Manager. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    minHeight: '100vh',
    backgroundColor: 'var(--bg-default)',
    color: 'var(--text-primary)',
  },
  // Header
  header: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    backgroundColor: 'rgba(var(--bg-default-rgb), 0.8)',
    backdropFilter: 'blur(12px)',
    borderBottom: '1px solid var(--border-default)',
  },
  headerContent: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '1rem 2rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logoContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  logoIcon: {
    width: '36px',
    height: '36px',
    borderRadius: '10px',
    background: 'var(--gradient-primary)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    fontSize: '1.25rem',
    fontWeight: 700,
    color: 'var(--text-bright)',
  },
  headerButtons: {
    display: 'flex',
    gap: '0.75rem',
  },
  headerLoginBtn: {
    padding: '0.5rem 1rem',
    fontSize: '0.875rem',
    fontWeight: 500,
    color: 'var(--text-secondary)',
    backgroundColor: 'transparent',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'color 0.2s',
  },
  headerGetStartedBtn: {
    padding: '0.5rem 1rem',
    fontSize: '0.875rem',
    fontWeight: 600,
    color: 'white',
    backgroundColor: 'var(--color-primary-500)',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
  // Hero Section
  heroSection: {
    paddingTop: '8rem',
    paddingBottom: '4rem',
    textAlign: 'center' as const,
  },
  heroContent: {
    maxWidth: '800px',
    margin: '0 auto',
    padding: '0 2rem',
  },
  badge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.5rem 1rem',
    backgroundColor: 'var(--color-primary-500)',
    color: 'white',
    borderRadius: '100px',
    fontSize: '0.875rem',
    fontWeight: 500,
    marginBottom: '1.5rem',
  },
  heroTitle: {
    fontSize: 'clamp(2.5rem, 6vw, 4rem)',
    fontWeight: 800,
    lineHeight: 1.1,
    color: 'var(--text-bright)',
    marginBottom: '1.5rem',
  },
  heroTitleHighlight: {
    background: 'var(--gradient-primary)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  },
  heroDescription: {
    fontSize: '1.25rem',
    lineHeight: 1.6,
    color: 'var(--text-secondary)',
    marginBottom: '2rem',
  },
  statsContainer: {
    display: 'flex',
    justifyContent: 'center',
    gap: '3rem',
    marginBottom: '2.5rem',
    flexWrap: 'wrap' as const,
  },
  statItem: {
    textAlign: 'center' as const,
  },
  statValue: {
    fontSize: '1.5rem',
    fontWeight: 700,
    color: 'var(--color-primary-500)',
  },
  statLabel: {
    fontSize: '0.875rem',
    color: 'var(--text-tertiary)',
    marginTop: '0.25rem',
  },
  ctaContainer: {
    display: 'flex',
    justifyContent: 'center',
    gap: '1rem',
    flexWrap: 'wrap' as const,
    marginBottom: '1rem',
  },
  primaryCta: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '1rem 2rem',
    fontSize: '1rem',
    fontWeight: 600,
    color: 'white',
    backgroundColor: 'var(--color-primary-500)',
    border: 'none',
    borderRadius: '12px',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  secondaryCta: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '1rem 2rem',
    fontSize: '1rem',
    fontWeight: 600,
    color: 'var(--text-primary)',
    backgroundColor: 'var(--bg-subtle)',
    border: '1px solid var(--border-default)',
    borderRadius: '12px',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  ctaNote: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    fontSize: '0.875rem',
    color: 'var(--text-tertiary)',
  },
  // Features Section
  featuresSection: {
    padding: '4rem 0',
    backgroundColor: 'var(--bg-subtle)',
  },
  sectionContent: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 2rem',
  },
  sectionHeader: {
    textAlign: 'center' as const,
    marginBottom: '3rem',
  },
  sectionTitle: {
    fontSize: '2rem',
    fontWeight: 700,
    color: 'var(--text-bright)',
    marginBottom: '0.5rem',
  },
  sectionSubtitle: {
    fontSize: '1.125rem',
    color: 'var(--text-secondary)',
  },
  featuresGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '1.5rem',
  },
  featureCard: {
    padding: '2rem',
    backgroundColor: 'var(--bg-surface)',
    borderRadius: '16px',
    border: '1px solid var(--border-default)',
    transition: 'transform 0.2s, box-shadow 0.2s',
  },
  featureIcon: {
    width: '48px',
    height: '48px',
    borderRadius: '12px',
    background: 'var(--gradient-primary)',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '1rem',
  },
  featureTitle: {
    fontSize: '1.125rem',
    fontWeight: 600,
    color: 'var(--text-bright)',
    marginBottom: '0.5rem',
  },
  featureDescription: {
    fontSize: '0.9375rem',
    color: 'var(--text-secondary)',
    lineHeight: 1.6,
  },
  // How It Works Section
  howItWorksSection: {
    padding: '4rem 0',
  },
  stepsContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '2rem',
  },
  stepCard: {
    textAlign: 'center' as const,
    padding: '2rem',
  },
  stepNumber: {
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    background: 'var(--gradient-primary)',
    color: 'white',
    fontSize: '1.25rem',
    fontWeight: 700,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 1rem',
  },
  stepTitle: {
    fontSize: '1.25rem',
    fontWeight: 600,
    color: 'var(--text-bright)',
    marginBottom: '0.75rem',
  },
  stepDescription: {
    fontSize: '0.9375rem',
    color: 'var(--text-secondary)',
    lineHeight: 1.6,
  },
  // Final CTA Section
  finalCtaSection: {
    padding: '4rem 0',
    backgroundColor: 'var(--bg-subtle)',
  },
  finalCtaContent: {
    maxWidth: '600px',
    margin: '0 auto',
    padding: '0 2rem',
    textAlign: 'center' as const,
  },
  finalCtaTitle: {
    fontSize: '2rem',
    fontWeight: 700,
    color: 'var(--text-bright)',
    marginBottom: '0.75rem',
  },
  finalCtaDescription: {
    fontSize: '1.125rem',
    color: 'var(--text-secondary)',
    marginBottom: '2rem',
  },
  finalCtaButtons: {
    display: 'flex',
    justifyContent: 'center',
    gap: '1rem',
    flexWrap: 'wrap' as const,
  },
  finalPrimaryCta: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '1rem 2rem',
    fontSize: '1rem',
    fontWeight: 600,
    color: 'white',
    backgroundColor: 'var(--color-primary-500)',
    border: 'none',
    borderRadius: '12px',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  finalSecondaryCta: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '1rem 2rem',
    fontSize: '1rem',
    fontWeight: 600,
    color: 'var(--text-primary)',
    backgroundColor: 'transparent',
    border: '1px solid var(--border-default)',
    borderRadius: '12px',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  // Footer
  footer: {
    padding: '2rem 0',
    borderTop: '1px solid var(--border-default)',
  },
  footerContent: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 2rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap' as const,
    gap: '1rem',
  },
  footerLogo: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    color: 'var(--text-secondary)',
    fontWeight: 600,
  },
  footerText: {
    fontSize: '0.875rem',
    color: 'var(--text-tertiary)',
  },
};

export default LandingPage;
