import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { 
  History as HistoryIcon, Calendar, Clock, TrendingUp, 
  Search, Eye, Edit, Grid3X3, List, Tag 
} from 'lucide-react';
import type { Idea } from '../types';
import { useData } from '../contexts/DataContext';

type SortBy = 'created' | 'updated' | 'title' | 'status' | 'priority';
type FilterBy = 'all' | 'draft' | 'in-progress' | 'completed' | 'archived';

export function History() {
  const { ideas, loading } = useData();
  const [sortBy, setSortBy] = useState<SortBy>('updated');
  const [filterBy, setFilterBy] = useState<FilterBy>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [viewMode, setViewMode] = useState<'card' | 'table'>('card');

  const filteredAndSortedIdeas = useMemo(() => {
    let result = [...ideas];

    // 검색 필터링
    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      result = result.filter(idea =>
        idea.title.toLowerCase().includes(lowerSearch) ||
        idea.description.toLowerCase().includes(lowerSearch) ||
        idea.category.toLowerCase().includes(lowerSearch) ||
        idea.tags.some(tag => tag.toLowerCase().includes(lowerSearch))
      );
    }

    // 상태 필터링
    if (filterBy !== 'all') {
      result = result.filter(idea => idea.status === filterBy);
    }

    // 정렬
    result.sort((a, b) => {
      let compareValue = 0;
      
      switch (sortBy) {
        case 'created':
          compareValue = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
        case 'updated':
          compareValue = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
          break;
        case 'title':
          compareValue = a.title.localeCompare(b.title);
          break;
        case 'status':
          compareValue = a.status.localeCompare(b.status);
          break;
        case 'priority':
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          compareValue = priorityOrder[a.priority] - priorityOrder[b.priority];
          break;
      }

      return sortOrder === 'desc' ? -compareValue : compareValue;
    });

    return result;
  }, [ideas, searchTerm, filterBy, sortBy, sortOrder]);

  const getStatusColor = (status: Idea['status']) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'in-progress': return 'bg-info-light text-info';
      case 'completed': return 'bg-success-light text-success';
      case 'archived': return 'bg-warning-light text-warning';
    }
  };

  const getStatusLabel = (status: Idea['status']) => {
    switch (status) {
      case 'draft': return '초안';
      case 'in-progress': return '진행중';
      case 'completed': return '완료';
      case 'archived': return '보관됨';
    }
  };

  const getPriorityColor = (priority: Idea['priority']) => {
    switch (priority) {
      case 'low': return 'text-gray-500';
      case 'medium': return 'text-warning';
      case 'high': return 'text-error';
    }
  };

  const getPriorityLabel = (priority: Idea['priority']) => {
    switch (priority) {
      case 'low': return '낮음';
      case 'medium': return '보통';
      case 'high': return '높음';
    }
  };

  const handleSortChange = (newSortBy: SortBy) => {
    if (sortBy === newSortBy) {
      setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
    } else {
      setSortBy(newSortBy);
      setSortOrder('desc');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto mb-4"></div>
          <p className="text-secondary">히스토리를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="animate-slide-in-up">
            <h1 className="text-4xl font-bold text-primary bg-gradient-hero bg-clip-text text-transparent flex items-center gap-3">
              <HistoryIcon className="h-10 w-10 text-accent" />
              아이디어 히스토리
            </h1>
            <p className="text-secondary mt-2">모든 아이디어의 변경 내역과 전체 기록을 확인해보세요</p>
          </div>
        </div>

        {/* 보기 모드 전환 */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex bg-secondary rounded-xl p-1 shadow-sm border border-primary">
            <button
              onClick={() => setViewMode('card')}
              className={`p-2 rounded-lg transition-all ${
                viewMode === 'card' 
                  ? 'bg-brand text-white shadow-md scale-105' 
                  : 'text-tertiary hover:text-primary hover:bg-hover'
              }`}
              title="카드 보기"
            >
              <Grid3X3 className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-2 rounded-lg transition-all ${
                viewMode === 'table' 
                  ? 'bg-brand text-white shadow-md scale-105' 
                  : 'text-tertiary hover:text-primary hover:bg-hover'
              }`}
              title="테이블 보기"
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* 검색 및 필터 */}
        <div className="grid md:grid-cols-4 gap-4 mb-6 animate-slide-in-up">
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-tertiary h-4 w-4" />
              <input
                type="text"
                placeholder="아이디어 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-primary rounded-lg focus:ring-2 focus:ring-accent focus:border-accent"
              />
            </div>
          </div>

          <div>
            <select
              value={filterBy}
              onChange={(e) => setFilterBy(e.target.value as FilterBy)}
              className="w-full px-3 py-2 border border-primary rounded-lg focus:ring-2 focus:ring-accent focus:border-accent"
            >
              <option value="all">모든 상태</option>
              <option value="draft">초안</option>
              <option value="in-progress">진행중</option>
              <option value="completed">완료</option>
              <option value="archived">보관됨</option>
            </select>
          </div>

          <div>
            <select
              value={sortBy}
              onChange={(e) => handleSortChange(e.target.value as SortBy)}
              className="w-full px-3 py-2 border border-primary rounded-lg focus:ring-2 focus:ring-accent focus:border-accent"
            >
              <option value="updated">최근 수정일</option>
              <option value="created">생성일</option>
              <option value="title">제목</option>
              <option value="status">상태</option>
              <option value="priority">우선순위</option>
            </select>
          </div>
        </div>

        {/* 결과 요약 */}
        <div className="bg-secondary rounded-xl p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-sm text-secondary">
                총 <span className="font-semibold text-accent">{filteredAndSortedIdeas.length}</span>개의 아이디어
              </span>
              <span className="text-xs text-tertiary">
                {sortBy === 'updated' ? '최근 수정일' : 
                 sortBy === 'created' ? '생성일' : 
                 sortBy === 'title' ? '제목' :
                 sortBy === 'status' ? '상태' : '우선순위'} 
                {sortOrder === 'desc' ? ' ↓' : ' ↑'}
              </span>
            </div>
            <div className="text-xs text-tertiary">
              마지막 업데이트: {format(new Date(), 'yyyy.MM.dd HH:mm', { locale: ko })}
            </div>
          </div>
        </div>
      </div>

      {/* 히스토리 목록 */}
      {filteredAndSortedIdeas.length === 0 ? (
        <div className="text-center py-16 card">
          <HistoryIcon className="mx-auto h-16 w-16 text-tertiary mb-4" />
          <h3 className="text-xl font-semibold text-primary mb-2">검색 결과가 없습니다</h3>
          <p className="text-secondary mb-8">다른 검색어나 필터를 시도해보세요.</p>
        </div>
      ) : viewMode === 'card' ? (
        <div className="space-y-4 animate-fade-in">
          {filteredAndSortedIdeas.map((idea, index) => (
            <div 
              key={idea.id} 
              className="card group hover:shadow-lg transition-all duration-300"
              style={{animationDelay: `${index * 50}ms`}}
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <Link 
                      to={`/idea/${idea.id}`}
                      className="text-lg font-semibold text-primary hover:text-accent transition-colors line-clamp-1 group-hover:text-accent"
                    >
                      {idea.title}
                    </Link>
                    <p className="text-secondary text-sm mt-1 line-clamp-2 leading-relaxed">
                      {idea.description}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-2 ml-4">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusColor(idea.status)}`}>
                      {getStatusLabel(idea.status)}
                    </span>
                    <div className="flex items-center gap-1">
                      <TrendingUp className={`h-3 w-3 ${getPriorityColor(idea.priority)}`} />
                      <span className={`text-xs font-medium ${getPriorityColor(idea.priority)}`}>
                        {getPriorityLabel(idea.priority)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="text-xs bg-secondary text-secondary px-2 py-1 rounded font-medium">
                    {idea.category}
                  </span>
                  {idea.tags.slice(0, 3).map((tag, tagIndex) => (
                    <span key={tagIndex} className="text-xs bg-accent text-accent px-2 py-1 rounded font-medium">
                      <Tag className="h-2 w-2 mr-1 inline" />
                      {tag}
                    </span>
                  ))}
                  {idea.tags.length > 3 && (
                    <span className="text-xs bg-tertiary text-tertiary px-2 py-1 rounded">
                      +{idea.tags.length - 3}개 더
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between text-xs text-tertiary">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>생성: {format(new Date(idea.createdAt), 'yyyy.MM.dd HH:mm', { locale: ko })}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>수정: {format(new Date(idea.updatedAt), 'yyyy.MM.dd HH:mm', { locale: ko })}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Link
                      to={`/idea/${idea.id}`}
                      className="btn-ghost p-1 rounded hover:bg-accent hover:text-white transition-all"
                      title="상세보기"
                    >
                      <Eye className="h-4 w-4" />
                    </Link>
                    <Link
                      to={`/edit/${idea.id}`}
                      className="btn-ghost p-1 rounded hover:bg-info hover:text-white transition-all"
                      title="수정"
                    >
                      <Edit className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="table-modern animate-fade-in">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-secondary uppercase tracking-wider">
                    아이디어
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-secondary uppercase tracking-wider">
                    카테고리
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-secondary uppercase tracking-wider">
                    상태
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-secondary uppercase tracking-wider">
                    우선순위
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-secondary uppercase tracking-wider">
                    생성일
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-secondary uppercase tracking-wider">
                    수정일
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-secondary uppercase tracking-wider">
                    작업
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredAndSortedIdeas.map((idea, index) => (
                  <tr 
                    key={idea.id} 
                    className="group animate-slide-in-up" 
                    style={{animationDelay: `${index * 30}ms`}}
                  >
                    <td className="px-6 py-5">
                      <div className="flex items-center">
                        <div className="flex-1 min-w-0">
                          <Link 
                            to={`/idea/${idea.id}`} 
                            className="text-base font-semibold text-primary hover:text-accent transition-colors line-clamp-1"
                          >
                            {idea.title}
                          </Link>
                          <p className="text-sm text-secondary line-clamp-1 mt-1 leading-relaxed">
                            {idea.description}
                          </p>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {idea.tags.slice(0, 2).map((tag, tagIndex) => (
                              <span 
                                key={tagIndex} 
                                className="inline-flex items-center px-2 py-1 bg-accent text-accent rounded text-xs font-medium"
                              >
                                {tag}
                              </span>
                            ))}
                            {idea.tags.length > 2 && (
                              <span className="text-xs text-tertiary bg-secondary px-2 py-1 rounded">
                                +{idea.tags.length - 2}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      <span className="text-sm font-medium text-primary bg-secondary px-3 py-1 rounded-full">
                        {idea.category}
                      </span>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium shadow-sm ${getStatusColor(idea.status)}`}>
                        {getStatusLabel(idea.status)}
                      </span>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      <div className={`flex items-center ${getPriorityColor(idea.priority)}`}>
                        <TrendingUp className="h-4 w-4 mr-2" />
                        <span className="text-sm font-medium">
                          {getPriorityLabel(idea.priority)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap text-sm text-tertiary">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2" />
                        {format(new Date(idea.createdAt), 'yyyy.MM.dd HH:mm', { locale: ko })}
                      </div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap text-sm text-tertiary">
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-2" />
                        {format(new Date(idea.updatedAt), 'yyyy.MM.dd HH:mm', { locale: ko })}
                      </div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Link
                          to={`/idea/${idea.id}`}
                          className="btn-ghost p-2 rounded-lg hover:bg-brand hover:text-white transition-all group/view"
                          title="상세보기"
                        >
                          <Eye className="h-4 w-4 transition-transform group-hover/view:scale-110" />
                        </Link>
                        <Link
                          to={`/edit/${idea.id}`}
                          className="btn-ghost p-2 rounded-lg hover:bg-info hover:text-white transition-all group/edit"
                          title="수정"
                        >
                          <Edit className="h-4 w-4 transition-transform group-hover/edit:scale-110" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}