export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export type VibeBlockType = 'idea' | 'phase' | 'strategy' | 'milestone' | 'risk' | 'outcome';

export interface FlowchartNode {
  id: string;
  type: VibeBlockType;
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
