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
  description?: string
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

export interface Tool {
  id: string
  orgId: string
  name: string
  type: "mcp" | "api" | "builtin"
  description?: string
}

export interface AgentAccessGrant {
  id: string
  agentId: string
  projectId: string
  workspaceFolderIds?: string[]
  vaultIds?: string[]
  integrationIds?: string[]
  skillIds?: string[]
  toolIds?: string[]
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
    email: "alex.rivera@acmecorp.com",
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
    email: "morgan.lee@acmecorp.com",
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
  { id: "org-1", name: "Acme Corp", slug: "acme-corp", plan: "Enterprise" },
  { id: "org-2", name: "Northwind Labs", slug: "northwind", plan: "Growth" },
  { id: "org-3", name: "Helios Ventures", slug: "helios", plan: "Starter" },
]

export const projects: Project[] = [
  {
    id: "proj-1",
    orgId: "org-1",
    name: "2027 Strategy Paper",
    description: "Annual corporate strategy document for 2027 — market outlook, priorities, and investment themes.",
    status: "active",
    updatedAt: "2026-05-18T14:22:00Z",
    budgetUsed: 12400,
    budgetTotal: 25000,
  },
  {
    id: "proj-2",
    orgId: "org-1",
    name: "CloudSuite Feedback & Ideation",
    description: "Synthesize product feedback and shape feature ideas for the CloudSuite product line.",
    status: "active",
    updatedAt: "2026-05-17T09:10:00Z",
    budgetUsed: 9800,
    budgetTotal: 20000,
  },
  {
    id: "proj-3",
    orgId: "org-1",
    name: "ServiceNow Helpdesk Analysis",
    description: "Analyze IT helpdesk ticket trends, SLAs, and recurring issues from ServiceNow exports.",
    status: "active",
    updatedAt: "2026-05-16T11:30:00Z",
    budgetUsed: 7200,
    budgetTotal: 15000,
  },
  {
    id: "proj-4",
    orgId: "org-1",
    name: "Weekly Sales Report & Trends",
    description: "Compile weekly sales performance, pipeline movement, and trend commentary for leadership.",
    status: "active",
    updatedAt: "2026-05-19T08:00:00Z",
    budgetUsed: 5600,
    budgetTotal: 12000,
  },
  {
    id: "proj-5",
    orgId: "org-2",
    name: "Pulse Analytics",
    description: "Telemetry pipelines for IoT sensor networks.",
    status: "active",
    updatedAt: "2026-05-16T11:30:00Z",
    budgetUsed: 22100,
    budgetTotal: 40000,
  },
  {
    id: "proj-6",
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
    email: "alex.rivera@acmecorp.com",
    role: "Admin",
    title: "VP Strategy & Operations",
    managerId: null,
    projectIds: ["proj-1"],
  },
  {
    id: "u3",
    orgId: "org-1",
    name: "Sam Okonkwo",
    email: "sam.okonkwo@acmecorp.com",
    role: "PM",
    title: "Program Manager",
    managerId: "u1",
    projectIds: ["proj-1", "proj-2", "proj-3", "proj-4"],
  },
  {
    id: "u2",
    orgId: "org-1",
    name: "Morgan Lee",
    email: "morgan.lee@acmecorp.com",
    role: "Engineer",
    title: "Strategy Analyst",
    managerId: "u1",
    projectIds: ["proj-1"],
  },
  {
    id: "u4",
    orgId: "org-1",
    name: "Jordan Kim",
    email: "jordan.kim@acmecorp.com",
    role: "PM",
    title: "Product Manager, CloudSuite",
    managerId: "u3",
    projectIds: ["proj-2"],
  },
  {
    id: "u9",
    orgId: "org-1",
    name: "Priya Sharma",
    email: "priya.sharma@acmecorp.com",
    role: "Engineer",
    title: "Customer Insights Lead",
    managerId: "u4",
    projectIds: ["proj-2"],
  },
  {
    id: "u10",
    orgId: "org-1",
    name: "Chris Alvarez",
    email: "chris.alvarez@acmecorp.com",
    role: "Engineer",
    title: "IT Operations Lead",
    managerId: "u3",
    projectIds: ["proj-3"],
  },
  {
    id: "u5",
    orgId: "org-1",
    name: "Dana Patel",
    email: "dana.patel@acmecorp.com",
    role: "Engineer",
    title: "Senior Data Analyst",
    managerId: "u3",
    projectIds: ["proj-3", "proj-4"],
  },
  {
    id: "u14",
    orgId: "org-1",
    name: "Riley Foster",
    email: "riley.foster@acmecorp.com",
    role: "PM",
    title: "Sales Operations Manager",
    managerId: "u1",
    projectIds: ["proj-4"],
  },
  {
    id: "u6",
    orgId: "org-2",
    name: "Casey Nguyen",
    email: "casey@northwind.io",
    role: "Admin",
    title: "Head of Data",
    managerId: null,
    projectIds: ["proj-5"],
  },
  {
    id: "u7",
    orgId: "org-2",
    name: "Taylor Brooks",
    email: "taylor@northwind.io",
    role: "Engineer",
    title: "Platform Engineer",
    managerId: "u6",
    projectIds: ["proj-5"],
  },
  {
    id: "u12",
    orgId: "org-3",
    name: "Noah Fischer",
    email: "noah@helios.io",
    role: "Admin",
    title: "Founder",
    managerId: null,
    projectIds: ["proj-6"],
  },
  {
    id: "u13",
    orgId: "org-3",
    name: "Elena Vasquez",
    email: "elena@helios.io",
    role: "Engineer",
    title: "Applied AI Engineer",
    managerId: "u12",
    projectIds: ["proj-6"],
  },
]

export const agents: Agent[] = [
  // 2027 Strategy Paper
  {
    id: "a1",
    orgId: "org-1",
    name: "Strategy research assistant",
    model: "gpt-4.1",
    status: "active",
    description: "Pulls market data and competitive intel for strategy sections.",
    managerId: "u2",
    projectIds: ["proj-1"],
  },
  {
    id: "a4",
    orgId: "org-1",
    name: "Executive summary writer",
    model: "gpt-4.1-mini",
    status: "active",
    description: "Drafts and refines executive summary and section narratives.",
    managerId: "u2",
    projectIds: ["proj-1"],
  },
  // CloudSuite Feedback & Ideation
  {
    id: "a2",
    orgId: "org-1",
    name: "Feedback synthesizer",
    model: "claude-sonnet",
    status: "active",
    description: "Clusters NPS comments and interview notes into themes.",
    managerId: "u9",
    projectIds: ["proj-2"],
  },
  {
    id: "a6",
    orgId: "org-1",
    name: "Feature brief author",
    model: "gpt-4.1",
    status: "active",
    description: "Turns validated themes into concise feature briefs.",
    managerId: "u4",
    projectIds: ["proj-2"],
  },
  // ServiceNow Helpdesk Analysis
  {
    id: "a5",
    orgId: "org-1",
    name: "Ticket trend analyst",
    model: "gpt-4.1",
    status: "active",
    description: "Tracks volume, SLA breaches, and category trends from ServiceNow.",
    managerId: "u10",
    projectIds: ["proj-3"],
    avatar: { type: "icon", icon: "shield" },
  },
  {
    id: "a3",
    orgId: "org-1",
    name: "Root cause summarizer",
    model: "gpt-4.1-mini",
    status: "active",
    description: "Summarizes recurring incident patterns and suggested fixes.",
    managerId: "u10",
    projectIds: ["proj-3"],
  },
  // Weekly Sales Report & Trends
  {
    id: "a7",
    orgId: "org-1",
    name: "Sales report compiler",
    model: "gpt-4.1",
    status: "active",
    description: "Builds the weekly sales deck from CRM and ERP exports.",
    managerId: "u14",
    projectIds: ["proj-4"],
  },
  {
    id: "a8",
    orgId: "org-1",
    name: "Trend narrator",
    model: "claude-sonnet",
    status: "active",
    description: "Writes plain-language trend commentary for leadership.",
    managerId: "u14",
    projectIds: ["proj-4"],
  },
  // Other orgs — minimal
  {
    id: "a9",
    orgId: "org-2",
    name: "Telemetry ingest manager",
    model: "gpt-4.1",
    status: "active",
    description: "Manages IoT telemetry ingestion pipelines.",
    managerId: "u7",
    projectIds: ["proj-5"],
  },
  {
    id: "a12",
    orgId: "org-3",
    name: "Inspection checklist QA",
    model: "gpt-4.1-mini",
    status: "active",
    description: "QA agent for pilot inspection checklists.",
    managerId: "u13",
    projectIds: ["proj-6"],
  },
]

export const resources: Resource[] = [
  {
    id: "r1",
    orgId: "org-1",
    projectId: "proj-1",
    name: "sharepoint-strategy-library",
    type: "api",
    size: "—",
    provider: "Microsoft SharePoint",
    status: "connected",
    lastSyncedAt: "2026-05-19T07:00:00Z",
  },
  {
    id: "r2",
    orgId: "org-1",
    projectId: "proj-1",
    name: "market-intel-q2.csv",
    type: "dataset",
    size: "4.2 MB",
    provider: "Internal BI",
    status: "connected",
    lastSyncedAt: "2026-05-18T16:00:00Z",
  },
  {
    id: "r3",
    orgId: "org-1",
    projectId: "proj-2",
    name: "productboard-api",
    type: "api",
    size: "—",
    provider: "Productboard",
    status: "connected",
    lastSyncedAt: "2026-05-19T08:30:00Z",
  },
  {
    id: "r4",
    orgId: "org-1",
    projectId: "proj-2",
    name: "cloudsuite-nps-export.csv",
    type: "dataset",
    size: "18 MB",
    provider: "Qualtrics",
    status: "connected",
    lastSyncedAt: "2026-05-19T06:00:00Z",
  },
  {
    id: "r5",
    orgId: "org-1",
    projectId: "proj-3",
    name: "servicenow-incidents",
    type: "api",
    size: "—",
    provider: "ServiceNow REST",
    status: "connected",
    lastSyncedAt: "2026-05-19T05:45:00Z",
  },
  {
    id: "r6",
    orgId: "org-1",
    projectId: "proj-3",
    name: "helpdesk-tickets-90d.csv",
    type: "dataset",
    size: "62 MB",
    provider: "ServiceNow Export",
    status: "connected",
    lastSyncedAt: "2026-05-19T04:00:00Z",
  },
  {
    id: "r7",
    orgId: "org-1",
    projectId: "proj-4",
    name: "salesforce-opportunities",
    type: "dataset",
    size: "210 MB",
    provider: "Salesforce",
    status: "connected",
    lastSyncedAt: "2026-05-19T09:00:00Z",
  },
  {
    id: "r8",
    orgId: "org-1",
    projectId: "proj-4",
    name: "erp-weekly-revenue",
    type: "api",
    size: "—",
    provider: "NetSuite",
    status: "connected",
    lastSyncedAt: "2026-05-19T08:15:00Z",
  },
  {
    id: "r9",
    orgId: "org-2",
    projectId: "proj-5",
    name: "sensor-schema.avro",
    type: "api",
    size: "12 KB",
    provider: "Confluent Schema Registry",
    status: "connected",
    lastSyncedAt: "2026-05-18T22:00:00Z",
  },
]

export const vaults: Vault[] = [
  {
    id: "v1",
    orgId: "org-1",
    name: "Integration Credentials",
    secrets: 14,
    projectIds: ["proj-1", "proj-2", "proj-3", "proj-4"],
    description: "API keys for SharePoint, Productboard, ServiceNow, and Salesforce",
  },
  {
    id: "v2",
    orgId: "org-1",
    name: "Document Signing",
    secrets: 4,
    projectIds: ["proj-1"],
    description: "DocuSign and internal approval signing certificates",
  },
  {
    id: "v3",
    orgId: "org-2",
    name: "Data Platform Keys",
    secrets: 6,
    projectIds: ["proj-5"],
    description: "Warehouse and ingest pipeline secrets",
  },
]

export const tools: Tool[] = [
  {
    id: "tool-slack-post",
    orgId: "org-1",
    name: "Slack Post",
    type: "mcp",
    description: "Post project updates to Slack channels.",
  },
  {
    id: "tool-sharepoint-read",
    orgId: "org-1",
    name: "SharePoint Reader",
    type: "mcp",
    description: "Read strategy documents and prior-year papers from SharePoint.",
  },
  {
    id: "tool-productboard",
    orgId: "org-1",
    name: "Productboard",
    type: "mcp",
    description: "Fetch features, insights, and customer feedback from Productboard.",
  },
  {
    id: "tool-servicenow-query",
    orgId: "org-1",
    name: "ServiceNow Query",
    type: "mcp",
    description: "Run saved queries against ServiceNow incident and request tables.",
  },
  {
    id: "tool-salesforce-report",
    orgId: "org-1",
    name: "Salesforce Report",
    type: "api",
    description: "Pull standard pipeline and bookings reports from Salesforce.",
  },
  {
    id: "tool-schema-registry",
    orgId: "org-2",
    name: "Schema Registry",
    type: "api",
    description: "Confluent schema registry lookup tool.",
  },
]

export const agentAccessGrants: AgentAccessGrant[] = [
  {
    id: "grant-a1-proj1",
    agentId: "a1",
    projectId: "proj-1",
    skillIds: [
      "skill-platform-data-analysis",
      "skill-org-acme-strategy",
      "skill-org-acme-source-citation",
      "skill-platform-safety-preamble",
    ],
    toolIds: ["tool-sharepoint-read"],
    integrationIds: ["r1", "r2"],
    vaultIds: ["v1"],
  },
  {
    id: "grant-a4-proj1",
    agentId: "a4",
    projectId: "proj-1",
    workspaceFolderIds: ["f2"],
    skillIds: [
      "skill-platform-pdf",
      "skill-org-acme-strategy",
      "skill-org-acme-executive-tone",
      "skill-platform-safety-preamble",
    ],
    integrationIds: [],
    vaultIds: ["v2"],
    toolIds: [],
  },
  {
    id: "grant-a2-proj2",
    agentId: "a2",
    projectId: "proj-2",
    skillIds: [
      "skill-platform-data-analysis",
      "skill-platform-customer-support",
      "skill-platform-safety-preamble",
    ],
    toolIds: ["tool-productboard"],
    integrationIds: ["r3", "r4"],
    vaultIds: ["v1"],
  },
  {
    id: "grant-a6-proj2",
    agentId: "a6",
    projectId: "proj-2",
    skillIds: ["skill-platform-pdf"],
    toolIds: ["tool-slack-post"],
    integrationIds: [],
    vaultIds: [],
  },
  {
    id: "grant-a5-proj3",
    agentId: "a5",
    projectId: "proj-3",
    skillIds: ["skill-platform-data-analysis", "skill-org-acme-servicenow"],
    toolIds: ["tool-servicenow-query"],
    integrationIds: ["r5", "r6"],
    vaultIds: ["v1"],
  },
  {
    id: "grant-a3-proj3",
    agentId: "a3",
    projectId: "proj-3",
    workspaceFolderIds: ["f21"],
    skillIds: ["skill-platform-customer-support"],
    integrationIds: [],
    vaultIds: [],
    toolIds: [],
  },
  {
    id: "grant-a7-proj4",
    agentId: "a7",
    projectId: "proj-4",
    skillIds: ["skill-platform-data-analysis"],
    toolIds: ["tool-salesforce-report"],
    integrationIds: ["r7", "r8"],
    vaultIds: ["v1"],
  },
  {
    id: "grant-a8-proj4",
    agentId: "a8",
    projectId: "proj-4",
    skillIds: ["skill-platform-pdf"],
    toolIds: ["tool-slack-post", "tool-salesforce-report"],
    integrationIds: ["r7"],
    vaultIds: [],
  },
]

export const projectFiles: ProjectFileNode[] = [
  // proj-1 — 2027 Strategy Paper
  { id: "f1", projectId: "proj-1", name: "research", kind: "folder", parentId: null, updatedAt: "2026-05-18T09:00:00Z" },
  { id: "f2", projectId: "proj-1", name: "drafts", kind: "folder", parentId: null, updatedAt: "2026-05-19T08:00:00Z" },
  { id: "f3", projectId: "proj-1", name: "references", kind: "folder", parentId: null, updatedAt: "2026-05-16T14:00:00Z" },
  { id: "f4", projectId: "proj-1", name: "competitive-landscape.md", kind: "file", parentId: "f1", size: "24 KB", updatedAt: "2026-05-19T07:30:00Z" },
  { id: "f5", projectId: "proj-1", name: "2026-strategy-retrospective.pdf", kind: "file", parentId: "f3", size: "1.8 MB", updatedAt: "2026-05-10T09:00:00Z" },
  { id: "f6", projectId: "proj-1", name: "executive-summary-v3.docx", kind: "file", parentId: "f2", size: "86 KB", updatedAt: "2026-05-19T06:00:00Z" },
  // proj-2 — CloudSuite Feedback
  { id: "f10", projectId: "proj-2", name: "feedback-raw", kind: "folder", parentId: null, updatedAt: "2026-05-18T12:00:00Z" },
  { id: "f11", projectId: "proj-2", name: "themes", kind: "folder", parentId: null, updatedAt: "2026-05-17T10:00:00Z" },
  { id: "f12", projectId: "proj-2", name: "feature-briefs", kind: "folder", parentId: null, updatedAt: "2026-05-19T08:00:00Z" },
  { id: "f13", projectId: "proj-2", name: "interview-notes-may.md", kind: "file", parentId: "f10", size: "42 KB", updatedAt: "2026-05-18T16:00:00Z" },
  { id: "f14", projectId: "proj-2", name: "theme-onboarding-friction.md", kind: "file", parentId: "f11", size: "12 KB", updatedAt: "2026-05-19T07:00:00Z" },
  { id: "f15", projectId: "proj-2", name: "brief-sso-improvements.md", kind: "file", parentId: "f12", size: "8 KB", updatedAt: "2026-05-19T08:30:00Z" },
  // proj-3 — ServiceNow Helpdesk
  { id: "f20", projectId: "proj-3", name: "exports", kind: "folder", parentId: null, updatedAt: "2026-05-19T04:00:00Z" },
  { id: "f21", projectId: "proj-3", name: "reports", kind: "folder", parentId: null, updatedAt: "2026-05-18T11:00:00Z" },
  { id: "f22", projectId: "proj-3", name: "tickets-90d-0519.csv", kind: "file", parentId: "f20", size: "62 MB", updatedAt: "2026-05-19T04:00:00Z" },
  { id: "f23", projectId: "proj-3", name: "sla-breach-summary.md", kind: "file", parentId: "f21", size: "14 KB", updatedAt: "2026-05-19T05:30:00Z" },
  // proj-4 — Weekly Sales Report
  { id: "f30", projectId: "proj-4", name: "weekly", kind: "folder", parentId: null, updatedAt: "2026-05-19T09:00:00Z" },
  { id: "f31", projectId: "proj-4", name: "templates", kind: "folder", parentId: null, updatedAt: "2026-05-14T10:00:00Z" },
  { id: "f32", projectId: "proj-4", name: "week-20-2026-report.pptx", kind: "file", parentId: "f30", size: "420 KB", updatedAt: "2026-05-19T08:45:00Z" },
  { id: "f33", projectId: "proj-4", name: "leadership-deck-template.pptx", kind: "file", parentId: "f31", size: "180 KB", updatedAt: "2026-05-14T10:30:00Z" },
  // other orgs
  { id: "f40", projectId: "proj-5", name: "schemas", kind: "folder", parentId: null, updatedAt: "2026-05-16T11:00:00Z" },
  { id: "f41", projectId: "proj-6", name: "templates", kind: "folder", parentId: null, updatedAt: "2026-05-14T10:00:00Z" },
]

export const configurations: Configuration[] = [
  { id: "c1", orgId: "org-1", projectId: "proj-1", key: "STRATEGY_FISCAL_YEAR", environment: "production" },
  { id: "c2", orgId: "org-1", projectId: "proj-3", key: "SNOW_QUERY_WINDOW_DAYS", environment: "production" },
  { id: "c3", orgId: "org-1", key: "DEFAULT_MODEL", environment: "global" },
  { id: "c4", orgId: "org-1", projectId: "proj-4", key: "SALES_WEEK_START", environment: "production" },
  { id: "c5", orgId: "org-2", projectId: "proj-5", key: "INGEST_BATCH_SIZE", environment: "production" },
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
    { id: "t1", title: "Finalize market sizing section", assignee: "Morgan Lee", status: "in_progress", due: "May 24" },
    { id: "t2", title: "Review executive summary draft", assignee: "Alex Rivera", status: "todo", due: "May 26" },
    { id: "t3", title: "Pull Q2 competitive intel", assignee: "Strategy research assistant", status: "done", due: "May 18" },
    { id: "t4", title: "Align investment themes with finance", assignee: "Sam Okonkwo", status: "in_progress", due: "May 28" },
  ],
  "proj-2": [
    { id: "t5", title: "Validate onboarding friction theme", assignee: "Priya Sharma", status: "in_progress", due: "May 23" },
    { id: "t6", title: "Draft SSO improvement brief", assignee: "Feature brief author", status: "todo", due: "May 25" },
    { id: "t7", title: "Import latest NPS export", assignee: "Jordan Kim", status: "done", due: "May 17" },
  ],
  "proj-3": [
    { id: "t8", title: "Refresh 90-day ticket export", assignee: "Chris Alvarez", status: "done", due: "May 19" },
    { id: "t9", title: "Summarize top 5 recurring incidents", assignee: "Root cause summarizer", status: "in_progress", due: "May 22" },
    { id: "t10", title: "Review SLA breach report with IT leadership", assignee: "Dana Patel", status: "todo", due: "May 27" },
  ],
  "proj-4": [
    { id: "t11", title: "Publish week 20 sales deck", assignee: "Sales report compiler", status: "in_progress", due: "May 19" },
    { id: "t12", title: "Add pipeline commentary for EMEA", assignee: "Trend narrator", status: "todo", due: "May 20" },
    { id: "t13", title: "Reconcile ERP vs Salesforce totals", assignee: "Dana Patel", status: "in_progress", due: "May 21" },
  ],
  "proj-5": [
    { id: "t14", title: "Ship telemetry batch ingest", assignee: "Taylor Brooks", status: "in_progress", due: "May 25" },
  ],
  "proj-6": [
    { id: "t15", title: "Scope pilot inspection workflow", assignee: "Elena Vasquez", status: "in_progress", due: "May 30" },
  ],
}

export const projectMessages: Record<string, Message[]> = {
  "proj-1": [
    { id: "m1", author: "Morgan Lee", content: "Competitive landscape draft is in research/ — needs your eyes on TAM assumptions.", time: "2h ago" },
    { id: "m2", author: "Strategy research assistant", content: "Synced 12 new analyst reports from SharePoint.", time: "5h ago" },
    { id: "m3", author: "Alex Rivera", content: "Let's keep the AI investment theme to two pages max in the final paper.", time: "Yesterday" },
  ],
  "proj-2": [
    { id: "m4", author: "Priya Sharma", content: "Onboarding friction is the clear leader — 34% of detractor comments mention SSO.", time: "3h ago" },
    { id: "m5", author: "Jordan Kim", content: "Can we prioritize the SSO brief for the June roadmap review?", time: "Yesterday" },
  ],
  "proj-3": [
    { id: "m6", author: "Chris Alvarez", content: "Password reset tickets still dominate — same as last month.", time: "4h ago" },
    { id: "m7", author: "Ticket trend analyst", content: "SLA breach rate down to 4.1% from 5.8% week over week.", time: "Yesterday" },
  ],
  "proj-4": [
    { id: "m8", author: "Riley Foster", content: "Leadership wants shorter trend narrative this week — one slide max.", time: "2h ago" },
    { id: "m9", author: "Trend narrator", content: "EMEA pipeline softening noted; APAC holding flat.", time: "Today, 8:00 AM" },
  ],
  "proj-5": [
    { id: "m10", author: "Casey Nguyen", content: "Ingest backlog cleared overnight.", time: "1d ago" },
  ],
  "proj-6": [
    { id: "m11", author: "Noah Fischer", content: "Pilot scope approved for two inspection sites.", time: "2d ago" },
  ],
}

export const projectActivity: Record<string, ActivityItem[]> = {
  "proj-1": [
    { id: "act1", action: "updated executive summary v3", actor: "Executive summary writer", time: "Today, 9:14 AM" },
    { id: "act2", action: "linked SharePoint strategy library", actor: "Alex Rivera", time: "Yesterday" },
    { id: "act3", action: "imported market-intel-q2.csv", actor: "Strategy research assistant", time: "May 18" },
  ],
  "proj-2": [
    { id: "act4", action: "published theme-onboarding-friction.md", actor: "Feedback synthesizer", time: "Today, 11:02 AM" },
    { id: "act5", action: "connected Productboard integration", actor: "Jordan Kim", time: "May 17" },
  ],
  "proj-3": [
    { id: "act6", action: "generated sla-breach-summary.md", actor: "Ticket trend analyst", time: "Today, 7:30 AM" },
    { id: "act7", action: "uploaded tickets-90d-0519.csv", actor: "Chris Alvarez", time: "Today, 4:00 AM" },
  ],
  "proj-4": [
    { id: "act8", action: "compiled week-20-2026-report.pptx", actor: "Sales report compiler", time: "Today, 8:45 AM" },
    { id: "act9", action: "posted draft to #sales-leadership", actor: "Trend narrator", time: "Yesterday" },
  ],
  "proj-5": [
    { id: "act10", action: "scaled ingest replicas", actor: "Taylor Brooks", time: "May 17" },
  ],
  "proj-6": [
    { id: "act11", action: "onboarded inspection QA agent", actor: "Elena Vasquez", time: "May 15" },
  ],
}

export const directoryProfiles: Record<string, DirectoryProfile> = {
  u1: {
    userId: "u1",
    upn: "alex.rivera@acmecorp.com",
    employeeId: "EMP-1042",
    department: "Strategy",
    office: "New York HQ",
    adManagerName: "—",
    groups: ["RAI-Admins", "Strategy-Leadership", "All-Employees"],
    accountEnabled: true,
    lastSyncedAt: "2026-05-19T08:00:00Z",
    source: "Azure AD",
  },
  u2: {
    userId: "u2",
    upn: "morgan.lee@acmecorp.com",
    employeeId: "EMP-2187",
    department: "Strategy",
    office: "New York HQ",
    adManagerName: "Alex Rivera",
    groups: ["Strategy-Team", "All-Employees"],
    accountEnabled: true,
    lastSyncedAt: "2026-05-19T08:00:00Z",
    source: "Azure AD",
  },
  u3: {
    userId: "u3",
    upn: "sam.okonkwo@acmecorp.com",
    employeeId: "EMP-1834",
    department: "Program Management",
    office: "New York HQ",
    adManagerName: "Alex Rivera",
    groups: ["PM-Team", "All-Employees"],
    accountEnabled: true,
    lastSyncedAt: "2026-05-19T08:00:00Z",
    source: "Azure AD",
  },
  u4: {
    userId: "u4",
    upn: "jordan.kim@acmecorp.com",
    employeeId: "EMP-2291",
    department: "Product",
    office: "Remote — Seattle",
    adManagerName: "Sam Okonkwo",
    groups: ["Product-CloudSuite", "All-Employees"],
    accountEnabled: true,
    lastSyncedAt: "2026-05-19T08:00:00Z",
    source: "Azure AD",
  },
  u5: {
    userId: "u5",
    upn: "dana.patel@acmecorp.com",
    employeeId: "EMP-2410",
    department: "Analytics",
    office: "Chicago",
    adManagerName: "Sam Okonkwo",
    groups: ["Analytics-Team", "All-Employees"],
    accountEnabled: true,
    lastSyncedAt: "2026-05-19T08:00:00Z",
    source: "Azure AD",
  },
  u9: {
    userId: "u9",
    upn: "priya.sharma@acmecorp.com",
    employeeId: "EMP-2555",
    department: "Product Research",
    office: "Austin",
    adManagerName: "Jordan Kim",
    groups: ["Research-Team", "All-Employees"],
    accountEnabled: true,
    lastSyncedAt: "2026-05-19T08:00:00Z",
    source: "Azure AD",
  },
  u10: {
    userId: "u10",
    upn: "chris.alvarez@acmecorp.com",
    employeeId: "EMP-2601",
    department: "IT Operations",
    office: "Chicago",
    adManagerName: "Sam Okonkwo",
    groups: ["IT-Ops", "All-Employees"],
    accountEnabled: true,
    lastSyncedAt: "2026-05-19T08:00:00Z",
    source: "Azure AD",
  },
  u14: {
    userId: "u14",
    upn: "riley.foster@acmecorp.com",
    employeeId: "EMP-2712",
    department: "Sales Operations",
    office: "New York HQ",
    adManagerName: "Alex Rivera",
    groups: ["Sales-Ops", "All-Employees"],
    accountEnabled: true,
    lastSyncedAt: "2026-05-19T08:00:00Z",
    source: "Azure AD",
  },
}

export const directoryCandidates: DirectoryCandidate[] = [
  {
    id: "ad-501",
    orgId: "org-1",
    displayName: "Nina Hoffmann",
    email: "nina.hoffmann@acmecorp.com",
    jobTitle: "Corporate Communications",
    department: "Marketing",
    office: "New York HQ",
    upn: "nina.hoffmann@acmecorp.com",
  },
  {
    id: "ad-502",
    orgId: "org-1",
    displayName: "Omar Hassan",
    email: "omar.hassan@acmecorp.com",
    jobTitle: "Business Analyst",
    department: "Finance",
    office: "Remote — Denver",
    upn: "omar.hassan@acmecorp.com",
  },
  {
    id: "ad-503",
    orgId: "org-1",
    displayName: "Riley Torres",
    email: "riley.torres@acmecorp.com",
    jobTitle: "Support Engineer",
    department: "IT Operations",
    office: "Chicago",
    upn: "riley.torres@acmecorp.com",
  },
]

export const agentActivity: Record<string, ActivityItem[]> = {
  a1: [
    { id: "aa1", action: "summarized 12 analyst reports from SharePoint", actor: "Strategy research assistant", time: "Today, 10:22 AM" },
    { id: "aa2", action: "updated competitive landscape metrics", actor: "Strategy research assistant", time: "Today, 8:05 AM" },
  ],
  a4: [
    { id: "aa3", action: "drafted executive summary v3", actor: "Executive summary writer", time: "Today, 9:40 AM" },
    { id: "aa4", action: "shortened AI investment section per feedback", actor: "Executive summary writer", time: "May 18" },
  ],
  a2: [
    { id: "aa5", action: "clustered 847 NPS comments into 6 themes", actor: "Feedback synthesizer", time: "Today, 11:30 AM" },
    { id: "aa6", action: "flagged onboarding friction as top detractor driver", actor: "Feedback synthesizer", time: "Yesterday" },
  ],
  a5: [
    { id: "aa7", action: "generated SLA breach summary for week 20", actor: "Ticket trend analyst", time: "Today, 7:15 AM" },
    { id: "aa8", action: "noted password-reset volume unchanged WoW", actor: "Ticket trend analyst", time: "May 18" },
  ],
  a7: [
    { id: "aa9", action: "compiled week 20 sales deck from Salesforce export", actor: "Sales report compiler", time: "Today, 8:45 AM" },
  ],
}

export const agentLogs: Record<string, AgentLogEntry[]> = {
  a1: [
    { id: "al1", level: "info", message: "SharePoint sync completed — 12 documents indexed", timestamp: "2026-05-19T10:22:14Z" },
    { id: "al2", level: "info", message: "Market intel dataset loaded (4.2 MB, 1,240 rows)", timestamp: "2026-05-19T08:05:33Z" },
    { id: "al3", level: "debug", message: "Applied skill acme-strategy-writing", timestamp: "2026-05-19T08:00:00Z" },
  ],
  a4: [
    { id: "al4", level: "info", message: "Generated executive summary (1,840 tokens)", timestamp: "2026-05-19T09:40:01Z" },
    { id: "al5", level: "info", message: "Saved draft to drafts/executive-summary-v3.docx", timestamp: "2026-05-19T09:40:05Z" },
  ],
  a5: [
    { id: "al6", level: "info", message: "ServiceNow query returned 3,412 incidents (90d window)", timestamp: "2026-05-19T07:15:22Z" },
    { id: "al7", level: "warn", message: "Password reset category still 22% of volume", timestamp: "2026-05-18T16:44:10Z" },
  ],
  a2: [
    { id: "al8", level: "info", message: "Productboard sync — 34 insights fetched", timestamp: "2026-05-19T11:30:00Z" },
  ],
  a7: [
    { id: "al9", level: "info", message: "Salesforce report pulled — 1,892 opportunities", timestamp: "2026-05-19T08:45:00Z" },
  ],
}

export const agentConfigurations: Record<string, AgentConfigEntry[]> = {
  a1: [
    { key: "STRATEGY_FISCAL_YEAR", value: "2027", environment: "production", description: "Target fiscal year for strategy paper" },
    { key: "MAX_SOURCES", value: "20", environment: "production", description: "Max external sources per research run" },
  ],
  a4: [
    { key: "DOC_TEMPLATE_VERSION", value: "3.0", environment: "production", description: "Executive summary template version" },
    { key: "MAX_OUTPUT_TOKENS", value: "4096", environment: "global", description: "Generation limit per section" },
  ],
  a5: [
    { key: "SNOW_QUERY_WINDOW_DAYS", value: "90", environment: "production", description: "Incident lookback window" },
    { key: "SLA_TARGET_PCT", value: "95", environment: "production", description: "Target SLA compliance percentage" },
  ],
  a7: [
    { key: "SALES_WEEK_START", value: "monday", environment: "production", description: "Week boundary for sales reporting" },
    { key: "REPORT_CURRENCY", value: "USD", environment: "global", description: "Currency for revenue figures" },
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
      title: user.title ?? "",
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
      title: agent.description ?? "",
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
