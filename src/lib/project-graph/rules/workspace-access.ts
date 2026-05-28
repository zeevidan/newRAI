import type { GraphEdge, GraphNode } from "@/lib/project-graph/types"
import { graphNodeId } from "@/lib/project-graph/types"

/**
 * Ensures folder nodes exist for scoped access and removes workspace edges
 * when an agent has explicit folder scopes (handled during build; this rule
 * deduplicates workspace nodes and validates folder references).
 */
export function applyWorkspaceAccessRules(
  nodes: GraphNode[],
  edges: GraphEdge[],
): { nodes: GraphNode[]; edges: GraphEdge[] } {
  const folderIds = new Set(
    nodes.filter((node) => node.kind === "folder").map((node) => node.entityId),
  )

  const filteredEdges = edges.filter((edge) => {
    if (edge.kind !== "accesses") return true
    const target = nodes.find((node) => node.id === edge.target)
    if (target?.kind === "folder" && target.entityId && !folderIds.has(target.entityId)) {
      return false
    }
    return true
  })

  const agentsWithFolderAccess = new Set(
    filteredEdges
      .filter((edge) => {
        const target = nodes.find((node) => node.id === edge.target)
        return edge.kind === "accesses" && target?.kind === "folder"
      })
      .map((edge) => edge.source),
  )

  const prunedEdges = filteredEdges.filter((edge) => {
    if (edge.kind !== "accesses") return true
    const target = nodes.find((node) => node.id === edge.target)
    if (target?.kind === "workspace" && agentsWithFolderAccess.has(edge.source)) {
      return false
    }
    return true
  })

  const workspaceNodeIds = new Set(
    nodes.filter((node) => node.kind === "workspace").map((node) => node.id),
  )
  const workspaceReferenced = prunedEdges.some(
    (edge) => edge.kind === "accesses" && workspaceNodeIds.has(edge.target),
  )

  const prunedNodes = workspaceReferenced
    ? nodes
    : nodes.filter((node) => node.kind !== "workspace")

  return { nodes: prunedNodes, edges: prunedEdges }
}

export function workspaceNodeId(projectId: string) {
  return graphNodeId("workspace", projectId)
}

export function folderNodeId(folderId: string) {
  return graphNodeId("folder", folderId)
}
