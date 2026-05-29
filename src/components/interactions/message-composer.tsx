import { useMemo, useState } from "react"
import { Send } from "lucide-react"
import { useApp } from "@/context/app-context"
import { useWorkflow } from "@/context/workflow-context"
import {
  getProjectAgents,
  getProjectUsers,
  resolveMemberName,
  type MemberKind,
} from "@/data/mock"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

interface MessageComposerProps {
  projectId: string
  threadId?: string
  replyToId?: string
  replyToKind?: MemberKind
  onSent?: () => void
}

export function MessageComposer({
  projectId,
  threadId,
  replyToId,
  replyToKind,
  onSent,
}: MessageComposerProps) {
  const { sessionUser, users, agents } = useApp()
  const { sendMessage } = useWorkflow()
  const [content, setContent] = useState("")
  const [recipientId, setRecipientId] = useState<string>(replyToId ?? "broadcast")

  const recipients = useMemo(() => {
    const projectUsers = getProjectUsers(projectId, users)
    const projectAgents = getProjectAgents(projectId, agents)
    return [
      { id: "broadcast", label: "Everyone on project", kind: undefined as MemberKind | undefined },
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
    const trimmed = content.trim()
    if (!trimmed) return

    const selected = recipients.find((item) => item.id === recipientId)
    sendMessage({
      projectId,
      authorId: sessionUser.id,
      authorKind: "user",
      content: trimmed,
      threadId: threadId ?? (replyToId ? `thread-${replyToId}` : undefined),
      recipientId: selected?.id === "broadcast" ? undefined : selected?.id,
      recipientKind: selected?.kind,
    })
    setContent("")
    onSent?.()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 rounded-lg border border-border bg-muted/20 p-4">
      {replyToId && replyToKind && (
        <p className="text-xs text-muted-foreground">
          Replying to {resolveMemberName(replyToId, users, agents)}
        </p>
      )}
      <div className="grid gap-2 sm:grid-cols-[minmax(0,220px)_1fr]">
        <div className="grid gap-2">
          <Label htmlFor="message-recipient">To</Label>
          <Select
            items={recipients.map((recipient) => ({
              value: recipient.id,
              label: recipient.label,
            }))}
            value={recipientId}
            onValueChange={(v) => v && setRecipientId(v)}
          >
            <SelectTrigger id="message-recipient">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {recipients.map((recipient) => (
                <SelectItem key={recipient.id} value={recipient.id}>
                  {recipient.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="message-content">Message</Label>
          <Textarea
            id="message-content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write a message to the team or an agent..."
            className="min-h-20"
          />
        </div>
      </div>
      <div className="flex justify-end">
        <Button type="submit" disabled={!content.trim()} className="gap-1.5">
          <Send className="size-3.5" />
          Send
        </Button>
      </div>
    </form>
  )
}
