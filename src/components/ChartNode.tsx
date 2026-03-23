import { memo, useState, useRef, useEffect, useCallback } from 'react';
import { Handle, Position, useReactFlow, type NodeProps } from '@xyflow/react';
import { NODE_CONFIG } from '../lib/node-config';

interface ChartNodeData {
  label: string;
  description: string;
  nodeType: string;
  [key: string]: unknown;
}

function ChartNodeComponent({ id, data, selected }: NodeProps) {
  const nodeData = data as unknown as ChartNodeData;
  const nodeType = nodeData.nodeType || 'phase';
  const config = NODE_CONFIG[nodeType as keyof typeof NODE_CONFIG] || NODE_CONFIG.phase;
  const { updateNodeData } = useReactFlow();

  const [editingField, setEditingField] = useState<'label' | 'description' | null>(null);
  const [editValue, setEditValue] = useState('');
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  useEffect(() => {
    if (editingField && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editingField]);

  const startEdit = useCallback((field: 'label' | 'description', value: string) => {
    setEditingField(field);
    setEditValue(value);
  }, []);

  const commitEdit = useCallback(() => {
    if (!editingField) return;
    const trimmed = editValue.trim();
    if (trimmed) {
      updateNodeData(id, { [editingField]: trimmed });
    }
    setEditingField(null);
  }, [editingField, editValue, id, updateNodeData]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      commitEdit();
    } else if (e.key === 'Escape') {
      setEditingField(null);
    }
  }, [commitEdit]);

  return (
    <>
      <Handle type="target" position={Position.Top} className="!bg-border-2 !border-0 !w-2.5 !h-2.5 hover:!bg-accent transition-colors" />

      <div className={`px-5 py-4 rounded-xl border ${config.bg} ${config.border} backdrop-blur-sm min-w-[180px] max-w-[240px] transition-shadow ${selected ? 'shadow-lg shadow-accent/20 !border-accent/60' : ''}`}>
        <div className="flex items-center gap-2 mb-1.5">
          <svg className={`w-3.5 h-3.5 ${config.color} shrink-0`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d={config.icon} />
          </svg>
          <span className={`text-[10px] font-medium uppercase tracking-wider ${config.color} opacity-80`}>
            {config.label}
          </span>
        </div>

        {editingField === 'label' ? (
          <input
            ref={inputRef as React.RefObject<HTMLInputElement>}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={commitEdit}
            onKeyDown={handleKeyDown}
            className="w-full bg-transparent text-text text-sm font-semibold leading-tight mb-1 outline-none border-b border-accent/50 nodrag"
          />
        ) : (
          <div
            className="text-text text-sm font-semibold leading-tight mb-1 cursor-text hover:text-accent-2 transition-colors"
            onDoubleClick={() => startEdit('label', nodeData.label)}
          >
            {nodeData.label}
          </div>
        )}

        {editingField === 'description' ? (
          <textarea
            ref={inputRef as React.RefObject<HTMLTextAreaElement>}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={commitEdit}
            onKeyDown={handleKeyDown}
            rows={2}
            className="w-full bg-transparent text-text-3 text-xs leading-relaxed outline-none border-b border-accent/50 resize-none nodrag"
          />
        ) : (
          <div
            className="text-text-3 text-xs leading-relaxed cursor-text hover:text-text-2 transition-colors"
            onDoubleClick={() => startEdit('description', nodeData.description)}
          >
            {nodeData.description}
          </div>
        )}
      </div>

      <Handle type="source" position={Position.Bottom} className="!bg-border-2 !border-0 !w-2.5 !h-2.5 hover:!bg-accent transition-colors" />
    </>
  );
}

export const ChartNode = memo(ChartNodeComponent);
