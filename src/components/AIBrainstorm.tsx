import { useState, useRef, useEffect } from 'react';
import { MessageCircle, Send, Loader2, Lightbulb, HelpCircle, X, Minimize2, Maximize2 } from 'lucide-react';
import { aiService } from '../services/aiService';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  suggestions?: string[];
  questions?: string[];
  timestamp: Date;
}

interface AIBrainstormProps {
  context?: {
    title?: string;
    description?: string;
    category?: string;
  };
}

export function AIBrainstorm({ context }: AIBrainstormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && !isMinimized && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen, isMinimized]);

  const handleOpen = () => {
    setIsOpen(true);
    setIsMinimized(false);
    if (messages.length === 0) {
      // 초기 환영 메시지
      const welcomeMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: context?.title
          ? `"${context.title}"에 대해 함께 브레인스토밍해볼까요?`
          : '안녕하세요! 아이디어 브레인스토밍을 도와드릴게요. 무엇이든 물어보세요!',
        suggestions: [
          '아이디어를 어떻게 발전시킬 수 있을까요?',
          '비즈니스 모델은 어떻게 구성하면 좋을까요?',
          '경쟁사와 차별화 방법이 궁금해요',
        ],
        timestamp: new Date(),
      };
      setMessages([welcomeMessage]);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await aiService.brainstorm(input.trim(), context);

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.response,
        suggestions: response.suggestions,
        questions: response.questions,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '죄송합니다. 응답을 생성하는 데 문제가 발생했습니다. 다시 시도해주세요.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={handleOpen}
        className="fixed bottom-24 right-6 z-40 p-3 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-110 group"
        title="AI 브레인스토밍"
      >
        <MessageCircle className="h-5 w-5 transition-transform group-hover:scale-110" />
      </button>
    );
  }

  return (
    <div
      className={`fixed z-50 bg-white rounded-2xl shadow-2xl border border-neutral-200 transition-all duration-300 ${
        isMinimized
          ? 'bottom-24 right-6 w-72'
          : 'bottom-6 right-6 w-96 max-h-[600px]'
      }`}
    >
      {/* 헤더 */}
      <div className="flex items-center justify-between p-4 border-b border-neutral-200 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-t-2xl">
        <div className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          <span className="font-semibold">AI 브레인스토밍</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
          >
            {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* 메시지 영역 */}
          <div className="h-80 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] ${message.role === 'user' ? 'order-2' : 'order-1'}`}>
                  <div
                    className={`p-3 rounded-2xl ${
                      message.role === 'user'
                        ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-br-sm'
                        : 'bg-neutral-100 text-neutral-800 rounded-bl-sm'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  </div>

                  {/* 제안 사항 */}
                  {message.suggestions && message.suggestions.length > 0 && (
                    <div className="mt-2 space-y-1.5">
                      {message.suggestions.map((suggestion, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSuggestionClick(suggestion)}
                          className="flex items-start gap-2 w-full p-2 text-left text-xs bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg transition-colors group"
                        >
                          <Lightbulb className="h-3.5 w-3.5 mt-0.5 flex-shrink-0 text-purple-500" />
                          <span className="line-clamp-2">{suggestion}</span>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* 후속 질문 */}
                  {message.questions && message.questions.length > 0 && (
                    <div className="mt-2 space-y-1.5">
                      {message.questions.map((question, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSuggestionClick(question)}
                          className="flex items-start gap-2 w-full p-2 text-left text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition-colors group"
                        >
                          <HelpCircle className="h-3.5 w-3.5 mt-0.5 flex-shrink-0 text-blue-500" />
                          <span>{question}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="bg-neutral-100 p-3 rounded-2xl rounded-bl-sm">
                  <Loader2 className="h-5 w-5 animate-spin text-purple-500" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* 입력 영역 */}
          <div className="p-4 border-t border-neutral-200">
            <div className="flex items-center gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="아이디어에 대해 물어보세요..."
                disabled={loading}
                className="flex-1 px-4 py-2.5 bg-neutral-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || loading}
                className="p-2.5 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
            <p className="text-[10px] text-neutral-400 mt-2 text-center">
              비즈니스 모델, 경쟁 전략, 실행 방법 등을 물어보세요
            </p>
          </div>
        </>
      )}
    </div>
  );
}
