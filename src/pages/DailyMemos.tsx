import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Calendar, Edit3, Save, Trash2, Plus, X } from 'lucide-react';
import api from '../services/api';

interface MemoEntry {
  id: string;
  date: string;
  content: string;
}

export function DailyMemos() {
  const [memos, setMemos] = useState<MemoEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingDate, setEditingDate] = useState<string | null>(null);
  const [editMemo, setEditMemo] = useState('');

  useEffect(() => {
    loadMemos();
  }, []);

  const loadMemos = async () => {
    try {
      setLoading(true);
      const fetchedMemos = await api.getMemos();
      setMemos(fetchedMemos.map((m: any) => ({
        id: m.id,
        date: typeof m.date === 'string' ? m.date.split('T')[0] : format(new Date(m.date), 'yyyy-MM-dd'),
        content: m.content
      })));
    } catch (error) {
      console.error('Failed to load memos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (date: string, content: string) => {
    setEditingDate(date);
    setEditMemo(content);
  };

  const handleSave = async (date: string) => {
    try {
      if (editMemo.trim()) {
        await api.saveMemo(date, editMemo);
      } else {
        await api.deleteMemoByDate(date);
      }
      setEditingDate(null);
      setEditMemo('');
      await loadMemos();
    } catch (error) {
      console.error('Failed to save memo:', error);
    }
  };

  const handleCancel = () => {
    setEditingDate(null);
    setEditMemo('');
  };

  const handleDelete = async (date: string) => {
    if (confirm('이 메모를 삭제하시겠습니까?')) {
      try {
        await api.deleteMemoByDate(date);
        await loadMemos();
      } catch (error) {
        console.error('Failed to delete memo:', error);
      }
    }
  };

  const addNewMemo = () => {
    const today = format(new Date(), 'yyyy-MM-dd');
    const existingMemo = memos.find(m => m.date === today);
    if (!existingMemo) {
      setEditingDate(today);
      setEditMemo('');
    } else {
      handleEdit(today, existingMemo.content);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center" style={{ height: '400px' }}>
        <div className="text-center">
          <div className="spinner mx-auto mb-4" />
          <p style={{ color: 'var(--text-secondary)' }}>메모를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="section-icon" style={{ background: 'var(--gradient-secondary)' }}>
                <Calendar className="w-5 h-5" />
              </div>
              <h1 className="text-3xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
                일일 메모
              </h1>
            </div>
            <p className="text-sm ml-12" style={{ color: 'var(--text-secondary)' }}>
              매일의 기록을 관리하세요
            </p>
          </div>
          <button onClick={addNewMemo} className="btn btn-primary">
            <Plus className="w-4 h-4" />
            <span>새 메모</span>
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto">
        {/* New memo form */}
        {editingDate && !memos.find(m => m.date === editingDate) && (
          <div className="card mb-6" style={{ padding: 'var(--space-6)' }}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="section-icon" style={{ width: '2rem', height: '2rem', background: 'var(--gradient-secondary)' }}>
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                    {format(new Date(editingDate), 'yyyy년 MM월 dd일', { locale: ko })}
                  </h3>
                  <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                    {format(new Date(editingDate), 'EEEE', { locale: ko })}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleSave(editingDate)} className="btn btn-primary btn-sm">
                  <Save className="w-4 h-4" />
                </button>
                <button onClick={handleCancel} className="btn btn-secondary btn-sm">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
            <textarea
              value={editMemo}
              onChange={(e) => setEditMemo(e.target.value)}
              placeholder="메모를 작성해주세요..."
              autoFocus
              style={{ minHeight: '120px' }}
            />
          </div>
        )}

        {/* Memos list */}
        <div className="space-y-4">
          {memos.length > 0 ? (
            memos.map(({ id, date, content }) => (
              <div key={id} className="card" style={{ padding: 'var(--space-6)' }}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="section-icon" style={{ width: '2rem', height: '2rem', background: 'var(--gradient-primary)' }}>
                      <Calendar className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                        {format(new Date(date), 'yyyy년 MM월 dd일', { locale: ko })}
                      </h3>
                      <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                        {format(new Date(date), 'EEEE', { locale: ko })}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {editingDate === date ? (
                      <>
                        <button onClick={() => handleSave(date)} className="btn btn-primary btn-sm">
                          <Save className="w-4 h-4" />
                        </button>
                        <button onClick={handleCancel} className="btn btn-secondary btn-sm">
                          <X className="w-4 h-4" />
                        </button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => handleEdit(date, content)} className="icon-btn">
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(date)}
                          className="icon-btn"
                          style={{ color: 'var(--color-error-500)' }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {editingDate === date ? (
                  <textarea
                    value={editMemo}
                    onChange={(e) => setEditMemo(e.target.value)}
                    placeholder="메모를 작성해주세요..."
                    autoFocus
                    style={{ minHeight: '120px' }}
                  />
                ) : (
                  <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-subtle)' }}>
                    <p className="whitespace-pre-wrap leading-relaxed" style={{ color: 'var(--text-primary)' }}>
                      {content}
                    </p>
                  </div>
                )}
              </div>
            ))
          ) : !editingDate && (
            <div className="card">
              <div className="empty-state">
                <Calendar className="empty-state-icon" />
                <h3 className="empty-state-title">아직 작성된 메모가 없습니다</h3>
                <p className="empty-state-description">첫 번째 일일메모를 작성해보세요</p>
                <button onClick={addNewMemo} className="btn btn-primary">
                  <Plus className="w-4 h-4" />
                  <span>첫 메모 작성하기</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
