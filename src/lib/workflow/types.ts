import type {
  ActivityItem,
  Agent,
  AgentLogEntry,
  MemberKind,
  Message,
  OrgChartMemberKind,
  Task,
  User,
} from "@/data/mock"
import type { AgentProjectConfig } from "@/data/agent-config-mock"

export type RunState = "stopped" | "running" | "paused"

export type AutonomyLevel = "manual" | "suggest" | "full"

export type PlaybookActionType =
  | "progress_task"
  | "complete_task"
  | "report_to_manager"
  | "handoff_to_teammate"
  | "ask_person"
  | "emit_finding"

export interface AgentRuntime {
  agentId: string
  projectId: string
  runState: RunState
  currentAction?: string
  lastBeatAt?: number
  nextBeatAt?: number
  beats: number
}

export interface ProjectRuntime {
  projectId: string
  runState: RunState
}

export interface WorkflowClock {
  simNow: number
  speed: number
  ticking: boolean
}

export interface WorkflowProposal {
  id: string
  projectId: string
  agentId: string
  kind: "message" | "task" | "task_update"
  summary: string
  payload: Record<string, unknown>
  status: "pending" | "approved" | "rejected"
  createdAt: string
}

export interface BeatWorld {
  simNow: number
  agent: Agent
  projectId: string
  config: AgentProjectConfig
  users: User[]
  agents: Agent[]
  tasks: Task[]
  messages: Message[]
  proposals: WorkflowProposal[]
  activity: ActivityItem[]
}

export interface BeatResult {
  currentAction: string
  nextBeatAt: number
  messages: Message[]
  tasks: Task[]
  taskUpdates: { taskId: string; patch: Partial<Task> }[]
  activity: ActivityItem[]
  logs: AgentLogEntry[]
  proposals: WorkflowProposal[]
}

export function runtimeKey(agentId: string, projectId: string) {
  return `${agentId}:${projectId}`
}

export function memberKindFromId(id: string, _users: User[], agents: Agent[]): OrgChartMemberKind {
  if (agents.some((agent) => agent.id === id)) return "agent"
  return "user"
}

export const WORKFLOW_LIMITS = {
  maxActivityPerScope: 200,
  maxLogsPerAgent: 200,
  realTickMs: 1000,
  interactionPulseMs: 2500,
} as const

export type InteractionPulseKind = "heartbeat" | "messaged" | "assigned_to"

export interface GraphInteractionPulse {
  id: string
  projectId: string
  kind: InteractionPulseKind
  sourceMemberId: string
  sourceKind: MemberKind
  targetMemberId?: string
  targetKind?: MemberKind
  label?: string
  expiresAt: number
}
