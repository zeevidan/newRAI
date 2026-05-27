import {
  Bot,
  Brain,
  ChartBar,
  Cpu,
  Eye,
  ImageIcon,
  PenLine,
  Radar,
  Search,
  Shield,
  Sparkles,
  Type,
  Workflow,
  Zap,
  type LucideIcon,
} from "lucide-react"
import type { AgentAvatar, AgentAvatarType } from "@/data/mock"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

export const AGENT_ICON_OPTIONS: { id: string; label: string; Icon: LucideIcon }[] = [
  { id: "bot", label: "Bot", Icon: Bot },
  { id: "brain", label: "Brain", Icon: Brain },
  { id: "sparkles", label: "Sparkles", Icon: Sparkles },
  { id: "cpu", label: "CPU", Icon: Cpu },
  { id: "radar", label: "Radar", Icon: Radar },
  { id: "shield", label: "Shield", Icon: Shield },
  { id: "search", label: "Search", Icon: Search },
  { id: "pen-line", label: "Writer", Icon: PenLine },
  { id: "chart-bar", label: "Analytics", Icon: ChartBar },
  { id: "workflow", label: "Workflow", Icon: Workflow },
  { id: "eye", label: "Vision", Icon: Eye },
  { id: "zap", label: "Fast", Icon: Zap },
]

const iconMap = Object.fromEntries(
  AGENT_ICON_OPTIONS.map((option) => [option.id, option.Icon]),
)

export function agentInitialsFromName(name: string) {
  const trimmed = name.trim()
  if (!trimmed) return "AG"
  if (trimmed.length <= 2) return trimmed.toUpperCase()
  return trimmed.slice(0, 2).toUpperCase()
}

export function defaultAgentAvatar(name: string): AgentAvatar {
  return {
    type: "initials",
    initials: agentInitialsFromName(name),
  }
}

export function resolveAgentAvatar(avatar: AgentAvatar | undefined, name: string): AgentAvatar {
  if (!avatar) return defaultAgentAvatar(name)
  if (avatar.type === "initials") {
    return {
      type: "initials",
      initials: avatar.initials?.slice(0, 2).toUpperCase() || agentInitialsFromName(name),
    }
  }
  if (avatar.type === "icon") {
    return {
      type: "icon",
      icon: avatar.icon && iconMap[avatar.icon] ? avatar.icon : AGENT_ICON_OPTIONS[0].id,
    }
  }
  return { type: "image", imageUrl: avatar.imageUrl }
}

export function getAgentIconComponent(iconId?: string) {
  return iconMap[iconId ?? AGENT_ICON_OPTIONS[0].id] ?? Bot
}

/** Inline SVG for d3 org-chart HTML nodes (16px fits a 42px circle) */
const ORG_CHART_ICON_SIZE = 16

const ORG_CHART_ICON_SVG: Record<string, string> = {
  bot: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/></svg>',
  brain: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z"/><path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z"/><path d="M15 13a4.5 4.5 0 0 1-3-4 4.5 4.5 0 0 1-3 4"/><path d="M17.599 6.5a3 3 0 0 0 .399-1.375"/><path d="M6.003 5.125A3 3 0 0 0 6.401 6.5"/><path d="M3.477 10.896a4 4 0 0 1 .585-.396"/><path d="M19.938 10.5a4 4 0 0 1 .585.396"/><path d="M6 18a4 4 0 0 1-1.967-.516"/><path d="M19.967 17.484A4 4 0 0 1 18 18"/></svg>',
  sparkles: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/><path d="M20 3v4"/><path d="M22 5h-4"/><path d="M4 17v2"/><path d="M5 18H3"/></svg>',
  cpu: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="16" height="16" x="4" y="4" rx="2"/><rect width="6" height="6" x="9" y="9" rx="1"/><path d="M15 2v2"/><path d="M15 20v2"/><path d="M2 15h2"/><path d="M2 9h2"/><path d="M20 15h2"/><path d="M20 9h2"/><path d="M9 2v2"/><path d="M9 20v2"/></svg>',
  radar: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19.07 4.93A10 10 0 0 0 6.99 3.34"/><path d="M4 6h.01"/><path d="M2.29 9.62A10 10 0 1 0 21.31 8.43"/><path d="M16.24 7.76a6 6 0 1 0-8.49 8.49"/><path d="M12 13v2"/><path d="M12 6v2"/></svg>',
  shield: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/></svg>',
  search: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>',
  "pen-line": '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.376 3.622a1 1 0 0 1 3.002 3.002L7.368 18.635a2 2 0 0 1-.855.506l-2.872.838a.5.5 0 0 1-.62-.62l.838-2.872a2 2 0 0 1 .506-.854z"/></svg>',
  "chart-bar": '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v16a2 2 0 0 0 2 2h16"/><path d="M7 16h8"/><path d="M7 11h12"/><path d="M7 6h3"/></svg>',
  workflow: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="8" height="8" x="3" y="3" rx="2"/><path d="M7 11v4a2 2 0 0 0 2 2h4"/><rect width="8" height="8" x="13" y="13" rx="2"/></svg>',
  eye: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"/><circle cx="12" cy="12" r="3"/></svg>',
  zap: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"/></svg>',
}

const ORG_CHART_IMAGE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="${ORG_CHART_ICON_SIZE}" height="${ORG_CHART_ICON_SIZE}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>`

export function getOrgChartAvatarMarkup(avatar: AgentAvatar | undefined, name: string) {
  const resolved = resolveAgentAvatar(avatar, name)
  if (resolved.type === "icon") {
    return ORG_CHART_ICON_SVG[resolved.icon ?? "bot"] ?? ORG_CHART_ICON_SVG.bot
  }
  if (resolved.type === "image") {
    return ORG_CHART_IMAGE_SVG
  }
  return resolved.initials ?? agentInitialsFromName(name)
}

const avatarTypeOptions: { type: AgentAvatarType; label: string; Icon: LucideIcon }[] = [
  { type: "initials", label: "Initials", Icon: Type },
  { type: "icon", label: "Icon", Icon: Sparkles },
  { type: "image", label: "Image", Icon: ImageIcon },
]

interface AgentAvatarDisplayProps {
  avatar?: AgentAvatar
  name: string
  status?: "active" | "paused" | "archived"
  size?: "sm" | "md" | "lg"
  className?: string
}

export function AgentAvatarDisplay({
  avatar,
  name,
  status = "active",
  size = "md",
  className,
}: AgentAvatarDisplayProps) {
  const resolved = resolveAgentAvatar(avatar, name)
  const isPaused = status === "paused"
  const sizeClass =
    size === "sm" ? "size-8" : size === "lg" ? "size-14" : "size-10"
  const initialsClass =
    size === "sm"
      ? "text-[10px] font-medium"
      : size === "lg"
        ? "text-sm font-semibold"
        : "text-xs font-medium"
  const iconSize = size === "sm" ? "size-3.5" : size === "lg" ? "size-7" : "size-5"

  const shellClass = cn(
    "flex shrink-0 items-center justify-center rounded-full",
    sizeClass,
    isPaused ? "bg-slate-400/20 text-slate-500" : "bg-indigo-500/10 text-indigo-600",
    className,
  )

  if (resolved.type === "icon") {
    const Icon = getAgentIconComponent(resolved.icon)
    return (
      <div className={shellClass}>
        <Icon className={iconSize} />
      </div>
    )
  }

  if (resolved.type === "image") {
    return (
      <div
        className={cn(
          shellClass,
          "border border-dashed border-indigo-300/60 bg-indigo-500/5",
        )}
      >
        <ImageIcon className={cn(iconSize, "opacity-60")} />
      </div>
    )
  }

  return (
    <Avatar className={cn(sizeClass, className)}>
      <AvatarFallback
        className={cn(
          initialsClass,
          isPaused ? "bg-slate-400/20 text-slate-500" : "bg-indigo-500/10 text-indigo-600",
        )}
      >
        {resolved.initials}
      </AvatarFallback>
    </Avatar>
  )
}

interface AgentAvatarPickerProps {
  value: AgentAvatar
  name: string
  onChange: (value: AgentAvatar) => void
  variant?: "default" | "dialog"
}

export function AgentAvatarPicker({
  value,
  name,
  onChange,
  variant = "default",
}: AgentAvatarPickerProps) {
  const resolved = resolveAgentAvatar(value, name)

  function setType(type: AgentAvatarType) {
    if (type === "initials") {
      onChange({
        type: "initials",
        initials: resolved.type === "initials" ? resolved.initials : agentInitialsFromName(name),
      })
      return
    }
    if (type === "icon") {
      onChange({
        type: "icon",
        icon:
          resolved.type === "icon"
            ? resolved.icon
            : AGENT_ICON_OPTIONS[0].id,
      })
      return
    }
    onChange({ type: "image" })
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Avatar</Label>
        <div className="flex flex-wrap gap-2">
          {avatarTypeOptions.map(({ type, label, Icon }) => (
            <Button
              key={type}
              type="button"
              size="sm"
              variant={resolved.type === type ? "secondary" : "outline"}
              className="gap-1.5"
              onClick={() => setType(type)}
            >
              <Icon className="size-3.5" />
              {label}
            </Button>
          ))}
        </div>
      </div>

      <div
        className={cn(
          "flex flex-col gap-4 rounded-lg border p-4 sm:flex-row sm:items-start",
          variant === "dialog"
            ? "border-border bg-background shadow-sm"
            : "border-border",
        )}
      >
        <AgentAvatarDisplay avatar={resolved} name={name} size="lg" />

        {resolved.type === "initials" && (
          <div className="min-w-0 flex-1 space-y-2">
            <Label htmlFor="agent-avatar-initials">Initials (2 letters)</Label>
            <Input
              id="agent-avatar-initials"
              value={resolved.initials ?? ""}
              maxLength={2}
              className="max-w-[120px] font-mono uppercase"
              onChange={(e) =>
                onChange({
                  type: "initials",
                  initials: e.target.value.replace(/[^a-zA-Z0-9]/g, "").slice(0, 2).toUpperCase(),
                })
              }
            />
            <p className="text-xs text-muted-foreground">
              Defaults to the first two letters of the agent name.
            </p>
          </div>
        )}

        {resolved.type === "icon" && (
          <div className="min-w-0 flex-1 space-y-2">
            <Label>Choose an icon</Label>
            <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
              {AGENT_ICON_OPTIONS.map(({ id, label, Icon }) => (
                <button
                  key={id}
                  type="button"
                  title={label}
                  onClick={() => onChange({ type: "icon", icon: id })}
                  className={cn(
                    "flex aspect-square items-center justify-center rounded-lg border transition-colors",
                    resolved.icon === id
                      ? "border-indigo-500 bg-indigo-500/10 text-indigo-600"
                      : "border-border hover:bg-muted/60",
                  )}
                >
                  <Icon className="size-5" />
                </button>
              ))}
            </div>
          </div>
        )}

        {resolved.type === "image" && (
          <div className="min-w-0 flex-1 space-y-2">
            <Label>Profile image</Label>
            <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-muted/20 px-6 py-8 text-center">
              <ImageIcon className="size-8 text-muted-foreground/60" />
              <p className="text-sm font-medium">Image upload coming soon</p>
              <p className="max-w-xs text-xs text-muted-foreground">
                You'll be able to upload a custom avatar image for this agent.
              </p>
              <Button type="button" variant="outline" size="sm" disabled>
                Upload image
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
