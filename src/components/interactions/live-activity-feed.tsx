import { useMemo } from "react"
import { Activity } from "lucide-react"
import { useApp } from "@/context/app-context"
import { useWorkflow } from "@/context/workflow-context"
import { resolveMemberName, type ActivityItem } from "@/data/mock"
import { formatRelativeTime } from "@/lib/workflow/format"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

interface LiveActivityFeedProps {
  projectId?: string
  agentId?: string
  items?: ActivityItem[]
  emptyMessage?: string
  showAgentBadge?: boolean
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()
}

export function LiveActivityFeed({
  projectId,
  agentId,
  items,
  emptyMessage = "No activity yet.",
  showAgentBadge = false,
}: LiveActivityFeedProps) {
  const { users, agents } = useApp()
  const { clock, getProjectActivity, getAgentActivityItems } = useWorkflow()

  const feedItems = useMemo(() => {
    if (items) return items
    if (agentId) return getAgentActivityItems(agentId)
    if (projectId) return getProjectActivity(projectId)
    return []
  }, [items, agentId, projectId, getProjectActivity, getAgentActivityItems])

  const sorted = useMemo(
    () => [...feedItems].sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [feedItems],
  )

  if (sorted.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border px-6 py-10 text-center">
        <Activity className="mx-auto mb-2 size-8 text-muted-foreground/60" />
        <p className="text-sm text-muted-foreground">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {sorted.map((item) => {
        const actorName = resolveMemberName(item.actorId, users, agents) ?? "Unknown"
        return (
          <div key={item.id} className="flex gap-3">
            <Avatar className="size-8 shrink-0">
              <AvatarFallback className="text-[10px]">{getInitials(actorName)}</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="text-sm">
                <span className="font-medium">{actorName}</span>{" "}
                <span className="text-muted-foreground">{item.action}</span>
              </p>
              <div className="mt-0.5 flex flex-wrap items-center gap-2">
                <p className="text-xs text-muted-foreground">
                  {formatRelativeTime(item.createdAt, clock.simNow)}
                </p>
                {showAgentBadge && item.actorKind === "agent" && (
                  <Badge variant="outline" className="text-[10px] capitalize">
                    agent
                  </Badge>
                )}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
