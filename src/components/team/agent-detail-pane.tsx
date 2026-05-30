import { useEffect, useMemo, useState } from "react"
import {
  Activity,
  Brain,
  Database,
  FileCode2,
  HeartPulse,
  ScrollText,
  Settings2,
  Shield,
  Sparkles,
  Wallet,
  Wrench,
} from "lucide-react"
import { useApp } from "@/context/app-context"
import { useWorkflow } from "@/context/workflow-context"
import {
  getAgentConfigurations,
  resolveMemberName,
  type AgentAvatar,
  type EntityStatus,
  type OrgChartMember,
} from "@/data/mock"
import {
  AgentAvatarButton,
  AgentAvatarEditorDialog,
} from "@/components/team/agent-avatar-editor-dialog"
import { AgentAccessDataTab } from "@/components/team/agent-detail/agent-access-data-tab"
import { AgentBehaviorTab } from "@/components/team/agent-detail/agent-behavior-tab"
import { AgentBudgetTab } from "@/components/team/agent-detail/agent-budget-tab"
import { AgentContextTab } from "@/components/team/agent-detail/agent-context-tab"
import { AgentGuardrailsTab } from "@/components/team/agent-detail/agent-guardrails-tab"
import { AgentHeartbeatTab } from "@/components/team/agent-detail/agent-heartbeat-tab"
import { AgentSkillsToolsTab } from "@/components/team/agent-detail/agent-skills-tools-tab"
import { LiveActivityFeed } from "@/components/interactions/live-activity-feed"
import { RunControls } from "@/components/workflow/run-controls"
import { Badge } from "@/components/ui/badge"
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { ReportsToCombobox } from "@/components/team/reports-to-combobox"
import { ENTITY_STATUS_ITEMS } from "@/lib/select-items"

const MODELS = ["gpt-4.1", "gpt-4.1-mini", "claude-sonnet"] as const

function getChartRootId(members: OrgChartMember[], excludeId?: string) {
  return members.find((member) => !member.managerId && member.id !== excludeId)?.id ?? null
}

function logLevelVariant(level: string) {
  if (level === "error") return "destructive" as const
  if (level === "warn") return "outline" as const
  return "secondary" as const
}

interface AgentDetailPaneProps {
  agentId: string
  projectId: string
  orgChartMembers: OrgChartMember[]
  onSaved?: () => void
}

export function AgentDetailPane({
  agentId,
  projectId,
  orgChartMembers,
  onSaved,
}: AgentDetailPaneProps) {
  const { users, agents, updateAgent } = useApp()
  const {
    getAgentRuntime,
    getAgentActivityItems,
    getAgentLogItems,
    startAgent,
    pauseAgent,
    stopAgent,
  } = useWorkflow()
  const agent = agents.find((item) => item.id === agentId)

  const [name, setName] = useState(agent?.name ?? "")
  const [description, setDescription] = useState(agent?.description ?? "")
  const [model, setModel] = useState(agent?.model ?? "gpt-4.1")
  const [status, setStatus] = useState<EntityStatus>(agent?.status ?? "active")
  const [managerId, setManagerId] = useState<string | null>(agent?.managerId ?? null)
  const [avatarDialogOpen, setAvatarDialogOpen] = useState(false)

  const runtime = getAgentRuntime(agentId, projectId)
  const activity = getAgentActivityItems(agentId)
  const logs = getAgentLogItems(agentId)
  const configurations = getAgentConfigurations(agentId)

  const chartRootId = useMemo(
    () => getChartRootId(orgChartMembers, agentId),
    [orgChartMembers, agentId],
  )
  const isRoot = agentId === chartRootId
  const allowTopLevel = !chartRootId || isRoot

  useEffect(() => {
    if (!agent) return
    setName(agent.name)
    setDescription(agent.description ?? "")
    setModel(agent.model)
    setStatus(agent.status)
    setManagerId(agent.managerId ?? null)
  }, [agent])

  if (!agent) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-sm text-muted-foreground">
          Agent not found.
        </CardContent>
      </Card>
    )
  }

  function handleSave(e: React.FormEvent) {
    e.preventDefault()
    const trimmedName = name.trim()
    if (!trimmedName) return

    const resolvedManagerId = allowTopLevel
      ? managerId || null
      : managerId || chartRootId

    updateAgent(agentId, {
      name: trimmedName,
      description: description.trim() || undefined,
      model,
      status,
      managerId: resolvedManagerId,
      projectId,
      onProject: true,
    })
    onSaved?.()
  }

  function handleAvatarSave(avatar: AgentAvatar) {
    updateAgent(agentId, {
      avatar,
      projectId,
      onProject: true,
    })
  }

  const managerName = agent.managerId
    ? resolveMemberName(agent.managerId, users, agents)
    : null

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
          <div className="flex items-start gap-4">
            <AgentAvatarButton
              avatar={agent.avatar}
              name={agent.name}
              status={agent.status}
              size="lg"
              onClick={() => setAvatarDialogOpen(true)}
            />
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <CardTitle className="text-xl">{agent.name}</CardTitle>
                <Badge
                  variant={agent.status === "active" ? "default" : "outline"}
                  className="capitalize"
                >
                  {agent.status}
                </Badge>
              </div>
              <CardDescription className="mt-1">
                {agent.description ? `${agent.description} · ` : ""}
                {agent.model}
              </CardDescription>
              {managerName && (
                <p className="mt-2 text-xs text-muted-foreground">
                  Reports to {managerName}
                </p>
              )}
              {runtime?.currentAction && runtime.runState === "running" && (
                <p className="mt-2 text-xs text-emerald-600">{runtime.currentAction}</p>
              )}
            </div>
          </div>
          <RunControls
            runState={runtime?.runState ?? "stopped"}
            onStart={() => startAgent(agentId, projectId)}
            onPause={() => pauseAgent(agentId, projectId)}
            onStop={() => stopAgent(agentId, projectId)}
            disabled={agent.status === "archived"}
            size="sm"
          />
        </CardHeader>
      </Card>

      <AgentAvatarEditorDialog
        open={avatarDialogOpen}
        onOpenChange={setAvatarDialogOpen}
        name={agent.name}
        avatar={agent.avatar}
        onSave={handleAvatarSave}
      />

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList
          variant="line"
          className="h-auto w-full justify-start gap-0 overflow-x-auto bg-transparent pb-px"
        >
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="behavior">
            <Sparkles className="size-4" />
            Behavior
          </TabsTrigger>
          <TabsTrigger value="skills-tools">
            <Wrench className="size-4" />
            Skills & Tools
          </TabsTrigger>
          <TabsTrigger value="access-data">
            <Database className="size-4" />
            Access & Data
          </TabsTrigger>
          <TabsTrigger value="guardrails">
            <Shield className="size-4" />
            Guardrails
          </TabsTrigger>
          <TabsTrigger value="heartbeat">
            <HeartPulse className="size-4" />
            Heartbeat
          </TabsTrigger>
          <TabsTrigger value="budget">
            <Wallet className="size-4" />
            Budget
          </TabsTrigger>
          <TabsTrigger value="context">
            <Brain className="size-4" />
            Context
          </TabsTrigger>
          <TabsTrigger value="configurations">
            <Settings2 className="size-4" />
            Configurations
          </TabsTrigger>
          <TabsTrigger value="activity">
            <Activity className="size-4" />
            Activity
          </TabsTrigger>
          <TabsTrigger value="logs">
            <ScrollText className="size-4" />
            Logs
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-0">
          <form onSubmit={handleSave} className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Agent settings</CardTitle>
                <CardDescription>
                  Identity, model, and org chart placement for this project.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2">
                <div className="grid gap-2 md:col-span-2">
                  <Label htmlFor="agent-name">Name</Label>
                  <Input
                    id="agent-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Strategy research assistant"
                    required
                  />
                </div>

                <div className="grid gap-2 md:col-span-2">
                  <Label htmlFor="agent-description">Description</Label>
                  <Textarea
                    id="agent-description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="What this agent does on the project (optional)"
                    className="min-h-20"
                  />
                </div>

                <div className="grid gap-2">
                  <Label>Model</Label>
                  <Select
                    items={MODELS.map((modelOption) => ({
                      value: modelOption,
                      label: modelOption,
                    }))}
                    value={model}
                    onValueChange={(value) => value && setModel(value)}
                  >
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

                <div className="grid gap-2">
                  <Label>Status</Label>
                  <Select
                    items={ENTITY_STATUS_ITEMS}
                    value={status}
                    onValueChange={(value) => value && setStatus(value as EntityStatus)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="paused">Paused</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2 md:col-span-2">
                  <Label>Reports to</Label>
                  <ReportsToCombobox
                    members={orgChartMembers}
                    excludeId={agentId}
                    value={managerId}
                    onValueChange={setManagerId}
                    allowTopLevel={allowTopLevel}
                  />
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button type="submit" disabled={!name.trim()}>
                Save & Close
              </Button>
            </div>
          </form>
        </TabsContent>

        <TabsContent value="behavior" className="mt-0">
          <AgentBehaviorTab agentId={agentId} projectId={projectId} onSaved={onSaved} />
        </TabsContent>

        <TabsContent value="skills-tools" className="mt-0">
          <AgentSkillsToolsTab agentId={agentId} projectId={projectId} onSaved={onSaved} />
        </TabsContent>

        <TabsContent value="access-data" className="mt-0">
          <AgentAccessDataTab agentId={agentId} projectId={projectId} onSaved={onSaved} />
        </TabsContent>

        <TabsContent value="guardrails" className="mt-0">
          <AgentGuardrailsTab agentId={agentId} projectId={projectId} onSaved={onSaved} />
        </TabsContent>

        <TabsContent value="heartbeat" className="mt-0">
          <AgentHeartbeatTab agentId={agentId} projectId={projectId} onSaved={onSaved} />
        </TabsContent>

        <TabsContent value="budget" className="mt-0">
          <AgentBudgetTab agentId={agentId} projectId={projectId} onSaved={onSaved} />
        </TabsContent>

        <TabsContent value="context" className="mt-0">
          <AgentContextTab agentId={agentId} projectId={projectId} onSaved={onSaved} />
        </TabsContent>

        <TabsContent value="configurations" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <FileCode2 className="size-4" />
                Agent configurations
              </CardTitle>
              <CardDescription>
                Environment-specific settings bound to this agent (read-only).
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {configurations.length === 0 ? (
                <p className="text-sm text-muted-foreground">No configurations defined.</p>
              ) : (
                configurations.map((config) => (
                  <div
                    key={`${config.key}-${config.environment}`}
                    className="flex flex-col gap-2 rounded-lg border border-border px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <code className="font-mono text-sm text-primary">{config.key}</code>
                      {config.description && (
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {config.description}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm">{config.value}</span>
                      <Badge variant="outline">{config.environment}</Badge>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Recent activity</CardTitle>
              <CardDescription>Actions performed by this agent on the project.</CardDescription>
            </CardHeader>
            <CardContent>
              <LiveActivityFeed
                agentId={agentId}
                items={activity}
                showAgentBadge
                emptyMessage="No activity recorded. Start the agent to see live actions."
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Runtime logs</CardTitle>
              <CardDescription>Structured log output from agent execution.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {logs.length === 0 ? (
                <p className="text-sm text-muted-foreground">No logs available.</p>
              ) : (
                logs.map((entry) => (
                  <div
                    key={entry.id}
                    className="rounded-lg border border-border bg-muted/20 px-4 py-3 font-mono text-xs"
                  >
                    <div className="mb-1 flex flex-wrap items-center gap-2">
                      <Badge variant={logLevelVariant(entry.level)} className="uppercase">
                        {entry.level}
                      </Badge>
                      <span className="text-muted-foreground">
                        {new Date(entry.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-foreground/90">{entry.message}</p>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
