import Joyride, { STATUS } from 'react-joyride-react-19';
import type { CallBackProps, Step } from 'react-joyride-react-19';
import { useState, useEffect } from 'react';

interface TutorialProps {
  run: boolean;
  onFinish: () => void;
}

const steps: Step[] = [
  {
    target: '.hero-section',
    content: '아이디어 매니저에 오신 것을 환영합니다! 이곳에서 전체 통계를 한눈에 확인할 수 있습니다.',
    placement: 'bottom',
    disableBeacon: true,
  },
  {
    target: '#nav-ideas',
    content: '아이디어 목록에서 모든 아이디어를 확인하고 관리할 수 있습니다.',
    placement: 'bottom',
  },
  {
    target: '#nav-kanban',
    content: '칸반 보드에서 아이디어를 드래그 앤 드롭으로 상태를 변경할 수 있습니다.',
    placement: 'bottom',
  },
  {
    target: '#nav-memos',
    content: '매일 메모를 작성하여 아이디어와 생각을 기록해보세요.',
    placement: 'bottom',
  },
  {
    target: '#btn-new-idea',
    content: '새 아이디어 버튼을 눌러 창의적인 아이디어를 추가해보세요!',
    placement: 'bottom',
  },
  {
    target: '#btn-search',
    content: '검색 기능으로 원하는 아이디어를 빠르게 찾을 수 있습니다.',
    placement: 'bottom',
  },
  {
    target: '#btn-theme',
    content: '다크 모드와 라이트 모드를 전환할 수 있습니다.',
    placement: 'bottom',
  },
];

export function Tutorial({ run, onFinish }: TutorialProps) {
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    if (run) {
      setStepIndex(0);
    }
  }, [run]);

  const handleCallback = (data: CallBackProps) => {
    const { status, index, type } = data;

    if (type === 'step:after') {
      setStepIndex(index + 1);
    }

    if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
      onFinish();
    }
  };

  return (
    <Joyride
      steps={steps}
      run={run}
      stepIndex={stepIndex}
      continuous
      showSkipButton
      showProgress
      callback={handleCallback}
      locale={{
        back: '이전',
        close: '닫기',
        last: '완료',
        next: '다음',
        skip: '건너뛰기',
      }}
      styles={{
        options: {
          primaryColor: 'var(--color-primary-500)',
          backgroundColor: 'var(--bg-surface)',
          textColor: 'var(--text-primary)',
          arrowColor: 'var(--bg-surface)',
          zIndex: 10000,
        },
        tooltip: {
          borderRadius: '12px',
          padding: '20px',
        },
        tooltipContent: {
          fontSize: '15px',
          lineHeight: '1.6',
        },
        buttonNext: {
          backgroundColor: 'var(--color-primary-500)',
          borderRadius: '8px',
          padding: '8px 16px',
        },
        buttonBack: {
          color: 'var(--text-secondary)',
          marginRight: '8px',
        },
        buttonSkip: {
          color: 'var(--text-tertiary)',
        },
        spotlight: {
          borderRadius: '12px',
        },
      }}
    />
  );
}
