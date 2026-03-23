import { type DragEvent } from 'react';
import { NODE_CONFIG, VIBE_BLOCK_TYPES } from '../lib/node-config';
import type { VibeBlockType } from '../lib/types';

const DOT_COLORS: Record<VibeBlockType, string> = {
  idea: 'bg-node-idea',
  phase: 'bg-node-phase',
  strategy: 'bg-node-strategy',
  milestone: 'bg-node-milestone',
  risk: 'bg-node-risk',
  outcome: 'bg-node-outcome',
};

function onDragStart(e: DragEvent, blockType: VibeBlockType) {
  e.dataTransfer.setData('application/lambochart-block', blockType);
  e.dataTransfer.effectAllowed = 'move';
}

export function VibeBlockPalette() {
  return (
    <div className="absolute top-4 left-4 z-10 w-48">
      <div className="bg-surface/95 backdrop-blur-sm border border-border rounded-xl p-3 shadow-xl">
        <h3 className="text-text-3 text-[10px] font-medium uppercase tracking-wider mb-3 px-1">
          Vibe Blocks
        </h3>

        <div className="space-y-1.5">
          {VIBE_BLOCK_TYPES.map((type) => {
            const config = NODE_CONFIG[type];
            return (
              <div
                key={type}
                draggable
                onDragStart={(e) => onDragStart(e, type)}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg border ${config.bg} ${config.border} cursor-grab active:cursor-grabbing hover:scale-[1.02] active:scale-[0.98] transition-all`}
              >
                <div className={`w-2.5 h-2.5 rounded-full ${DOT_COLORS[type]} shrink-0`} />
                <div>
                  <div className="text-text text-xs font-medium">{config.label}</div>
                  <div className="text-text-3 text-[10px] leading-tight">{config.defaultDescription}</div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-3 px-1">
          <p className="text-text-3 text-[10px] leading-relaxed">
            Drag blocks onto the canvas. Double-click to edit. Drag between handles to connect.
          </p>
        </div>
      </div>
    </div>
  );
}
