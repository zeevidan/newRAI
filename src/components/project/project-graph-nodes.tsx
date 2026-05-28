import { memo } from "react"
import {
  Bot,
  Database,
  Folder,
  FolderKanban,
  KeyRound,
  Plug,
  Sparkles,
  UserRound,
  Wrench,
} from "lucide-react"
import { Handle, Position, type NodeProps } from "@xyflow/react"
import type { GraphNodeKind } from "@/lib/project-graph/types"
import { cn } from "@/lib/utils"

export interface ProjectGraphNodeData {
  label: string
  subtitle?: string
  kind: GraphNodeKind
  abstract?: boolean
  dimmed?: boolean
  highlighted?: boolean
  focused?: boolean
  connectedTarget?: boolean
  connectedSource?: boolean
  [key: string]: unknown
}

const kindIcons: Record<GraphNodeKind, typeof Bot> = {
  person: UserRound,
  agent: Bot,
  vault: KeyRound,
  integration: Plug,
  workspace: FolderKanban,
  folder: Folder,
  skill: Sparkles,
  tool: Wrench,
  config: Database,
}

const kindStyles: Record<GraphNodeKind, string> = {
  person: "border-border",
  agent: "border-indigo-400/40 border-dashed",
  vault: "border-amber-400/40",
  integration: "border-sky-400/40",
  workspace: "border-border border-dashed",
  folder: "border-border",
  skill: "border-violet-400/40",
  tool: "border-emerald-400/40",
  config: "border-border",
}

function ProjectGraphNodeComponent({ data }: NodeProps) {
  const nodeData = data as ProjectGraphNodeData
  const Icon = kindIcons[nodeData.kind]

  return (
    <div
      className={cn(
        "min-w-[148px] max-w-[180px] rounded-lg border bg-card px-3 py-2 shadow-sm transition-[box-shadow,border-color,filter] duration-200",
        kindStyles[nodeData.kind],
        nodeData.abstract && "border-dashed",
        nodeData.dimmed && "border-border/40 text-muted-foreground/60 saturate-50",
        nodeData.highlighted && "ring-2 ring-primary/30",
        nodeData.focused && "ring-2 ring-primary shadow-md",
      )}
    >
      <Handle
        type="target"
        position={Position.Left}
        className={cn(
          "!w-2 !h-2 !border-2 transition-colors",
          nodeData.connectedTarget
            ? "!bg-sky-500 !border-sky-600"
            : "!bg-muted-foreground/40 !border-background",
        )}
      />
      <div className="flex items-start gap-2">
        <Icon className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />
        <div className="min-w-0">
          <p className="truncate text-xs font-medium">{nodeData.label}</p>
          {nodeData.subtitle && (
            <p className="truncate text-[10px] text-muted-foreground">{nodeData.subtitle}</p>
          )}
        </div>
      </div>
      <Handle
        type="source"
        position={Position.Right}
        className={cn(
          "!w-2 !h-2 !border-2 transition-colors",
          nodeData.connectedSource
            ? "!bg-violet-500 !border-violet-600"
            : "!bg-muted-foreground/40 !border-background",
        )}
      />
    </div>
  )
}

export const ProjectGraphNode = memo(ProjectGraphNodeComponent)

export const projectGraphNodeTypes = {
  projectGraph: ProjectGraphNode,
}
