import { useEffect, useMemo, useState } from "react"
import { useParams } from "react-router-dom"
import {
  Activity,
  ArrowLeftRight,
  CircleDollarSign,
  FolderKanban,
  LayoutDashboard,
  ListTodo,
  MessageSquare,
  Settings2,
  Users,
} from "lucide-react"
import { useApp } from "@/context/app-context"
import { useWorkflow } from "@/context/workflow-context"
import {
  formatCurrency,
  getProjectActiveAgentCount,
  getProjectAgents,
  getProjectPeopleCount,
  getProjectResources,
  getProjectUsers,
  type OrgChartMemberKind,
} from "@/data/mock"
import { getProjectGraph } from "@/lib/project-graph/get-project-graph"
import type { GraphNode } from "@/lib/project-graph/types"
import { ProjectRelationshipDiagram } from "@/components/project/project-relationship-diagram"
import { LiveActivityFeed } from "@/components/interactions/live-activity-feed"
import { MessageThread } from "@/components/interactions/message-thread"
import { TaskBoard } from "@/components/interactions/task-board"
import { RunControls } from "@/components/workflow/run-controls"
import { WorkflowApprovals } from "@/components/workflow/workflow-approvals"
import { TeamTab } from "@/components/team/team-tab"
import { WorkspaceTab } from "@/components/workspace/workspace-tab"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function ProjectMainPane() {
  const { projectId } = useParams()
  const {
    orgProjects,
    users,
    agents,
    resources,
    vaults,
    tools,
    agentAccessGrants,
    configurations,
  } = useApp()
  const {
    clock,
    getProjectTasks,
    getProjectMessages,
    getProjectActivity,
    getProjectRuntime,
    runningAgentCount,
    pendingProposalCount,
    startProject,
    pauseProject,
    stopProject,
    setSpeed,
    pauseClock,
    resumeClock,
  } = useWorkflow()

  const selectedProject =
    orgProjects.find((project) => project.id === projectId) ?? null

  const [activeTab, setActiveTab] = useState("overview")
  const [interactionView, setInteractionView] = useState<"messages" | "tasks">(
    "messages",
  )
  const [teamFocus, setTeamFocus] = useState<{
    kind: OrgChartMemberKind
    id: string
  } | null>(null)
  const [workspaceFocus, setWorkspaceFocus] = useState<{
    view: "files" | "integrations" | "vaults"
    folderId?: string | null
  } | null>(null)

  const projectGraph = useMemo(
    () =>
      selectedProject
        ? getProjectGraph(selectedProject.id, {
            users,
            agents,
            vaults,
            resources,
            grants: agentAccessGrants,
            toolList: tools,
          })
        : null,
    [
      selectedProject,
      users,
      agents,
      vaults,
      resources,
      agentAccessGrants,
      tools,
    ],
  )

  useEffect(() => {
    if (activeTab !== "interactions") {
      setInteractionView("messages")
    }
  }, [activeTab])

  if (!selectedProject) {
    return (
      <div className="flex flex-1 items-center justify-center text-muted-foreground">
        Select or create a project to get started.
      </div>
    )
  }

  const tasks = getProjectTasks(selectedProject.id)
  const messages = getProjectMessages(selectedProject.id)
  const activity = getProjectActivity(selectedProject.id)
  const projectRuntime = getProjectRuntime(selectedProject.id)
  const runState = projectRuntime?.runState ?? "stopped"
  const agentsRunning = runningAgentCount(selectedProject.id)
  const pendingApprovals = pendingProposalCount(selectedProject.id)
  const projectUsers = getProjectUsers(selectedProject.id, users)
  const projectAgents = getProjectAgents(selectedProject.id, agents)
  const projectResources = getProjectResources(selectedProject.id, resources)
  const peopleCount = getProjectPeopleCount(selectedProject.id, users, agents)
  const taskCount = tasks.length
  const openTaskCount = tasks.filter((task) => task.status !== "done").length
  const interactionCount = messages.length + taskCount
  const activeAgentCount = getProjectActiveAgentCount(selectedProject.id, agents)
  const budgetPct = Math.round(
    (selectedProject.budgetUsed / selectedProject.budgetTotal) * 100,
  )

  function handleGraphNodeSelect(node: GraphNode) {
    if (!node.entityId && node.kind !== "workspace") return

    switch (node.kind) {
      case "workspace":
        setWorkspaceFocus({ view: "files", folderId: null })
        setActiveTab("workspace")
        break
      case "folder":
        setWorkspaceFocus({ view: "files", folderId: node.entityId ?? null })
        setActiveTab("workspace")
        break
      case "vault":
        setWorkspaceFocus({ view: "vaults" })
        setActiveTab("workspace")
        break
      case "integration":
        setWorkspaceFocus({ view: "integrations" })
        setActiveTab("workspace")
        break
      default:
        break
    }
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="shrink-0 px-6 pt-8 pb-8">
        <div className="flex flex-wrap items-start justify-between gap-8">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <h1 className="text-xl font-semibold tracking-tight">
                {selectedProject.name}
              </h1>
              <Badge variant="outline" className="capitalize">
                {selectedProject.status}
              </Badge>
            </div>
            <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
              {selectedProject.description}
            </p>
          </div>
          <div className="flex flex-col items-end gap-4">
            <RunControls
              runState={runState}
              onStart={() => startProject(selectedProject.id)}
              onPause={() => pauseProject(selectedProject.id)}
              onStop={() => stopProject(selectedProject.id)}
              disabled={selectedProject.status === "archived"}
              clockSpeed={{
                speed: clock.speed,
                ticking: clock.ticking,
                onSetSpeed: setSpeed,
                onPauseClock: pauseClock,
                onResumeClock: resumeClock,
              }}
            />
            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <span>
                {agentsRunning} agent{agentsRunning === 1 ? "" : "s"} running
              </span>
              {pendingApprovals > 0 && (
                <Badge variant="outline">{pendingApprovals} approvals</Badge>
              )}
            </div>
            <div className="flex gap-10 text-sm">
              <div>
                <p className="text-muted-foreground">People & agents</p>
                <p className="font-medium">{peopleCount}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Interactions</p>
                <p className="font-medium">{interactionCount}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Budget</p>
                <p className="font-medium">{budgetPct}% used</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="flex min-h-0 flex-1 flex-col"
      >
        <div className="shrink-0 border-b border-border px-6">
          <TabsList variant="line" className="h-11 w-full justify-start bg-transparent">
            <TabsTrigger value="overview">
              <LayoutDashboard className="size-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="team">
              <Users className="size-4" />
              Team
            </TabsTrigger>
            <TabsTrigger value="workspace">
              <FolderKanban className="size-4" />
              Workspace
            </TabsTrigger>
            <TabsTrigger value="interactions">
              <ArrowLeftRight className="size-4" />
              Interactions
            </TabsTrigger>
            <TabsTrigger value="activity">
              <Activity className="size-4" />
              Activity
            </TabsTrigger>
            <TabsTrigger value="budget">
              <CircleDollarSign className="size-4" />
              Budget
            </TabsTrigger>
            <TabsTrigger value="configurations">
              <Settings2 className="size-4" />
              Configurations
            </TabsTrigger>
          </TabsList>
        </div>

        <ScrollArea className="min-h-0 flex-1">
          <div className="p-6">
            <TabsContent value="overview" className="mt-0 space-y-4">
              {projectGraph && (
                <Card>
                  <CardHeader>
                    <CardTitle>Project relationships</CardTitle>
                    <CardDescription>
                      How people, agents, skills, tools, and resources connect on
                      this project. Agents glow green while beating; messages and
                      task handoffs flash briefly between people and agents.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ProjectRelationshipDiagram
                      graph={projectGraph}
                      onSelectNode={handleGraphNodeSelect}
                    />
                  </CardContent>
                </Card>
              )}

              <div className="grid gap-4 md:grid-cols-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription>People</CardDescription>
                    <CardTitle className="text-2xl">{projectUsers.length}</CardTitle>
                  </CardHeader>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription>Active agents</CardDescription>
                    <CardTitle className="text-2xl">{activeAgentCount}</CardTitle>
                  </CardHeader>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription>Resources</CardDescription>
                    <CardTitle className="text-2xl">{projectResources.length}</CardTitle>
                  </CardHeader>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription>Open tasks</CardDescription>
                    <CardTitle className="text-2xl">
                      {tasks.filter((task) => task.status !== "done").length}
                    </CardTitle>
                  </CardHeader>
                </Card>
              </div>
              <Card>
                <CardHeader>
                  <CardTitle>Recent activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <LiveActivityFeed
                    projectId={selectedProject.id}
                    emptyMessage={
                      runState === "stopped"
                        ? "Press Start to run the team and generate live activity."
                        : "No activity yet."
                    }
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="team" className="mt-0">
              <TeamTab
                projectId={selectedProject.id}
                projectName={selectedProject.name}
                isActive={activeTab === "team"}
                onBackToProject={() => setActiveTab("overview")}
                focusMember={teamFocus}
                onFocusMemberConsumed={() => setTeamFocus(null)}
              />
            </TabsContent>

            <TabsContent value="workspace" className="mt-0">
              <WorkspaceTab
                projectId={selectedProject.id}
                isActive={activeTab === "workspace"}
                focus={workspaceFocus}
                onFocusConsumed={() => setWorkspaceFocus(null)}
              />
            </TabsContent>

            <TabsContent value="interactions" className="mt-0 space-y-4">
              <WorkflowApprovals projectId={selectedProject.id} />

              <Card>
                <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <CardTitle>Interactions</CardTitle>
                    <CardDescription>
                      {interactionView === "messages"
                        ? `${messages.length} ${messages.length === 1 ? "message" : "messages"} on this project`
                        : `${taskCount} total · ${openTaskCount} open`}
                    </CardDescription>
                  </div>

                  <div className="flex rounded-lg border border-border bg-background p-0.5">
                    <Button
                      type="button"
                      variant={interactionView === "messages" ? "secondary" : "ghost"}
                      size="sm"
                      className="gap-1.5"
                      onClick={() => setInteractionView("messages")}
                    >
                      <MessageSquare className="size-3.5" />
                      Messages
                    </Button>
                    <Button
                      type="button"
                      variant={interactionView === "tasks" ? "secondary" : "ghost"}
                      size="sm"
                      className="gap-1.5"
                      onClick={() => setInteractionView("tasks")}
                    >
                      <ListTodo className="size-3.5" />
                      Tasks
                    </Button>
                  </div>
                </CardHeader>

                <CardContent>
                  {runState === "stopped" ? (
                    <div className="rounded-lg border border-dashed border-border px-6 py-10 text-center">
                      <p className="text-sm font-medium">Team is stopped</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Press Start in the project header to run agents and enable live
                        interactions.
                      </p>
                    </div>
                  ) : interactionView === "messages" ? (
                    <MessageThread projectId={selectedProject.id} messages={messages} />
                  ) : (
                    <TaskBoard projectId={selectedProject.id} tasks={tasks} />
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="activity" className="mt-0">
              <Card>
                <CardHeader>
                  <CardTitle>Activity log</CardTitle>
                  <CardDescription>Live feed of project actions.</CardDescription>
                </CardHeader>
                <CardContent>
                  <LiveActivityFeed
                    projectId={selectedProject.id}
                    items={activity}
                    emptyMessage={
                      runState === "stopped"
                        ? "Press Start to run the team."
                        : "No activity recorded yet."
                    }
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="budget" className="mt-0">
              <Card>
                <CardHeader>
                  <CardTitle>Budget overview</CardTitle>
                  <CardDescription>
                    {formatCurrency(selectedProject.budgetUsed)} of{" "}
                    {formatCurrency(selectedProject.budgetTotal)} allocated
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mb-2 flex justify-between text-sm">
                    <span>Utilization</span>
                    <span className="font-medium">{budgetPct}%</span>
                  </div>
                  <div className="h-3 overflow-hidden rounded-full bg-secondary">
                    <div
                      className="h-full rounded-full bg-primary transition-all"
                      style={{ width: `${budgetPct}%` }}
                    />
                  </div>
                  <p className="mt-4 text-sm text-muted-foreground">
                    Remaining:{" "}
                    {formatCurrency(
                      selectedProject.budgetTotal - selectedProject.budgetUsed,
                    )}
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="configurations" className="mt-0 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Project configurations</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {configurations
                    .filter(
                      (c) =>
                        c.projectId === selectedProject.id || !c.projectId,
                    )
                    .map((config) => (
                      <div
                        key={config.id}
                        className="flex items-center justify-between rounded-lg border border-border px-4 py-3 text-sm"
                      >
                        <code className="font-mono text-primary">{config.key}</code>
                        <Badge variant="outline">{config.environment}</Badge>
                      </div>
                    ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">AI Agents</CardTitle>
                  <CardDescription>
                    {projectAgents.length} assigned to this project
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  {projectAgents.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No agents on this project.</p>
                  ) : (
                    projectAgents.map((agent) => (
                      <div
                        key={agent.id}
                        className="flex items-center justify-between text-sm"
                      >
                        <span>{agent.name}</span>
                        <span className="text-muted-foreground">{agent.model}</span>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </div>
        </ScrollArea>
      </Tabs>
    </div>
  )
}
