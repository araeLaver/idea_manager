import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Tooltip } from '../components/Tooltip';
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
  User,
  Eye,
  MousePointer,
  Info,
  ChevronLeft,
  ChevronRight,
  Monitor,
  Kanban,
  FileText,
  BarChart3,
} from 'lucide-react';

/** Preview screenshot data */
const previewScreens = [
  {
    id: 'dashboard',
    title: '대시보드',
    description: '한눈에 보는 아이디어 현황과 통계',
    icon: BarChart3,
    features: ['전체 아이디어 통계', '최근 활동 내역', '진행 상태 요약', '빠른 액세스 메뉴'],
  },
  {
    id: 'ideas',
    title: '아이디어 목록',
    description: '체계적인 아이디어 관리와 필터링',
    icon: Lightbulb,
    features: ['카드/목록 뷰 전환', '상태별 필터링', '태그 기반 분류', '빠른 검색'],
  },
  {
    id: 'kanban',
    title: '칸반 보드',
    description: '드래그 앤 드롭으로 진행 관리',
    icon: Kanban,
    features: ['직관적인 드래그 앤 드롭', '상태별 컬럼 정리', '실시간 업데이트', '시각적 진행 추적'],
  },
  {
    id: 'memos',
    title: '데일리 메모',
    description: '매일의 아이디어와 영감 기록',
    icon: FileText,
    features: ['캘린더 기반 메모', '날짜별 기록 관리', '마크다운 지원', '아이디어 연결'],
  },
];

const LandingPage = () => {
  const navigate = useNavigate();
  const { continueAsGuest } = useAuth();
  const [currentPreview, setCurrentPreview] = useState(0);

  const handleGuestLogin = () => {
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

  const guestTooltipContent = (
    <div>
      <div style={{ fontWeight: 600, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
        <Eye size={16} style={{ color: 'var(--color-primary-500)' }} />
        비회원 둘러보기
      </div>
      <ul style={{ margin: 0, paddingLeft: '16px', color: 'var(--text-secondary)' }}>
        <li>회원가입 없이 모든 기능 체험</li>
        <li>샘플 데이터로 기능 미리보기</li>
        <li>로컬 저장으로 데이터 보관</li>
        <li>언제든지 회원가입 가능</li>
      </ul>
      <div style={{ marginTop: '10px', padding: '8px', backgroundColor: 'var(--bg-subtle)', borderRadius: '8px', fontSize: '0.8125rem' }}>
        <Info size={14} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} />
        게스트 모드의 데이터는 브라우저에만 저장됩니다
      </div>
    </div>
  );

  const nextPreview = () => {
    setCurrentPreview((prev) => (prev + 1) % previewScreens.length);
  };

  const prevPreview = () => {
    setCurrentPreview((prev) => (prev - 1 + previewScreens.length) % previewScreens.length);
  };

  const CurrentIcon = previewScreens[currentPreview].icon;

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
            <Tooltip content={guestTooltipContent} position="bottom" delay={100}>
              <button
                style={styles.primaryCta}
                onClick={handleGuestLogin}
              >
                <Compass size={20} />
                <span>비회원 둘러보기</span>
                <ArrowRight size={18} />
              </button>
            </Tooltip>
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
            <span>회원가입 없이도 모든 기능을 체험할 수 있습니다</span>
          </p>

          {/* Mouse hint for tooltip */}
          <div style={styles.tooltipHint}>
            <MousePointer size={14} />
            <span>버튼 위에 마우스를 올려 자세한 정보를 확인하세요</span>
          </div>
        </div>
      </section>

      {/* App Preview Section */}
      <section style={styles.previewSection}>
        <div style={styles.sectionContent}>
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>
              <Monitor size={28} style={{ marginRight: '10px', verticalAlign: 'middle' }} />
              앱 미리보기
            </h2>
            <p style={styles.sectionSubtitle}>
              회원가입 전에 주요 기능을 살펴보세요
            </p>
          </div>

          <div style={styles.previewContainer}>
            {/* Preview Navigation */}
            <button style={styles.previewNavBtn} onClick={prevPreview}>
              <ChevronLeft size={24} />
            </button>

            {/* Preview Card */}
            <div style={styles.previewCard}>
              <div style={styles.previewHeader}>
                <div style={styles.previewIconContainer}>
                  <CurrentIcon size={32} color="white" />
                </div>
                <div>
                  <h3 style={styles.previewTitle}>{previewScreens[currentPreview].title}</h3>
                  <p style={styles.previewDescription}>{previewScreens[currentPreview].description}</p>
                </div>
              </div>

              <div style={styles.previewContent}>
                <div style={styles.mockScreen}>
                  <div style={styles.mockHeader}>
                    <div style={styles.mockDots}>
                      <span style={{ ...styles.mockDot, backgroundColor: '#ff5f57' }} />
                      <span style={{ ...styles.mockDot, backgroundColor: '#ffbd2e' }} />
                      <span style={{ ...styles.mockDot, backgroundColor: '#28c840' }} />
                    </div>
                    <span style={styles.mockTitle}>{previewScreens[currentPreview].title}</span>
                  </div>
                  <div style={styles.mockBody}>
                    {previewScreens[currentPreview].features.map((feature, idx) => (
                      <div key={idx} style={styles.mockFeature}>
                        <CheckCircle2 size={16} style={{ color: 'var(--color-primary-500)', flexShrink: 0 }} />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Preview Dots */}
              <div style={styles.previewDots}>
                {previewScreens.map((_, idx) => (
                  <button
                    key={idx}
                    style={{
                      ...styles.previewDot,
                      backgroundColor: idx === currentPreview ? 'var(--color-primary-500)' : 'var(--border-default)',
                    }}
                    onClick={() => setCurrentPreview(idx)}
                  />
                ))}
              </div>
            </div>

            <button style={styles.previewNavBtn} onClick={nextPreview}>
              <ChevronRight size={24} />
            </button>
          </div>

          {/* Try Now Button */}
          <div style={{ textAlign: 'center', marginTop: '2rem' }}>
            <Tooltip content={guestTooltipContent} position="top" delay={100}>
              <button style={styles.tryNowBtn} onClick={handleGuestLogin}>
                <Eye size={20} />
                <span>지금 바로 체험하기</span>
                <ArrowRight size={18} />
              </button>
            </Tooltip>
          </div>
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
            <Tooltip content={guestTooltipContent} position="top" delay={100}>
              <button
                style={styles.finalPrimaryCta}
                onClick={handleGuestLogin}
              >
                <Compass size={20} />
                <span>비회원 둘러보기</span>
              </button>
            </Tooltip>
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
    boxShadow: '0 4px 14px rgba(var(--color-primary-rgb), 0.4)',
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
  tooltipHint: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    fontSize: '0.75rem',
    color: 'var(--text-tertiary)',
    marginTop: '1rem',
    opacity: 0.7,
  },
  // Preview Section
  previewSection: {
    padding: '4rem 0',
    backgroundColor: 'var(--bg-default)',
  },
  previewContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '1rem',
    maxWidth: '900px',
    margin: '0 auto',
  },
  previewNavBtn: {
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    border: '1px solid var(--border-default)',
    backgroundColor: 'var(--bg-surface)',
    color: 'var(--text-secondary)',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s',
    flexShrink: 0,
  },
  previewCard: {
    flex: 1,
    maxWidth: '700px',
    backgroundColor: 'var(--bg-surface)',
    borderRadius: '20px',
    border: '1px solid var(--border-default)',
    padding: '2rem',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
  },
  previewHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    marginBottom: '1.5rem',
  },
  previewIconContainer: {
    width: '64px',
    height: '64px',
    borderRadius: '16px',
    background: 'var(--gradient-primary)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  previewTitle: {
    fontSize: '1.5rem',
    fontWeight: 700,
    color: 'var(--text-bright)',
    marginBottom: '0.25rem',
  },
  previewDescription: {
    fontSize: '1rem',
    color: 'var(--text-secondary)',
  },
  previewContent: {
    marginBottom: '1.5rem',
  },
  mockScreen: {
    backgroundColor: 'var(--bg-subtle)',
    borderRadius: '12px',
    overflow: 'hidden',
    border: '1px solid var(--border-subtle)',
  },
  mockHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    padding: '0.75rem 1rem',
    backgroundColor: 'var(--bg-default)',
    borderBottom: '1px solid var(--border-subtle)',
  },
  mockDots: {
    display: 'flex',
    gap: '6px',
  },
  mockDot: {
    width: '12px',
    height: '12px',
    borderRadius: '50%',
  },
  mockTitle: {
    fontSize: '0.875rem',
    fontWeight: 500,
    color: 'var(--text-secondary)',
  },
  mockBody: {
    padding: '1.5rem',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '1rem',
  },
  mockFeature: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    fontSize: '0.9375rem',
    color: 'var(--text-primary)',
  },
  previewDots: {
    display: 'flex',
    justifyContent: 'center',
    gap: '8px',
  },
  previewDot: {
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    border: 'none',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
  tryNowBtn: {
    display: 'inline-flex',
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
    boxShadow: '0 4px 14px rgba(var(--color-primary-rgb), 0.4)',
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
