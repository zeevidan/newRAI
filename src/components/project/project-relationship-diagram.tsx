import { useCallback, useEffect, useMemo, useState } from "react"
import {
  Background,
  Controls,
  MiniMap,
  ReactFlow,
  type Edge,
  type Node,
  type ReactFlowInstance,
  type Viewport,
} from "@xyflow/react"
import "@xyflow/react/dist/style.css"
import { filterProjectGraph } from "@/lib/project-graph/build-project-graph"
import { applyForceLayout } from "@/lib/project-graph/layout-force"
import { applyGroupedLayout } from "@/lib/project-graph/layout-grouped"
import {
  DEFAULT_GRAPH_FILTERS,
  type GraphEdge,
  type GraphEdgeKind,
  type GraphNode,
  type GraphNodeFilter,
  type ProjectGraph,
} from "@/lib/project-graph/types"
import {
  projectGraphNodeTypes,
  type ProjectGraphNodeData,
} from "@/components/project/project-graph-nodes"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const edgeStyles: Record<GraphEdgeKind, { stroke: string; strokeDasharray?: string }> = {
  reports_to: { stroke: "hsl(var(--muted-foreground))", strokeDasharray: "4 4" },
  uses: { stroke: "#8b5cf6" },
  accesses: { stroke: "#0ea5e9" },
}

export interface ProjectRelationshipDiagramProps {
  graph: ProjectGraph
  onSelectNode?: (node: GraphNode) => void
  className?: string
}

type LayoutMode = "grouped" | "force"

function getRelationshipHighlight(
  focusedNodeId: string | null,
  edges: GraphEdge[],
): { nodeIds: Set<string>; edgeIds: Set<string> } {
  if (!focusedNodeId) {
    return { nodeIds: new Set(), edgeIds: new Set() }
  }

  const nodeIds = new Set<string>([focusedNodeId])
  const edgeIds = new Set<string>()

  for (const edge of edges) {
    if (edge.source === focusedNodeId || edge.target === focusedNodeId) {
      edgeIds.add(edge.id)
      nodeIds.add(edge.source)
      nodeIds.add(edge.target)
    }
  }

  return { nodeIds, edgeIds }
}

function toFlowNodes(
  nodes: GraphNode[],
  positions: Map<string, { x: number; y: number }>,
  highlight: { nodeIds: Set<string>; edgeIds: Set<string> },
  focusedNodeId: string | null,
): Node[] {
  const isFocusActive = focusedNodeId !== null

  return nodes.map((node) => ({
    id: node.id,
    type: "projectGraph",
    position: positions.get(node.id) ?? { x: 0, y: 0 },
    data: {
      label: node.label,
      subtitle: node.subtitle,
      kind: node.kind,
      abstract: node.abstract,
      dimmed: isFocusActive && !highlight.nodeIds.has(node.id),
      highlighted: isFocusActive && highlight.nodeIds.has(node.id) && node.id !== focusedNodeId,
      focused: node.id === focusedNodeId,
    } satisfies ProjectGraphNodeData,
  }))
}

function toFlowEdges(
  edges: ProjectGraph["edges"],
  highlight: { nodeIds: Set<string>; edgeIds: Set<string> },
  focusedNodeId: string | null,
): Edge[] {
  const isFocusActive = focusedNodeId !== null

  return edges.map((edge) => {
    const style = edgeStyles[edge.kind]
    const isHighlighted = highlight.edgeIds.has(edge.id)

    return {
      id: edge.id,
      source: edge.source,
      target: edge.target,
      label: edge.label,
      zIndex: 0,
      animated: isFocusActive
        ? isHighlighted && (edge.kind === "uses" || edge.kind === "accesses")
        : edge.kind === "uses" || edge.kind === "accesses",
      style: {
        stroke: style.stroke,
        strokeDasharray: style.strokeDasharray,
        strokeWidth: isFocusActive && isHighlighted ? 2.5 : 1.5,
        opacity: isFocusActive ? (isHighlighted ? 1 : 0.08) : 1,
      },
      labelStyle: { fontSize: 10 },
    }
  })
}

const filterLabels: Record<GraphNodeFilter, string> = {
  people: "People",
  agents: "Agents",
  skills: "Skills",
  tools: "Tools",
  vaults: "Vaults",
  integrations: "Integrations",
  workspace: "Workspace",
}

const flowInteractionProps = {
  nodesDraggable: false,
  nodesConnectable: false,
  elementsSelectable: false,
  panOnDrag: false,
  zoomOnScroll: false,
  zoomOnPinch: false,
  zoomOnDoubleClick: false,
  preventScrolling: false,
  proOptions: { hideAttribution: true },
} as const

export function ProjectRelationshipDiagram({
  graph,
  onSelectNode,
  className,
}: ProjectRelationshipDiagramProps) {
  const [layoutMode, setLayoutMode] = useState<LayoutMode>("grouped")
  const [filters, setFilters] = useState<GraphNodeFilter[]>(DEFAULT_GRAPH_FILTERS)
  const [showReportingLines, setShowReportingLines] = useState(false)
  const [focusedNodeId, setFocusedNodeId] = useState<string | null>(null)
  const [viewport, setViewport] = useState<Viewport | undefined>(undefined)

  const filteredGraph = useMemo(
    () => filterProjectGraph(graph, filters),
    [graph, filters],
  )

  const reportingGraph = useMemo(() => {
    if (showReportingLines) return filteredGraph
    return {
      ...filteredGraph,
      edges: filteredGraph.edges.filter((edge) => edge.kind !== "reports_to"),
    }
  }, [filteredGraph, showReportingLines])

  useEffect(() => {
    setFocusedNodeId(null)
    setViewport(undefined)
  }, [graph.projectId, filters, showReportingLines, layoutMode])

  const highlight = useMemo(
    () => getRelationshipHighlight(focusedNodeId, reportingGraph.edges),
    [focusedNodeId, reportingGraph.edges],
  )

  const positions = useMemo(() => {
    if (layoutMode === "force") {
      return applyForceLayout(reportingGraph.nodes, reportingGraph.edges)
    }
    return applyGroupedLayout(reportingGraph.nodes)
  }, [layoutMode, reportingGraph])

  const flowNodes = useMemo(
    () => toFlowNodes(reportingGraph.nodes, positions, highlight, focusedNodeId),
    [reportingGraph.nodes, positions, highlight, focusedNodeId],
  )
  const flowEdges = useMemo(
    () => toFlowEdges(reportingGraph.edges, highlight, focusedNodeId),
    [reportingGraph.edges, highlight, focusedNodeId],
  )

  const layoutNodes = useMemo(
    () =>
      flowNodes.map((node) => ({
        ...node,
        draggable: false,
        selectable: false,
        focusable: false,
        domAttributes: { "aria-hidden": true },
        style: {
          ...(node.style ?? {}),
          opacity: 0,
          pointerEvents: "none" as const,
        },
      })),
    [flowNodes],
  )

  const nodeLookup = useMemo(
    () => new Map(reportingGraph.nodes.map((node) => [node.id, node])),
    [reportingGraph.nodes],
  )

  const focusedLabel = focusedNodeId
    ? reportingGraph.nodes.find((node) => node.id === focusedNodeId)?.label
    : null

  const handleNodeClick = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      const graphNode = nodeLookup.get(node.id)
      if (!graphNode) return

      if (graphNode.kind === "person" || graphNode.kind === "agent") {
        setFocusedNodeId((current) => (current === node.id ? null : node.id))
        return
      }

      setFocusedNodeId(null)
      onSelectNode?.(graphNode)
    },
    [nodeLookup, onSelectNode],
  )

  const handlePaneClick = useCallback(() => {
    setFocusedNodeId(null)
  }, [])

  const handleFlowInit = useCallback((instance: ReactFlowInstance) => {
    instance.fitView({ padding: 0.2 })
    setViewport(instance.getViewport())
  }, [])

  const flowKey = `${graph.projectId}:${layoutMode}:${filters.join(",")}:${showReportingLines}`

  function toggleFilter(filter: GraphNodeFilter) {
    setFilters((current) =>
      current.includes(filter)
        ? current.filter((item) => item !== filter)
        : [...current, filter],
    )
  }

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <div className="flex flex-wrap items-center gap-2">
        <div className="inline-flex rounded-lg border border-border p-0.5">
          <Button
            type="button"
            size="sm"
            variant={layoutMode === "grouped" ? "default" : "ghost"}
            className="h-7 px-2.5 text-xs"
            onClick={() => setLayoutMode("grouped")}
          >
            Grouped
          </Button>
          <Button
            type="button"
            size="sm"
            variant={layoutMode === "force" ? "default" : "ghost"}
            className="h-7 px-2.5 text-xs"
            onClick={() => setLayoutMode("force")}
          >
            Force
          </Button>
        </div>

        <label className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
          <input
            type="checkbox"
            checked={showReportingLines}
            onChange={(e) => setShowReportingLines(e.target.checked)}
            className="size-3.5 rounded border-border"
          />
          Reporting lines
        </label>

        <div className="hidden h-4 w-px bg-border sm:block" />

        <div className="flex flex-wrap gap-2">
          {(Object.keys(filterLabels) as GraphNodeFilter[]).map((filter) => (
            <label
              key={filter}
              className="inline-flex items-center gap-1.5 rounded-md border border-border px-2 py-1 text-xs"
            >
              <input
                type="checkbox"
                checked={filters.includes(filter)}
                onChange={() => toggleFilter(filter)}
                className="size-3 rounded border-border"
              />
              {filterLabels[filter]}
            </label>
          ))}
        </div>
      </div>

      {focusedLabel && (
        <p className="text-xs text-muted-foreground">
          Showing relationships for <span className="font-medium text-foreground">{focusedLabel}</span>.
          Click the canvas to clear.
        </p>
      )}

      <div className="project-relationship-flow relative h-[520px] overflow-hidden rounded-xl border border-border bg-muted/10">
        <div className="project-relationship-flow-edges pointer-events-none absolute inset-0 z-0">
          <ReactFlow
            key={`${flowKey}-edges`}
            {...flowInteractionProps}
            nodes={layoutNodes}
            edges={flowEdges}
            nodeTypes={projectGraphNodeTypes}
            viewport={viewport}
            minZoom={0.35}
            maxZoom={1.4}
            zIndexMode="manual"
            defaultEdgeOptions={{ zIndex: 0 }}
          />
        </div>

        <div className="project-relationship-flow-nodes absolute inset-0 z-10">
          <ReactFlow
            key={`${flowKey}-nodes`}
            nodes={flowNodes}
            edges={[]}
            nodeTypes={projectGraphNodeTypes}
            onNodeClick={handleNodeClick}
            onPaneClick={handlePaneClick}
            onInit={handleFlowInit}
            onViewportChange={setViewport}
            viewport={viewport}
            minZoom={0.35}
            maxZoom={1.4}
            proOptions={{ hideAttribution: true }}
          >
            <Background gap={20} size={1} />
            <Controls showInteractive={false} />
            <MiniMap
              pannable
              zoomable
              nodeStrokeWidth={2}
              className="!bg-background/90"
            />
          </ReactFlow>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 text-[11px] text-muted-foreground">
        <span className="inline-flex items-center gap-1">
          <span className="size-2 rounded-full bg-violet-500" /> Uses
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="size-2 rounded-full bg-sky-500" /> Accesses
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="size-2 rounded-full bg-muted-foreground" /> Reports to
        </span>
      </div>
    </div>
  )
}
