"use client";

import { useEffect, useRef, useState } from "react";
import {
  Bot,
  LucideIcon,
  Play,
  Plus,
  Save,
  ScanLine,
  Rocket,
  X,
  ChevronLeft,
  Maximize2,
  Minimize2,
} from "lucide-react";

type NodeKind = "trigger" | "agent";

type CanvasNode = {
  id: string;
  label: string;
  description: string;
  kind: NodeKind;
  x: number;
  y: number;
};

type CanvasEdge = {
  id: string;
  from: string;
  to: string;
};

const nodeStyles: Record<
  NodeKind,
  { icon: LucideIcon; badge: string; dot: string }
> = {
  trigger: { icon: ScanLine, badge: "bg-sky-50 text-sky-700", dot: "bg-sky-500" },
  agent: { icon: Bot, badge: "bg-emerald-50 text-emerald-700", dot: "bg-emerald-500" },
};

const nodeTools = [
  "OCR",
  "Normalize",
  "Inventory check",
  "Forecast",
  "PO draft",
  "POS sync",
  "Email",
  "Slack",
  "Web",
];

const initialNodes: CanvasNode[] = [
  {
    id: "invoice-received",
    label: "Invoice received",
    description: "New document detected",
    kind: "trigger",
    x: 60,
    y: 90,
  },
  {
    id: "extract-items",
    label: "Extract line items",
    description: "OCR + normalization",
    kind: "agent",
    x: 280,
    y: 210,
  },
  {
    id: "create-reorder",
    label: "Create reorder",
    description: "Draft purchase order",
    kind: "agent",
    x: 760,
    y: 240,
  },
];

const initialEdges: CanvasEdge[] = [
  { id: "e1", from: "invoice-received", to: "extract-items" },
  { id: "e2", from: "extract-items", to: "create-reorder" },
];

type AgentBuilderCanvasProps = {
  workflowId: string;
  blank?: boolean;
};

export default function AgentBuilderCanvas({ workflowId, blank = false }: AgentBuilderCanvasProps) {
  const storageKey = `chefvision-agent-builder-nodes-${workflowId}`;
  const [nodes, setNodes] = useState<CanvasNode[]>(blank ? [] : initialNodes);
  const [edges] = useState<CanvasEdge[]>(initialEdges);
  const [selectedId, setSelectedId] = useState<string | null>("extract-items");
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [isAddNodeOpen, setIsAddNodeOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [addNodeStep, setAddNodeStep] = useState<"type" | "tools">("type");
  const [newNodeType, setNewNodeType] = useState<NodeKind>("agent");
  const [newNodeTools, setNewNodeTools] = useState<string[]>([]);
  const dragOffset = useRef({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const savedNodes = window.localStorage.getItem(storageKey);
      if (savedNodes) setNodes(JSON.parse(savedNodes) as CanvasNode[]);
    } catch {
      // Ignore malformed or unavailable saved canvas state.
    }
  }, [storageKey]);

  function handleSave() {
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(nodes));
    } catch {
      // Ignore storage quota or private browsing errors.
    }
  }

  function getPointerPosition(event: React.PointerEvent) {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    return {
      x: event.clientX - rect.left + (canvasRef.current?.scrollLeft ?? 0),
      y: event.clientY - rect.top + (canvasRef.current?.scrollTop ?? 0),
    };
  }

  function handlePointerDown(event: React.PointerEvent, node: CanvasNode) {
    event.stopPropagation();
    setSelectedId(node.id);
    setDraggingId(node.id);
    const pointer = getPointerPosition(event);
    dragOffset.current = { x: pointer.x - node.x, y: pointer.y - node.y };
    event.currentTarget.setPointerCapture?.(event.pointerId);
  }

  function handlePointerMove(event: React.PointerEvent) {
    if (!draggingId) return;
    const pointer = getPointerPosition(event);
    setNodes((current) =>
      current.map((node) =>
        node.id === draggingId
          ? {
              ...node,
              x: Math.max(0, pointer.x - dragOffset.current.x),
              y: Math.max(0, pointer.y - dragOffset.current.y),
            }
          : node
      )
    );
  }

  function handlePointerUp() {
    setDraggingId(null);
  }

  function openAddNodePanel() {
    setAddNodeStep("type");
    setNewNodeType("agent");
    setNewNodeTools([]);
    setIsAddNodeOpen(true);
  }

  function toggleTool(tool: string) {
    setNewNodeTools((current) =>
      current.includes(tool) ? current.filter((t) => t !== tool) : [...current, tool]
    );
  }

  function submitNewNode() {
    const newNode: CanvasNode = {
      id: `node-${Date.now()}`,
      label: `New ${newNodeType}`,
      description: newNodeTools.length ? newNodeTools.join(" · ") : "No tools selected",
      kind: newNodeType,
      x: 260,
      y: 180,
    };
    setNodes((current) => [...current, newNode]);
    setSelectedId(newNode.id);
    setIsAddNodeOpen(false);
  }

  const nodeMap = new Map(nodes.map((node) => [node.id, node]));

  return (
    <div
      className={`flex h-full min-h-0 flex-col gap-4 ${
        isExpanded ? "fixed inset-0 z-50 bg-white p-4 sm:p-6" : ""
      }`}
    >
      {isExpanded && (
        <h2 className="font-display text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
          Agent Builder
        </h2>
      )}
      <div className={`relative flex-1 ${isExpanded ? "" : "min-h-[540px]"}`}>
        <div
          ref={canvasRef}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          className="app-scrollbar relative h-full overflow-auto rounded-2xl border border-slate-100 bg-slate-50/60"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, rgba(15,23,42,0.10) 1px, transparent 0)",
            backgroundSize: "24px 24px",
          }}
        >
          <div className="pointer-events-auto absolute left-4 top-4 z-10 flex w-[calc(100%-2rem)] flex-wrap items-center justify-between gap-2">
            {!isAddNodeOpen && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={openAddNodePanel}
                  aria-label="Add node"
                  title="Add node"
                  className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 transition-colors hover:bg-slate-50"
                >
                  <Plus className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50"
                >
                  <Play className="h-4 w-4" />
                  Run
                </button>
              </div>
            )}
            <div className="ml-auto flex items-center gap-2">
              <button
                type="button"
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50"
              >
                <Rocket className="h-4 w-4" />
                Deploy
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50"
              >
                <Save className="h-4 w-4" />
                Save
              </button>
              <button
                type="button"
                onClick={() => setIsExpanded((current) => !current)}
                aria-label={isExpanded ? "Collapse canvas" : "Expand canvas"}
                title={isExpanded ? "Collapse canvas" : "Expand canvas"}
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 transition-colors hover:bg-slate-50"
              >
                {isExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <svg className="pointer-events-none absolute inset-0 h-full w-full">
            {edges.map((edge) => {
              const source = nodeMap.get(edge.from);
              const target = nodeMap.get(edge.to);
              if (!source || !target) return null;

              const x1 = source.x + 150;
              const y1 = source.y + 40;
              const x2 = target.x + 20;
              const y2 = target.y + 40;
              const midX = (x1 + x2) / 2;

              return (
                <g key={edge.id}>
                  <path
                    d={`M ${x1} ${y1} C ${midX} ${y1}, ${midX} ${y2}, ${x2} ${y2}`}
                    fill="none"
                    stroke="#94a3b8"
                    strokeWidth="2"
                    strokeDasharray="6 6"
                  />
                  <circle cx={x2} cy={y2} r="4" fill="#10b981" />
                </g>
              );
            })}
          </svg>

          {nodes.map((node) => {
            const style = nodeStyles[node.kind];
            const Icon = style.icon;
            const selected = selectedId === node.id;

            return (
              <div
                key={node.id}
                onPointerDown={(event) => handlePointerDown(event, node)}
                className={`absolute w-[170px] cursor-grab touch-none select-none rounded-xl border bg-white p-3 shadow-xs transition-shadow ${
                  selected ? "border-emerald-300 shadow-md" : "border-slate-100"
                } ${draggingId === node.id ? "cursor-grabbing shadow-lg" : ""}`}
                style={{ left: node.x, top: node.y }}
              >
                <div className="flex items-center gap-2">
                  <span className={`flex h-7 w-7 items-center justify-center rounded-lg ${style.badge}`}>
                    <Icon className="h-4 w-4" />
                  </span>
                  <div className="min-w-0">
                    <div className="truncate text-xs font-semibold text-slate-900">{node.label}</div>
                    <div className="truncate text-[10px] text-slate-500">{node.description}</div>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <span className={`rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide ${style.badge}`}>
                    {node.kind}
                  </span>
                  <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
                </div>
              </div>
            );
          })}
        </div>

        {isAddNodeOpen && (
          <div
            aria-hidden="true"
            className="absolute inset-0 z-10 rounded-2xl bg-slate-900/35"
          />
        )}

        {isAddNodeOpen && (
          <div
            className={`absolute left-4 top-4 z-20 rounded-2xl border border-slate-100 bg-white p-4 shadow-lg ${
              addNodeStep === "tools" ? "w-[280px]" : "w-[240px]"
            }`}
          >
            {addNodeStep === "type" ? (
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-display text-sm font-semibold text-slate-900">Create node</h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsAddNodeOpen(false)}
                    className="rounded-md p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
                    aria-label="Close"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="space-y-2">
                  {(Object.keys(nodeStyles) as NodeKind[]).map((kind) => {
                    const style = nodeStyles[kind];
                    const Icon = style.icon;
                    const selected = newNodeType === kind;
                    return (
                      <button
                        key={kind}
                        type="button"
                        onClick={() => setNewNodeType(kind)}
                        className={`flex w-full items-center gap-2 rounded-xl border px-2.5 py-2 text-left text-[11px] font-medium transition-colors ${
                          selected ? "border-emerald-300 bg-emerald-50/60" : "border-slate-100 hover:bg-slate-50"
                        }`}
                      >
                        <span className={`flex h-7 w-7 items-center justify-center rounded-lg ${style.badge}`}>
                          <Icon className="h-4 w-4" />
                        </span>
                        <span className="text-[11px] font-medium capitalize text-slate-800">{kind}</span>
                      </button>
                    );
                  })}
                </div>

                <button
                  type="button"
                  onClick={() => setAddNodeStep("tools")}
                  className="w-full rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-slate-800"
                >
                  Continue
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setAddNodeStep("type")}
                      className="rounded-md p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
                      aria-label="Back"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <div>
                      <h3 className="font-display text-sm font-semibold text-slate-900">Add tools</h3>
                      <p className="mt-1 text-[11px] text-slate-500">Select the tools for this node.</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsAddNodeOpen(false)}
                    className="rounded-md p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
                    aria-label="Close"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {nodeTools.map((tool) => {
                    const selected = newNodeTools.includes(tool);
                    return (
                      <button
                        key={tool}
                        type="button"
                        onClick={() => toggleTool(tool)}
                        className={`flex w-full items-center justify-between gap-2 rounded-xl border px-2.5 py-2 text-left text-[11px] font-medium transition-colors ${
                          selected ? "border-emerald-300 bg-emerald-50/60 text-emerald-800" : "border-slate-100 text-slate-700 hover:bg-slate-50"
                        }`}
                      >
                        <span>{tool}</span>
                        <span className={`h-1.5 w-1.5 rounded-full ${selected ? "bg-emerald-500" : "bg-slate-200"}`} />
                      </button>
                    );
                  })}
                </div>

                <button
                  type="button"
                  onClick={submitNewNode}
                  className="w-full rounded-lg bg-emerald-500 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-emerald-600"
                >
                  Add node
                </button>
              </div>
            )}
          </div>
        )}

      </div>

      <div className="text-[11px] text-slate-500">
        Drag and Drop Canvas
      </div>
    </div>
  );
}
