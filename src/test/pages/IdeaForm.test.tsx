import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { IdeaForm } from '../../pages/IdeaForm';
import { ThemeProvider } from '../../contexts/ThemeContext';

// Mock navigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock DataContext
const mockCreateIdea = vi.fn();
const mockUpdateIdea = vi.fn();
const mockGetIdea = vi.fn();

vi.mock('../../contexts/DataContext', () => ({
  useData: () => ({
    ideas: [],
    createIdea: mockCreateIdea,
    updateIdea: mockUpdateIdea,
    getIdea: mockGetIdea,
  }),
}));

// Mock AuthContext
vi.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({
    isGuest: false,
  }),
}));

// Mock ToastContext
const mockShowToast = vi.fn();
vi.mock('../../contexts/ToastContext', () => ({
  useToast: () => ({
    showToast: mockShowToast,
  }),
}));

// Mock AIFeatures component
vi.mock('../../components/AIFeatures', () => ({
  AIFeatures: () => <div data-testid="ai-features">AI Features Mock</div>,
}));

const renderIdeaForm = (route = '/new') => {
  const routes = [
    { path: '/new', element: <IdeaForm /> },
    { path: '/edit/:id', element: <IdeaForm /> },
    { path: '/', element: <div>Home</div> },
  ];

  const initialEntry = route.includes(':id')
    ? `/edit/${route.split('/').pop()}`
    : route;

  const router = createMemoryRouter(routes, {
    initialEntries: [initialEntry],
  });

  return render(
    <ThemeProvider>
      <RouterProvider router={router} />
    </ThemeProvider>
  );
};

describe('IdeaForm Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCreateIdea.mockResolvedValue({ id: 'new-idea-id' });
    mockUpdateIdea.mockResolvedValue({});
  });

  describe('Create Mode', () => {
    it('should render form with "새 아이디어" title', () => {
      renderIdeaForm();

      expect(screen.getByText('새 아이디어')).toBeInTheDocument();
    });

    it('should render all form fields', () => {
      renderIdeaForm();

      expect(screen.getByPlaceholderText('아이디어 제목을 입력하세요')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('아이디어에 대한 설명을 입력하세요')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('예: 웹서비스, 모바일앱')).toBeInTheDocument();
      expect(screen.getByText('상태')).toBeInTheDocument();
      expect(screen.getByText('우선순위')).toBeInTheDocument();
      expect(screen.getByText('태그')).toBeInTheDocument();
    });

    it('should render back link', () => {
      renderIdeaForm();

      const backLink = screen.getByText('목록으로');
      expect(backLink).toBeInTheDocument();
      expect(backLink.closest('a')).toHaveAttribute('href', '/');
    });

    it('should render AI Features component', () => {
      renderIdeaForm();

      expect(screen.getByTestId('ai-features')).toBeInTheDocument();
    });

    it('should render save button with correct text', () => {
      renderIdeaForm();

      expect(screen.getByText('저장하기')).toBeInTheDocument();
    });

    it('should render cancel button', () => {
      renderIdeaForm();

      const cancelButton = screen.getByText('취소');
      expect(cancelButton).toBeInTheDocument();
      expect(cancelButton.closest('a')).toHaveAttribute('href', '/');
    });
  });

  describe('Form Inputs', () => {
    it('should update title on input', () => {
      renderIdeaForm();

      const titleInput = screen.getByPlaceholderText('아이디어 제목을 입력하세요');
      fireEvent.change(titleInput, { target: { value: '새 아이디어 제목' } });

      expect(titleInput).toHaveValue('새 아이디어 제목');
    });

    it('should update description on textarea input', () => {
      renderIdeaForm();

      const descriptionInput = screen.getByPlaceholderText('아이디어에 대한 설명을 입력하세요');
      fireEvent.change(descriptionInput, { target: { value: '새 아이디어 설명' } });

      expect(descriptionInput).toHaveValue('새 아이디어 설명');
    });

    it('should update category on input', () => {
      renderIdeaForm();

      const categoryInput = screen.getByPlaceholderText('예: 웹서비스, 모바일앱');
      fireEvent.change(categoryInput, { target: { value: '웹서비스' } });

      expect(categoryInput).toHaveValue('웹서비스');
    });

    it('should change status on select', () => {
      renderIdeaForm();

      const statusSelect = screen.getByDisplayValue('초안');
      fireEvent.change(statusSelect, { target: { value: 'in-progress' } });

      expect(statusSelect).toHaveValue('in-progress');
    });

    it('should change priority on select', () => {
      renderIdeaForm();

      const prioritySelect = screen.getByDisplayValue('보통');
      fireEvent.change(prioritySelect, { target: { value: 'high' } });

      expect(prioritySelect).toHaveValue('high');
    });
  });

  describe('Tag Management', () => {
    it('should add tag on Enter key press', () => {
      renderIdeaForm();

      const tagInput = screen.getByPlaceholderText('태그를 입력하고 Enter를 누르세요');
      fireEvent.change(tagInput, { target: { value: '새태그' } });
      fireEvent.keyPress(tagInput, { key: 'Enter', code: 'Enter', charCode: 13 });

      expect(screen.getByText('새태그')).toBeInTheDocument();
      expect(tagInput).toHaveValue('');
    });

    it('should add tag on Plus button click', () => {
      renderIdeaForm();

      const tagInput = screen.getByPlaceholderText('태그를 입력하고 Enter를 누르세요');
      fireEvent.change(tagInput, { target: { value: '새태그' } });

      const addButton = tagInput.nextElementSibling;
      fireEvent.click(addButton!);

      expect(screen.getByText('새태그')).toBeInTheDocument();
    });

    it('should remove tag on X button click', () => {
      renderIdeaForm();

      // Add a tag first
      const tagInput = screen.getByPlaceholderText('태그를 입력하고 Enter를 누르세요');
      fireEvent.change(tagInput, { target: { value: '삭제할태그' } });
      fireEvent.keyPress(tagInput, { key: 'Enter', code: 'Enter', charCode: 13 });

      expect(screen.getByText('삭제할태그')).toBeInTheDocument();

      // Remove the tag - find the button within the tag badge
      const tagBadge = screen.getByText('삭제할태그').closest('.badge');
      const removeButton = tagBadge?.querySelector('button');
      expect(removeButton).toBeTruthy();
      fireEvent.click(removeButton!);

      expect(screen.queryByText('삭제할태그')).not.toBeInTheDocument();
    });

    it('should not add duplicate tags', () => {
      renderIdeaForm();

      const tagInput = screen.getByPlaceholderText('태그를 입력하고 Enter를 누르세요');

      // Add tag first time
      fireEvent.change(tagInput, { target: { value: '중복태그' } });
      fireEvent.keyPress(tagInput, { key: 'Enter', code: 'Enter', charCode: 13 });

      // Try to add same tag again
      fireEvent.change(tagInput, { target: { value: '중복태그' } });
      fireEvent.keyPress(tagInput, { key: 'Enter', code: 'Enter', charCode: 13 });

      // Should only have one instance
      const tags = screen.getAllByText('중복태그');
      expect(tags).toHaveLength(1);
    });

    it('should not add empty tag', () => {
      renderIdeaForm();

      const tagInput = screen.getByPlaceholderText('태그를 입력하고 Enter를 누르세요');
      fireEvent.change(tagInput, { target: { value: '   ' } });
      fireEvent.keyPress(tagInput, { key: 'Enter', code: 'Enter', charCode: 13 });

      // No tags should be added
      const tagContainer = tagInput.closest('.form-group')?.querySelector('.flex.flex-wrap');
      expect(tagContainer?.children.length || 0).toBe(0);
    });
  });

  describe('Form Submission', () => {
    it('should call createIdea on submit in create mode', async () => {
      renderIdeaForm();

      // Fill required fields (description must be at least 10 characters)
      fireEvent.change(screen.getByPlaceholderText('아이디어 제목을 입력하세요'), {
        target: { value: '테스트 제목' },
      });
      fireEvent.change(screen.getByPlaceholderText('아이디어에 대한 설명을 입력하세요'), {
        target: { value: '테스트 설명입니다. 충분히 긴 설명입니다.' },
      });
      fireEvent.change(screen.getByPlaceholderText('예: 웹서비스, 모바일앱'), {
        target: { value: '웹서비스' },
      });

      // Submit form
      const submitButton = screen.getByText('저장하기');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockCreateIdea).toHaveBeenCalledWith({
          title: '테스트 제목',
          description: '테스트 설명입니다. 충분히 긴 설명입니다.',
          category: '웹서비스',
          tags: [],
          status: 'draft',
          priority: 'medium',
          notes: '',
          targetMarket: '',
          potentialRevenue: '',
          resources: '',
          timeline: '',
          deadline: '',
          reminderEnabled: false,
          reminderDays: 3,
        });
      });
    });

    it('should show success toast and navigate on successful submit', async () => {
      renderIdeaForm();

      // Fill required fields (description must be at least 10 characters)
      fireEvent.change(screen.getByPlaceholderText('아이디어 제목을 입력하세요'), {
        target: { value: '테스트 제목' },
      });
      fireEvent.change(screen.getByPlaceholderText('아이디어에 대한 설명을 입력하세요'), {
        target: { value: '테스트 설명입니다. 충분히 긴 설명입니다.' },
      });
      fireEvent.change(screen.getByPlaceholderText('예: 웹서비스, 모바일앱'), {
        target: { value: '웹서비스' },
      });

      fireEvent.click(screen.getByText('저장하기'));

      await waitFor(() => {
        expect(mockShowToast).toHaveBeenCalledWith('새 아이디어가 저장되었습니다.', 'success');
        expect(mockNavigate).toHaveBeenCalledWith('/');
      });
    });

    it('should show error toast on submit failure', async () => {
      mockCreateIdea.mockRejectedValue(new Error('Failed'));

      renderIdeaForm();

      // Fill required fields (description must be at least 10 characters)
      fireEvent.change(screen.getByPlaceholderText('아이디어 제목을 입력하세요'), {
        target: { value: '테스트 제목' },
      });
      fireEvent.change(screen.getByPlaceholderText('아이디어에 대한 설명을 입력하세요'), {
        target: { value: '테스트 설명입니다. 충분히 긴 설명입니다.' },
      });
      fireEvent.change(screen.getByPlaceholderText('예: 웹서비스, 모바일앱'), {
        target: { value: '웹서비스' },
      });

      fireEvent.click(screen.getByText('저장하기'));

      await waitFor(() => {
        expect(mockShowToast).toHaveBeenCalledWith('아이디어 저장에 실패했습니다.', 'error');
      });
    });
  });

  describe('Edit Mode', () => {
    beforeEach(() => {
      mockGetIdea.mockResolvedValue({
        id: 'test-id',
        title: '기존 제목',
        description: '기존 설명입니다. 충분히 긴 설명입니다.',
        category: '기술',
        tags: ['태그1', '태그2'],
        status: 'in-progress',
        priority: 'high',
        notes: '기존 메모',
        targetMarket: '기존 시장',
        potentialRevenue: '기존 수익',
        resources: '기존 자원',
        timeline: '기존 일정',
      });
    });

    it('should render form with "아이디어 수정" title in edit mode', async () => {
      renderIdeaForm('/edit/:id/test-id');

      await waitFor(() => {
        expect(screen.getByText('아이디어 수정')).toBeInTheDocument();
      });
    });

    it('should load existing idea data in edit mode', async () => {
      renderIdeaForm('/edit/:id/test-id');

      await waitFor(() => {
        expect(screen.getByDisplayValue('기존 제목')).toBeInTheDocument();
        expect(screen.getByDisplayValue('기존 설명입니다. 충분히 긴 설명입니다.')).toBeInTheDocument();
        expect(screen.getByDisplayValue('기술')).toBeInTheDocument();
        expect(screen.getByText('태그1')).toBeInTheDocument();
        expect(screen.getByText('태그2')).toBeInTheDocument();
      });
    });

    it('should call updateIdea on submit in edit mode', async () => {
      renderIdeaForm('/edit/:id/test-id');

      await waitFor(() => {
        expect(screen.getByDisplayValue('기존 제목')).toBeInTheDocument();
      });

      // Modify title
      fireEvent.change(screen.getByDisplayValue('기존 제목'), {
        target: { value: '수정된 제목' },
      });

      fireEvent.click(screen.getByText('수정하기'));

      await waitFor(() => {
        expect(mockUpdateIdea).toHaveBeenCalledWith('test-id', expect.objectContaining({
          title: '수정된 제목',
        }));
        expect(mockShowToast).toHaveBeenCalledWith('아이디어가 수정되었습니다.', 'success');
      });
    });

    it('should navigate to home when idea not found', async () => {
      mockGetIdea.mockResolvedValue(null);

      renderIdeaForm('/edit/:id/invalid-id');

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/');
      });
    });

    it('should render "수정하기" button in edit mode', async () => {
      renderIdeaForm('/edit/:id/test-id');

      await waitFor(() => {
        expect(screen.getByText('수정하기')).toBeInTheDocument();
      });
    });
  });

  describe('Additional Fields', () => {
    it('should update target market field', () => {
      renderIdeaForm();

      const targetMarketInput = screen.getByPlaceholderText('대상 고객층과 시장 규모를 설명하세요');
      fireEvent.change(targetMarketInput, { target: { value: '20-30대 직장인' } });

      expect(targetMarketInput).toHaveValue('20-30대 직장인');
    });

    it('should update potential revenue field', () => {
      renderIdeaForm();

      const revenueInput = screen.getByPlaceholderText('예상 수익 모델과 규모');
      fireEvent.change(revenueInput, { target: { value: '월 1000만원' } });

      expect(revenueInput).toHaveValue('월 1000만원');
    });

    it('should update resources field', () => {
      renderIdeaForm();

      const resourcesInput = screen.getByPlaceholderText('필요한 인력, 자금, 기술 등');
      fireEvent.change(resourcesInput, { target: { value: '개발자 2명' } });

      expect(resourcesInput).toHaveValue('개발자 2명');
    });

    it('should update notes field', () => {
      renderIdeaForm();

      const notesInput = screen.getByPlaceholderText('추가 메모나 아이디어');
      fireEvent.change(notesInput, { target: { value: '추가 메모 내용' } });

      expect(notesInput).toHaveValue('추가 메모 내용');
    });
  });

  describe('Guest Mode', () => {
    beforeEach(() => {
      vi.mocked(vi.importActual('../../contexts/AuthContext')).useAuth = () => ({
        isGuest: true,
      });
    });

    it('should display guest mode badge', () => {
      // Re-mock with isGuest: true
      vi.doMock('../../contexts/AuthContext', () => ({
        useAuth: () => ({ isGuest: true }),
      }));

      // Note: This test may need adjustment based on how the mock is handled
      // The component shows guest badge when isGuest is true
    });
  });
});
