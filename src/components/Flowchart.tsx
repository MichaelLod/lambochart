import { useCallback, useMemo, useRef, useState, type DragEvent } from 'react';
import type { ByokySession } from '@byoky/sdk';
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
  type Edge,
  type ReactFlowInstance,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import type { FlowchartData, VibeBlockType } from '../lib/types';
import { NODE_CONFIG } from '../lib/node-config';
import { layoutFlowchart } from '../lib/layout';
import { generateFlowchartFromPrompt } from '../lib/ai';
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
  session: ByokySession | null;
  onConnect: () => void;
  onBack: () => void;
}

let idCounter = 0;
function nextId() {
  return `vibe-${Date.now()}-${idCounter++}`;
}

function serializeCanvas(nodes: Node[], edges: Edge[], title: string): string {
  return JSON.stringify({ title, nodes, edges }, null, 2);
}

function deserializeCanvas(json: string): { title: string; nodes: Node[]; edges: Edge[] } {
  const data = JSON.parse(json);
  return { title: data.title || 'Imported Chart', nodes: data.nodes || [], edges: data.edges || [] };
}

export function Flowchart({ data, session, onConnect, onBack }: FlowchartProps) {
  const { nodes: initialNodes, edges: initialEdges } = useMemo(
    () => (data ? layoutFlowchart(data) : { nodes: [], edges: [] }),
    [data],
  );

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [title, setTitle] = useState(data?.title || 'Untitled Chart');
  const rfInstance = useRef<ReactFlowInstance | null>(null);

  const [aiPrompt, setAiPrompt] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const onInit = useCallback((instance: ReactFlowInstance) => {
    rfInstance.current = instance;
    if (data) {
      setTimeout(() => instance.fitView(), 100);
    }
  }, [data]);

  const onReactFlowConnect = useCallback(
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

  const handleAiGenerate = useCallback(async () => {
    if (!aiPrompt.trim()) return;

    if (!session) {
      onConnect();
      return;
    }

    setAiLoading(true);
    setAiError(null);

    try {
      const chartData = await generateFlowchartFromPrompt(session, aiPrompt.trim());
      const { nodes: newNodes, edges: newEdges } = layoutFlowchart(chartData);
      setNodes(newNodes);
      setEdges(newEdges);
      setTitle(chartData.title);
      setAiPrompt('');
      setTimeout(() => rfInstance.current?.fitView(), 100);
    } catch (e) {
      setAiError((e as Error).message);
    } finally {
      setAiLoading(false);
    }
  }, [aiPrompt, session, onConnect, setNodes, setEdges]);

  const handleSave = useCallback(() => {
    const json = serializeCanvas(nodes, edges, title);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.toLowerCase().replace(/\s+/g, '-')}.lambochart.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [nodes, edges, title]);

  const handleLoad = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const { title: t, nodes: n, edges: ed } = deserializeCanvas(ev.target?.result as string);
        setNodes(n);
        setEdges(ed);
        setTitle(t);
        setTimeout(() => rfInstance.current?.fitView(), 100);
      } catch {
        setAiError('Failed to load file. Make sure it is a valid .lambochart.json file.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  }, [setNodes, setEdges]);

  const nodeCount = nodes.length;

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

        <div className="flex items-center gap-2">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-3 py-1.5 text-text-2 hover:text-text text-sm border border-border hover:border-border-2 rounded-lg transition-colors cursor-pointer"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            Load
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleLoad}
            className="hidden"
          />

          <button
            onClick={handleSave}
            disabled={nodeCount === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-accent hover:bg-accent-2 disabled:opacity-30 text-white text-sm rounded-lg transition-colors cursor-pointer disabled:cursor-default"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Save
          </button>
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
          onConnect={onReactFlowConnect}
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

        {nodeCount === 0 && !aiLoading && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center">
              <p className="text-text-3 text-lg mb-1">Drag vibe blocks or describe your idea below</p>
              <p className="text-text-3/50 text-sm">AI will generate the full product lifecycle chart</p>
            </div>
          </div>
        )}
      </div>

      {/* AI prompt bar */}
      <div className="px-6 py-4 border-t border-border bg-surface/50 backdrop-blur-sm">
        <div className="max-w-2xl mx-auto">
          {aiError && (
            <div className="mb-3 p-2.5 bg-rose/10 border border-rose/20 rounded-lg text-rose text-xs">
              {aiError}
            </div>
          )}

          <div className="flex gap-3">
            <div className="relative flex-1">
              <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2a4 4 0 0 1 4 4v1a3 3 0 0 1 3 3v1a2 2 0 0 1-2 2h-1v3a4 4 0 0 1-8 0v-3H7a2 2 0 0 1-2-2v-1a3 3 0 0 1 3-3V6a4 4 0 0 1 4-4z" />
              </svg>
              <input
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleAiGenerate();
                  }
                }}
                placeholder={session ? 'Describe your product idea and AI will chart it...' : 'Connect wallet to use AI generation...'}
                disabled={aiLoading}
                className="w-full pl-10 pr-4 py-3 bg-surface-2 border border-border rounded-xl text-text text-sm placeholder:text-text-3 focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20 transition-colors disabled:opacity-50"
              />
            </div>

            <button
              onClick={session ? handleAiGenerate : onConnect}
              disabled={aiLoading || (session ? !aiPrompt.trim() : false)}
              className="px-5 py-3 bg-accent hover:bg-accent-2 disabled:opacity-30 text-white text-sm font-medium rounded-xl transition-all cursor-pointer disabled:cursor-default flex items-center gap-2"
            >
              {aiLoading ? (
                <>
                  <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="31.4 31.4" strokeLinecap="round" />
                  </svg>
                  Generating...
                </>
              ) : session ? (
                <>
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                  </svg>
                  Generate
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="3" />
                    <path d="M12 8v8M8 12h8" />
                  </svg>
                  Connect
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
