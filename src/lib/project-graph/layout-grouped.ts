import type { GraphNode } from "@/lib/project-graph/types"

const COLUMN_X: Record<GraphNode["group"], number> = {
  team: 0,
  capabilities: 380,
  resources: 760,
}

const ROW_HEIGHT = 88

export interface LayoutPosition {
  x: number
  y: number
}

export function applyGroupedLayout(nodes: GraphNode[]): Map<string, LayoutPosition> {
  const positions = new Map<string, LayoutPosition>()
  const counters: Record<GraphNode["group"], number> = {
    team: 0,
    capabilities: 0,
    resources: 0,
  }

  const sorted = [...nodes].sort((a, b) => {
    if (a.group !== b.group) {
      const order: GraphNode["group"][] = ["team", "capabilities", "resources"]
      return order.indexOf(a.group) - order.indexOf(b.group)
    }
    if (a.kind !== b.kind) return a.kind.localeCompare(b.kind)
    return a.label.localeCompare(b.label)
  })

  for (const node of sorted) {
    const row = counters[node.group]
    counters[node.group] += 1
    positions.set(node.id, {
      x: COLUMN_X[node.group],
      y: row * ROW_HEIGHT,
    })
  }

  return positions
}
