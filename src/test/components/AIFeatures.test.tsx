import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AIFeatures } from '../../components/AIFeatures';
import { aiService } from '../../services/aiService';

// Mock aiService
vi.mock('../../services/aiService', () => ({
  aiService: {
    isAvailable: vi.fn(() => true),
    categorizeIdea: vi.fn(),
    suggestTags: vi.fn(),
    findSimilarIdeas: vi.fn(),
    generateSWOT: vi.fn(),
    improveIdea: vi.fn(),
  },
}));

// Mock DataContext
vi.mock('../../contexts/DataContext', () => ({
  useData: () => ({
    ideas: [
      {
        id: '1',
        title: '기존 아이디어',
        description: '기존 설명',
        tags: ['테스트'],
      },
    ],
  }),
}));

describe('AIFeatures Component', () => {
  const mockProps = {
    title: '테스트 제목',
    description: '테스트 설명',
    tags: ['태그1'],
    onCategorySelect: vi.fn(),
    onTagsSelect: vi.fn(),
    onTitleChange: vi.fn(),
    onDescriptionChange: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (aiService.isAvailable as ReturnType<typeof vi.fn>).mockReturnValue(true);
  });

  it('should render nothing when AI service is not available', () => {
    (aiService.isAvailable as ReturnType<typeof vi.fn>).mockReturnValue(false);

    const { container } = render(<AIFeatures {...mockProps} />);

    expect(container.firstChild).toBeNull();
  });

  it('should render AI assistant section when available', () => {
    render(<AIFeatures {...mockProps} />);

    expect(screen.getByText('AI 어시스턴트')).toBeInTheDocument();
    expect(screen.getByText('카테고리 제안')).toBeInTheDocument();
    expect(screen.getByText('태그 제안')).toBeInTheDocument();
  });

  it('should call categorizeIdea when suggest category button is clicked', async () => {
    (aiService.categorizeIdea as ReturnType<typeof vi.fn>).mockResolvedValue({
      category: '기술',
      confidence: 0.85,
    });

    render(<AIFeatures {...mockProps} />);

    // Find and click category suggest button (first Wand2 icon button)
    const buttons = screen.getAllByRole('button');
    const categoryButton = buttons.find(btn =>
      btn.closest('.p-4')?.textContent?.includes('카테고리 제안')
    );

    expect(categoryButton).toBeTruthy();
    fireEvent.click(categoryButton!);

    await waitFor(() => {
      expect(aiService.categorizeIdea).toHaveBeenCalledWith('테스트 제목', '테스트 설명');
    });
  });

  it('should display category prediction result and apply on click', async () => {
    (aiService.categorizeIdea as ReturnType<typeof vi.fn>).mockResolvedValue({
      category: '기술',
      confidence: 0.85,
    });

    render(<AIFeatures {...mockProps} />);

    // Trigger category suggestion
    const buttons = screen.getAllByRole('button');
    const categoryButton = buttons.find(btn =>
      btn.closest('.p-4')?.textContent?.includes('카테고리 제안')
    );
    fireEvent.click(categoryButton!);

    await waitFor(() => {
      expect(screen.getByText('기술')).toBeInTheDocument();
      expect(screen.getByText('확신도: 85%')).toBeInTheDocument();
    });

    // Click apply button
    const applyButton = screen.getByText('적용');
    fireEvent.click(applyButton);

    expect(mockProps.onCategorySelect).toHaveBeenCalledWith('기술');
  });

  it('should call suggestTags when suggest tags button is clicked', async () => {
    (aiService.suggestTags as ReturnType<typeof vi.fn>).mockResolvedValue({
      tags: ['AI', '자동화', '기술'],
    });

    render(<AIFeatures {...mockProps} />);

    const buttons = screen.getAllByRole('button');
    const tagButton = buttons.find(btn =>
      btn.closest('.p-4')?.textContent?.includes('태그 제안') &&
      !btn.closest('.p-4')?.textContent?.includes('카테고리')
    );

    expect(tagButton).toBeTruthy();
    fireEvent.click(tagButton!);

    await waitFor(() => {
      expect(aiService.suggestTags).toHaveBeenCalledWith('테스트 제목', '테스트 설명');
    });
  });

  it('should display tag suggestions and select individual tags', async () => {
    (aiService.suggestTags as ReturnType<typeof vi.fn>).mockResolvedValue({
      tags: ['AI', '자동화'],
    });

    render(<AIFeatures {...mockProps} />);

    // Trigger tag suggestion
    const buttons = screen.getAllByRole('button');
    const tagButton = buttons.find(btn =>
      btn.closest('.p-4')?.textContent?.includes('태그 제안') &&
      !btn.closest('.p-4')?.textContent?.includes('카테고리')
    );
    fireEvent.click(tagButton!);

    await waitFor(() => {
      expect(screen.getByText('AI')).toBeInTheDocument();
      expect(screen.getByText('자동화')).toBeInTheDocument();
    });

    // Click individual tag
    fireEvent.click(screen.getByText('AI'));
    expect(mockProps.onTagsSelect).toHaveBeenCalledWith(['AI']);
  });

  it('should apply all tags when "모든 태그 적용" is clicked', async () => {
    (aiService.suggestTags as ReturnType<typeof vi.fn>).mockResolvedValue({
      tags: ['AI', '자동화'],
    });

    render(<AIFeatures {...mockProps} />);

    // Trigger tag suggestion
    const buttons = screen.getAllByRole('button');
    const tagButton = buttons.find(btn =>
      btn.closest('.p-4')?.textContent?.includes('태그 제안') &&
      !btn.closest('.p-4')?.textContent?.includes('카테고리')
    );
    fireEvent.click(tagButton!);

    await waitFor(() => {
      expect(screen.getByText('모든 태그 적용')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('모든 태그 적용'));
    expect(mockProps.onTagsSelect).toHaveBeenCalledWith(['AI', '자동화']);
  });

  it('should toggle advanced features section', () => {
    render(<AIFeatures {...mockProps} />);

    // Initially advanced features are hidden
    expect(screen.queryByText('유사 아이디어 찾기')).not.toBeInTheDocument();
    expect(screen.queryByText('SWOT 분석')).not.toBeInTheDocument();

    // Click toggle button
    const toggleButton = screen.getByText('고급 AI 분석 보기');
    fireEvent.click(toggleButton);

    // Now advanced features should be visible
    expect(screen.getByText('유사 아이디어 찾기')).toBeInTheDocument();
    expect(screen.getByText('SWOT 분석')).toBeInTheDocument();

    // Click toggle again to hide
    fireEvent.click(screen.getByText('고급 AI 분석 숨기기'));
    expect(screen.queryByText('유사 아이디어 찾기')).not.toBeInTheDocument();
  });

  it('should disable buttons when title and description are empty', () => {
    render(<AIFeatures {...mockProps} title="" description="" />);

    // Find the category suggest button
    const buttons = screen.getAllByRole('button');
    const categoryButton = buttons.find(btn =>
      btn.closest('.p-4')?.textContent?.includes('카테고리 제안')
    );

    // Button should be disabled when title and description are empty
    expect(categoryButton).toBeDisabled();
  });

  it('should display improvement suggestions section', () => {
    render(<AIFeatures {...mockProps} />);

    expect(screen.getByText('개선 제안')).toBeInTheDocument();
  });

  it('should call improveIdea and display suggestions', async () => {
    (aiService.improveIdea as ReturnType<typeof vi.fn>).mockResolvedValue({
      improvedTitle: '더 나은 아이디어 제목입니다',
      improvedDescription: '더 상세한 아이디어 설명입니다',
      suggestions: ['제안 포인트 1', '제안 포인트 2'],
    });

    render(<AIFeatures {...mockProps} />);

    // Find improvement button
    const buttons = screen.getAllByRole('button');
    const improveButton = buttons.find(btn =>
      btn.closest('.p-4')?.textContent?.includes('개선 제안')
    );
    fireEvent.click(improveButton!);

    await waitFor(() => {
      expect(aiService.improveIdea).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(screen.getByText('더 나은 아이디어 제목입니다')).toBeInTheDocument();
      expect(screen.getByText('더 상세한 아이디어 설명입니다')).toBeInTheDocument();
      expect(screen.getByText('제안 포인트 1')).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it('should apply improved title when check button is clicked', async () => {
    (aiService.improveIdea as ReturnType<typeof vi.fn>).mockResolvedValue({
      improvedTitle: '새롭게 개선된 제목',
      suggestions: [],
    });

    render(<AIFeatures {...mockProps} />);

    const buttons = screen.getAllByRole('button');
    const improveButton = buttons.find(btn =>
      btn.closest('.p-4')?.textContent?.includes('개선 제안')
    );
    fireEvent.click(improveButton!);

    await waitFor(() => {
      expect(screen.getByText('새롭게 개선된 제목')).toBeInTheDocument();
    });

    // Find and click the apply button (Check icon button)
    const applyButtons = screen.getAllByTitle('적용');
    fireEvent.click(applyButtons[0]);

    expect(mockProps.onTitleChange).toHaveBeenCalledWith('새롭게 개선된 제목');
  });

  it('should find similar ideas when button is clicked', async () => {
    (aiService.findSimilarIdeas as ReturnType<typeof vi.fn>).mockResolvedValue([
      {
        id: '1',
        title: '유사한 아이디어 항목',
        similarity: 75,
        matchedKeywords: ['키워드1'],
      },
    ]);

    render(<AIFeatures {...mockProps} />);

    // Open advanced section
    const toggleButton = screen.getByText(/고급 AI 분석/);
    fireEvent.click(toggleButton);

    await waitFor(() => {
      expect(screen.getByText('유사 아이디어 찾기')).toBeInTheDocument();
    });

    // Click find similar button
    const advancedSection = screen.getByText('유사 아이디어 찾기').closest('.p-4');
    const findButton = advancedSection?.querySelector('button');
    fireEvent.click(findButton!);

    await waitFor(() => {
      expect(aiService.findSimilarIdeas).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(screen.getByText('유사한 아이디어 항목')).toBeInTheDocument();
      expect(screen.getByText('75%')).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it('should generate SWOT analysis when button is clicked', async () => {
    (aiService.generateSWOT as ReturnType<typeof vi.fn>).mockResolvedValue({
      strengths: ['강점 항목1'],
      weaknesses: ['약점 항목1'],
      opportunities: ['기회 항목1'],
      threats: ['위협 항목1'],
    });

    render(<AIFeatures {...mockProps} />);

    // Open advanced section
    const toggleButton = screen.getByText(/고급 AI 분석/);
    fireEvent.click(toggleButton);

    await waitFor(() => {
      expect(screen.getByText('SWOT 분석')).toBeInTheDocument();
    });

    // Click SWOT button
    const swotSection = screen.getByText('SWOT 분석').closest('.p-4');
    const swotButton = swotSection?.querySelector('button');
    fireEvent.click(swotButton!);

    await waitFor(() => {
      expect(aiService.generateSWOT).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(screen.getByText('강점')).toBeInTheDocument();
      expect(screen.getByText('• 강점 항목1')).toBeInTheDocument();
      expect(screen.getByText('• 약점 항목1')).toBeInTheDocument();
      expect(screen.getByText('• 기회 항목1')).toBeInTheDocument();
      expect(screen.getByText('• 위협 항목1')).toBeInTheDocument();
    }, { timeout: 3000 });
  });
});
