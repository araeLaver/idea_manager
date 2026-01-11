import { useState, useRef } from 'react';
import { Download, Upload, FileJson, FileSpreadsheet, X, CheckCircle, AlertCircle } from 'lucide-react';
import { useData } from '../contexts/DataContext';
import type { IdeaFormData } from '../types';

interface ExportImportProps {
  onClose: () => void;
}

export function ExportImport({ onClose }: ExportImportProps) {
  const { ideas, createIdea } = useData();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<{ success: number; failed: number } | null>(null);
  const [importError, setImportError] = useState('');

  const exportToJSON = () => {
    const exportData = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      ideas: ideas.map(idea => ({
        title: idea.title,
        description: idea.description,
        category: idea.category,
        tags: idea.tags,
        status: idea.status,
        priority: idea.priority,
        notes: idea.notes,
        targetMarket: idea.targetMarket,
        potentialRevenue: idea.potentialRevenue,
        resources: idea.resources,
        timeline: idea.timeline,
        createdAt: idea.createdAt,
        updatedAt: idea.updatedAt,
      })),
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ideas-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const exportToCSV = () => {
    const headers = [
      'Title',
      'Description',
      'Category',
      'Tags',
      'Status',
      'Priority',
      'Notes',
      'Target Market',
      'Potential Revenue',
      'Resources',
      'Timeline',
      'Created At',
      'Updated At',
    ];

    const escapeCSV = (value: string | undefined) => {
      if (!value) return '';
      const escaped = value.replace(/"/g, '""');
      return escaped.includes(',') || escaped.includes('\n') || escaped.includes('"')
        ? `"${escaped}"`
        : escaped;
    };

    const rows = ideas.map(idea => [
      escapeCSV(idea.title),
      escapeCSV(idea.description),
      escapeCSV(idea.category),
      escapeCSV(idea.tags.join(', ')),
      escapeCSV(idea.status),
      escapeCSV(idea.priority),
      escapeCSV(idea.notes),
      escapeCSV(idea.targetMarket),
      escapeCSV(idea.potentialRevenue),
      escapeCSV(idea.resources),
      escapeCSV(idea.timeline),
      escapeCSV(idea.createdAt),
      escapeCSV(idea.updatedAt),
    ]);

    const csv = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ideas-export-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    setImportError('');
    setImportResult(null);

    try {
      const text = await file.text();
      const data = JSON.parse(text);

      if (!data.ideas || !Array.isArray(data.ideas)) {
        throw new Error('Invalid file format: missing ideas array');
      }

      let success = 0;
      let failed = 0;

      for (const idea of data.ideas) {
        try {
          const ideaData: IdeaFormData = {
            title: idea.title || 'Untitled',
            description: idea.description || '',
            category: idea.category || 'General',
            tags: Array.isArray(idea.tags) ? idea.tags : [],
            status: ['draft', 'in-progress', 'completed', 'archived'].includes(idea.status)
              ? idea.status
              : 'draft',
            priority: ['low', 'medium', 'high'].includes(idea.priority)
              ? idea.priority
              : 'medium',
            notes: idea.notes || '',
            targetMarket: idea.targetMarket || '',
            potentialRevenue: idea.potentialRevenue || '',
            resources: idea.resources || '',
            timeline: idea.timeline || '',
          };
          await createIdea(ideaData);
          success++;
        } catch {
          failed++;
        }
      }

      setImportResult({ success, failed });
    } catch (err) {
      setImportError(err instanceof Error ? err.message : 'Failed to import file');
    } finally {
      setImporting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
      onClick={onClose}
    >
      <div
        className="card w-full max-w-md mx-4"
        style={{ padding: 'var(--space-6)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
            내보내기 / 가져오기
          </h2>
          <button onClick={onClose} className="icon-btn" aria-label="닫기">
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {/* Export Section */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--text-secondary)' }}>
            <Download className="w-4 h-4 inline mr-2" />
            내보내기
          </h3>
          <p className="text-xs mb-3" style={{ color: 'var(--text-tertiary)' }}>
            현재 {ideas.length}개의 아이디어를 내보냅니다.
          </p>
          <div className="flex gap-2">
            <button
              onClick={exportToJSON}
              disabled={ideas.length === 0}
              className="btn btn-secondary flex-1"
            >
              <FileJson className="w-4 h-4" />
              <span>JSON</span>
            </button>
            <button
              onClick={exportToCSV}
              disabled={ideas.length === 0}
              className="btn btn-secondary flex-1"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>CSV</span>
            </button>
          </div>
        </div>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full" style={{ height: '1px', backgroundColor: 'var(--border-default)' }} />
          </div>
          <div className="relative flex justify-center">
            <span
              className="px-3 text-xs"
              style={{ backgroundColor: 'var(--bg-surface)', color: 'var(--text-tertiary)' }}
            >
              또는
            </span>
          </div>
        </div>

        {/* Import Section */}
        <div>
          <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--text-secondary)' }}>
            <Upload className="w-4 h-4 inline mr-2" />
            가져오기
          </h3>
          <p className="text-xs mb-3" style={{ color: 'var(--text-tertiary)' }}>
            JSON 파일에서 아이디어를 가져옵니다.
          </p>

          {/* Import Result */}
          {importResult && (
            <div
              className="flex items-center gap-2 p-3 mb-3 rounded-lg"
              style={{
                backgroundColor: importResult.failed > 0
                  ? 'var(--color-warning-50)'
                  : 'var(--color-success-50)',
                color: importResult.failed > 0
                  ? 'var(--color-warning-700)'
                  : 'var(--color-success-700)',
              }}
            >
              <CheckCircle className="w-4 h-4 flex-shrink-0" />
              <span className="text-sm">
                {importResult.success}개 성공
                {importResult.failed > 0 && `, ${importResult.failed}개 실패`}
              </span>
            </div>
          )}

          {/* Import Error */}
          {importError && (
            <div
              className="flex items-center gap-2 p-3 mb-3 rounded-lg"
              style={{ backgroundColor: 'var(--color-error-50)', color: 'var(--color-error-700)' }}
            >
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span className="text-sm">{importError}</span>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleImport}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={importing}
            className="btn btn-primary w-full"
          >
            {importing ? (
              <>
                <span className="spinner" style={{ width: '1rem', height: '1rem' }} />
                <span>가져오는 중...</span>
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                <span>JSON 파일 선택</span>
              </>
            )}
          </button>
        </div>

        {/* Info */}
        <p
          className="text-xs mt-4 p-3 rounded-lg"
          style={{ backgroundColor: 'var(--bg-subtle)', color: 'var(--text-tertiary)' }}
        >
          가져오기 시 기존 아이디어는 유지되며 새로운 아이디어가 추가됩니다.
        </p>
      </div>
    </div>
  );
}
