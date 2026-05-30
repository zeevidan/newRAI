import type {
  ActivityItem,
  AgentLogEntry,
  Message,
  Task,
} from "@/data/mock"
import { getPlaybookForAgent, seededPick } from "@/lib/workflow/playbooks"
import { isDemoAgent, runDemoBeat } from "@/lib/workflow/demo-scripts"
import type {
  BeatResult,
  BeatWorld,
  PlaybookActionType,
  WorkflowProposal,
} from "@/lib/workflow/types"

function isoFromSim(simNow: number) {
  return new Date(simNow).toISOString()
}

function id(prefix: string, simNow: number) {
  return `${prefix}-${simNow}-${Math.floor(Math.random() * 10000)}`
}

function agentTasks(world: BeatWorld) {
  return world.tasks.filter(
    (task) =>
      task.projectId === world.projectId &&
      task.assigneeId === world.agent.id &&
      task.assigneeKind === "agent" &&
      task.status !== "done",
  )
}

function hasPendingProposals(world: BeatWorld) {
  return world.proposals.some(
    (proposal) =>
      proposal.agentId === world.agent.id &&
      proposal.projectId === world.projectId &&
      proposal.status === "pending",
  )
}

function pickActionForBeat(world: BeatWorld, beats: number): PlaybookActionType {
  const actions = getPlaybookForAgent(world.agent.id, world.config.goals)
  return actions[beats % actions.length]!
}

export function runBeat(world: BeatWorld, beats: number): BeatResult {
  const action = pickActionForBeat(world, beats)
  const autonomy = world.config.heartbeat.autonomy
  const maxActions = world.config.heartbeat.maxActionsPerBeat
  const intervalMs = world.config.heartbeat.intervalSec * 1000

  const result: BeatResult = {
    currentAction: describeAction(action, world),
    nextBeatAt: world.simNow + intervalMs,
    messages: [],
    tasks: [],
    taskUpdates: [],
    activity: [],
    logs: [],
    proposals: [],
  }

  if (!world.config.heartbeat.enabled) {
    result.currentAction = "Heartbeat disabled"
    return result
  }

  if (autonomy === "manual" && hasPendingProposals(world)) {
    result.currentAction = "Waiting for approval"
    result.logs.push({
      id: id("log", world.simNow),
      agentId: world.agent.id,
      level: "info",
      message: `Heartbeat beat #${beats + 1}: waiting for approval on pending proposal(s)`,
      timestamp: isoFromSim(world.simNow),
    })
    return result
  }

  if (isDemoAgent(world.agent.id)) {
    const outcome = runDemoBeat(world)
    if (outcome) {
      result.currentAction = outcome.currentAction
      result.messages = outcome.messages
      result.tasks = outcome.tasks
      result.taskUpdates = outcome.taskUpdates
      result.activity = outcome.activity
      result.proposals = outcome.proposals
      result.logs.push(...outcome.logs)
      result.logs.push({
        id: id("log", world.simNow),
        agentId: world.agent.id,
        level: "info",
        message: `Heartbeat beat #${beats + 1}: ${result.currentAction}`,
        timestamp: isoFromSim(world.simNow),
      })
      return result
    }
  }

  const apply = autonomy === "full" || autonomy === "suggest"
  const proposeOnly = autonomy === "manual"

  for (let i = 0; i < Math.max(1, maxActions); i++) {
    const currentAction = i === 0 ? action : pickActionForBeat(world, beats + i)
    const beatOutcome = executeAction(currentAction, world, beats + i, proposeOnly && i === 0)

    result.messages.push(...beatOutcome.messages)
    result.tasks.push(...beatOutcome.tasks)
    result.taskUpdates.push(...beatOutcome.taskUpdates)
    result.activity.push(...beatOutcome.activity)
    result.logs.push(...beatOutcome.logs)
    result.proposals.push(...beatOutcome.proposals)

    if (proposeOnly) break
    if (!apply) break
  }

  if (result.activity.length === 0 && apply) {
    result.activity.push({
      id: id("act", world.simNow),
      projectId: world.projectId,
      agentId: world.agent.id,
      actorId: world.agent.id,
      actorKind: "agent",
      action: result.currentAction.toLowerCase(),
      createdAt: isoFromSim(world.simNow),
    })
  }

  result.logs.push({
    id: id("log", world.simNow),
    level: "info",
    message: `Heartbeat beat #${beats + 1}: ${result.currentAction}`,
    timestamp: isoFromSim(world.simNow),
  })

  return result
}

function describeAction(action: PlaybookActionType, world: BeatWorld): string {
  switch (action) {
    case "progress_task":
      return "Advancing assigned task"
    case "complete_task":
      return "Completing assigned task"
    case "report_to_manager":
      return "Reporting status to manager"
    case "handoff_to_teammate":
      return "Handing off work to teammate"
    case "ask_person":
      return "Messaging project teammate"
    case "emit_finding":
      return world.config.goals[0] ?? "Processing project work"
    default:
      return "Working"
  }
}

function executeAction(
  action: PlaybookActionType,
  world: BeatWorld,
  beatSeed: number,
  proposeOnly: boolean,
): Omit<BeatResult, "currentAction" | "nextBeatAt"> {
  const empty = {
    messages: [] as Message[],
    tasks: [] as Task[],
    taskUpdates: [] as { taskId: string; patch: Partial<Task> }[],
    activity: [] as ActivityItem[],
    logs: [] as AgentLogEntry[],
    proposals: [] as WorkflowProposal[],
  }

  const iso = isoFromSim(world.simNow)

  switch (action) {
    case "progress_task": {
      const tasks = agentTasks(world)
      const inProgress = tasks.find((t) => t.status === "in_progress")
      const target = inProgress ?? tasks.find((t) => t.status === "todo")
      if (!target) {
        empty.activity.push(makeActivity(world, "no open tasks — scanning project goals", iso))
        return empty
      }
      if (target.status === "todo") {
        const patch = { status: "in_progress" as const, updatedAt: iso }
        if (proposeOnly) {
          empty.proposals.push(makeProposal(world, "task_update", `Start task: ${target.title}`, {
            taskId: target.id,
            patch,
          }))
          return empty
        }
        empty.taskUpdates.push({ taskId: target.id, patch })
        empty.activity.push(makeActivity(world, `started task "${target.title}"`, iso))
      } else {
        empty.activity.push(makeActivity(world, `continued work on "${target.title}"`, iso))
      }
      return empty
    }
    case "complete_task": {
      const tasks = agentTasks(world)
      const target = tasks.find((t) => t.status === "in_progress") ?? tasks[0]
      if (!target) return empty
      const patch = { status: "done" as const, updatedAt: iso }
      if (proposeOnly) {
        empty.proposals.push(
          makeProposal(world, "task_update", `Complete task: ${target.title}`, {
            taskId: target.id,
            patch,
          }),
        )
        return empty
      }
      empty.taskUpdates.push({ taskId: target.id, patch })
      empty.activity.push(makeActivity(world, `completed task "${target.title}"`, iso))
      return empty
    }
    case "report_to_manager": {
      const managerId = world.agent.managerId
      if (!managerId) return empty
      const content = seededPick(
        [
          `Status update: progressing on ${world.config.goals[0] ?? "project goals"}.`,
          "Completed a workflow beat — findings ready for review.",
          "Need guidance on priority for the next deliverable.",
        ],
        beatSeed,
      )
      const msg: Message = {
        id: id("msg", world.simNow),
        projectId: world.projectId,
        authorId: world.agent.id,
        authorKind: "agent",
        recipientId: managerId,
        recipientKind: world.agents.some((a) => a.id === managerId) ? "agent" : "user",
        content,
        createdAt: iso,
      }
      if (proposeOnly) {
        empty.proposals.push(makeProposal(world, "message", content, { message: msg }))
        return empty
      }
      empty.messages.push(msg)
      empty.activity.push(makeActivity(world, "sent status report to manager", iso))
      return empty
    }
    case "handoff_to_teammate": {
      const teammates = world.agents.filter(
        (a) =>
          a.id !== world.agent.id &&
          a.projectIds?.includes(world.projectId) &&
          a.managerId === world.agent.managerId,
      )
      const person = world.users.find((u) => u.projectIds?.includes(world.projectId))
      const teammate = teammates[0]
      if (!teammate && !person) return empty

      const assigneeId = teammate?.id ?? person!.id
      const assigneeKind = teammate ? "agent" : "user"
      const title = `Follow-up: ${world.config.goals[0] ?? "project item"}`
      const task: Task = {
        id: id("task", world.simNow),
        projectId: world.projectId,
        title,
        assigneeId,
        assigneeKind,
        creatorId: world.agent.id,
        creatorKind: "agent",
        status: "todo",
        createdAt: iso,
        updatedAt: iso,
      }
      if (proposeOnly) {
        empty.proposals.push(makeProposal(world, "task", `Assign task: ${title}`, { task }))
        return empty
      }
      empty.tasks.push(task)
      empty.activity.push(makeActivity(world, `assigned "${title}" to teammate`, iso))
      return empty
    }
    case "ask_person": {
      const people = world.users.filter((u) => u.projectIds?.includes(world.projectId))
      if (people.length === 0) return empty
      const target = seededPick(people, beatSeed)
      const content = seededPick(
        [
          "Can you confirm priorities for this sprint?",
          "Please review the latest output in workspace when you have a moment.",
          "Do you have updated inputs for the next report cycle?",
        ],
        beatSeed + 1,
      )
      const msg: Message = {
        id: id("msg", world.simNow),
        projectId: world.projectId,
        authorId: world.agent.id,
        authorKind: "agent",
        recipientId: target.id,
        recipientKind: "user",
        content,
        createdAt: iso,
      }
      if (proposeOnly) {
        empty.proposals.push(makeProposal(world, "message", content, { message: msg }))
        return empty
      }
      empty.messages.push(msg)
      empty.activity.push(makeActivity(world, `asked ${target.name} a question`, iso))
      return empty
    }
    case "emit_finding":
    default: {
      const finding = seededPick(
        world.config.goals.length > 0
          ? world.config.goals
          : ["processed project data", "updated working notes"],
        beatSeed,
      )
      empty.activity.push(makeActivity(world, finding.toLowerCase(), iso))
      return empty
    }
  }
}

function makeActivity(world: BeatWorld, action: string, createdAt: string): ActivityItem {
  return {
    id: id("act", world.simNow),
    projectId: world.projectId,
    agentId: world.agent.id,
    actorId: world.agent.id,
    actorKind: "agent",
    action,
    createdAt,
  }
}

function makeProposal(
  world: BeatWorld,
  kind: WorkflowProposal["kind"],
  summary: string,
  payload: Record<string, unknown>,
): WorkflowProposal {
  return {
    id: id("prop", world.simNow),
    projectId: world.projectId,
    agentId: world.agent.id,
    kind,
    summary,
    payload,
    status: "pending",
    createdAt: isoFromSim(world.simNow),
  }
}

export function getDueAgents(
  runtimes: { agentId: string; projectId: string; runState: string; nextBeatAt?: number }[],
  simNow: number,
): { agentId: string; projectId: string }[] {
  return runtimes
    .filter(
      (rt) => rt.runState === "running" && rt.nextBeatAt != null && rt.nextBeatAt <= simNow,
    )
    .map((rt) => ({ agentId: rt.agentId, projectId: rt.projectId }))
}
