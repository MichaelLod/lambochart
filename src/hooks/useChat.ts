import { useState, useCallback } from 'react';
import type { ByokySession } from '@byoky/sdk';
import type { ChatMessage, FlowchartData } from '../lib/types';
import { BRAINSTORM_SYSTEM, FLOWCHART_SYSTEM } from '../lib/prompts';
import { callLLM, getProviderId } from '../lib/ai';

export function useChat(session: ByokySession | null) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = useCallback(
    async (content: string) => {
      if (!session) return;

      const providerId = getProviderId(session);
      if (!providerId) {
        setError('No AI provider available. Add an API key in your Byoky wallet.');
        return;
      }

      const userMsg: ChatMessage = { role: 'user', content };
      const updatedMessages = [...messages, userMsg];
      setMessages(updatedMessages);
      setLoading(true);
      setError(null);

      try {
        const reply = await callLLM(session, providerId, BRAINSTORM_SYSTEM, updatedMessages);
        setMessages([...updatedMessages, { role: 'assistant', content: reply }]);
      } catch (e) {
        setError((e as Error).message);
      } finally {
        setLoading(false);
      }
    },
    [session, messages],
  );

  const generateFlowchart = useCallback(async (): Promise<FlowchartData | null> => {
    if (!session) return null;

    const providerId = getProviderId(session);
    if (!providerId) {
      setError('No AI provider available.');
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const summary = messages
        .map((m) => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`)
        .join('\n\n');

      const result = await callLLM(session, providerId, FLOWCHART_SYSTEM, [
        { role: 'user', content: `Here is the brainstorming conversation:\n\n${summary}\n\nGenerate the product lifecycle flowchart as JSON.` },
      ]);

      const cleaned = result.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      return JSON.parse(cleaned) as FlowchartData;
    } catch (e) {
      setError(`Failed to generate flowchart: ${(e as Error).message}`);
      return null;
    } finally {
      setLoading(false);
    }
  }, [session, messages]);

  return { messages, loading, error, sendMessage, generateFlowchart };
}
