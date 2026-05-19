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
  memberCount: number
  taskCount: number
}

export interface User {
  id: string
  orgId: string
  name: string
  email: string
  role: string
  avatar?: string
}

export interface Agent {
  id: string
  orgId: string
  name: string
  model: string
  status: EntityStatus
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

export const currentUser = {
  id: "user-1",
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
    memberCount: 8,
    taskCount: 24,
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
    memberCount: 5,
    taskCount: 17,
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
    memberCount: 3,
    taskCount: 9,
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
    memberCount: 6,
    taskCount: 14,
  },
]

export const users: User[] = [
  { id: "u1", orgId: "org-1", name: "Alex Rivera", email: "alex@acme.io", role: "Admin" },
  { id: "u2", orgId: "org-1", name: "Morgan Lee", email: "morgan@acme.io", role: "Engineer" },
  { id: "u3", orgId: "org-1", name: "Sam Okonkwo", email: "sam@acme.io", role: "PM" },
  { id: "u4", orgId: "org-1", name: "Jordan Kim", email: "jordan@acme.io", role: "Designer" },
]

export const agents: Agent[] = [
  { id: "a1", orgId: "org-1", name: "Route Planner", model: "gpt-4.1", status: "active" },
  { id: "a2", orgId: "org-1", name: "QA Inspector", model: "claude-sonnet", status: "active" },
  { id: "a3", orgId: "org-1", name: "Ops Copilot", model: "gpt-4.1-mini", status: "paused" },
]

export const resources: Resource[] = [
  { id: "r1", orgId: "org-1", projectId: "proj-1", name: "floor-plan-v3.dxf", type: "file", size: "4.2 MB" },
  { id: "r2", orgId: "org-1", projectId: "proj-2", name: "defect-labels.csv", type: "dataset", size: "128 MB" },
  { id: "r3", orgId: "org-1", name: "warehouse-api-spec.yaml", type: "api", size: "24 KB" },
]

export const vaults: Vault[] = [
  { id: "v1", orgId: "org-1", name: "Production Keys", secrets: 12 },
  { id: "v2", orgId: "org-1", name: "Staging Keys", secrets: 8 },
]

export const configurations: Configuration[] = [
  { id: "c1", orgId: "org-1", projectId: "proj-1", key: "MAX_FLEET_SIZE", environment: "production" },
  { id: "c2", orgId: "org-1", projectId: "proj-1", key: "ROUTING_TIMEOUT_MS", environment: "staging" },
  { id: "c3", orgId: "org-1", key: "DEFAULT_MODEL", environment: "global" },
]

export const projectTasks: Record<string, Task[]> = {
  "proj-1": [
    { id: "t1", title: "Calibrate LIDAR mounts", assignee: "Morgan Lee", status: "in_progress", due: "May 22" },
    { id: "t2", title: "Ship v0.9 routing heuristics", assignee: "Sam Okonkwo", status: "todo", due: "May 28" },
    { id: "t3", title: "Review safety checklist", assignee: "Alex Rivera", status: "done", due: "May 15" },
  ],
}

export const projectMessages: Record<string, Message[]> = {
  "proj-1": [
    { id: "m1", author: "Sam Okonkwo", content: "Fleet sim passed overnight — ready for staging deploy.", time: "2h ago" },
    { id: "m2", author: "Morgan Lee", content: "Pushed calibration patch to branch `feat/lidar-v2`.", time: "5h ago" },
  ],
}

export const projectActivity: Record<string, ActivityItem[]> = {
  "proj-1": [
    { id: "act1", action: "Deployed routing agent v2.1", actor: "Morgan Lee", time: "Today, 9:14 AM" },
    { id: "act2", action: "Added resource floor-plan-v3.dxf", actor: "Alex Rivera", time: "Yesterday" },
    { id: "act3", action: "Updated budget allocation", actor: "Sam Okonkwo", time: "May 16" },
  ],
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
