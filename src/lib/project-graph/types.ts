export type GraphNodeKind =
  | "person"
  | "agent"
  | "vault"
  | "integration"
  | "workspace"
  | "folder"
  | "skill"
  | "tool"
  | "config"

export type GraphEdgeKind = "reports_to" | "uses" | "accesses"

export type GraphNodeGroup = "team" | "capabilities" | "resources"

export interface GraphNode {
  id: string
  kind: GraphNodeKind
  label: string
  subtitle?: string
  entityId?: string
  group: GraphNodeGroup
  abstract?: boolean
  metadata?: Record<string, unknown>
}

export interface GraphEdge {
  id: string
  kind: GraphEdgeKind
  source: string
  target: string
  label?: string
}

export interface ProjectGraph {
  projectId: string
  nodes: GraphNode[]
  edges: GraphEdge[]
}

export interface GraphBuildOptions {
  showUnusedResources?: boolean
}

export type GraphNodeFilter =
  | "people"
  | "agents"
  | "skills"
  | "tools"
  | "vaults"
  | "integrations"
  | "workspace"

export const DEFAULT_GRAPH_FILTERS: GraphNodeFilter[] = [
  "people",
  "agents",
  "skills",
  "tools",
  "vaults",
  "integrations",
  "workspace",
]

export function graphNodeId(kind: GraphNodeKind, entityId: string) {
  return `${kind}:${entityId}`
}
