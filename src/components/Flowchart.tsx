import { useMemo, useCallback } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  BackgroundVariant,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import type { FlowchartData } from '../lib/types';
import { layoutFlowchart } from '../lib/layout';
import { ChartNode } from './ChartNode';

const nodeTypes = { chartNode: ChartNode };

interface FlowchartProps {
  data: FlowchartData;
  onBack: () => void;
}

export function Flowchart({ data, onBack }: FlowchartProps) {
  const { nodes: initialNodes, edges: initialEdges } = useMemo(
    () => layoutFlowchart(data),
    [data],
  );

  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, , onEdgesChange] = useEdgesState(initialEdges);

  const onInit = useCallback((instance: { fitView: () => void }) => {
    setTimeout(() => instance.fitView(), 100);
  }, []);

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-surface/50 backdrop-blur-sm z-10 relative">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-text-2 hover:text-text text-sm transition-colors cursor-pointer"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Back
          </button>

          <div className="w-px h-5 bg-border" />

          <div>
            <h1 className="font-display text-lg font-semibold text-text">{data.title}</h1>
            <p className="text-text-3 text-xs">{data.nodes.length} stages &middot; Product lifecycle flowchart</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Legend />
        </div>
      </div>

      {/* Flow */}
      <div className="flex-1">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onInit={onInit}
          nodeTypes={nodeTypes}
          fitView
          minZoom={0.2}
          maxZoom={2}
          defaultEdgeOptions={{ type: 'smoothstep' }}
        >
          <Background variant={BackgroundVariant.Dots} gap={24} size={1} color="#1a1a26" />
          <Controls
            showInteractive={false}
            className="!bg-surface !border-border !rounded-lg !shadow-lg [&>button]:!bg-surface-2 [&>button]:!border-border [&>button]:!text-text-2 [&>button:hover]:!bg-surface-3"
          />
          <MiniMap
            nodeColor="#2a2a3a"
            maskColor="rgba(10, 10, 15, 0.8)"
            className="!bg-surface !border-border !rounded-lg"
          />
        </ReactFlow>
      </div>
    </div>
  );
}

function Legend() {
  const items = [
    { type: 'idea', color: 'bg-node-idea', label: 'Idea' },
    { type: 'phase', color: 'bg-node-phase', label: 'Phase' },
    { type: 'strategy', color: 'bg-node-strategy', label: 'Strategy' },
    { type: 'milestone', color: 'bg-node-milestone', label: 'Milestone' },
    { type: 'risk', color: 'bg-node-risk', label: 'Risk' },
    { type: 'outcome', color: 'bg-node-outcome', label: 'Outcome' },
  ];

  return (
    <div className="flex items-center gap-3">
      {items.map((item) => (
        <div key={item.type} className="flex items-center gap-1.5">
          <div className={`w-2 h-2 rounded-full ${item.color}`} />
          <span className="text-text-3 text-[10px] uppercase tracking-wider">{item.label}</span>
        </div>
      ))}
    </div>
  );
}
