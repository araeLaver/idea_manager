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
  Eye, Edit, Trash2, Clock
} from 'lucide-react';
import type { Idea } from '../types';
import { useData } from '../contexts/DataContext';
import { Link } from 'react-router-dom';

interface Column {
  id: string;
  title: string;
  status: Idea['status'];
  color: string;
  bgColor: string;
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
      style={{
        ...style,
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border-default)',
        borderRadius: 'var(--radius-md)',
        padding: '0.875rem',
        cursor: isDragging ? 'grabbing' : 'grab',
        opacity: isDragging ? 0.5 : 1
      }}
      className="group"
      {...attributes}
      {...listeners}
    >
      <div className="flex items-start justify-between mb-2">
        <h3 className="text-sm font-semibold line-clamp-2 flex-1 mr-2" style={{ color: 'var(--text-primary)' }}>
          {idea.title}
        </h3>
        <GripVertical className="h-4 w-4 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: 'var(--text-tertiary)' }} />
      </div>

      <p className="text-xs mb-3 line-clamp-2 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
        {idea.description}
      </p>

      <div className="flex flex-wrap gap-1 mb-3">
        {idea.tags.slice(0, 2).map((tag, index) => (
          <span
            key={index}
            className="text-xs px-1.5 py-0.5 rounded"
            style={{
              backgroundColor: 'var(--bg-hover)',
              color: 'var(--text-secondary)'
            }}
          >
            {tag}
          </span>
        ))}
        {idea.tags.length > 2 && (
          <span className="text-xs px-1.5 py-0.5" style={{ color: 'var(--text-tertiary)' }}>
            +{idea.tags.length - 2}
          </span>
        )}
      </div>

      <div className="flex items-center justify-between text-xs mb-3" style={{ color: 'var(--text-tertiary)' }}>
        <div className="flex items-center">
          <Calendar className="h-3 w-3 mr-1" />
          {format(new Date(idea.createdAt), 'MM.dd', { locale: ko })}
        </div>
        <span className="px-1.5 py-0.5 rounded text-xs" style={{
          backgroundColor: 'var(--bg-hover)',
          color: 'var(--text-secondary)'
        }}>
          {idea.category}
        </span>
      </div>

      <div className="flex items-center justify-between pt-2 opacity-0 group-hover:opacity-100 transition-opacity" style={{ borderTop: '1px solid var(--border-default)' }}>
        <div className="flex gap-1">
          <Link
            to={`/idea/${idea.id}`}
            className="p-1 rounded hover:bg-blue-50 transition-colors"
            title="상세보기"
            style={{ color: 'var(--text-tertiary)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <Eye className="h-3 w-3" />
          </Link>
          <Link
            to={`/edit/${idea.id}`}
            className="p-1 rounded hover:bg-blue-50 transition-colors"
            title="수정"
            style={{ color: 'var(--text-tertiary)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <Edit className="h-3 w-3" />
          </Link>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(idea.id);
          }}
          className="p-1 rounded hover:bg-red-50 transition-colors"
          title="삭제"
          style={{ color: 'var(--text-tertiary)' }}
        >
          <Trash2 className="h-3 w-3" />
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
    <div className="flex-1 min-w-80">
      <div className="p-3 h-full rounded-lg" style={{
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border-default)'
      }}>
        <div className="flex items-center justify-between mb-4 pb-3" style={{ borderBottom: '1px solid var(--border-default)' }}>
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{column.title}</h2>
            <span className="text-xs px-2 py-0.5 rounded" style={{
              backgroundColor: 'var(--bg-hover)',
              color: 'var(--text-secondary)'
            }}>
              {column.count}
            </span>
          </div>
          <Link
            to={`/new?status=${column.status}`}
            className="p-1.5 rounded hover:bg-blue-50 transition-colors"
            title={`새 ${column.title} 아이디어 추가`}
            style={{ color: 'var(--text-tertiary)' }}
          >
            <Plus className="h-4 w-4" />
          </Link>
        </div>

        <SortableContextProvider items={ideas.map(idea => idea.id)}>
          <div className="space-y-2 min-h-96">
            {ideas.map((idea) => (
              <KanbanCard
                key={idea.id}
                idea={idea}
                onDelete={onDelete}
              />
            ))}
            {ideas.length === 0 && (
              <div className="text-center py-12">
                <p className="text-xs mb-3" style={{ color: 'var(--text-secondary)' }}>
                  아직 {column.title} 아이디어가 없습니다
                </p>
                <Link
                  to={`/new?status=${column.status}`}
                  className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded transition-colors"
                  style={{
                    backgroundColor: 'var(--bg-hover)',
                    color: 'var(--text-primary)'
                  }}
                >
                  <Plus className="h-3 w-3" />
                  추가하기
                </Link>
              </div>
            )}
          </div>
        </SortableContextProvider>
      </div>
    </div>
  );
}

export function KanbanBoard() {
  const { ideas, loading, deleteIdea, updateIdea } = useData();
  const [activeId, setActiveId] = useState<string | null>(null);
  const sensors = useSensors(useSensor(PointerSensor));

  const columns: Column[] = [
    {
      id: 'draft',
      title: '아이디어 초안',
      status: 'draft',
      color: 'text-gray-600',
      bgColor: 'bg-gray-400',
      count: ideas.filter(idea => idea.status === 'draft').length,
    },
    {
      id: 'in-progress',
      title: '개발 진행중',
      status: 'in-progress',
      color: 'text-info',
      bgColor: 'bg-info',
      count: ideas.filter(idea => idea.status === 'in-progress').length,
    },
    {
      id: 'completed',
      title: '완료됨',
      status: 'completed',
      color: 'text-success',
      bgColor: 'bg-success',
      count: ideas.filter(idea => idea.status === 'completed').length,
    },
    {
      id: 'archived',
      title: '보관됨',
      status: 'archived',
      color: 'text-warning',
      bgColor: 'bg-warning',
      count: ideas.filter(idea => idea.status === 'archived').length,
    },
  ];

  const handleDelete = async (id: string) => {
    if (confirm('이 아이디어를 삭제하시겠습니까?')) {
      try {
        await deleteIdea(id);
      } catch (error) {
        console.error('Failed to delete idea:', error);
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

    const activeId = active.id as string;
    const overId = over.id as string;

    // Find the active idea
    const activeIdea = ideas.find(idea => idea.id === activeId);
    if (!activeIdea) return;

    // Determine the new status based on where it was dropped
    let newStatus: Idea['status'] = activeIdea.status;

    // Check if dropped on a column
    const column = columns.find(col => col.id === overId);
    if (column) {
      newStatus = column.status;
    } else {
      // Check if dropped on another idea - get that idea's status
      const overIdea = ideas.find(idea => idea.id === overId);
      if (overIdea) {
        newStatus = overIdea.status;
      }
    }

    // Update the idea's status if it changed
    if (newStatus !== activeIdea.status) {
      updateIdea(activeId, { status: newStatus }).catch(error => {
        console.error('Failed to update idea status:', error);
      });
    }
  };

  const activeIdea = activeId ? ideas.find(idea => idea.id === activeId) : null;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto mb-4"></div>
          <p className="text-secondary">아이디어를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
              칸반 보드
            </h1>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>드래그 앤 드롭으로 아이디어 상태를 관리하세요</p>
          </div>

          <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-tertiary)' }}>
            <Clock className="h-4 w-4" />
            <span>총 {ideas.length}개</span>
          </div>
        </div>
      </div>

      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-4 overflow-x-auto pb-6">
          {columns.map((column) => {
            const columnIdeas = ideas.filter(idea => idea.status === column.status);
            return (
              <SortableContext
                key={column.id}
                items={columnIdeas.map(idea => idea.id)}
                strategy={verticalListSortingStrategy}
              >
                <KanbanColumn
                  column={{ ...column, count: columnIdeas.length }}
                  ideas={columnIdeas}
                  onDelete={handleDelete}
                />
              </SortableContext>
            );
          })}
        </div>

        <DragOverlay>
          {activeIdea && (
            <div className="card opacity-95 scale-105 shadow-2xl rotate-3">
              <div className="p-4">
                <h3 className="text-base font-semibold text-primary mb-2">
                  {activeIdea.title}
                </h3>
                <p className="text-secondary text-sm line-clamp-2">
                  {activeIdea.description}
                </p>
              </div>
            </div>
          )}
        </DragOverlay>
      </DndContext>
    </div>
  );
}