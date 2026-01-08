import { useState, useEffect } from 'react';
import { Download, X, RefreshCw, WifiOff } from 'lucide-react';
import { usePWA } from '../hooks/usePWA';

export function PWAPrompt() {
  const { isInstallable, isOnline, needsUpdate, installApp, updateApp } = usePWA();
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Show install banner after a delay if installable and not dismissed
    if (isInstallable && !dismissed) {
      const timer = setTimeout(() => setShowInstallBanner(true), 3000);
      return () => clearTimeout(timer);
    }
  }, [isInstallable, dismissed]);

  const handleInstall = async () => {
    const success = await installApp();
    if (success) {
      setShowInstallBanner(false);
    }
  };

  const handleDismiss = () => {
    setShowInstallBanner(false);
    setDismissed(true);
    // Remember dismissal for this session
    sessionStorage.setItem('pwa-install-dismissed', 'true');
  };

  // Check if was dismissed this session
  useEffect(() => {
    if (sessionStorage.getItem('pwa-install-dismissed')) {
      setDismissed(true);
    }
  }, []);

  return (
    <>
      {/* Offline indicator */}
      {!isOnline && (
        <div
          className="fixed bottom-4 left-4 flex items-center gap-2 px-4 py-2 rounded-lg shadow-lg z-50"
          style={{
            backgroundColor: 'var(--color-warning-100)',
            color: 'var(--color-warning-800)',
            border: '1px solid var(--color-warning-300)',
          }}
          role="alert"
          aria-live="polite"
        >
          <WifiOff className="w-4 h-4" aria-hidden="true" />
          <span className="text-sm font-medium">오프라인 모드</span>
        </div>
      )}

      {/* Update available banner */}
      {needsUpdate && (
        <div
          className="fixed bottom-4 right-4 flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg z-50"
          style={{
            backgroundColor: 'var(--color-primary-600)',
            color: 'white',
          }}
          role="alert"
          aria-live="polite"
        >
          <RefreshCw className="w-5 h-5" aria-hidden="true" />
          <div className="flex flex-col">
            <span className="text-sm font-medium">새 버전이 있습니다</span>
            <span className="text-xs opacity-80">업데이트하려면 클릭하세요</span>
          </div>
          <button
            onClick={updateApp}
            className="ml-2 px-3 py-1 bg-white text-primary-600 rounded text-sm font-medium hover:bg-opacity-90 transition-colors"
            style={{ color: 'var(--color-primary-600)' }}
          >
            업데이트
          </button>
        </div>
      )}

      {/* Install prompt banner */}
      {showInstallBanner && (
        <div
          className="fixed bottom-4 right-4 flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg z-50 max-w-sm"
          style={{
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-default)',
          }}
          role="dialog"
          aria-label="앱 설치 안내"
        >
          <div
            className="flex items-center justify-center w-10 h-10 rounded-lg flex-shrink-0"
            style={{ background: 'var(--gradient-primary)' }}
          >
            <Download className="w-5 h-5 text-white" aria-hidden="true" />
          </div>
          <div className="flex flex-col flex-1 min-w-0">
            <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
              앱으로 설치하기
            </span>
            <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
              홈 화면에 추가하여 더 빠르게 사용하세요
            </span>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={handleInstall}
              className="px-3 py-1.5 rounded text-sm font-medium text-white transition-colors"
              style={{ background: 'var(--gradient-primary)' }}
            >
              설치
            </button>
            <button
              onClick={handleDismiss}
              className="p-1 rounded transition-colors"
              style={{ color: 'var(--text-tertiary)' }}
              aria-label="닫기"
            >
              <X className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
