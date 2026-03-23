import { useState, useRef, useEffect, useCallback } from 'react';
import type { ByokySession } from '@byoky/sdk';
import type { Node } from '@xyflow/react';
import type { ChatMessage } from '../lib/types';
import { NODE_CONFIG } from '../lib/node-config';
import { exploreNode } from '../lib/ai';

interface NodeSidebarProps {
  node: Node;
  allNodes: Node[];
  session: ByokySession | null;
  onConnect: () => void;
  onClose: () => void;
}

interface ChartNodeData {
  label: string;
  description: string;
  nodeType: string;
}

const QUICK_PROMPTS = [
  'How do I execute this?',
  'What are the risks?',
  'What tools should I use?',
  'How long will this take?',
  'What comes after this?',
];

export function NodeSidebar({ node, allNodes, session, onConnect, onClose }: NodeSidebarProps) {
  const nodeData = node.data as unknown as ChartNodeData;
  const nodeType = nodeData.nodeType || 'phase';
  const config = NODE_CONFIG[nodeType as keyof typeof NODE_CONFIG] || NODE_CONFIG.phase;

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMessages([]);
    setError(null);
    setInput('');
  }, [node.id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  useEffect(() => {
    inputRef.current?.focus();
  }, [node.id]);

  const chartContext = allNodes
    .map((n) => {
      const d = n.data as unknown as ChartNodeData;
      return `${d.nodeType}: ${d.label}`;
    })
    .join(', ');

  const sendMessage = useCallback(
    async (content: string) => {
      if (!session) {
        onConnect();
        return;
      }

      const userMsg: ChatMessage = { role: 'user', content };
      const updatedMessages = [...messages, userMsg];
      setMessages(updatedMessages);
      setInput('');
      setLoading(true);
      setError(null);

      try {
        const reply = await exploreNode(
          session,
          nodeData.label,
          nodeData.nodeType,
          nodeData.description,
          chartContext,
          updatedMessages,
        );
        setMessages([...updatedMessages, { role: 'assistant', content: reply }]);
      } catch (e) {
        setError((e as Error).message);
      } finally {
        setLoading(false);
      }
    },
    [session, onConnect, messages, nodeData, chartContext],
  );

  const handleSubmit = () => {
    const trimmed = input.trim();
    if (!trimmed || loading) return;
    sendMessage(trimmed);
  };

  return (
    <div className="absolute top-0 right-0 bottom-0 w-96 z-20 flex flex-col bg-surface border-l border-border shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-border">
        <div className="flex items-center gap-3 min-w-0">
          <div className={`w-8 h-8 rounded-lg ${config.bg} ${config.border} border flex items-center justify-center shrink-0`}>
            <svg className={`w-4 h-4 ${config.color}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d={config.icon} />
            </svg>
          </div>
          <div className="min-w-0">
            <h3 className="text-text text-sm font-semibold truncate">{nodeData.label}</h3>
            <p className={`text-[10px] font-medium uppercase tracking-wider ${config.color} opacity-80`}>{config.label}</p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 text-text-3 hover:text-text rounded-lg hover:bg-surface-2 transition-colors cursor-pointer"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Description */}
      <div className="px-5 py-3 border-b border-border">
        <p className="text-text-2 text-xs leading-relaxed">{nodeData.description}</p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-5 py-4">
        {messages.length === 0 && !loading && (
          <div className="space-y-2">
            <p className="text-text-3 text-xs mb-3">Ask AI to explore this block:</p>
            {QUICK_PROMPTS.map((prompt) => (
              <button
                key={prompt}
                onClick={() => sendMessage(prompt)}
                disabled={!session}
                className="block w-full text-left px-3 py-2 text-xs text-text-2 hover:text-text bg-surface-2 hover:bg-surface-3 border border-border rounded-lg transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-default"
              >
                {prompt}
              </button>
            ))}
            {!session && (
              <button
                onClick={onConnect}
                className="block w-full text-center px-3 py-2 text-xs text-accent-2 hover:text-accent bg-accent-glow border border-accent/20 rounded-lg transition-colors cursor-pointer mt-3"
              >
                Connect wallet to use AI
              </button>
            )}
          </div>
        )}

        <div className="space-y-3">
          {messages.map((msg, i) => (
            <div key={i} className={`${msg.role === 'user' ? 'flex justify-end' : ''}`}>
              <div
                className={`text-xs leading-relaxed whitespace-pre-wrap ${
                  msg.role === 'user'
                    ? 'bg-accent text-white px-3 py-2 rounded-xl rounded-br-md max-w-[85%]'
                    : 'text-text-2'
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex gap-1.5 py-2">
              <span className="w-1.5 h-1.5 bg-text-3 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-1.5 h-1.5 bg-text-3 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-1.5 h-1.5 bg-text-3 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          )}

          {error && (
            <div className="p-2 bg-rose/10 border border-rose/20 rounded-lg text-rose text-[11px]">
              {error}
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </div>

      {/* Input */}
      <div className="px-5 py-3 border-t border-border">
        <div className="flex gap-2">
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleSubmit();
              }
            }}
            placeholder={session ? 'Ask about this block...' : 'Connect wallet first'}
            disabled={loading || !session}
            className="flex-1 px-3 py-2 bg-surface-2 border border-border rounded-lg text-text text-xs placeholder:text-text-3 focus:outline-none focus:border-accent/50 transition-colors disabled:opacity-50"
          />
          <button
            onClick={handleSubmit}
            disabled={!input.trim() || loading || !session}
            className="px-3 py-2 bg-accent hover:bg-accent-2 disabled:opacity-30 text-white rounded-lg transition-all cursor-pointer disabled:cursor-default"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
