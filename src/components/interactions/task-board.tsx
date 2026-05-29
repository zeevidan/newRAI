import { useMemo } from "react"
import { ListTodo } from "lucide-react"
import { useApp } from "@/context/app-context"
import { useWorkflow } from "@/context/workflow-context"
import { resolveMemberName, getProjectAgents, getProjectUsers, type MemberKind, type Task } from "@/data/mock"
import { formatRelativeTime } from "@/lib/workflow/format"
import { TASK_STATUS_ITEMS } from "@/lib/select-items"
import { TaskComposer } from "@/components/interactions/task-composer"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface TaskBoardProps {
  projectId: string
  tasks: Task[]
}

const STATUS_OPTIONS: Task["status"][] = ["todo", "in_progress", "blocked", "done"]

function statusVariant(status: Task["status"]) {
  if (status === "done") return "secondary" as const
  if (status === "in_progress") return "default" as const
  if (status === "blocked") return "destructive" as const
  return "outline" as const
}

export function TaskBoard({ projectId, tasks }: TaskBoardProps) {
  const { users, agents } = useApp()
  const { clock, updateTaskStatus, assignTask } = useWorkflow()

  const sorted = useMemo(
    () =>
      [...tasks].sort((a, b) => {
        const statusOrder = { in_progress: 0, todo: 1, blocked: 2, done: 3 }
        const left = statusOrder[a.status]
        const right = statusOrder[b.status]
        if (left !== right) return left - right
        return b.updatedAt.localeCompare(a.updatedAt)
      }),
    [tasks],
  )

  const assignees = useMemo(() => {
    const projectUsers = getProjectUsers(projectId, users)
    const projectAgents = getProjectAgents(projectId, agents)
    return [
      { id: "unassigned", label: "Unassigned", kind: undefined as MemberKind | undefined },
      ...projectUsers.map((user) => ({
        id: user.id,
        label: user.name,
        kind: "user" as const,
      })),
      ...projectAgents.map((agent) => ({
        id: agent.id,
        label: agent.name,
        kind: "agent" as const,
      })),
    ]
  }, [projectId, users, agents])

  if (sorted.length === 0) {
    return (
      <div className="space-y-4">
        <div className="rounded-lg border border-dashed border-border px-6 py-10 text-center">
          <ListTodo className="mx-auto mb-2 size-8 text-muted-foreground/60" />
          <p className="text-sm font-medium">No tasks yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Create tasks and assign them to people or running agents.
          </p>
        </div>
        <TaskComposer projectId={projectId} />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <TaskComposer projectId={projectId} />

      <div className="space-y-3">
        {sorted.map((task) => {
          const assigneeName = task.assigneeId
            ? resolveMemberName(task.assigneeId, users, agents)
            : "Unassigned"

          return (
            <div
              key={task.id}
              className="flex flex-col gap-3 rounded-lg border border-border px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0 flex-1">
                <p className="font-medium">{task.title}</p>
                {task.description && (
                  <p className="mt-0.5 text-sm text-muted-foreground">{task.description}</p>
                )}
                <p className="mt-1 text-xs text-muted-foreground">
                  {assigneeName}
                  {task.dueAt && ` · due ${new Date(task.dueAt).toLocaleDateString()}`}
                  {" · updated "}
                  {formatRelativeTime(task.updatedAt, clock.simNow)}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Select
                  items={assignees.map((assignee) => ({
                    value: assignee.id,
                    label: assignee.label,
                  }))}
                  value={task.assigneeId ?? "unassigned"}
                  onValueChange={(value) => {
                    if (!value || value === "unassigned") return
                    const kind = users.some((u) => u.id === value) ? "user" : "agent"
                    assignTask(task.id, value, kind)
                  }}
                >
                  <SelectTrigger className="w-[160px]">
                    <SelectValue placeholder="Assignee" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unassigned">Unassigned</SelectItem>
                    {assignees
                      .filter((assignee) => assignee.id !== "unassigned")
                      .map((assignee) => (
                        <SelectItem key={assignee.id} value={assignee.id}>
                          {assignee.label}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                <Select
                  items={TASK_STATUS_ITEMS}
                  value={task.status}
                  onValueChange={(value) =>
                    value && updateTaskStatus(task.id, value as Task["status"])
                  }
                >
                  <SelectTrigger className="w-[140px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status.replace("_", " ")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Badge variant={statusVariant(task.status)} className="capitalize">
                  {task.status.replace("_", " ")}
                </Badge>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
