import { useMemo, useState } from "react"
import { MessageSquare, Reply } from "lucide-react"
import { useApp } from "@/context/app-context"
import { useWorkflow } from "@/context/workflow-context"
import { resolveMemberName, type Message } from "@/data/mock"
import { formatRelativeTime } from "@/lib/workflow/format"
import { MessageComposer } from "@/components/interactions/message-composer"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

interface MessageThreadProps {
  projectId: string
  messages: Message[]
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()
}

export function MessageThread({ projectId, messages }: MessageThreadProps) {
  const { users, agents } = useApp()
  const { clock } = useWorkflow()
  const [replyTarget, setReplyTarget] = useState<{
    id: string
    kind: "user" | "agent"
    threadId?: string
  } | null>(null)

  const sorted = useMemo(
    () => [...messages].sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [messages],
  )

  if (sorted.length === 0) {
    return (
      <div className="space-y-4">
        <div className="rounded-lg border border-dashed border-border px-6 py-10 text-center">
          <MessageSquare className="mx-auto mb-2 size-8 text-muted-foreground/60" />
          <p className="text-sm font-medium">No messages yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Start a conversation with your team or agents. Replies to running agents nudge their
            next heartbeat.
          </p>
        </div>
        <MessageComposer projectId={projectId} />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <MessageComposer
        projectId={projectId}
        threadId={replyTarget?.threadId}
        replyToId={replyTarget?.id}
        replyToKind={replyTarget?.kind}
        onSent={() => setReplyTarget(null)}
      />

      <div className="space-y-4">
        {sorted.map((msg) => {
          const authorName = resolveMemberName(msg.authorId, users, agents) ?? "Unknown"
          const recipientName = msg.recipientId
            ? resolveMemberName(msg.recipientId, users, agents)
            : null

          return (
            <div key={msg.id} className="rounded-lg border border-border px-4 py-3">
              <div className="mb-2 flex flex-wrap items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Avatar className="size-7">
                    <AvatarFallback className="text-[10px]">
                      {getInitials(authorName)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-medium">{authorName}</span>
                      <Badge variant="outline" className="capitalize text-[10px]">
                        {msg.authorKind}
                      </Badge>
                      {recipientName && (
                        <span className="text-xs text-muted-foreground">
                          → {recipientName}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {formatRelativeTime(msg.createdAt, clock.simNow)}
                    </p>
                  </div>
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  className="gap-1"
                  onClick={() =>
                    setReplyTarget({
                      id: msg.authorId,
                      kind: msg.authorKind,
                      threadId: msg.threadId ?? `thread-${msg.id}`,
                    })
                  }
                >
                  <Reply className="size-3.5" />
                  Reply
                </Button>
              </div>
              <p className="text-sm leading-relaxed text-foreground/90">{msg.content}</p>
              {msg.threadId && (
                <p className="mt-2 text-[10px] uppercase tracking-wide text-muted-foreground">
                  Thread {msg.threadId}
                </p>
              )}
              <Separator className="mt-3 opacity-50" />
            </div>
          )
        })}
      </div>
    </div>
  )
}
