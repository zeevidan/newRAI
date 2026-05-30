import { toast } from "sonner"
import type { Agent, Message, User } from "@/data/mock"
import { resolveMemberName } from "@/data/mock"
import type { WorkflowProposal } from "@/lib/workflow/types"

function truncate(text: string, max = 140) {
  const trimmed = text.trim()
  if (trimmed.length <= max) return trimmed
  return `${trimmed.slice(0, max - 1)}…`
}

function isSessionUserOnProject(
  sessionUserId: string,
  projectId: string,
  users: User[],
) {
  return users.some(
    (user) => user.id === sessionUserId && user.projectIds?.includes(projectId),
  )
}

function shouldNotifyApproval(
  sessionUserId: string,
  proposal: WorkflowProposal,
  agents: Agent[],
  users: User[],
) {
  if (proposal.status !== "pending") return false
  if (!isSessionUserOnProject(sessionUserId, proposal.projectId, users)) {
    return false
  }

  const agent = agents.find((item) => item.id === proposal.agentId)
  if (agent?.managerId) {
    return agent.managerId === sessionUserId
  }

  return true
}

export function notifyWorkflowBeat(input: {
  sessionUserId: string
  messages: Message[]
  proposals: WorkflowProposal[]
  agents: Agent[]
  users: User[]
}) {
  const { sessionUserId, messages, proposals, agents, users } = input

  for (const message of messages) {
    if (
      message.authorKind !== "agent" ||
      message.recipientKind !== "user" ||
      message.recipientId !== sessionUserId
    ) {
      continue
    }

    const agentName = resolveMemberName(message.authorId, users, agents)
    toast.message(`Message from ${agentName}`, {
      description: truncate(message.content),
    })
  }

  for (const proposal of proposals) {
    if (!shouldNotifyApproval(sessionUserId, proposal, agents, users)) {
      continue
    }

    const agentName = resolveMemberName(proposal.agentId, users, agents)
    toast("Approval requested", {
      description: `${agentName}: ${proposal.summary}`,
    })
  }
}
