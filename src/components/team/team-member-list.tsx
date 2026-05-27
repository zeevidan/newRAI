import { useMemo, useState } from "react"
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Bot,
  Search,
  UserRound,
} from "lucide-react"
import type { Agent, AgentAvatar, EntityStatus, OrgChartMemberKind, User } from "@/data/mock"
import { AgentAvatarDisplay } from "@/components/team/agent-avatar"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"

export interface TeamMemberRow {
  id: string
  kind: OrgChartMemberKind
  name: string
  title: string
  email?: string
  status?: EntityStatus
  avatar?: AgentAvatar
}

type SortKey = "name" | "type" | "title"
type SortDir = "asc" | "desc"

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()
}

export function buildTeamMemberRows(users: User[], agents: Agent[]): TeamMemberRow[] {
  return [
    ...users.map((user) => ({
      id: user.id,
      kind: "user" as const,
      name: user.name,
      title: user.title ?? "—",
      email: user.email,
    })),
    ...agents.map((agent) => ({
      id: agent.id,
      kind: "agent" as const,
      name: agent.name,
      title: agent.model,
      status: agent.status,
      avatar: agent.avatar,
    })),
  ]
}

function SortButton({
  label,
  active,
  direction,
  onClick,
  className,
}: {
  label: string
  active: boolean
  direction: SortDir
  onClick: () => void
  className?: string
}) {
  const Icon = active ? (direction === "asc" ? ArrowUp : ArrowDown) : ArrowUpDown
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground transition-colors hover:text-foreground",
        active && "text-foreground",
        className,
      )}
    >
      {label}
      <Icon className="size-3.5 shrink-0 opacity-70" />
    </button>
  )
}

interface TeamMemberListProps {
  users: User[]
  agents: Agent[]
  onSelectMember: (kind: OrgChartMemberKind, id: string) => void
}

export function TeamMemberList({ users, agents, onSelectMember }: TeamMemberListProps) {
  const [query, setQuery] = useState("")
  const [kindFilter, setKindFilter] = useState<"all" | OrgChartMemberKind>("all")
  const [statusFilter, setStatusFilter] = useState<"all" | EntityStatus>("all")
  const [sortKey, setSortKey] = useState<SortKey>("name")
  const [sortDir, setSortDir] = useState<SortDir>("asc")

  const rows = useMemo(() => buildTeamMemberRows(users, agents), [users, agents])

  const filteredRows = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()

    return rows
      .filter((row) => {
        if (kindFilter !== "all" && row.kind !== kindFilter) return false
        if (statusFilter !== "all") {
          if (row.kind === "user") return false
          if (row.status !== statusFilter) return false
        }
        if (!normalizedQuery) return true
        return (
          row.name.toLowerCase().includes(normalizedQuery) ||
          row.title.toLowerCase().includes(normalizedQuery) ||
          (row.email?.toLowerCase().includes(normalizedQuery) ?? false)
        )
      })
      .sort((a, b) => {
        const pick = (row: TeamMemberRow) => {
          if (sortKey === "type") return row.kind
          if (sortKey === "title") return row.title
          return row.name
        }
        const left = pick(a).toLowerCase()
        const right = pick(b).toLowerCase()
        const cmp = left.localeCompare(right)
        return sortDir === "asc" ? cmp : -cmp
      })
  }, [rows, query, kindFilter, statusFilter, sortKey, sortDir])

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((prev) => (prev === "asc" ? "desc" : "asc"))
      return
    }
    setSortKey(key)
    setSortDir("asc")
  }

  return (
    <div className="flex flex-col">
      <div className="flex flex-col gap-3 border-b border-border/60 bg-muted/20 px-4 py-3 sm:flex-row sm:items-center">
        <div className="relative min-w-0 flex-1">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name, title, email, model..."
            className="pl-9"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <Select
            value={kindFilter}
            onValueChange={(value) => value && setKindFilter(value as typeof kindFilter)}
          >
            <SelectTrigger className="w-[130px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All types</SelectItem>
              <SelectItem value="user">People</SelectItem>
              <SelectItem value="agent">Agents</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={statusFilter}
            onValueChange={(value) => value && setStatusFilter(value as typeof statusFilter)}
          >
            <SelectTrigger className="w-[130px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="paused">Paused</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="hidden grid-cols-[minmax(0,220px)_88px_minmax(0,1fr)_100px] gap-3 border-b border-border/60 px-4 py-2.5 md:grid">
        <SortButton
          label="Name"
          active={sortKey === "name"}
          direction={sortDir}
          onClick={() => toggleSort("name")}
        />
        <SortButton
          label="Type"
          active={sortKey === "type"}
          direction={sortDir}
          onClick={() => toggleSort("type")}
        />
        <SortButton
          label="Title / Model"
          active={sortKey === "title"}
          direction={sortDir}
          onClick={() => toggleSort("title")}
        />
        <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Status
        </span>
      </div>

      <div className="divide-y divide-border">
        {filteredRows.length === 0 ? (
          <p className="px-4 py-12 text-center text-sm text-muted-foreground">
            No team members match your filters.
          </p>
        ) : (
          filteredRows.map((row) => (
            <button
              key={row.id}
              type="button"
              onClick={() => onSelectMember(row.kind, row.id)}
              className="grid w-full grid-cols-1 gap-2 px-4 py-3 text-left transition-colors hover:bg-muted/40 md:grid-cols-[minmax(0,220px)_88px_minmax(0,1fr)_100px] md:items-center md:gap-3"
            >
              <div className="flex min-w-0 items-center gap-3">
                {row.kind === "agent" ? (
                  <AgentAvatarDisplay
                    avatar={row.avatar}
                    name={row.name}
                    status={row.status}
                    size="sm"
                  />
                ) : (
                  <Avatar className="size-8 shrink-0">
                    <AvatarFallback className="bg-primary/10 text-[10px] font-medium text-primary">
                      {getInitials(row.name)}
                    </AvatarFallback>
                  </Avatar>
                )}
                <div className="min-w-0">
                  <p className="truncate font-medium">{row.name}</p>
                  {row.email && (
                    <p className="truncate text-sm text-muted-foreground md:hidden">
                      {row.email}
                    </p>
                  )}
                </div>
              </div>

              <div className="md:contents">
                <Badge
                  variant={row.kind === "agent" ? "outline" : "secondary"}
                  className="w-fit capitalize md:justify-self-start"
                >
                  {row.kind === "agent" ? (
                    <>
                      <Bot className="size-3" />
                      Agent
                    </>
                  ) : (
                    <>
                      <UserRound className="size-3" />
                      Person
                    </>
                  )}
                </Badge>
                <p className="truncate text-sm text-muted-foreground">{row.title}</p>
                <div>
                  {row.kind === "agent" && row.status ? (
                    <Badge
                      variant={row.status === "active" ? "default" : "outline"}
                      className="capitalize"
                    >
                      {row.status}
                    </Badge>
                  ) : (
                    <span className="text-sm text-muted-foreground">—</span>
                  )}
                </div>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  )
}
