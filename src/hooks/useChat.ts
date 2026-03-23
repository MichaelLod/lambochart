import { useState, useCallback } from 'react';
import type { ByokySession } from '@byoky/sdk';
import type { ChatMessage, FlowchartData } from '../lib/types';
import { BRAINSTORM_SYSTEM, FLOWCHART_SYSTEM } from '../lib/prompts';

function getProviderId(session: ByokySession): string | null {
  for (const id of ['anthropic', 'openai']) {
    if (session.providers[id]?.available) return id;
  }
  return null;
}

interface ApiConfig {
  url: string;
  headers: Record<string, string>;
  buildBody: (system: string, messages: ChatMessage[]) => Record<string, unknown>;
  extractContent: (data: Record<string, unknown>) => string;
}

function getApiConfig(providerId: string): ApiConfig {
  if (providerId === 'anthropic') {
    return {
      url: 'https://api.anthropic.com/v1/messages',
      headers: {
        'content-type': 'application/json',
        'anthropic-version': '2023-06-01',
      },
      buildBody: (system, messages) => ({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4096,
        system,
        messages: messages.map((m) => ({ role: m.role, content: m.content })),
      }),
      extractContent: (data) => {
        const content = data.content as Array<{ type: string; text: string }>;
        return content?.[0]?.text ?? '';
      },
    };
  }

  return {
    url: 'https://api.openai.com/v1/chat/completions',
    headers: { 'content-type': 'application/json' },
    buildBody: (system, messages) => ({
      model: 'gpt-4o',
      max_tokens: 4096,
      messages: [
        { role: 'system', content: system },
        ...messages.map((m) => ({ role: m.role, content: m.content })),
      ],
    }),
    extractContent: (data) => {
      const choices = data.choices as Array<{ message: { content: string } }>;
      return choices?.[0]?.message?.content ?? '';
    },
  };
}

async function callLLM(
  session: ByokySession,
  providerId: string,
  system: string,
  messages: ChatMessage[],
): Promise<string> {
  const config = getApiConfig(providerId);
  const proxyFetch = session.createFetch(providerId);

  const response = await proxyFetch(config.url, {
    method: 'POST',
    headers: config.headers,
    body: JSON.stringify(config.buildBody(system, messages)),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API error (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  return config.extractContent(data);
}

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
