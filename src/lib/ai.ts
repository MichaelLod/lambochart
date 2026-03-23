import type { ByokySession } from '@byoky/sdk';
import type { ChatMessage, FlowchartData } from './types';
import { FLOWCHART_SYSTEM, EXPLORE_SYSTEM } from './prompts';

interface ApiConfig {
  url: string;
  headers: Record<string, string>;
  buildBody: (system: string, messages: ChatMessage[]) => Record<string, unknown>;
  extractContent: (data: Record<string, unknown>) => string;
}

function withSystemPrompt(system: string, messages: ChatMessage[]): ChatMessage[] {
  return [
    { role: 'user', content: system },
    { role: 'assistant', content: 'Understood. I will follow these instructions.' },
    ...messages,
  ];
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
        messages: withSystemPrompt(system, messages).map((m) => ({
          role: m.role,
          content: m.content,
        })),
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

export function getProviderId(session: ByokySession): string | null {
  for (const id of ['anthropic', 'openai']) {
    if (session.providers[id]?.available) return id;
  }
  return null;
}

export async function callLLM(
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

export async function generateFlowchartFromPrompt(
  session: ByokySession,
  prompt: string,
): Promise<FlowchartData> {
  const providerId = getProviderId(session);
  if (!providerId) throw new Error('No AI provider available. Connect a wallet with an API key.');

  const result = await callLLM(session, providerId, FLOWCHART_SYSTEM, [
    { role: 'user', content: prompt },
  ]);

  const cleaned = result.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  return JSON.parse(cleaned) as FlowchartData;
}

export async function exploreNode(
  session: ByokySession,
  nodeLabel: string,
  nodeType: string,
  nodeDescription: string,
  chartContext: string,
  messages: ChatMessage[],
): Promise<string> {
  const providerId = getProviderId(session);
  if (!providerId) throw new Error('No AI provider available. Connect a wallet with an API key.');

  const contextMsg = `I'm looking at a "${nodeType}" block in my product chart called "${nodeLabel}".
Description: ${nodeDescription}

Chart context: ${chartContext}`;

  const allMessages: ChatMessage[] = [
    { role: 'user', content: contextMsg },
    { role: 'assistant', content: `I'll help you explore "${nodeLabel}". What would you like to dive into?` },
    ...messages,
  ];

  return callLLM(session, providerId, EXPLORE_SYSTEM, allMessages);
}
