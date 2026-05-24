import { useEffect, useMemo, useState } from "react"
import { Search, UserPlus } from "lucide-react"
import { useApp } from "@/context/app-context"
import {
  getAvailableDirectoryCandidates,
  type OrgChartMember,
  type OrgChartMemberKind,
} from "@/data/mock"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ReportsToCombobox } from "@/components/team/reports-to-combobox"

const AGENT_ROLES = ["Manager", "QA", "Writer", "Analyst"] as const
const USER_ROLES = ["Admin", "Engineer", "PM", "Designer"] as const
const MODELS = ["gpt-4.1", "gpt-4.1-mini", "claude-sonnet"] as const

function getChartRootId(members: OrgChartMember[]) {
  return members.find((member) => !member.managerId)?.id ?? null
}

interface TeamMemberCreatePaneProps {
  kind: OrgChartMemberKind
  projectId: string
  managerId?: string | null
  orgChartMembers: OrgChartMember[]
  onCancel: () => void
  onCreated: (kind: OrgChartMemberKind, id: string) => void
  embedded?: boolean
}

export function TeamMemberCreatePane({
  kind,
  projectId,
  managerId,
  orgChartMembers,
  onCancel,
  onCreated,
  embedded = false,
}: TeamMemberCreatePaneProps) {
  const { currentOrg, users, addUser, addAgent } = useApp()
  const isAgent = kind === "agent"

  const chartRootId = useMemo(() => getChartRootId(orgChartMembers), [orgChartMembers])
  const allowTopLevel = !chartRootId

  const directoryCandidates = useMemo(
    () => getAvailableDirectoryCandidates(currentOrg.id, users, projectId),
    [currentOrg.id, users, projectId],
  )

  const [directoryQuery, setDirectoryQuery] = useState("")
  const [selectedDirectoryId, setSelectedDirectoryId] = useState<string>("")
  const [role, setRole] = useState<string>("Engineer")
  const [name, setName] = useState("Manager")
  const [title, setTitle] = useState("Project agent")
  const [model, setModel] = useState("gpt-4.1")
  const [reportsTo, setReportsTo] = useState<string | null>(managerId ?? chartRootId ?? null)

  const filteredCandidates = directoryCandidates.filter((candidate) => {
    const query = directoryQuery.toLowerCase()
    return (
      candidate.displayName.toLowerCase().includes(query) ||
      candidate.email.toLowerCase().includes(query) ||
      candidate.department.toLowerCase().includes(query)
    )
  })

  useEffect(() => {
    setReportsTo(managerId ?? chartRootId ?? null)
  }, [managerId, chartRootId])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    const resolvedManagerId = allowTopLevel
      ? reportsTo || null
      : reportsTo || chartRootId

    if (isAgent) {
      const id = addAgent({
        name,
        title: title.trim() || "Project agent",
        model,
        status: "active",
        managerId: resolvedManagerId,
        projectId,
      })
      onCreated("agent", id)
      return
    }

    const candidate = directoryCandidates.find(
      (item) => item.id === selectedDirectoryId,
    )
    if (!candidate) return

    const id = addUser({
      name: candidate.displayName,
      email: candidate.email,
      role,
      title: candidate.jobTitle,
      managerId: resolvedManagerId,
      projectId,
    })

    onCreated("user", id)
  }

  const form = (
    <form onSubmit={handleSubmit} className="grid gap-5 md:grid-cols-2">
          {isAgent ? (
            <>
              <div className="grid gap-2">
                <Label>Functional role</Label>
                <Select value={name} onValueChange={(value) => value && setName(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {AGENT_ROLES.map((agentRole) => (
                      <SelectItem key={agentRole} value={agentRole}>
                        {agentRole}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="create-agent-title">Title</Label>
                <Input
                  id="create-agent-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Fleet routing manager"
                />
              </div>
              <div className="grid gap-2">
                <Label>Model</Label>
                <Select value={model} onValueChange={(value) => value && setModel(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {MODELS.map((modelOption) => (
                      <SelectItem key={modelOption} value={modelOption}>
                        {modelOption}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </>
          ) : (
            <>
              <div className="grid gap-2 md:col-span-2">
                <Label htmlFor="directory-search">Search directory</Label>
                <div className="relative">
                  <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="directory-search"
                    value={directoryQuery}
                    onChange={(e) => setDirectoryQuery(e.target.value)}
                    placeholder="Name, email, or department"
                    className="pl-9"
                  />
                </div>
              </div>

              <div className="grid gap-2 md:col-span-2">
                <Label>Select person</Label>
                <div className="max-h-56 space-y-2 overflow-y-auto rounded-lg border border-border p-2">
                  {filteredCandidates.length === 0 ? (
                    <p className="px-2 py-4 text-center text-sm text-muted-foreground">
                      No directory users match your search.
                    </p>
                  ) : (
                    filteredCandidates.map((candidate) => (
                      <button
                        key={candidate.id}
                        type="button"
                        onClick={() => setSelectedDirectoryId(candidate.id)}
                        className={`flex w-full items-start gap-3 rounded-md px-3 py-2.5 text-left transition-colors ${
                          selectedDirectoryId === candidate.id
                            ? "bg-primary/10 ring-1 ring-primary/30"
                            : "hover:bg-muted/60"
                        }`}
                      >
                        <UserPlus className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                        <div className="min-w-0">
                          <p className="font-medium">{candidate.displayName}</p>
                          <p className="text-sm text-muted-foreground">{candidate.email}</p>
                          <p className="text-xs text-muted-foreground">
                            {candidate.jobTitle} · {candidate.department}
                          </p>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>

              <div className="grid gap-2">
                <Label>Project role</Label>
                <Select value={role} onValueChange={(value) => value && setRole(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {USER_ROLES.map((userRole) => (
                      <SelectItem key={userRole} value={userRole}>
                        {userRole}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          <div className="grid gap-2 md:col-span-2">
            <Label>Reports to</Label>
            <ReportsToCombobox
              members={orgChartMembers}
              value={reportsTo}
              onValueChange={setReportsTo}
              allowTopLevel={allowTopLevel}
            />
          </div>

          <div className="flex gap-3 pt-2 md:col-span-2">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={!isAgent && !selectedDirectoryId}>
              {isAgent ? "Add agent" : "Add to project"}
            </Button>
          </div>
        </form>
  )

  if (embedded) return form

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isAgent ? "Add agent" : "Add person from directory"}</CardTitle>
        <CardDescription>
          {isAgent
            ? "Configure a new AI agent on this project's org chart."
            : "Search your corporate directory and assign them to this project."}
        </CardDescription>
      </CardHeader>
      <CardContent>{form}</CardContent>
    </Card>
  )
}
