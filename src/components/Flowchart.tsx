import { useCallback, useMemo, useRef, type DragEvent } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  BackgroundVariant,
  type Connection,
  type Node,
  type ReactFlowInstance,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import type { FlowchartData, VibeBlockType } from '../lib/types';
import { NODE_CONFIG } from '../lib/node-config';
import { layoutFlowchart } from '../lib/layout';
import { ChartNode } from './ChartNode';
import { VibeBlockPalette } from './VibeBlockPalette';

const nodeTypes = { chartNode: ChartNode };

const DEFAULT_EDGE_OPTIONS = {
  type: 'smoothstep' as const,
  animated: true,
  style: { stroke: '#3a3a4f', strokeWidth: 1.5 },
};

interface FlowchartProps {
  data: FlowchartData | null;
  onBack: () => void;
}

let idCounter = 0;
function nextId() {
  return `vibe-${Date.now()}-${idCounter++}`;
}

export function Flowchart({ data, onBack }: FlowchartProps) {
  const { nodes: initialNodes, edges: initialEdges } = useMemo(
    () => (data ? layoutFlowchart(data) : { nodes: [], edges: [] }),
    [data],
  );

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const rfInstance = useRef<ReactFlowInstance | null>(null);

  const onInit = useCallback((instance: ReactFlowInstance) => {
    rfInstance.current = instance;
    if (data) {
      setTimeout(() => instance.fitView(), 100);
    }
  }, [data]);

  const onConnect = useCallback(
    (connection: Connection) => {
      setEdges((eds) => addEdge({ ...connection, ...DEFAULT_EDGE_OPTIONS }, eds));
    },
    [setEdges],
  );

  const onDragOver = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (e: DragEvent) => {
      e.preventDefault();
      const blockType = e.dataTransfer.getData('application/lambochart-block') as VibeBlockType;
      if (!blockType || !NODE_CONFIG[blockType]) return;

      const config = NODE_CONFIG[blockType];
      const bounds = (e.currentTarget as HTMLElement).getBoundingClientRect();

      const position = rfInstance.current
        ? rfInstance.current.screenToFlowPosition({
            x: e.clientX - bounds.left,
            y: e.clientY - bounds.top,
          })
        : { x: e.clientX - bounds.left - 100, y: e.clientY - bounds.top - 40 };

      const newNode: Node = {
        id: nextId(),
        type: 'chartNode',
        position,
        data: {
          label: config.defaultLabel,
          description: config.defaultDescription,
          nodeType: blockType,
        },
      };

      setNodes((nds) => [...nds, newNode]);
    },
    [setNodes],
  );

  const onNodesDelete = useCallback(
    (deleted: Node[]) => {
      const deletedIds = new Set(deleted.map((n) => n.id));
      setEdges((eds) => eds.filter((e) => !deletedIds.has(e.source) && !deletedIds.has(e.target)));
    },
    [setEdges],
  );

  const nodeCount = nodes.length;
  const title = data?.title || 'Untitled Chart';

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
            <h1 className="font-display text-lg font-semibold text-text">{title}</h1>
            <p className="text-text-3 text-xs">
              {nodeCount} {nodeCount === 1 ? 'block' : 'blocks'} &middot; {edges.length} {edges.length === 1 ? 'connection' : 'connections'}
            </p>
          </div>
        </div>
      </div>

      {/* Canvas */}
      <div className="flex-1 relative">
        <VibeBlockPalette />

        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onInit={onInit}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onNodesDelete={onNodesDelete}
          nodeTypes={nodeTypes}
          fitView={!!data}
          minZoom={0.2}
          maxZoom={2}
          defaultEdgeOptions={DEFAULT_EDGE_OPTIONS}
          deleteKeyCode={['Backspace', 'Delete']}
          snapToGrid
          snapGrid={[16, 16]}
          connectionLineStyle={{ stroke: '#7c5cfc', strokeWidth: 2 }}
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

        {nodeCount === 0 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center">
              <p className="text-text-3 text-lg mb-1">Drag vibe blocks here</p>
              <p className="text-text-3/50 text-sm">or generate a chart from your brainstorm</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
