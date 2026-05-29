import { useMemo, useState } from "react"
import { Plus } from "lucide-react"
import { useApp } from "@/context/app-context"
import { useWorkflow } from "@/context/workflow-context"
import {
  getProjectAgents,
  getProjectUsers,
  type MemberKind,
} from "@/data/mock"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

interface TaskComposerProps {
  projectId: string
  onCreated?: () => void
}

export function TaskComposer({ projectId, onCreated }: TaskComposerProps) {
  const { sessionUser, users, agents } = useApp()
  const { createTask } = useWorkflow()
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [assigneeId, setAssigneeId] = useState<string>("unassigned")

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

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = title.trim()
    if (!trimmed) return

    const selected = assignees.find((item) => item.id === assigneeId)
    createTask({
      projectId,
      title: trimmed,
      description: description.trim() || undefined,
      creatorId: sessionUser.id,
      creatorKind: "user",
      assigneeId: selected?.id === "unassigned" ? undefined : selected?.id,
      assigneeKind: selected?.kind,
    })
    setTitle("")
    setDescription("")
    setAssigneeId("unassigned")
    setOpen(false)
    onCreated?.()
  }

  if (!open) {
    return (
      <Button type="button" variant="outline" className="gap-1.5" onClick={() => setOpen(true)}>
        <Plus className="size-3.5" />
        New task
      </Button>
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-3 rounded-lg border border-border bg-muted/20 p-4"
    >
      <div className="grid gap-2">
        <Label htmlFor="task-title">Title</Label>
        <Input
          id="task-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="What needs to get done?"
          required
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="task-description">Description</Label>
        <Textarea
          id="task-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Optional details..."
          className="min-h-16"
        />
      </div>
      <div className="grid gap-2 sm:max-w-xs">
        <Label>Assign to</Label>
        <Select
          items={assignees.map((assignee) => ({ value: assignee.id, label: assignee.label }))}
          value={assigneeId}
          onValueChange={(v) => v && setAssigneeId(v)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {assignees.map((assignee) => (
              <SelectItem key={assignee.id} value={assignee.id}>
                {assignee.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
          Cancel
        </Button>
        <Button type="submit" disabled={!title.trim()}>
          Create task
        </Button>
      </div>
    </form>
  )
}
