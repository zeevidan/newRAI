import type { Message, Task, MemberKind } from "@/data/mock"
import type { GraphEdge } from "@/lib/project-graph/types"
import { graphNodeId } from "@/lib/project-graph/types"
import {
  WORKFLOW_LIMITS,
  type GraphInteractionPulse,
  type InteractionPulseKind,
} from "@/lib/workflow/types"

type PulseInput = Omit<GraphInteractionPulse, "id" | "expiresAt">

function appendPulse(pulses: GraphInteractionPulse[], input: PulseInput) {
  const pulse: GraphInteractionPulse = {
    ...input,
    id: `pulse-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    expiresAt: Date.now() + WORKFLOW_LIMITS.interactionPulseMs,
  }
  return [...pulses, pulse]
}

export function pruneInteractionPulses(pulses: GraphInteractionPulse[]) {
  const now = Date.now()
  return pulses.filter((pulse) => pulse.expiresAt > now)
}

export function appendHeartbeatPulse(
  pulses: GraphInteractionPulse[],
  projectId: string,
  agentId: string,
) {
  return appendPulse(pulses, {
    projectId,
    kind: "heartbeat",
    sourceMemberId: agentId,
    sourceKind: "agent",
  })
}

export function appendMessagePulse(
  pulses: GraphInteractionPulse[],
  message: Pick<
    Message,
    "projectId" | "authorId" | "authorKind" | "recipientId" | "recipientKind"
  >,
) {
  if (!message.recipientId || !message.recipientKind) return pulses
  return appendPulse(pulses, {
    projectId: message.projectId,
    kind: "messaged",
    sourceMemberId: message.authorId,
    sourceKind: message.authorKind,
    targetMemberId: message.recipientId,
    targetKind: message.recipientKind,
  })
}

export function appendTaskPulse(
  pulses: GraphInteractionPulse[],
  task: Pick<
    Task,
    | "projectId"
    | "creatorId"
    | "creatorKind"
    | "assigneeId"
    | "assigneeKind"
    | "title"
  >,
) {
  if (!task.assigneeId || !task.assigneeKind) return pulses
  return appendPulse(pulses, {
    projectId: task.projectId,
    kind: "assigned_to",
    sourceMemberId: task.creatorId,
    sourceKind: task.creatorKind,
    targetMemberId: task.assigneeId,
    targetKind: task.assigneeKind,
    label: task.title,
  })
}

export function appendBeatInteractionPulses(
  pulses: GraphInteractionPulse[],
  projectId: string,
  agentId: string,
  beatResult: { messages: Message[]; tasks: Task[] },
) {
  let next = appendHeartbeatPulse(pulses, projectId, agentId)
  for (const message of beatResult.messages) {
    next = appendMessagePulse(next, message)
  }
  for (const task of beatResult.tasks) {
    next = appendTaskPulse(next, task)
  }
  return next
}

export function isTeamInteractionKind(kind: InteractionPulseKind) {
  return kind === "messaged" || kind === "assigned_to"
}

function memberToNodeId(kind: MemberKind, memberId: string) {
  return graphNodeId(kind === "user" ? "person" : "agent", memberId)
}

export function pulsesToGraphEdges(
  pulses: GraphInteractionPulse[],
  nodeIds: Set<string>,
): GraphEdge[] {
  const edges: GraphEdge[] = []

  for (const pulse of pulses) {
    if (!isTeamInteractionKind(pulse.kind)) continue
    if (!pulse.targetMemberId || !pulse.targetKind) continue

    const source = memberToNodeId(pulse.sourceKind, pulse.sourceMemberId)
    const target = memberToNodeId(pulse.targetKind, pulse.targetMemberId)
    if (!nodeIds.has(source) || !nodeIds.has(target)) continue

    edges.push({
      id: pulse.id,
      kind: pulse.kind,
      source,
      target,
      label: pulse.label,
    })
  }

  return edges
}

export function getWorkingNodeIds(pulses: GraphInteractionPulse[]) {
  const ids = new Set<string>()
  for (const pulse of pulses) {
    if (pulse.kind === "heartbeat" && pulse.sourceKind === "agent") {
      ids.add(graphNodeId("agent", pulse.sourceMemberId))
    }
  }
  return ids
}
