import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';

const TYPE_STYLES: Record<string, { bg: string; border: string; icon: string }> = {
  idea: {
    bg: 'bg-node-idea/10',
    border: 'border-node-idea/40',
    icon: 'M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z',
  },
  phase: {
    bg: 'bg-node-phase/10',
    border: 'border-node-phase/40',
    icon: 'M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z M4 22v-7',
  },
  strategy: {
    bg: 'bg-node-strategy/10',
    border: 'border-node-strategy/40',
    icon: 'M12 2L2 7l10 5 10-5-10-5z M2 17l10 5 10-5 M2 12l10 5 10-5',
  },
  milestone: {
    bg: 'bg-node-milestone/10',
    border: 'border-node-milestone/40',
    icon: 'M22 11.08V12a10 10 0 1 1-5.93-9.14 M22 4L12 14.01l-3-3',
  },
  risk: {
    bg: 'bg-node-risk/10',
    border: 'border-node-risk/40',
    icon: 'M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z M12 9v4 M12 17h.01',
  },
  outcome: {
    bg: 'bg-node-outcome/10',
    border: 'border-node-outcome/40',
    icon: 'M6 9l6 6 6-6',
  },
};

const TYPE_COLORS: Record<string, string> = {
  idea: 'text-node-idea',
  phase: 'text-node-phase',
  strategy: 'text-node-strategy',
  milestone: 'text-node-milestone',
  risk: 'text-node-risk',
  outcome: 'text-node-outcome',
};

const TYPE_LABELS: Record<string, string> = {
  idea: 'Idea',
  phase: 'Phase',
  strategy: 'Strategy',
  milestone: 'Milestone',
  risk: 'Risk',
  outcome: 'Outcome',
};

interface ChartNodeData {
  label: string;
  description: string;
  nodeType: string;
  [key: string]: unknown;
}

function ChartNodeComponent({ data }: NodeProps) {
  const nodeData = data as unknown as ChartNodeData;
  const nodeType = nodeData.nodeType || 'phase';
  const style = TYPE_STYLES[nodeType] || TYPE_STYLES.phase;
  const color = TYPE_COLORS[nodeType] || TYPE_COLORS.phase;

  return (
    <>
      <Handle type="target" position={Position.Top} className="!bg-border-2 !border-0 !w-2 !h-2" />

      <div className={`px-5 py-4 rounded-xl border ${style.bg} ${style.border} backdrop-blur-sm min-w-[180px] max-w-[240px]`}>
        <div className="flex items-center gap-2 mb-1.5">
          <svg className={`w-3.5 h-3.5 ${color} shrink-0`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d={style.icon} />
          </svg>
          <span className={`text-[10px] font-medium uppercase tracking-wider ${color} opacity-80`}>
            {TYPE_LABELS[nodeType]}
          </span>
        </div>

        <div className="text-text text-sm font-semibold leading-tight mb-1">
          {nodeData.label}
        </div>

        <div className="text-text-3 text-xs leading-relaxed">
          {nodeData.description}
        </div>
      </div>

      <Handle type="source" position={Position.Bottom} className="!bg-border-2 !border-0 !w-2 !h-2" />
    </>
  );
}

export const ChartNode = memo(ChartNodeComponent);
