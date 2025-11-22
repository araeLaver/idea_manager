import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, X, Filter } from 'lucide-react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import type { Idea } from '../types';
import { storage } from '../utils/storage';

export function SearchPage() {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedPriority, setSelectedPriority] = useState('');
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    const storedIdeas = storage.getIdeas();
    setIdeas(storedIdeas);
    
    const uniqueCategories = Array.from(new Set(storedIdeas.map(idea => idea.category)));
    setCategories(uniqueCategories);
  }, []);

  const filteredIdeas = ideas.filter(idea => {
    const matchesSearch = searchTerm === '' || 
      idea.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      idea.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      idea.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = selectedCategory === '' || idea.category === selectedCategory;
    const matchesStatus = selectedStatus === '' || idea.status === selectedStatus;
    const matchesPriority = selectedPriority === '' || idea.priority === selectedPriority;
    
    return matchesSearch && matchesCategory && matchesStatus && matchesPriority;
  });

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setSelectedStatus('');
    setSelectedPriority('');
  };

  const hasActiveFilters = searchTerm || selectedCategory || selectedStatus || selectedPriority;

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">아이디어 검색</h1>
      
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="제목, 설명, 태그로 검색..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              카테고리
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">전체</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              상태
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">전체</option>
              <option value="draft">초안</option>
              <option value="in-progress">진행중</option>
              <option value="completed">완료</option>
              <option value="archived">보관됨</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              우선순위
            </label>
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">전체</option>
              <option value="low">낮음</option>
              <option value="medium">보통</option>
              <option value="high">높음</option>
            </select>
          </div>
        </div>

        {hasActiveFilters && (
          <div className="mt-4 flex justify-between items-center">
            <span className="text-sm text-gray-600">
              {filteredIdeas.length}개의 결과를 찾았습니다
            </span>
            <button
              onClick={clearFilters}
              className="flex items-center px-3 py-1 text-sm text-gray-600 hover:text-gray-900"
            >
              <X className="h-4 w-4 mr-1" />
              필터 초기화
            </button>
          </div>
        )}
      </div>

      {filteredIdeas.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <Filter className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">검색 결과가 없습니다</h3>
          <p className="mt-1 text-sm text-gray-500">다른 검색어나 필터를 시도해보세요.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredIdeas.map((idea) => (
            <Link
              key={idea.id}
              to={`/idea/${idea.id}`}
              className="block bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6"
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-semibold text-gray-900">{idea.title}</h3>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    idea.priority === 'high' ? 'bg-red-100 text-red-800' :
                    idea.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {idea.priority === 'high' ? '높음' : idea.priority === 'medium' ? '보통' : '낮음'}
                  </span>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    idea.status === 'completed' ? 'bg-green-100 text-green-800' :
                    idea.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                    idea.status === 'archived' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {idea.status === 'completed' ? '완료' :
                     idea.status === 'in-progress' ? '진행중' :
                     idea.status === 'archived' ? '보관됨' : '초안'}
                  </span>
                </div>
              </div>
              <p className="text-gray-600 text-sm mb-3 line-clamp-2">{idea.description}</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span>{idea.category}</span>
                  <span>{format(new Date(idea.createdAt), 'yyyy.MM.dd HH:mm', { locale: ko })}</span>
                </div>
                <div className="flex gap-1">
                  {idea.tags.slice(0, 3).map((tag, index) => (
                    <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}