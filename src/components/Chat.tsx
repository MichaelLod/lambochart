import { useState, useRef, useEffect } from 'react';
import type { ChatMessage } from '../lib/types';

interface ChatProps {
  messages: ChatMessage[];
  loading: boolean;
  error: string | null;
  onSend: (message: string) => void;
  onGenerateChart: () => void;
}

export function Chat({ messages, loading, error, onSend, onGenerateChart }: ChatProps) {
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = () => {
    const trimmed = input.trim();
    if (!trimmed || loading) return;
    setInput('');
    onSend(trimmed);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const hasEnoughContext = messages.length >= 4;

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-surface/50 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <h1 className="font-display text-lg font-semibold text-text">lambochart</h1>
          <span className="text-text-3 text-sm">brainstorm mode</span>
        </div>

        {hasEnoughContext && (
          <button
            onClick={onGenerateChart}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-accent hover:bg-accent-2 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-all cursor-pointer disabled:cursor-wait"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
            Generate Flowchart
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center max-w-md mx-auto">
            <div className="w-12 h-12 rounded-xl bg-accent-glow border border-accent/20 flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-accent-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </div>
            <h2 className="text-text font-semibold text-lg mb-2">What do you want to build?</h2>
            <p className="text-text-3 text-sm leading-relaxed">
              Describe your product idea and I'll help you think it through.
              Once we've explored it enough, I'll generate a product lifecycle flowchart.
            </p>
          </div>
        )}

        <div className="max-w-2xl mx-auto space-y-4">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                  msg.role === 'user'
                    ? 'bg-accent text-white rounded-br-md'
                    : 'bg-surface-2 text-text border border-border rounded-bl-md'
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-surface-2 border border-border rounded-2xl rounded-bl-md px-4 py-3">
                <div className="flex gap-1.5">
                  <span className="w-2 h-2 bg-text-3 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-text-3 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-text-3 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="p-3 bg-rose/10 border border-rose/20 rounded-lg text-rose text-sm">
              {error}
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </div>

      {/* Input */}
      <div className="px-6 py-4 border-t border-border bg-surface/50 backdrop-blur-sm">
        <div className="max-w-2xl mx-auto flex gap-3">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Describe your product idea..."
            rows={1}
            className="flex-1 px-4 py-3 bg-surface-2 border border-border rounded-xl text-text text-sm placeholder:text-text-3 resize-none focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20 transition-colors"
            style={{ minHeight: '44px', maxHeight: '120px' }}
            onInput={(e) => {
              const target = e.target as HTMLTextAreaElement;
              target.style.height = 'auto';
              target.style.height = `${Math.min(target.scrollHeight, 120)}px`;
            }}
          />
          <button
            onClick={handleSubmit}
            disabled={!input.trim() || loading}
            className="px-4 py-3 bg-accent hover:bg-accent-2 disabled:opacity-30 text-white rounded-xl transition-all cursor-pointer disabled:cursor-default"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
