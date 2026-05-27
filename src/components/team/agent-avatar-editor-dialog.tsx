import { useEffect, useState } from "react"
import type { AgentAvatar } from "@/data/mock"
import {
  AgentAvatarDisplay,
  AgentAvatarPicker,
  resolveAgentAvatar,
} from "@/components/team/agent-avatar"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

interface AgentAvatarEditorDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  name: string
  avatar?: AgentAvatar
  onSave: (avatar: AgentAvatar) => void
}

export function AgentAvatarEditorDialog({
  open,
  onOpenChange,
  name,
  avatar,
  onSave,
}: AgentAvatarEditorDialogProps) {
  const [draft, setDraft] = useState<AgentAvatar>(() =>
    resolveAgentAvatar(avatar, name),
  )

  useEffect(() => {
    if (open) {
      setDraft(resolveAgentAvatar(avatar, name))
    }
  }, [open, avatar, name])

  function handleSave() {
    onSave(resolveAgentAvatar(draft, name))
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        overlayClassName="z-[100] bg-black/45 supports-backdrop-filter:backdrop-blur-sm"
        className="z-[101] gap-0 overflow-hidden border border-border bg-background p-0 shadow-2xl ring-1 ring-foreground/15 sm:max-w-lg"
      >
        <DialogHeader className="border-b border-border bg-muted/40 px-4 py-4">
          <DialogTitle>Edit agent avatar</DialogTitle>
          <DialogDescription>
            Choose initials, an icon, or a custom image for this agent.
          </DialogDescription>
        </DialogHeader>

        <div className="bg-muted/30 px-4 py-4">
          <AgentAvatarPicker value={draft} name={name} onChange={setDraft} variant="dialog" />
        </div>

        <DialogFooter className="border-t border-border bg-muted/50 px-4 py-4">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="button" onClick={handleSave}>
            Save avatar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

interface AgentAvatarButtonProps {
  avatar?: AgentAvatar
  name: string
  status?: "active" | "paused" | "archived"
  size?: "sm" | "md" | "lg"
  className?: string
  onClick: () => void
}

export function AgentAvatarButton({
  avatar,
  name,
  status,
  size = "lg",
  className,
  onClick,
}: AgentAvatarButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      title="Change avatar"
      className={cn(
        "group relative shrink-0 rounded-full outline-none transition-shadow focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        className,
      )}
    >
      <AgentAvatarDisplay avatar={avatar} name={name} status={status} size={size} />
      <span className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-full bg-black/0 text-[10px] font-medium text-white opacity-0 transition-all group-hover:bg-black/45 group-hover:opacity-100">
        Edit
      </span>
    </button>
  )
}
