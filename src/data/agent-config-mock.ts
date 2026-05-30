import type { AgentAccessGrant } from "@/data/mock"

export type WorkspaceScope = "full" | "folders"
export type DataClassificationTier = "public" | "internal" | "confidential" | "restricted"

export interface ModelParams {
  temperature: number
  maxTokens: number
  topP: number
}

export interface ResponseSettings {
  format: "markdown" | "plain" | "json"
  language: string
  citationStyle: "inline" | "footnotes" | "none"
}

export interface AgentBudgetLimits {
  spendCapUsd?: number
  tokenLimitPerRun?: number
  rateLimitPerMin?: number
  scheduleWindow?: string
  quotaNotes?: string
}

export interface AgentContextScope {
  orgContextIds: string[]
  projectContextIds: string[]
  platformContextIds: string[]
  memoryStoreIds: string[]
}

export type AutonomyLevel = "manual" | "suggest" | "full"

export interface HeartbeatConfig {
  enabled: boolean
  intervalSec: number
  autonomy: AutonomyLevel
  maxActionsPerBeat: number
  activeWindow?: string
}

export interface AgentProjectConfig {
  id: string
  agentId: string
  projectId: string
  goals: string[]
  systemPrompt: string
  modelParams: ModelParams
  responseSettings: ResponseSettings
  workspaceScope: WorkspaceScope
  dataClassificationTier: DataClassificationTier
  policyIds: string[]
  guardrailIds: string[]
  approvalPolicyId?: string
  egressAllowlistId?: string
  budget: AgentBudgetLimits
  contextScope: AgentContextScope
  heartbeat: HeartbeatConfig
}

export interface Guardrail {
  id: string
  orgId?: string
  name: string
  description: string
  severity: "info" | "warn" | "block"
  status: "active" | "draft"
}

export interface ApprovalPolicy {
  id: string
  orgId?: string
  name: string
  description: string
  requiresApprovalFor: string[]
}

export interface EgressAllowlist {
  id: string
  orgId?: string
  name: string
  description: string
  allowedHosts: string[]
}

export interface MemoryStore {
  id: string
  orgId?: string
  name: string
  description: string
  sourceType: "vector" | "document" | "conversation"
}

export interface InjectableContext {
  id: string
  scope: "platform" | "org" | "project"
  orgId?: string
  projectId?: string
  name: string
  description: string
}

export const dataClassificationOptions: {
  value: DataClassificationTier
  label: string
  description: string
}[] = [
  { value: "public", label: "Public", description: "Non-sensitive, externally shareable" },
  { value: "internal", label: "Internal", description: "Default org workspace data" },
  { value: "confidential", label: "Confidential", description: "Limited team access" },
  { value: "restricted", label: "Restricted", description: "Highest sensitivity — vault-only" },
]

export const guardrails: Guardrail[] = [
  {
    id: "gr1",
    name: "No credential exfiltration",
    description: "Block responses that include API keys, tokens, or vault contents.",
    severity: "block",
    status: "active",
  },
  {
    id: "gr2",
    orgId: "org-1",
    name: "PII masking",
    description: "Redact email addresses and phone numbers in outputs.",
    severity: "warn",
    status: "active",
  },
  {
    id: "gr3",
    orgId: "org-1",
    name: "External link validation",
    description: "Only link to approved domains from the egress allowlist.",
    severity: "block",
    status: "active",
  },
]

export const approvalPolicies: ApprovalPolicy[] = [
  {
    id: "ap1",
    orgId: "org-1",
    name: "External API calls",
    description: "Human approval before calling non-internal APIs.",
    requiresApprovalFor: ["external_api", "webhook"],
  },
  {
    id: "ap2",
    orgId: "org-1",
    name: "Document publish",
    description: "Approval before writing to shared drives or sending email.",
    requiresApprovalFor: ["sharepoint_write", "email_send"],
  },
]

export const egressAllowlists: EgressAllowlist[] = [
  {
    id: "eg1",
    orgId: "org-1",
    name: "Acme approved hosts",
    description: "Standard egress for strategy and ops agents.",
    allowedHosts: ["*.acmecorp.com", "graph.microsoft.com", "api.openai.com"],
  },
  {
    id: "eg2",
    name: "Platform default",
    description: "Minimal platform egress for sandboxed agents.",
    allowedHosts: ["api.openai.com", "api.anthropic.com"],
  },
]

export const memoryStores: MemoryStore[] = [
  {
    id: "ms1",
    orgId: "org-1",
    name: "Strategy research index",
    description: "Embeddings over prior strategy papers and market intel.",
    sourceType: "vector",
  },
  {
    id: "ms2",
    orgId: "org-1",
    name: "Project conversation memory",
    description: "Rolling summary of agent runs on this project.",
    sourceType: "conversation",
  },
]

export const injectableContexts: InjectableContext[] = [
  {
    id: "ic1",
    scope: "platform",
    name: "Platform capabilities",
    description: "Available tools, models, and platform limits.",
  },
  {
    id: "ic2",
    scope: "org",
    orgId: "org-1",
    name: "Acme brand guidelines",
    description: "Voice, terminology, and formatting standards.",
  },
  {
    id: "ic3",
    scope: "project",
    orgId: "org-1",
    projectId: "proj-1",
    name: "2027 Strategy scope",
    description: "Project charter, stakeholders, and deliverable outline.",
  },
  {
    id: "ic4",
    scope: "project",
    orgId: "org-1",
    projectId: "proj-2",
    name: "CloudSuite product context",
    description: "Product areas, release cadence, and NPS targets.",
  },
]

const defaultModelParams: ModelParams = {
  temperature: 0.4,
  maxTokens: 4096,
  topP: 1,
}

const defaultResponseSettings: ResponseSettings = {
  format: "markdown",
  language: "en",
  citationStyle: "inline",
}

const defaultHeartbeat: HeartbeatConfig = {
  enabled: true,
  intervalSec: 30,
  autonomy: "full",
  maxActionsPerBeat: 1,
}

export const agentProjectConfigs: AgentProjectConfig[] = [
  {
    id: "cfg-a1-proj1",
    agentId: "a1",
    projectId: "proj-1",
    goals: [
      "Summarize competitive landscape changes weekly",
      "Flag material shifts in market share or pricing",
    ],
    systemPrompt:
      "You are a strategy research assistant for Acme Corp's 2027 planning cycle. Prioritize primary sources, quantify claims, and surface risks early.",
    modelParams: { temperature: 0.3, maxTokens: 8192, topP: 0.95 },
    responseSettings: { format: "markdown", language: "en", citationStyle: "inline" },
    workspaceScope: "full",
    dataClassificationTier: "internal",
    policyIds: ["pol1", "pol3"],
    guardrailIds: ["gr1", "gr2", "gr3"],
    approvalPolicyId: "ap1",
    egressAllowlistId: "eg1",
    budget: {
      spendCapUsd: 1200,
      tokenLimitPerRun: 32000,
      rateLimitPerMin: 30,
      scheduleWindow: "Mon–Fri 07:00–20:00 UTC",
    },
    contextScope: {
      orgContextIds: ["ic2"],
      projectContextIds: ["ic3"],
      platformContextIds: ["ic1"],
      memoryStoreIds: ["ms1"],
    },
    heartbeat: {
      enabled: true,
      intervalSec: 25,
      autonomy: "full",
      maxActionsPerBeat: 2,
      activeWindow: "Mon–Fri 07:00–20:00 UTC",
    },
  },
  {
    id: "cfg-a4-proj1",
    agentId: "a4",
    projectId: "proj-1",
    goals: ["Draft executive summary sections", "Maintain consistent narrative voice"],
    systemPrompt:
      "You write executive summaries for Acme leadership. Be direct, structured, and aligned with the strategy research findings.",
    modelParams: { temperature: 0.5, maxTokens: 4096, topP: 1 },
    responseSettings: { format: "markdown", language: "en", citationStyle: "footnotes" },
    workspaceScope: "folders",
    dataClassificationTier: "confidential",
    policyIds: ["pol2", "pol3"],
    guardrailIds: ["gr1", "gr2"],
    approvalPolicyId: "ap2",
    egressAllowlistId: "eg1",
    budget: {
      spendCapUsd: 800,
      tokenLimitPerRun: 16000,
      rateLimitPerMin: 20,
    },
    contextScope: {
      orgContextIds: ["ic2"],
      projectContextIds: ["ic3"],
      platformContextIds: ["ic1"],
      memoryStoreIds: ["ms2"],
    },
    heartbeat: {
      enabled: true,
      intervalSec: 35,
      autonomy: "suggest",
      maxActionsPerBeat: 1,
    },
  },
  {
    id: "cfg-a2-proj2",
    agentId: "a2",
    projectId: "proj-2",
    goals: ["Cluster feedback into themes", "Highlight top detractor drivers"],
    systemPrompt:
      "You synthesize customer feedback for CloudSuite. Group by theme, quantify volume, and quote representative comments.",
    modelParams: defaultModelParams,
    responseSettings: defaultResponseSettings,
    workspaceScope: "full",
    dataClassificationTier: "internal",
    policyIds: ["pol3"],
    guardrailIds: ["gr1", "gr2"],
    approvalPolicyId: "ap1",
    egressAllowlistId: "eg1",
    budget: { spendCapUsd: 600, tokenLimitPerRun: 24000, rateLimitPerMin: 25 },
    contextScope: {
      orgContextIds: ["ic2"],
      projectContextIds: ["ic4"],
      platformContextIds: ["ic1"],
      memoryStoreIds: [],
    },
    heartbeat: {
      enabled: true,
      intervalSec: 30,
      autonomy: "full",
      maxActionsPerBeat: 1,
    },
  },
  // Voice of the Customer Report
  {
    id: "cfg-a20-proj7",
    agentId: "a20",
    projectId: "proj-7",
    goals: [
      "Assemble the Voice of the Customer report in the report/ folder",
      "Weave masked evidence and quotes into an executive narrative",
    ],
    systemPrompt:
      "You lead the Voice of the Customer agent team. Coordinate the source agents, then assemble a board-ready report. Mask all customer names and deal sizes via the vault. Require manager approval before publishing the final report.",
    modelParams: { temperature: 0.5, maxTokens: 8192, topP: 1 },
    responseSettings: { format: "markdown", language: "en", citationStyle: "inline" },
    workspaceScope: "folders",
    dataClassificationTier: "confidential",
    policyIds: ["pol2", "pol3"],
    guardrailIds: ["gr1", "gr2", "gr3"],
    approvalPolicyId: "ap2",
    egressAllowlistId: "eg1",
    budget: { spendCapUsd: 700, tokenLimitPerRun: 24000, rateLimitPerMin: 20 },
    contextScope: {
      orgContextIds: ["ic2"],
      projectContextIds: [],
      platformContextIds: ["ic1"],
      memoryStoreIds: ["ms2"],
    },
    heartbeat: {
      enabled: true,
      intervalSec: 30,
      autonomy: "manual",
      maxActionsPerBeat: 1,
    },
  },
  {
    id: "cfg-a21-proj7",
    agentId: "a21",
    projectId: "proj-7",
    goals: [
      "Pull masked customer feedback and deal context from Salesforce",
      "Tag feedback by account segment and ARR band",
    ],
    systemPrompt:
      "You query Salesforce for customer feedback, cases, and deal context. Always mask exact ACV through the vault and report values only as ARR bands.",
    modelParams: { temperature: 0.3, maxTokens: 8192, topP: 0.95 },
    responseSettings: { format: "markdown", language: "en", citationStyle: "inline" },
    workspaceScope: "folders",
    dataClassificationTier: "restricted",
    policyIds: ["pol3"],
    guardrailIds: ["gr1", "gr2"],
    approvalPolicyId: "ap1",
    egressAllowlistId: "eg1",
    budget: { spendCapUsd: 500, tokenLimitPerRun: 16000, rateLimitPerMin: 25 },
    contextScope: {
      orgContextIds: ["ic2"],
      projectContextIds: [],
      platformContextIds: ["ic1"],
      memoryStoreIds: [],
    },
    heartbeat: {
      enabled: true,
      intervalSec: 18,
      autonomy: "full",
      maxActionsPerBeat: 1,
    },
  },
  {
    id: "cfg-a22-proj7",
    agentId: "a22",
    projectId: "proj-7",
    goals: [
      "Extract support tickets and call transcripts from ServiceNow and Gong",
      "Surface recurring pain points with ticket volumes",
    ],
    systemPrompt:
      "You extract ServiceNow tickets and Gong call transcripts, tag recurring pain points, and mask customer identities before writing anything to the workspace.",
    modelParams: { temperature: 0.3, maxTokens: 8192, topP: 0.95 },
    responseSettings: { format: "markdown", language: "en", citationStyle: "inline" },
    workspaceScope: "folders",
    dataClassificationTier: "restricted",
    policyIds: ["pol3"],
    guardrailIds: ["gr1", "gr2"],
    approvalPolicyId: "ap1",
    egressAllowlistId: "eg1",
    budget: { spendCapUsd: 500, tokenLimitPerRun: 16000, rateLimitPerMin: 25 },
    contextScope: {
      orgContextIds: ["ic2"],
      projectContextIds: [],
      platformContextIds: ["ic1"],
      memoryStoreIds: [],
    },
    heartbeat: {
      enabled: true,
      intervalSec: 20,
      autonomy: "full",
      maxActionsPerBeat: 1,
    },
  },
  {
    id: "cfg-a23-proj7",
    agentId: "a23",
    projectId: "proj-7",
    goals: [
      "Cluster multi-source feedback into weighted themes",
      "Score sentiment by customer segment and region",
    ],
    systemPrompt:
      "You synthesize feedback from all sources into weighted themes and sentiment scores. De-duplicate signals across sources and weight by account ARR band.",
    modelParams: { temperature: 0.4, maxTokens: 8192, topP: 1 },
    responseSettings: { format: "markdown", language: "en", citationStyle: "inline" },
    workspaceScope: "folders",
    dataClassificationTier: "confidential",
    policyIds: ["pol3"],
    guardrailIds: ["gr1", "gr2"],
    approvalPolicyId: "ap1",
    egressAllowlistId: "eg1",
    budget: { spendCapUsd: 500, tokenLimitPerRun: 20000, rateLimitPerMin: 25 },
    contextScope: {
      orgContextIds: ["ic2"],
      projectContextIds: [],
      platformContextIds: ["ic1"],
      memoryStoreIds: ["ms2"],
    },
    heartbeat: {
      enabled: true,
      intervalSec: 22,
      autonomy: "full",
      maxActionsPerBeat: 1,
    },
  },
]

export function createDefaultAgentProjectConfig(
  agentId: string,
  projectId: string,
): AgentProjectConfig {
  return {
    id: `cfg-${agentId}-${projectId}`,
    agentId,
    projectId,
    goals: [],
    systemPrompt: "",
    modelParams: { ...defaultModelParams },
    responseSettings: { ...defaultResponseSettings },
    workspaceScope: "full",
    dataClassificationTier: "internal",
    policyIds: [],
    guardrailIds: ["gr1"],
    approvalPolicyId: undefined,
    egressAllowlistId: "eg2",
    budget: {},
    contextScope: {
      orgContextIds: [],
      projectContextIds: [],
      platformContextIds: ["ic1"],
      memoryStoreIds: [],
    },
    heartbeat: { ...defaultHeartbeat },
  }
}

export function getAgentProjectConfig(
  agentId: string,
  projectId: string,
  configs: AgentProjectConfig[] = agentProjectConfigs,
): AgentProjectConfig {
  return (
    configs.find((cfg) => cfg.agentId === agentId && cfg.projectId === projectId) ??
    createDefaultAgentProjectConfig(agentId, projectId)
  )
}

export function getAgentAccessGrant(
  grants: AgentAccessGrant[],
  agentId: string,
  projectId: string,
): AgentAccessGrant | undefined {
  return grants.find((grant) => grant.agentId === agentId && grant.projectId === projectId)
}

export function getOrgGuardrails(orgId: string) {
  return guardrails.filter((item) => !item.orgId || item.orgId === orgId)
}

export function getOrgApprovalPolicies(orgId: string) {
  return approvalPolicies.filter((item) => !item.orgId || item.orgId === orgId)
}

export function getOrgEgressAllowlists(orgId: string) {
  return egressAllowlists.filter((item) => !item.orgId || item.orgId === orgId)
}

export function getOrgMemoryStores(orgId: string) {
  return memoryStores.filter((item) => !item.orgId || item.orgId === orgId)
}

export function getInjectableContextsForProject(orgId: string, projectId: string) {
  return injectableContexts.filter(
    (ctx) =>
      ctx.scope === "platform" ||
      (ctx.scope === "org" && ctx.orgId === orgId) ||
      (ctx.scope === "project" && ctx.orgId === orgId && ctx.projectId === projectId),
  )
}
