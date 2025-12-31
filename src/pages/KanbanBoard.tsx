import { useState } from 'react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
  SortableContext as SortableContextProvider,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import {
  Calendar, Plus, GripVertical,
  Eye, Edit, Trash2, LayoutGrid
} from 'lucide-react';
import type { Idea } from '../types';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';

interface Column {
  id: string;
  title: string;
  status: Idea['status'];
  gradient: string;
  count: number;
}

interface KanbanCardProps {
  idea: Idea;
  onDelete: (id: string) => void;
}

function KanbanCard({ idea, onDelete }: KanbanCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: idea.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`kanban-card ${isDragging ? 'opacity-50 rotate-2' : ''}`}
      {...attributes}
      {...listeners}
    >
      <div className="flex items-start justify-between mb-2">
        <h3 className="text-sm font-semibold line-clamp-2 flex-1 mr-2" style={{ color: 'var(--text-primary)' }}>
          {idea.title}
        </h3>
        <GripVertical className="w-4 h-4 flex-shrink-0 opacity-0 group-hover:opacity-100" style={{ color: 'var(--text-tertiary)' }} />
      </div>

      <p className="text-xs mb-3 line-clamp-2 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
        {idea.description}
      </p>

      <div className="flex flex-wrap gap-1 mb-3">
        {idea.tags.slice(0, 2).map((tag, index) => (
          <span key={index} className="tag text-xs">{tag}</span>
        ))}
        {idea.tags.length > 2 && (
          <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>+{idea.tags.length - 2}</span>
        )}
      </div>

      <div className="flex items-center justify-between text-xs mb-3" style={{ color: 'var(--text-tertiary)' }}>
        <div className="flex items-center">
          <Calendar className="w-3 h-3 mr-1" />
          {format(new Date(idea.createdAt), 'MM.dd', { locale: ko })}
        </div>
        <span className="tag text-xs">{idea.category}</span>
      </div>

      <div
        className="flex items-center justify-between pt-2 opacity-0 group-hover:opacity-100 transition-opacity"
        style={{ borderTop: '1px solid var(--border-default)' }}
      >
        <div className="flex gap-1">
          <Link
            to={`/idea/${idea.id}`}
            className="icon-btn"
            style={{ width: '1.5rem', height: '1.5rem' }}
            onClick={(e) => e.stopPropagation()}
          >
            <Eye className="w-3 h-3" />
          </Link>
          <Link
            to={`/edit/${idea.id}`}
            className="icon-btn"
            style={{ width: '1.5rem', height: '1.5rem' }}
            onClick={(e) => e.stopPropagation()}
          >
            <Edit className="w-3 h-3" />
          </Link>
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(idea.id); }}
          className="icon-btn"
          style={{ width: '1.5rem', height: '1.5rem', color: 'var(--color-error-500)' }}
        >
          <Trash2 className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}

interface KanbanColumnProps {
  column: Column;
  ideas: Idea[];
  onDelete: (id: string) => void;
}

function KanbanColumn({ column, ideas, onDelete }: KanbanColumnProps) {
  return (
    <div className="kanban-column">
      <div className="kanban-column-header">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full" style={{ background: column.gradient }} />
          <span className="text-sm" style={{ color: 'var(--text-primary)' }}>{column.title}</span>
          <span
            className="text-xs px-1.5 py-0.5 rounded"
            style={{ backgroundColor: 'var(--bg-subtle)', color: 'var(--text-secondary)' }}
          >
            {column.count}
          </span>
        </div>
        <Link to={`/new?status=${column.status}`} className="icon-btn" style={{ width: '1.5rem', height: '1.5rem' }}>
          <Plus className="w-4 h-4" />
        </Link>
      </div>

      <SortableContextProvider items={ideas.map(idea => idea.id)}>
        <div className="space-y-3 min-h-96">
          {ideas.map((idea) => (
            <KanbanCard key={idea.id} idea={idea} onDelete={onDelete} />
          ))}
          {ideas.length === 0 && (
            <div className="text-center py-8">
              <p className="text-xs mb-3" style={{ color: 'var(--text-tertiary)' }}>
                아직 {column.title} 아이디어가 없습니다
              </p>
              <Link to={`/new?status=${column.status}`} className="btn btn-secondary btn-sm">
                <Plus className="w-3 h-3" />
                추가하기
              </Link>
            </div>
          )}
        </div>
      </SortableContextProvider>
    </div>
  );
}

export function KanbanBoard() {
  const { ideas, loading, deleteIdea, updateIdea } = useData();
  const { isGuest } = useAuth();
  const [activeId, setActiveId] = useState<string | null>(null);
  const sensors = useSensors(useSensor(PointerSensor));

  const columns: Column[] = [
    { id: 'draft', title: '아이디어 초안', status: 'draft', gradient: 'linear-gradient(135deg, #64748b, #94a3b8)', count: 0 },
    { id: 'in-progress', title: '개발 진행중', status: 'in-progress', gradient: 'linear-gradient(135deg, #3b82f6, #06b6d4)', count: 0 },
    { id: 'completed', title: '완료됨', status: 'completed', gradient: 'linear-gradient(135deg, #22c55e, #14b8a6)', count: 0 },
    { id: 'archived', title: '보관됨', status: 'archived', gradient: 'linear-gradient(135deg, #f59e0b, #f97316)', count: 0 },
  ];

  const handleDelete = async (id: string) => {
    if (confirm('이 아이디어를 삭제하시겠습니까?')) {
      try {
        await deleteIdea(id);
      } catch {
        alert('아이디어 삭제에 실패했습니다.');
      }
    }
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const activeIdea = ideas.find(idea => idea.id === active.id);
    if (!activeIdea) return;

    let newStatus: Idea['status'] = activeIdea.status;
    const column = columns.find(col => col.id === over.id);
    if (column) {
      newStatus = column.status;
    } else {
      const overIdea = ideas.find(idea => idea.id === over.id);
      if (overIdea) newStatus = overIdea.status;
    }

    if (newStatus !== activeIdea.status) {
      updateIdea(active.id as string, { status: newStatus }).catch(() => {
        alert('상태 변경에 실패했습니다.');
      });
    }
  };

  const activeIdea = activeId ? ideas.find(idea => idea.id === activeId) : null;

  if (loading) {
    return (
      <div className="flex items-center justify-center" style={{ height: '400px' }}>
        <div className="text-center">
          <div className="spinner mx-auto mb-4" />
          <p style={{ color: 'var(--text-secondary)' }}>아이디어를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="section-icon">
                <LayoutGrid className="w-5 h-5" />
              </div>
              <h1 className="text-3xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
                칸반 보드
              </h1>
              {isGuest && (
                <span className="badge badge-warning text-xs">게스트 모드</span>
              )}
            </div>
            <p className="text-sm ml-12" style={{ color: 'var(--text-secondary)' }}>
              드래그 앤 드롭으로 아이디어 상태를 관리하세요
              {isGuest && ' (브라우저에 저장됩니다)'}
            </p>
          </div>
          <div className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
            총 {ideas.length}개
          </div>
        </div>
      </div>

      <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="flex gap-4 overflow-x-auto pb-6">
          {columns.map((column) => {
            const columnIdeas = ideas.filter(idea => idea.status === column.status);
            return (
              <SortableContext key={column.id} items={columnIdeas.map(idea => idea.id)} strategy={verticalListSortingStrategy}>
                <KanbanColumn column={{ ...column, count: columnIdeas.length }} ideas={columnIdeas} onDelete={handleDelete} />
              </SortableContext>
            );
          })}
        </div>

        <DragOverlay>
          {activeIdea && (
            <div className="card p-4 shadow-xl rotate-3 scale-105">
              <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>{activeIdea.title}</h3>
              <p className="text-sm line-clamp-2" style={{ color: 'var(--text-secondary)' }}>{activeIdea.description}</p>
            </div>
          )}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
