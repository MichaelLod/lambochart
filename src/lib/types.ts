export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface FlowchartNode {
  id: string;
  type: 'idea' | 'phase' | 'strategy' | 'milestone' | 'risk' | 'outcome';
  label: string;
  description: string;
}

export interface FlowchartEdge {
  from: string;
  to: string;
  label?: string;
}

export interface FlowchartData {
  title: string;
  nodes: FlowchartNode[];
  edges: FlowchartEdge[];
}

export type AppView = 'landing' | 'brainstorm' | 'chart';
