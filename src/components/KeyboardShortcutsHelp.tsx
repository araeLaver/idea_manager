import { useState } from 'react';
import { Keyboard, X } from 'lucide-react';

interface Shortcut {
  keys: string[];
  description: string;
  category: string;
}

const shortcuts: Shortcut[] = [
  {
    keys: ['Ctrl', 'N'],
    description: '새 아이디어 작성',
    category: '작업',
  },
  {
    keys: ['Ctrl', 'K'],
    description: '검색',
    category: '작업',
  },
  {
    keys: ['Ctrl', 'D'],
    description: '다크모드 토글',
    category: '작업',
  },
  {
    keys: ['1'],
    description: '대시보드로 이동',
    category: '네비게이션',
  },
  {
    keys: ['2'],
    description: '아이디어 목록으로 이동',
    category: '네비게이션',
  },
  {
    keys: ['3'],
    description: '칸반 보드로 이동',
    category: '네비게이션',
  },
  {
    keys: ['4'],
    description: '히스토리로 이동',
    category: '네비게이션',
  },
  {
    keys: ['G', 'D'],
    description: '대시보드로 이동',
    category: '빠른 이동',
  },
  {
    keys: ['G', 'L'],
    description: '목록으로 이동',
    category: '빠른 이동',
  },
  {
    keys: ['G', 'K'],
    description: '칸반으로 이동',
    category: '빠른 이동',
  },
  {
    keys: ['G', 'H'],
    description: '히스토리로 이동',
    category: '빠른 이동',
  },
  {
    keys: ['Esc'],
    description: '모달 닫기',
    category: '일반',
  },
];

export function KeyboardShortcutsHelp() {
  const [isOpen, setIsOpen] = useState(false);

  const renderKey = (key: string) => (
    <kbd className="px-2 py-1 text-xs font-semibold text-primary bg-secondary border border-primary rounded shadow-sm">
      {key}
    </kbd>
  );

  const groupedShortcuts = shortcuts.reduce((acc, shortcut) => {
    if (!acc[shortcut.category]) {
      acc[shortcut.category] = [];
    }
    acc[shortcut.category].push(shortcut);
    return acc;
  }, {} as Record<string, Shortcut[]>);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="btn-ghost p-2 rounded-xl hover:bg-hover transition-all group"
        title="키보드 단축키 (Ctrl+?)"
      >
        <Keyboard className="h-5 w-5 transition-transform group-hover:scale-110" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-tertiary rounded-2xl shadow-2xl max-w-2xl w-full max-h-80vh overflow-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-brand">
                    <Keyboard className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-primary">키보드 단축키</h2>
                    <p className="text-sm text-secondary">빠른 작업을 위한 단축키 모음</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="btn-ghost p-2 rounded-xl hover:bg-hover transition-all"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="grid gap-6">
                {Object.entries(groupedShortcuts).map(([category, categoryShortcuts]) => (
                  <div key={category}>
                    <h3 className="text-sm font-semibold text-accent uppercase tracking-wider mb-3">
                      {category}
                    </h3>
                    <div className="space-y-2">
                      {categoryShortcuts.map((shortcut, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 rounded-lg hover:bg-hover transition-colors"
                        >
                          <span className="text-sm text-primary">{shortcut.description}</span>
                          <div className="flex items-center gap-1">
                            {shortcut.keys.map((key, keyIndex) => (
                              <span key={keyIndex} className="flex items-center">
                                {keyIndex > 0 && (
                                  <span className="text-tertiary mx-1">
                                    {shortcut.keys.length === 2 && shortcut.keys[0] === 'G' ? ' → ' : ' + '}
                                  </span>
                                )}
                                {renderKey(key)}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 bg-accent rounded-lg">
                <p className="text-sm text-accent">
                  <strong>팁:</strong> 대부분의 단축키는 입력 필드가 활성화되지 않은 상태에서 작동합니다.
                  G + 다른 키 조합은 Gmail 스타일의 빠른 네비게이션입니다.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}