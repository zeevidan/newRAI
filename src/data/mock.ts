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
  avatar?: AgentAvatar
}

export type AgentAvatarType = "initials" | "icon" | "image"

export interface AgentAvatar {
  type: AgentAvatarType
  initials?: string
  icon?: string
  imageUrl?: string
}

export interface Resource {
  id: string
  orgId: string
  projectId?: string
  name: string
  type: "file" | "dataset" | "api"
  size: string
  provider?: string
  status?: "connected" | "syncing" | "error" | "paused"
  lastSyncedAt?: string
}

export interface Vault {
  id: string
  orgId: string
  name: string
  secrets: number
  projectIds?: string[]
  description?: string
}

export interface ProjectFileNode {
  id: string
  projectId: string
  name: string
  kind: "folder" | "file"
  parentId: string | null
  size?: string
  updatedAt: string
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

export interface DirectoryProfile {
  userId: string
  upn: string
  employeeId: string
  department: string
  office: string
  adManagerName: string
  groups: string[]
  accountEnabled: boolean
  lastSyncedAt: string
  source: "Azure AD" | "Active Directory"
}

export interface DirectoryCandidate {
  id: string
  orgId: string
  displayName: string
  email: string
  jobTitle: string
  department: string
  office: string
  upn: string
}

export interface AgentLogEntry {
  id: string
  level: "info" | "warn" | "error" | "debug"
  message: string
  timestamp: string
}

export interface AgentConfigEntry {
  key: string
  value: string
  environment: string
  description?: string
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
  avatar?: AgentAvatar
}

export type PlatformRole = "member" | "org_admin" | "platform_admin"

export interface SessionUser {
  id: string
  name: string
  email: string
  avatar: string
  platformRole: PlatformRole
  orgAdminOrgIds?: string[]
}

export interface PlatformConfiguration {
  id: string
  key: string
  value: string
  environment: string
  description?: string
}

export interface Policy {
  id: string
  orgId?: string
  name: string
  description: string
  status: "active" | "draft"
  updatedAt: string
}

/** Swap to mockSessionProfiles.orgAdmin or .member to test other personas. */
export type MockSessionProfileKey = "platformAdmin" | "orgAdmin" | "member"

export const mockSessionProfiles: Record<MockSessionProfileKey, SessionUser> = {
  platformAdmin: {
    id: "u1",
    name: "Alex Rivera",
    email: "alex@acme.io",
    avatar: "AR",
    platformRole: "platform_admin",
    orgAdminOrgIds: ["org-1"],
  },
  orgAdmin: {
    id: "u6",
    name: "Casey Nguyen",
    email: "casey@northwind.io",
    avatar: "CN",
    platformRole: "org_admin",
    orgAdminOrgIds: ["org-2"],
  },
  member: {
    id: "u2",
    name: "Morgan Lee",
    email: "morgan@acme.io",
    avatar: "ML",
    platformRole: "member",
  },
}

export const mockSessionProfileOptions: {
  key: MockSessionProfileKey
  label: string
  description: string
}[] = [
  {
    key: "platformAdmin",
    label: "Alex Rivera",
    description: "Platform admin",
  },
  {
    key: "orgAdmin",
    label: "Casey Nguyen",
    description: "Org admin",
  },
  {
    key: "member",
    label: "Morgan Lee",
    description: "Member",
  },
]

export const sessionUser: SessionUser = mockSessionProfiles.platformAdmin

/** @deprecated Use sessionUser instead */
export const currentUser = {
  id: sessionUser.id,
  name: sessionUser.name,
  email: sessionUser.email,
  avatar: sessionUser.avatar,
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
    avatar: { type: "icon", icon: "shield" },
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
  {
    id: "r2",
    orgId: "org-1",
    projectId: "proj-2",
    name: "defect-labels.csv",
    type: "dataset",
    size: "128 MB",
    provider: "Snowflake",
    status: "connected",
    lastSyncedAt: "2026-05-19T08:30:00Z",
  },
  {
    id: "r3",
    orgId: "org-1",
    projectId: "proj-1",
    name: "warehouse-api-spec.yaml",
    type: "api",
    size: "24 KB",
    provider: "Internal REST",
    status: "connected",
    lastSyncedAt: "2026-05-19T06:15:00Z",
  },
  { id: "r4", orgId: "org-1", projectId: "proj-1", name: "fleet-routes.json", type: "file", size: "890 KB" },
  {
    id: "r5",
    orgId: "org-1",
    projectId: "proj-2",
    name: "camera-calibration.npz",
    type: "dataset",
    size: "56 MB",
    provider: "S3",
    status: "syncing",
    lastSyncedAt: "2026-05-19T09:00:00Z",
  },
  { id: "r6", orgId: "org-1", projectId: "proj-3", name: "handoff-protocol.md", type: "file", size: "18 KB" },
  {
    id: "r7",
    orgId: "org-2",
    projectId: "proj-4",
    name: "sensor-schema.avro",
    type: "api",
    size: "12 KB",
    provider: "Confluent Schema Registry",
    status: "connected",
    lastSyncedAt: "2026-05-18T22:00:00Z",
  },
  {
    id: "r8",
    orgId: "org-2",
    projectId: "proj-4",
    name: "telemetry-sample.parquet",
    type: "dataset",
    size: "2.1 GB",
    provider: "Databricks",
    status: "connected",
    lastSyncedAt: "2026-05-19T07:45:00Z",
  },
  {
    id: "r9",
    orgId: "org-1",
    projectId: "proj-1",
    name: "fleet-telemetry",
    type: "dataset",
    size: "340 GB",
    provider: "Azure Data Lake",
    status: "connected",
    lastSyncedAt: "2026-05-19T09:12:00Z",
  },
  {
    id: "r10",
    orgId: "org-1",
    projectId: "proj-1",
    name: "routing-service",
    type: "api",
    size: "—",
    provider: "gRPC",
    status: "paused",
    lastSyncedAt: "2026-05-15T14:00:00Z",
  },
]

export const vaults: Vault[] = [
  {
    id: "v1",
    orgId: "org-1",
    name: "Production Keys",
    secrets: 12,
    projectIds: ["proj-1", "proj-2"],
    description: "Production API keys and signing certificates",
  },
  {
    id: "v2",
    orgId: "org-1",
    name: "Staging Keys",
    secrets: 8,
    projectIds: ["proj-1", "proj-3"],
    description: "Staging environment credentials",
  },
  {
    id: "v3",
    orgId: "org-2",
    name: "Data Platform Keys",
    secrets: 6,
    projectIds: ["proj-4"],
    description: "Warehouse and ingest pipeline secrets",
  },
]

export const projectFiles: ProjectFileNode[] = [
  { id: "f1", projectId: "proj-1", name: "configs", kind: "folder", parentId: null, updatedAt: "2026-05-17T12:00:00Z" },
  { id: "f2", projectId: "proj-1", name: "data", kind: "folder", parentId: null, updatedAt: "2026-05-18T09:00:00Z" },
  { id: "f3", projectId: "proj-1", name: "docs", kind: "folder", parentId: null, updatedAt: "2026-05-16T14:00:00Z" },
  { id: "f4", projectId: "proj-1", name: "sim-runs", kind: "folder", parentId: "f2", updatedAt: "2026-05-19T08:00:00Z" },
  { id: "f5", projectId: "proj-1", name: "routing-heuristics.yaml", kind: "file", parentId: "f1", size: "12 KB", updatedAt: "2026-05-19T07:30:00Z" },
  { id: "f6", projectId: "proj-1", name: "fleet-params.json", kind: "file", parentId: "f1", size: "4 KB", updatedAt: "2026-05-18T16:00:00Z" },
  { id: "f7", projectId: "proj-1", name: "safety-checklist.md", kind: "file", parentId: "f3", size: "18 KB", updatedAt: "2026-05-15T11:00:00Z" },
  { id: "f8", projectId: "proj-1", name: "architecture-overview.pdf", kind: "file", parentId: "f3", size: "2.1 MB", updatedAt: "2026-05-10T09:00:00Z" },
  { id: "f9", projectId: "proj-1", name: "overnight-run-0519.log", kind: "file", parentId: "f4", size: "890 KB", updatedAt: "2026-05-19T06:00:00Z" },
  { id: "f10", projectId: "proj-1", name: "floor-plan-v3.dxf", kind: "file", parentId: null, size: "4.2 MB", updatedAt: "2026-05-18T10:00:00Z" },
  { id: "f11", projectId: "proj-1", name: "fleet-routes.json", kind: "file", parentId: null, size: "890 KB", updatedAt: "2026-05-17T15:00:00Z" },
  { id: "f12", projectId: "proj-2", name: "models", kind: "folder", parentId: null, updatedAt: "2026-05-18T12:00:00Z" },
  { id: "f13", projectId: "proj-2", name: "labels", kind: "folder", parentId: null, updatedAt: "2026-05-17T10:00:00Z" },
  { id: "f14", projectId: "proj-2", name: "classifier-v3.onnx", kind: "file", parentId: "f12", size: "124 MB", updatedAt: "2026-05-19T08:00:00Z" },
  { id: "f15", projectId: "proj-2", name: "defect-taxonomy.json", kind: "file", parentId: "f13", size: "32 KB", updatedAt: "2026-05-16T13:00:00Z" },
  { id: "f16", projectId: "proj-3", name: "protocols", kind: "folder", parentId: null, updatedAt: "2026-05-12T16:00:00Z" },
  { id: "f17", projectId: "proj-3", name: "handoff-protocol.md", kind: "file", parentId: "f16", size: "18 KB", updatedAt: "2026-05-12T16:45:00Z" },
  { id: "f18", projectId: "proj-4", name: "schemas", kind: "folder", parentId: null, updatedAt: "2026-05-16T11:00:00Z" },
  { id: "f19", projectId: "proj-4", name: "sensor-events.avsc", kind: "file", parentId: "f18", size: "8 KB", updatedAt: "2026-05-16T11:30:00Z" },
  { id: "f20", projectId: "proj-5", name: "templates", kind: "folder", parentId: null, updatedAt: "2026-05-14T10:00:00Z" },
  { id: "f21", projectId: "proj-5", name: "inspection-report.md", kind: "file", parentId: "f20", size: "6 KB", updatedAt: "2026-05-14T10:30:00Z" },
]

export const configurations: Configuration[] = [
  { id: "c1", orgId: "org-1", projectId: "proj-1", key: "MAX_FLEET_SIZE", environment: "production" },
  { id: "c2", orgId: "org-1", projectId: "proj-1", key: "ROUTING_TIMEOUT_MS", environment: "staging" },
  { id: "c3", orgId: "org-1", key: "DEFAULT_MODEL", environment: "global" },
  { id: "c4", orgId: "org-1", projectId: "proj-2", key: "CONFIDENCE_THRESHOLD", environment: "production" },
  { id: "c5", orgId: "org-2", projectId: "proj-4", key: "INGEST_BATCH_SIZE", environment: "production" },
]

export const platformConfigurations: PlatformConfiguration[] = [
  {
    id: "pc1",
    key: "MAX_AGENTS_PER_ORG",
    value: "50",
    environment: "production",
    description: "Maximum active agents per organization",
  },
  {
    id: "pc2",
    key: "DEFAULT_LLM_PROVIDER",
    value: "openai",
    environment: "global",
    description: "Default LLM provider for new orgs",
  },
  {
    id: "pc3",
    key: "AUDIT_LOG_RETENTION_DAYS",
    value: "90",
    environment: "global",
    description: "Platform audit log retention period",
  },
]

export const policies: Policy[] = [
  {
    id: "pol1",
    name: "Data residency — US only",
    description: "Require all org data to remain in US regions.",
    status: "active",
    updatedAt: "2026-05-10T12:00:00Z",
  },
  {
    id: "pol2",
    name: "Agent execution sandbox",
    description: "Agents must run in isolated execution environments.",
    status: "active",
    updatedAt: "2026-05-08T09:00:00Z",
  },
  {
    id: "pol3",
    orgId: "org-1",
    name: "PII redaction on exports",
    description: "Automatically redact PII from project exports.",
    status: "active",
    updatedAt: "2026-05-15T14:00:00Z",
  },
  {
    id: "pol4",
    orgId: "org-1",
    name: "External API access",
    description: "Require approval for agents calling external APIs.",
    status: "draft",
    updatedAt: "2026-05-18T11:00:00Z",
  },
  {
    id: "pol5",
    orgId: "org-2",
    name: "Telemetry retention",
    description: "Retain telemetry data for 180 days maximum.",
    status: "active",
    updatedAt: "2026-05-12T16:00:00Z",
  },
]

export function getPlatformPolicies() {
  return policies.filter((policy) => !policy.orgId)
}

export function getOrgPolicies(orgId: string) {
  return policies.filter((policy) => policy.orgId === orgId)
}

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

export const directoryProfiles: Record<string, DirectoryProfile> = {
  u1: {
    userId: "u1",
    upn: "alex.rivera@acme.io",
    employeeId: "EMP-1042",
    department: "Engineering",
    office: "San Francisco HQ",
    adManagerName: "—",
    groups: ["RAI-Admins", "Eng-Directors", "All-Employees"],
    accountEnabled: true,
    lastSyncedAt: "2026-05-19T08:00:00Z",
    source: "Azure AD",
  },
  u2: {
    userId: "u2",
    upn: "morgan.lee@acme.io",
    employeeId: "EMP-2187",
    department: "Robotics",
    office: "San Francisco HQ",
    adManagerName: "Sam Okonkwo",
    groups: ["Robotics-Team", "Atlas-Contributors", "All-Employees"],
    accountEnabled: true,
    lastSyncedAt: "2026-05-19T08:00:00Z",
    source: "Azure AD",
  },
  u3: {
    userId: "u3",
    upn: "sam.okonkwo@acme.io",
    employeeId: "EMP-1834",
    department: "Product",
    office: "San Francisco HQ",
    adManagerName: "Alex Rivera",
    groups: ["PM-Team", "Atlas-Leads", "All-Employees"],
    accountEnabled: true,
    lastSyncedAt: "2026-05-19T08:00:00Z",
    source: "Azure AD",
  },
  u4: {
    userId: "u4",
    upn: "jordan.kim@acme.io",
    employeeId: "EMP-2291",
    department: "Design",
    office: "Remote — Seattle",
    adManagerName: "Sam Okonkwo",
    groups: ["Design-Team", "All-Employees"],
    accountEnabled: true,
    lastSyncedAt: "2026-05-19T08:00:00Z",
    source: "Azure AD",
  },
  u5: {
    userId: "u5",
    upn: "dana.patel@acme.io",
    employeeId: "EMP-2410",
    department: "Machine Learning",
    office: "San Francisco HQ",
    adManagerName: "Sam Okonkwo",
    groups: ["ML-Team", "Atlas-Contributors", "All-Employees"],
    accountEnabled: true,
    lastSyncedAt: "2026-05-19T08:00:00Z",
    source: "Azure AD",
  },
  u9: {
    userId: "u9",
    upn: "priya.sharma@acme.io",
    employeeId: "EMP-2555",
    department: "Computer Vision",
    office: "Austin Lab",
    adManagerName: "Sam Okonkwo",
    groups: ["CV-Team", "Sentinel-Contributors", "All-Employees"],
    accountEnabled: true,
    lastSyncedAt: "2026-05-19T08:00:00Z",
    source: "Azure AD",
  },
  u10: {
    userId: "u10",
    upn: "chris.alvarez@acme.io",
    employeeId: "EMP-2601",
    department: "Field Systems",
    office: "Chicago Field Office",
    adManagerName: "Sam Okonkwo",
    groups: ["Field-Ops", "Relay-Contributors", "All-Employees"],
    accountEnabled: true,
    lastSyncedAt: "2026-05-19T08:00:00Z",
    source: "Azure AD",
  },
}

export const directoryCandidates: DirectoryCandidate[] = [
  {
    id: "ad-501",
    orgId: "org-1",
    displayName: "Riley Torres",
    email: "riley.torres@acme.io",
    jobTitle: "Systems Integrator",
    department: "Robotics",
    office: "San Francisco HQ",
    upn: "riley.torres@acme.io",
  },
  {
    id: "ad-502",
    orgId: "org-1",
    displayName: "Nina Hoffmann",
    email: "nina.hoffmann@acme.io",
    jobTitle: "Safety Engineer",
    department: "Operations",
    office: "Austin Lab",
    upn: "nina.hoffmann@acme.io",
  },
  {
    id: "ad-503",
    orgId: "org-1",
    displayName: "Omar Hassan",
    email: "omar.hassan@acme.io",
    jobTitle: "Data Analyst",
    department: "Analytics",
    office: "Remote — Denver",
    upn: "omar.hassan@acme.io",
  },
]

export const agentActivity: Record<string, ActivityItem[]> = {
  a1: [
    { id: "aa1", action: "rebalanced fleet routes for zone B", actor: "Manager", time: "Today, 10:22 AM" },
    { id: "aa2", action: "escalated congestion alert to Morgan Lee", actor: "Manager", time: "Today, 8:05 AM" },
    { id: "aa3", action: "completed nightly route optimization", actor: "Manager", time: "Yesterday" },
  ],
  a4: [
    { id: "aa4", action: "published runbook section 4.2", actor: "Writer", time: "Today, 9:40 AM" },
    { id: "aa5", action: "drafted failover procedure update", actor: "Writer", time: "May 17" },
  ],
  a5: [
    { id: "aa6", action: "passed safety compliance scan", actor: "QA", time: "Today, 7:15 AM" },
    { id: "aa7", action: "flagged 2 route edge cases", actor: "QA", time: "May 18" },
  ],
  a2: [
    { id: "aa8", action: "inspected 1,240 units on line 4", actor: "QA", time: "Today, 11:30 AM" },
    { id: "aa9", action: "updated defect threshold to 0.98", actor: "QA", time: "Yesterday" },
  ],
}

export const agentLogs: Record<string, AgentLogEntry[]> = {
  a1: [
    { id: "al1", level: "info", message: "Route optimization completed in 1.2s (142 nodes)", timestamp: "2026-05-19T10:22:14Z" },
    { id: "al2", level: "warn", message: "Zone B congestion above threshold (87%)", timestamp: "2026-05-19T08:05:33Z" },
    { id: "al3", level: "info", message: "Heartbeat OK — model gpt-4.1, latency 340ms p95", timestamp: "2026-05-19T08:00:00Z" },
    { id: "al4", level: "debug", message: "Loaded config MAX_FLEET_SIZE=48", timestamp: "2026-05-19T07:59:58Z" },
  ],
  a4: [
    { id: "al5", level: "info", message: "Generated runbook section 4.2 (2,140 tokens)", timestamp: "2026-05-19T09:40:01Z" },
    { id: "al6", level: "info", message: "Saved draft to project resource store", timestamp: "2026-05-19T09:40:05Z" },
  ],
  a5: [
    { id: "al7", level: "info", message: "Compliance scan passed — 0 violations", timestamp: "2026-05-19T07:15:22Z" },
    { id: "al8", level: "warn", message: "Edge case EC-441 requires human review", timestamp: "2026-05-18T16:44:10Z" },
    { id: "al9", level: "error", message: "Timeout on route validation batch (retry 1/3)", timestamp: "2026-05-18T14:02:00Z" },
  ],
}

export const agentConfigurations: Record<string, AgentConfigEntry[]> = {
  a1: [
    { key: "MAX_FLEET_SIZE", value: "48", environment: "production", description: "Maximum active robots per zone" },
    { key: "ROUTING_TIMEOUT_MS", value: "5000", environment: "production", description: "Route calculation timeout" },
    { key: "REPLAN_INTERVAL_SEC", value: "30", environment: "staging", description: "Background replan cadence" },
    { key: "ESCALATION_THRESHOLD", value: "0.85", environment: "production", description: "Congestion alert threshold" },
  ],
  a4: [
    { key: "DOC_TEMPLATE_VERSION", value: "2.1", environment: "production", description: "Runbook template version" },
    { key: "MAX_OUTPUT_TOKENS", value: "4096", environment: "global", description: "Generation limit per section" },
  ],
  a5: [
    { key: "COMPLIANCE_RULESET", value: "warehouse-safety-v3", environment: "production", description: "Active rule pack" },
    { key: "STRICT_MODE", value: "true", environment: "production", description: "Block on any violation" },
    { key: "REVIEW_QUEUE", value: "safety-review", environment: "staging", description: "Human review queue name" },
  ],
}

export function getDirectoryProfile(userId: string) {
  return directoryProfiles[userId]
}

export function getAvailableDirectoryCandidates(
  orgId: string,
  users: User[],
  _projectId: string,
) {
  const orgUserEmails = new Set(
    users.filter((user) => user.orgId === orgId).map((user) => user.email.toLowerCase()),
  )
  return directoryCandidates.filter(
    (candidate) =>
      candidate.orgId === orgId && !orgUserEmails.has(candidate.email.toLowerCase()),
  )
}

export function getAgentActivity(agentId: string) {
  return agentActivity[agentId] ?? []
}

export function getAgentLogs(agentId: string) {
  return agentLogs[agentId] ?? []
}

export function getAgentConfigurations(agentId: string) {
  return agentConfigurations[agentId] ?? []
}

export function resolveMemberName(
  id: string,
  users: User[],
  agents: Agent[],
): string | null {
  const user = users.find((item) => item.id === id)
  if (user) return user.name
  const agent = agents.find((item) => item.id === id)
  return agent?.name ?? null
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

export function getProjectIntegrations(projectId: string, resources: Resource[]) {
  return getProjectResources(projectId, resources).filter(
    (resource) => resource.type === "dataset" || resource.type === "api",
  )
}

export function getProjectFiles(projectId: string, files: ProjectFileNode[] = projectFiles) {
  return files.filter((file) => file.projectId === projectId)
}

export function getProjectVaults(projectId: string, vaults: Vault[]) {
  return vaults.filter((vault) => vault.projectIds?.includes(projectId))
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
      avatar: agent.avatar,
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
