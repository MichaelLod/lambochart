import type { FlowchartData } from './types';
import type { Node, Edge } from '@xyflow/react';

const NODE_WIDTH = 220;
const NODE_HEIGHT = 100;
const HORIZONTAL_GAP = 60;
const VERTICAL_GAP = 80;

interface LayoutNode {
  id: string;
  depth: number;
  children: string[];
  parents: string[];
}

export function layoutFlowchart(data: FlowchartData): { nodes: Node[]; edges: Edge[] } {
  const graph = new Map<string, LayoutNode>();

  for (const node of data.nodes) {
    graph.set(node.id, { id: node.id, depth: -1, children: [], parents: [] });
  }

  for (const edge of data.edges) {
    const parent = graph.get(edge.from);
    const child = graph.get(edge.to);
    if (parent && child) {
      parent.children.push(edge.to);
      child.parents.push(edge.from);
    }
  }

  const roots = data.nodes.filter((n) => {
    const g = graph.get(n.id);
    return g && g.parents.length === 0;
  });

  if (roots.length === 0 && data.nodes.length > 0) {
    const g = graph.get(data.nodes[0].id);
    if (g) g.parents = [];
    roots.push(data.nodes[0]);
  }

  const queue: string[] = roots.map((r) => r.id);
  for (const id of queue) {
    const node = graph.get(id)!;
    if (node.depth === -1) node.depth = 0;
  }

  let head = 0;
  while (head < queue.length) {
    const id = queue[head++];
    const node = graph.get(id)!;
    for (const childId of node.children) {
      const child = graph.get(childId);
      if (child) {
        child.depth = Math.max(child.depth, node.depth + 1);
        if (!queue.includes(childId)) queue.push(childId);
      }
    }
  }

  for (const [, node] of graph) {
    if (node.depth === -1) node.depth = 0;
  }

  const layers = new Map<number, string[]>();
  for (const [id, node] of graph) {
    if (!layers.has(node.depth)) layers.set(node.depth, []);
    layers.get(node.depth)!.push(id);
  }

  const maxDepth = Math.max(0, ...Array.from(layers.keys()));
  const nodeMap = new Map(data.nodes.map((n) => [n.id, n]));

  const flowNodes: Node[] = [];

  for (let depth = 0; depth <= maxDepth; depth++) {
    const layerIds = layers.get(depth) || [];
    const layerWidth = layerIds.length * (NODE_WIDTH + HORIZONTAL_GAP) - HORIZONTAL_GAP;
    const startX = -layerWidth / 2;

    layerIds.forEach((id, i) => {
      const source = nodeMap.get(id);
      if (!source) return;

      flowNodes.push({
        id,
        type: 'chartNode',
        position: {
          x: startX + i * (NODE_WIDTH + HORIZONTAL_GAP),
          y: depth * (NODE_HEIGHT + VERTICAL_GAP),
        },
        data: {
          label: source.label,
          description: source.description,
          nodeType: source.type,
        },
      });
    });
  }

  const flowEdges: Edge[] = data.edges.map((edge, i) => ({
    id: `e-${i}`,
    source: edge.from,
    target: edge.to,
    label: edge.label,
    type: 'smoothstep',
    animated: true,
    style: { stroke: '#3a3a4f', strokeWidth: 1.5 },
    labelStyle: { fill: '#6a6a82', fontSize: 11 },
    labelBgStyle: { fill: '#12121a', fillOpacity: 0.9 },
    labelBgPadding: [6, 4] as [number, number],
    labelBgBorderRadius: 4,
  }));

  return { nodes: flowNodes, edges: flowEdges };
}
