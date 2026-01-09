import { registerSW } from 'virtual:pwa-register';

// Service Worker 등록 및 업데이트 처리
const updateSW = registerSW({
  onNeedRefresh() {
    // 새 버전이 있을 때 이벤트 발생
    const event = new CustomEvent('pwa-update-available');
    window.dispatchEvent(event);
  },
  onOfflineReady() {
    // 오프라인 사용 준비 완료
    if (import.meta.env.DEV) {
      console.log('오프라인 사용 준비 완료');
    }
  },
  onRegistered(registration) {
    // 서비스 워커 등록 완료
    if (registration) {
      // 주기적으로 업데이트 확인 (1시간마다)
      setInterval(() => {
        registration.update();
      }, 60 * 60 * 1000);
    }
  },
  onRegisterError(error) {
    console.error('서비스 워커 등록 실패:', error);
  },
});

export { updateSW };
