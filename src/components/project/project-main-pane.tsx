import {
  Activity,
  CircleDollarSign,
  LayoutDashboard,
  ListTodo,
  MessageSquare,
  Settings2,
  Users,
} from "lucide-react"
import { useApp } from "@/context/app-context"
import {
  formatCurrency,
  projectActivity,
  projectMessages,
  projectTasks,
} from "@/data/mock"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function ProjectMainPane() {
  const {
    selectedProject,
    users,
    agents,
    resources,
    vaults,
    configurations,
  } = useApp()

  if (!selectedProject) {
    return (
      <div className="flex flex-1 items-center justify-center text-muted-foreground">
        Select or create a project to get started.
      </div>
    )
  }

  const tasks = projectTasks[selectedProject.id] ?? []
  const messages = projectMessages[selectedProject.id] ?? []
  const activity = projectActivity[selectedProject.id] ?? []
  const budgetPct = Math.round(
    (selectedProject.budgetUsed / selectedProject.budgetTotal) * 100,
  )

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
          <div className="flex gap-10 text-sm">
            <div>
              <p className="text-muted-foreground">Team</p>
              <p className="font-medium">{selectedProject.memberCount}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Tasks</p>
              <p className="font-medium">{selectedProject.taskCount}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Budget</p>
              <p className="font-medium">{budgetPct}% used</p>
            </div>
          </div>
        </div>
      </div>

      <Tabs defaultValue="overview" className="flex min-h-0 flex-1 flex-col">
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
            <TabsTrigger value="messages">
              <MessageSquare className="size-4" />
              Messages
            </TabsTrigger>
            <TabsTrigger value="tasks">
              <ListTodo className="size-4" />
              Tasks
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
              <div className="grid gap-4 md:grid-cols-3">
                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription>Active agents</CardDescription>
                    <CardTitle className="text-2xl">
                      {agents.filter((a) => a.status === "active").length}
                    </CardTitle>
                  </CardHeader>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription>Resources</CardDescription>
                    <CardTitle className="text-2xl">{resources.length}</CardTitle>
                  </CardHeader>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription>Vaults</CardDescription>
                    <CardTitle className="text-2xl">{vaults.length}</CardTitle>
                  </CardHeader>
                </Card>
              </div>
              <Card>
                <CardHeader>
                  <CardTitle>Recent activity</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {activity.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No activity yet.</p>
                  ) : (
                    activity.map((item) => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span>
                          <span className="font-medium">{item.actor}</span>{" "}
                          {item.action}
                        </span>
                        <span className="text-muted-foreground">{item.time}</span>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="team" className="mt-0">
              <Card>
                <CardHeader>
                  <CardTitle>Team members</CardTitle>
                  <CardDescription>
                    People with access to this organization
                  </CardDescription>
                </CardHeader>
                <CardContent className="divide-y divide-border">
                  {users.map((user) => (
                    <div key={user.id} className="flex items-center justify-between py-3">
                      <div>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                      <Badge variant="secondary">{user.role}</Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="messages" className="mt-0">
              <Card>
                <CardHeader>
                  <CardTitle>Project messages</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {messages.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No messages yet.</p>
                  ) : (
                    messages.map((msg) => (
                      <div key={msg.id}>
                        <div className="mb-1 flex items-center justify-between">
                          <span className="text-sm font-medium">{msg.author}</span>
                          <span className="text-xs text-muted-foreground">{msg.time}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">{msg.content}</p>
                        <Separator className="mt-4" />
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="tasks" className="mt-0">
              <Card>
                <CardHeader>
                  <CardTitle>Tasks</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {tasks.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No tasks yet.</p>
                  ) : (
                    tasks.map((task) => (
                      <div
                        key={task.id}
                        className="flex items-center justify-between rounded-lg border border-border px-4 py-3"
                      >
                        <div>
                          <p className="font-medium">{task.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {task.assignee} · due {task.due}
                          </p>
                        </div>
                        <Badge
                          variant={
                            task.status === "done"
                              ? "secondary"
                              : task.status === "in_progress"
                                ? "default"
                                : "outline"
                          }
                          className="capitalize"
                        >
                          {task.status.replace("_", " ")}
                        </Badge>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="activity" className="mt-0">
              <Card>
                <CardHeader>
                  <CardTitle>Activity log</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {activity.map((item) => (
                    <div key={item.id} className="flex gap-3">
                      <div className="mt-1 size-2 shrink-0 rounded-full bg-primary" />
                      <div>
                        <p className="text-sm">
                          <span className="font-medium">{item.actor}</span> {item.action}
                        </p>
                        <p className="text-xs text-muted-foreground">{item.time}</p>
                      </div>
                    </div>
                  ))}
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

              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">AI Agents</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {agents.map((agent) => (
                      <div
                        key={agent.id}
                        className="flex items-center justify-between text-sm"
                      >
                        <span>{agent.name}</span>
                        <span className="text-muted-foreground">{agent.model}</span>
                      </div>
                    ))}
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Resources & Vaults</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    {resources.map((r) => (
                      <div key={r.id} className="flex justify-between">
                        <span>{r.name}</span>
                        <span className="text-muted-foreground">{r.type}</span>
                      </div>
                    ))}
                    <Separator />
                    {vaults.map((v) => (
                      <div key={v.id} className="flex justify-between">
                        <span>{v.name}</span>
                        <span className="text-muted-foreground">
                          {v.secrets} secrets
                        </span>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </div>
        </ScrollArea>
      </Tabs>
    </div>
  )
}
