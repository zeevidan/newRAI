import { forceCenter, forceCollide, forceLink, forceManyBody, forceSimulation } from "d3-force"
import type { GraphEdge, GraphNode } from "@/lib/project-graph/types"
import type { LayoutPosition } from "@/lib/project-graph/layout-grouped"

export function applyForceLayout(
  nodes: GraphNode[],
  edges: GraphEdge[],
  width = 960,
  height = 520,
): Map<string, LayoutPosition> {
  const simNodes = nodes.map((node) => ({
    id: node.id,
    x: Math.random() * width,
    y: Math.random() * height,
  }))

  const nodeIndex = new Map(simNodes.map((node, index) => [node.id, index]))

  const simLinks = edges
    .filter((edge) => nodeIndex.has(edge.source) && nodeIndex.has(edge.target))
    .map((edge) => ({
      source: nodeIndex.get(edge.source)!,
      target: nodeIndex.get(edge.target)!,
    }))

  const simulation = forceSimulation(simNodes)
    .force(
      "link",
      forceLink(simLinks)
        .distance(120)
        .strength(0.4),
    )
    .force("charge", forceManyBody().strength(-320))
    .force("center", forceCenter(width / 2, height / 2))
    .force(
      "collide",
      forceCollide(48).strength(0.8),
    )
    .stop()

  for (let i = 0; i < 240; i += 1) {
    simulation.tick()
  }

  const positions = new Map<string, LayoutPosition>()
  for (const node of simNodes) {
    positions.set(node.id, {
      x: node.x ?? width / 2,
      y: node.y ?? height / 2,
    })
  }

  return positions
}
