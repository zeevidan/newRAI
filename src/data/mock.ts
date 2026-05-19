export type EntityStatus = "active" | "paused" | "archived"

export interface Organization {
  id: string
  name: string
  slug: string
  plan: string
}

export interface Project {
  id: string
  orgId: string
  name: string
  description: string
  status: EntityStatus
  updatedAt: string
  budgetUsed: number
  budgetTotal: number
}

export interface User {
  id: string
  orgId: string
  name: string
  email: string
  role: string
  title?: string
  managerId?: string | null
  projectIds?: string[]
  avatar?: string
}

export interface Agent {
  id: string
  orgId: string
  name: string
  model: string
  status: EntityStatus
  title?: string
  managerId?: string | null
  projectIds?: string[]
}

export interface Resource {
  id: string
  orgId: string
  projectId?: string
  name: string
  type: "file" | "dataset" | "api"
  size: string
}

export interface Vault {
  id: string
  orgId: string
  name: string
  secrets: number
}

export interface Configuration {
  id: string
  orgId: string
  projectId?: string
  key: string
  environment: string
}

export interface Task {
  id: string
  title: string
  assignee: string
  status: "todo" | "in_progress" | "done"
  due: string
}

export interface Message {
  id: string
  author: string
  content: string
  time: string
}

export interface ActivityItem {
  id: string
  action: string
  actor: string
  time: string
}

export type OrgChartMemberKind = "user" | "agent"

export interface OrgChartMember {
  id: string
  name: string
  title: string
  role: string
  email?: string
  managerId?: string | null
  kind: OrgChartMemberKind
  model?: string
  status?: EntityStatus
}

export const currentUser = {
  id: "u1",
  name: "Alex Rivera",
  email: "alex@acme.io",
  avatar: "AR",
}

export const organizations: Organization[] = [
  { id: "org-1", name: "Acme Robotics", slug: "acme", plan: "Enterprise" },
  { id: "org-2", name: "Northwind Labs", slug: "northwind", plan: "Growth" },
  { id: "org-3", name: "Helios Ventures", slug: "helios", plan: "Starter" },
]

export const projects: Project[] = [
  {
    id: "proj-1",
    orgId: "org-1",
    name: "Atlas Navigation",
    description: "Autonomous warehouse routing and fleet coordination.",
    status: "active",
    updatedAt: "2026-05-18T14:22:00Z",
    budgetUsed: 48200,
    budgetTotal: 75000,
  },
  {
    id: "proj-2",
    orgId: "org-1",
    name: "Sentinel Vision",
    description: "Real-time defect detection on production lines.",
    status: "active",
    updatedAt: "2026-05-17T09:10:00Z",
    budgetUsed: 31800,
    budgetTotal: 50000,
  },
  {
    id: "proj-3",
    orgId: "org-1",
    name: "Relay Comms",
    description: "Multi-agent handoff protocols for field ops.",
    status: "paused",
    updatedAt: "2026-05-12T16:45:00Z",
    budgetUsed: 12400,
    budgetTotal: 30000,
  },
  {
    id: "proj-4",
    orgId: "org-2",
    name: "Pulse Analytics",
    description: "Telemetry pipelines for IoT sensor networks.",
    status: "active",
    updatedAt: "2026-05-16T11:30:00Z",
    budgetUsed: 22100,
    budgetTotal: 40000,
  },
  {
    id: "proj-5",
    orgId: "org-3",
    name: "Lumen Pilot",
    description: "Early-stage autonomous inspection workflows.",
    status: "active",
    updatedAt: "2026-05-15T08:00:00Z",
    budgetUsed: 6800,
    budgetTotal: 20000,
  },
]

export const users: User[] = [
  {
    id: "u1",
    orgId: "org-1",
    name: "Alex Rivera",
    email: "alex@acme.io",
    role: "Admin",
    title: "Director of Engineering",
    managerId: null,
    projectIds: ["proj-1", "proj-2", "proj-3"],
  },
  {
    id: "u3",
    orgId: "org-1",
    name: "Sam Okonkwo",
    email: "sam@acme.io",
    role: "PM",
    title: "Project Lead",
    managerId: "u1",
    projectIds: ["proj-1", "proj-2", "proj-3"],
  },
  {
    id: "u2",
    orgId: "org-1",
    name: "Morgan Lee",
    email: "morgan@acme.io",
    role: "Engineer",
    title: "Robotics Engineer",
    managerId: "u3",
    projectIds: ["proj-1"],
  },
  {
    id: "u4",
    orgId: "org-1",
    name: "Jordan Kim",
    email: "jordan@acme.io",
    role: "Designer",
    title: "Product Designer",
    managerId: "u3",
    projectIds: ["proj-1", "proj-2"],
  },
  {
    id: "u5",
    orgId: "org-1",
    name: "Dana Patel",
    email: "dana@acme.io",
    role: "Engineer",
    title: "ML Engineer",
    managerId: "u3",
    projectIds: ["proj-1", "proj-2"],
  },
  {
    id: "u9",
    orgId: "org-1",
    name: "Priya Sharma",
    email: "priya@acme.io",
    role: "Engineer",
    title: "Computer Vision Engineer",
    managerId: "u3",
    projectIds: ["proj-2"],
  },
  {
    id: "u10",
    orgId: "org-1",
    name: "Chris Alvarez",
    email: "chris@acme.io",
    role: "Engineer",
    title: "Field Systems Engineer",
    managerId: "u3",
    projectIds: ["proj-3"],
  },
  {
    id: "u6",
    orgId: "org-2",
    name: "Casey Nguyen",
    email: "casey@northwind.io",
    role: "Admin",
    title: "Head of Data",
    managerId: null,
    projectIds: ["proj-4"],
  },
  {
    id: "u7",
    orgId: "org-2",
    name: "Taylor Brooks",
    email: "taylor@northwind.io",
    role: "Engineer",
    title: "Platform Engineer",
    managerId: "u6",
    projectIds: ["proj-4"],
  },
  {
    id: "u8",
    orgId: "org-2",
    name: "Jamie Ortiz",
    email: "jamie@northwind.io",
    role: "PM",
    title: "Analytics Lead",
    managerId: "u6",
    projectIds: ["proj-4"],
  },
  {
    id: "u11",
    orgId: "org-2",
    name: "Riley Chen",
    email: "riley@northwind.io",
    role: "Engineer",
    title: "Data Engineer",
    managerId: "u8",
    projectIds: ["proj-4"],
  },
  {
    id: "u12",
    orgId: "org-3",
    name: "Noah Fischer",
    email: "noah@helios.io",
    role: "Admin",
    title: "Founder",
    managerId: null,
    projectIds: ["proj-5"],
  },
  {
    id: "u13",
    orgId: "org-3",
    name: "Elena Vasquez",
    email: "elena@helios.io",
    role: "Engineer",
    title: "Applied AI Engineer",
    managerId: "u12",
    projectIds: ["proj-5"],
  },
]

export const agents: Agent[] = [
  // Atlas Navigation — fleet routing & warehouse ops
  {
    id: "a1",
    orgId: "org-1",
    name: "Manager",
    model: "gpt-4.1",
    status: "active",
    title: "Fleet routing manager",
    managerId: "u2",
    projectIds: ["proj-1"],
  },
  {
    id: "a4",
    orgId: "org-1",
    name: "Writer",
    model: "gpt-4.1-mini",
    status: "active",
    title: "Route runbook author",
    managerId: "u2",
    projectIds: ["proj-1"],
  },
  {
    id: "a5",
    orgId: "org-1",
    name: "QA",
    model: "claude-sonnet",
    status: "active",
    title: "Safety compliance checker",
    managerId: "u3",
    projectIds: ["proj-1"],
  },
  // Sentinel Vision — production-line defect detection
  {
    id: "a2",
    orgId: "org-1",
    name: "QA",
    model: "claude-sonnet",
    status: "active",
    title: "Production line inspector",
    managerId: "u9",
    projectIds: ["proj-2"],
  },
  {
    id: "a6",
    orgId: "org-1",
    name: "Manager",
    model: "gpt-4.1",
    status: "active",
    title: "Classification pipeline manager",
    managerId: "u9",
    projectIds: ["proj-2"],
  },
  {
    id: "a7",
    orgId: "org-1",
    name: "Writer",
    model: "gpt-4.1-mini",
    status: "paused",
    title: "Label set author",
    managerId: "u5",
    projectIds: ["proj-2"],
  },
  // Relay Comms — field handoff protocols
  {
    id: "a3",
    orgId: "org-1",
    name: "Manager",
    model: "gpt-4.1-mini",
    status: "paused",
    title: "Handoff orchestrator",
    managerId: "u10",
    projectIds: ["proj-3"],
  },
  {
    id: "a8",
    orgId: "org-1",
    name: "Writer",
    model: "claude-sonnet",
    status: "active",
    title: "Field comms author",
    managerId: "u10",
    projectIds: ["proj-3"],
  },
  {
    id: "a13",
    orgId: "org-1",
    name: "QA",
    model: "gpt-4.1",
    status: "active",
    title: "Protocol validator",
    managerId: "u10",
    projectIds: ["proj-3"],
  },
  // Pulse Analytics — IoT telemetry pipelines
  {
    id: "a9",
    orgId: "org-2",
    name: "Manager",
    model: "gpt-4.1",
    status: "active",
    title: "Telemetry ingest manager",
    managerId: "u7",
    projectIds: ["proj-4"],
  },
  {
    id: "a10",
    orgId: "org-2",
    name: "Writer",
    model: "gpt-4.1-mini",
    status: "active",
    title: "Pipeline documentation author",
    managerId: "u11",
    projectIds: ["proj-4"],
  },
  {
    id: "a11",
    orgId: "org-2",
    name: "QA",
    model: "claude-sonnet",
    status: "active",
    title: "Anomaly detection checker",
    managerId: "u8",
    projectIds: ["proj-4"],
  },
  // Lumen Pilot — inspection workflows
  {
    id: "a12",
    orgId: "org-3",
    name: "QA",
    model: "gpt-4.1-mini",
    status: "active",
    title: "Inspection checklist QA",
    managerId: "u13",
    projectIds: ["proj-5"],
  },
  {
    id: "a14",
    orgId: "org-3",
    name: "Manager",
    model: "gpt-4.1",
    status: "active",
    title: "Pilot workflow manager",
    managerId: "u13",
    projectIds: ["proj-5"],
  },
  {
    id: "a15",
    orgId: "org-3",
    name: "Writer",
    model: "gpt-4.1-mini",
    status: "active",
    title: "Inspection report author",
    managerId: "u13",
    projectIds: ["proj-5"],
  },
]

export const resources: Resource[] = [
  { id: "r1", orgId: "org-1", projectId: "proj-1", name: "floor-plan-v3.dxf", type: "file", size: "4.2 MB" },
  { id: "r2", orgId: "org-1", projectId: "proj-2", name: "defect-labels.csv", type: "dataset", size: "128 MB" },
  { id: "r3", orgId: "org-1", projectId: "proj-1", name: "warehouse-api-spec.yaml", type: "api", size: "24 KB" },
  { id: "r4", orgId: "org-1", projectId: "proj-1", name: "fleet-routes.json", type: "file", size: "890 KB" },
  { id: "r5", orgId: "org-1", projectId: "proj-2", name: "camera-calibration.npz", type: "dataset", size: "56 MB" },
  { id: "r6", orgId: "org-1", projectId: "proj-3", name: "handoff-protocol.md", type: "file", size: "18 KB" },
  { id: "r7", orgId: "org-2", projectId: "proj-4", name: "sensor-schema.avro", type: "api", size: "12 KB" },
  { id: "r8", orgId: "org-2", projectId: "proj-4", name: "telemetry-sample.parquet", type: "dataset", size: "2.1 GB" },
]

export const vaults: Vault[] = [
  { id: "v1", orgId: "org-1", name: "Production Keys", secrets: 12 },
  { id: "v2", orgId: "org-1", name: "Staging Keys", secrets: 8 },
  { id: "v3", orgId: "org-2", name: "Data Platform Keys", secrets: 6 },
]

export const configurations: Configuration[] = [
  { id: "c1", orgId: "org-1", projectId: "proj-1", key: "MAX_FLEET_SIZE", environment: "production" },
  { id: "c2", orgId: "org-1", projectId: "proj-1", key: "ROUTING_TIMEOUT_MS", environment: "staging" },
  { id: "c3", orgId: "org-1", key: "DEFAULT_MODEL", environment: "global" },
  { id: "c4", orgId: "org-1", projectId: "proj-2", key: "CONFIDENCE_THRESHOLD", environment: "production" },
  { id: "c5", orgId: "org-2", projectId: "proj-4", key: "INGEST_BATCH_SIZE", environment: "production" },
]

export const projectTasks: Record<string, Task[]> = {
  "proj-1": [
    { id: "t1", title: "Calibrate LIDAR mounts", assignee: "Morgan Lee", status: "in_progress", due: "May 22" },
    { id: "t2", title: "Ship v0.9 routing heuristics", assignee: "Sam Okonkwo", status: "todo", due: "May 28" },
    { id: "t3", title: "Review safety checklist", assignee: "Alex Rivera", status: "done", due: "May 15" },
    { id: "t4", title: "Tune routing agent latency", assignee: "Manager", status: "in_progress", due: "May 24" },
    { id: "t5", title: "Validate fleet sim scenarios", assignee: "Dana Patel", status: "todo", due: "May 30" },
    { id: "t6", title: "Update navigation UI flows", assignee: "Jordan Kim", status: "in_progress", due: "May 26" },
  ],
  "proj-2": [
    { id: "t7", title: "Expand defect label set", assignee: "Priya Sharma", status: "in_progress", due: "May 23" },
    { id: "t8", title: "Benchmark line QA accuracy", assignee: "QA", status: "todo", due: "May 27" },
    { id: "t9", title: "Design review station mockups", assignee: "Jordan Kim", status: "done", due: "May 14" },
    { id: "t10", title: "Retrain classification manager v3", assignee: "Dana Patel", status: "in_progress", due: "May 29" },
  ],
  "proj-3": [
    { id: "t11", title: "Document handoff failure modes", assignee: "Chris Alvarez", status: "todo", due: "Jun 2" },
    { id: "t12", title: "Revive handoff manager staging run", assignee: "Sam Okonkwo", status: "in_progress", due: "Jun 5" },
    { id: "t13", title: "Test field comms writer failover", assignee: "Writer", status: "todo", due: "Jun 8" },
    { id: "t20", title: "Validate protocol QA coverage", assignee: "QA", status: "in_progress", due: "Jun 6" },
  ],
  "proj-4": [
    { id: "t14", title: "Ship telemetry batch ingest", assignee: "Taylor Brooks", status: "in_progress", due: "May 25" },
    { id: "t15", title: "Calibrate anomaly QA thresholds", assignee: "QA", status: "todo", due: "May 31" },
    { id: "t16", title: "Review pipeline cost model", assignee: "Jamie Ortiz", status: "done", due: "May 13" },
    { id: "t17", title: "Partition parquet archives", assignee: "Riley Chen", status: "in_progress", due: "May 28" },
  ],
  "proj-5": [
    { id: "t18", title: "Scope pilot inspection workflow", assignee: "Elena Vasquez", status: "in_progress", due: "May 30" },
    { id: "t19", title: "Configure inspection QA prompts", assignee: "QA", status: "todo", due: "Jun 4" },
    { id: "t21", title: "Draft pilot report templates", assignee: "Writer", status: "todo", due: "Jun 6" },
  ],
}

export const projectMessages: Record<string, Message[]> = {
  "proj-1": [
    { id: "m1", author: "Sam Okonkwo", content: "Fleet sim passed overnight — ready for staging deploy.", time: "2h ago" },
    { id: "m2", author: "Morgan Lee", content: "Pushed calibration patch to branch `feat/lidar-v2`.", time: "5h ago" },
    { id: "m3", author: "Manager", content: "Routing latency down 18% after heuristic update.", time: "Yesterday" },
  ],
  "proj-2": [
    { id: "m4", author: "Priya Sharma", content: "New defect class added — needs label review.", time: "3h ago" },
    { id: "m5", author: "QA", content: "False positive rate holding at 1.2% on line 4.", time: "Yesterday" },
  ],
  "proj-3": [
    { id: "m6", author: "Chris Alvarez", content: "Paused until field hardware arrives next sprint.", time: "2d ago" },
    { id: "m10", author: "Writer", content: "Failover script ready for protocol QA sign-off.", time: "Yesterday" },
  ],
  "proj-4": [
    { id: "m7", author: "Jamie Ortiz", content: "Ingest backlog cleared — anomaly alerts normalized.", time: "4h ago" },
    { id: "m8", author: "Manager", content: "Peak throughput 42k events/sec in load test.", time: "Yesterday" },
  ],
  "proj-5": [
    { id: "m9", author: "Noah Fischer", content: "Pilot scope approved — starting with 2 inspection sites.", time: "1d ago" },
    { id: "m11", author: "Writer", content: "First inspection report template published.", time: "2d ago" },
  ],
}

export const projectActivity: Record<string, ActivityItem[]> = {
  "proj-1": [
    { id: "act1", action: "deployed routing Manager v2.1", actor: "Morgan Lee", time: "Today, 9:14 AM" },
    { id: "act2", action: "added resource floor-plan-v3.dxf", actor: "Alex Rivera", time: "Yesterday" },
    { id: "act3", action: "updated budget allocation", actor: "Sam Okonkwo", time: "May 16" },
    { id: "act4", action: "activated Safety QA in production", actor: "Alex Rivera", time: "May 15" },
  ],
  "proj-2": [
    { id: "act5", action: "promoted classification Manager v3 to staging", actor: "Dana Patel", time: "Today, 11:02 AM" },
    { id: "act6", action: "uploaded defect-labels.csv", actor: "Priya Sharma", time: "Yesterday" },
  ],
  "proj-3": [
    { id: "act7", action: "paused handoff Manager runs", actor: "Sam Okonkwo", time: "May 12" },
  ],
  "proj-4": [
    { id: "act8", action: "scaled ingest Manager replicas", actor: "Taylor Brooks", time: "Today, 8:30 AM" },
    { id: "act9", action: "linked sensor-schema.avro", actor: "Riley Chen", time: "May 17" },
  ],
  "proj-5": [
    { id: "act10", action: "onboarded inspection QA agent", actor: "Elena Vasquez", time: "May 15" },
  ],
}

export function isOnProject(entity: { projectIds?: string[] }, projectId: string) {
  return entity.projectIds?.includes(projectId) ?? false
}

export function getProjectUsers(projectId: string, users: User[]) {
  return users.filter((user) => isOnProject(user, projectId))
}

export function getProjectAgents(projectId: string, agents: Agent[]) {
  return agents.filter((agent) => isOnProject(agent, projectId))
}

export function getProjectResources(projectId: string, resources: Resource[]) {
  return resources.filter((resource) => resource.projectId === projectId)
}

export function getProjectTaskCount(projectId: string) {
  return projectTasks[projectId]?.length ?? 0
}

export function getProjectPeopleCount(projectId: string, users: User[], agents: Agent[]) {
  return getProjectUsers(projectId, users).length + getProjectAgents(projectId, agents).length
}

export function getProjectActiveAgentCount(projectId: string, agents: Agent[]) {
  return getProjectAgents(projectId, agents).filter((agent) => agent.status === "active").length
}

export function buildProjectOrgChart(
  projectId: string,
  users: User[],
  agents: Agent[],
): OrgChartMember[] {
  const memberIds = new Set<string>()

  const includeWithManagers = (id: string, managerId?: string | null) => {
    memberIds.add(id)
    if (!managerId || memberIds.has(managerId)) return

    const userManager = users.find((user) => user.id === managerId)
    if (userManager) {
      includeWithManagers(userManager.id, userManager.managerId)
      return
    }

    const agentManager = agents.find((agent) => agent.id === managerId)
    if (agentManager) {
      includeWithManagers(agentManager.id, agentManager.managerId)
    }
  }

  getProjectUsers(projectId, users).forEach((user) =>
    includeWithManagers(user.id, user.managerId),
  )
  getProjectAgents(projectId, agents).forEach((agent) =>
    includeWithManagers(agent.id, agent.managerId),
  )

  const chartUsers: OrgChartMember[] = users
    .filter((user) => memberIds.has(user.id))
    .map((user) => ({
      id: user.id,
      name: user.name,
      title: user.title ?? user.role,
      role: user.role,
      email: user.email,
      managerId: user.managerId,
      kind: "user" as const,
    }))

  const chartAgents: OrgChartMember[] = agents
    .filter((agent) => memberIds.has(agent.id))
    .map((agent) => ({
      id: agent.id,
      name: agent.name,
      title: agent.title ?? "AI Agent",
      role: "Agent",
      managerId: agent.managerId,
      kind: "agent" as const,
      model: agent.model,
      status: agent.status,
    }))

  const members = [...chartUsers, ...chartAgents]
  const memberIdSet = new Set(members.map((member) => member.id))

  // Ensure every parent reference resolves within the chart dataset
  for (const member of members) {
    if (member.managerId && !memberIdSet.has(member.managerId)) {
      member.managerId = null
    }
  }

  return members
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value)
}

export function formatRelativeDate(iso: string) {
  const date = new Date(iso)
  const diff = Date.now() - date.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  if (days === 0) return "Today"
  if (days === 1) return "Yesterday"
  return `${days}d ago`
}
