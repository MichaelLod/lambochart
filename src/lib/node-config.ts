import type { VibeBlockType } from './types';

export interface NodeTypeConfig {
  bg: string;
  border: string;
  color: string;
  icon: string;
  label: string;
  defaultLabel: string;
  defaultDescription: string;
}

export const NODE_CONFIG: Record<VibeBlockType, NodeTypeConfig> = {
  idea: {
    bg: 'bg-node-idea/10',
    border: 'border-node-idea/40',
    color: 'text-node-idea',
    icon: 'M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z',
    label: 'Idea',
    defaultLabel: 'New Idea',
    defaultDescription: 'Describe your core concept',
  },
  phase: {
    bg: 'bg-node-phase/10',
    border: 'border-node-phase/40',
    color: 'text-node-phase',
    icon: 'M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z M4 22v-7',
    label: 'Phase',
    defaultLabel: 'New Phase',
    defaultDescription: 'A development or growth stage',
  },
  strategy: {
    bg: 'bg-node-strategy/10',
    border: 'border-node-strategy/40',
    color: 'text-node-strategy',
    icon: 'M12 2L2 7l10 5 10-5-10-5z M2 17l10 5 10-5 M2 12l10 5 10-5',
    label: 'Strategy',
    defaultLabel: 'New Strategy',
    defaultDescription: 'A strategic approach or decision',
  },
  milestone: {
    bg: 'bg-node-milestone/10',
    border: 'border-node-milestone/40',
    color: 'text-node-milestone',
    icon: 'M22 11.08V12a10 10 0 1 1-5.93-9.14 M22 4L12 14.01l-3-3',
    label: 'Milestone',
    defaultLabel: 'New Milestone',
    defaultDescription: 'A measurable achievement',
  },
  risk: {
    bg: 'bg-node-risk/10',
    border: 'border-node-risk/40',
    color: 'text-node-risk',
    icon: 'M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z M12 9v4 M12 17h.01',
    label: 'Risk',
    defaultLabel: 'New Risk',
    defaultDescription: 'A potential blocker or challenge',
  },
  outcome: {
    bg: 'bg-node-outcome/10',
    border: 'border-node-outcome/40',
    color: 'text-node-outcome',
    icon: 'M6 9l6 6 6-6',
    label: 'Outcome',
    defaultLabel: 'New Outcome',
    defaultDescription: 'An achievable end state',
  },
};

export const VIBE_BLOCK_TYPES: VibeBlockType[] = [
  'idea', 'phase', 'strategy', 'milestone', 'risk', 'outcome',
];
