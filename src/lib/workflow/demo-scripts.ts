import type {
  ActivityItem,
  AgentLogEntry,
  Message,
  ProjectFileNode,
  Task,
} from "@/data/mock"
import type { BeatWorld, WorkflowProposal } from "@/lib/workflow/types"

/**
 * Scripted, state-driven workflow for the "Voice of the Customer Report" demo
 * (proj-7). Instead of the generic playbook, these agents follow a realistic
 * pipeline:
 *
 *   1. Salesforce Insights Agent (a21)  ─┐
 *   2. Support Signals Agent     (a22)  ─┤→ report to editor
 *   3. Theme Synthesizer         (a23)   │  (waits for 1 & 2, then synthesizes)
 *   4. Customer Story Editor     (a20)   │  (waits for 3, drafts, asks the human
 *                                        ┘   manager to approve publishing)
 *
 * Progress is derived from durable state (task status + sent messages) plus a
 * few activity markers for intra-phase sub-steps, so a heartbeat that has
 * nothing to do simply idles instead of repeating work.
 */

const DEMO_AGENT_IDS = ["a20", "a21", "a22", "a23"] as const

export function isDemoAgent(agentId: string): boolean {
  return (DEMO_AGENT_IDS as readonly string[]).includes(agentId)
}

export interface DemoBeatOutcome {
  currentAction: string
  messages: Message[]
  tasks: Task[]
  taskUpdates: { taskId: string; patch: Partial<Task> }[]
  activity: ActivityItem[]
  logs: AgentLogEntry[]
  proposals: WorkflowProposal[]
}

let demoSeq = 0
function uid(prefix: string, simNow: number) {
  demoSeq += 1
  return `${prefix}-${simNow}-${demoSeq}`
}

function isoFromSim(simNow: number) {
  return new Date(simNow).toISOString()
}

function taskByAssignee(world: BeatWorld, agentId: string): Task | undefined {
  return world.tasks.find(
    (task) =>
      task.projectId === world.projectId &&
      task.assigneeId === agentId &&
      task.assigneeKind === "agent",
  )
}

function didAct(world: BeatWorld, marker: string): boolean {
  return world.activity.some(
    (item) =>
      item.projectId === world.projectId &&
      item.agentId === world.agent.id &&
      item.action.includes(marker),
  )
}

class BeatBuilder {
  private world: BeatWorld
  currentAction = "Working"
  messages: Message[] = []
  tasks: Task[] = []
  taskUpdates: { taskId: string; patch: Partial<Task> }[] = []
  activity: ActivityItem[] = []
  logs: AgentLogEntry[] = []
  proposals: WorkflowProposal[] = []

  constructor(world: BeatWorld) {
    this.world = world
  }

  status(action: string) {
    this.currentAction = action
    return this
  }

  act(action: string) {
    this.activity.push({
      id: uid("act", this.world.simNow),
      projectId: this.world.projectId,
      agentId: this.world.agent.id,
      actorId: this.world.agent.id,
      actorKind: "agent",
      action,
      createdAt: isoFromSim(this.world.simNow),
    })
    return this
  }

  log(level: AgentLogEntry["level"], message: string) {
    this.logs.push({
      id: uid("log", this.world.simNow),
      agentId: this.world.agent.id,
      level,
      message,
      timestamp: isoFromSim(this.world.simNow),
    })
    return this
  }

  message(recipientId: string, recipientKind: "user" | "agent", content: string) {
    this.messages.push({
      id: uid("msg", this.world.simNow),
      projectId: this.world.projectId,
      authorId: this.world.agent.id,
      authorKind: "agent",
      recipientId,
      recipientKind,
      content,
      createdAt: isoFromSim(this.world.simNow),
    })
    return this
  }

  startTask(taskId: string) {
    this.taskUpdates.push({
      taskId,
      patch: { status: "in_progress", updatedAt: isoFromSim(this.world.simNow) },
    })
    return this
  }

  completeTask(taskId: string) {
    this.taskUpdates.push({
      taskId,
      patch: { status: "done", updatedAt: isoFromSim(this.world.simNow) },
    })
    return this
  }

  proposeComplete(taskId: string, summary: string) {
    this.proposals.push({
      id: uid("prop", this.world.simNow),
      projectId: this.world.projectId,
      agentId: this.world.agent.id,
      kind: "task_update",
      summary,
      payload: {
        taskId,
        patch: { status: "done", updatedAt: isoFromSim(this.world.simNow) },
      },
      status: "pending",
      createdAt: isoFromSim(this.world.simNow),
    })
    return this
  }

  build(): DemoBeatOutcome {
    return {
      currentAction: this.currentAction,
      messages: this.messages,
      tasks: this.tasks,
      taskUpdates: this.taskUpdates,
      activity: this.activity,
      logs: this.logs,
      proposals: this.proposals,
    }
  }
}

const EDITOR_ID = "a20"
const MANAGER_USER_ID = "u20"

function salesforceBeat(world: BeatWorld): DemoBeatOutcome {
  const b = new BeatBuilder(world)
  const task = taskByAssignee(world, "a21")
  if (!task) return b.status("No assigned task").build()

  if (task.status === "todo") {
    return b
      .status("Connecting to Salesforce")
      .startTask(task.id)
      .act("connected to Salesforce via vault-backed credentials")
      .log("info", "Salesforce connection established (credentials from vault v4)")
      .build()
  }

  if (task.status === "in_progress") {
    if (!didAct(world, "pulled 1,284 feedback")) {
      return b
        .status("Pulling customer feedback")
        .act("pulled 1,284 feedback & case records from Salesforce")
        .build()
    }
    if (!didAct(world, "masked deal sizes")) {
      return b
        .status("Masking deal sizes")
        .act("masked deal sizes into ARR bands for 312 accounts")
        .log("debug", "applied PII & deal-size redaction (tool-pii-redaction)")
        .build()
    }
    return b
      .status("Handing off to synthesis")
      .completeTask(task.id)
      .message(
        EDITOR_ID,
        "agent",
        "Salesforce pull complete — 1,284 records across 312 accounts, deal sizes masked to ARR bands. Ready for synthesis.",
      )
      .act("completed Salesforce extraction & masking")
      .build()
  }

  // done → idle
  if (!didAct(world, "standing by for new Salesforce")) {
    return b
      .status("Monitoring Salesforce")
      .act("standing by for new Salesforce feedback")
      .build()
  }
  return b.status("Monitoring Salesforce").build()
}

function supportSignalsBeat(world: BeatWorld): DemoBeatOutcome {
  const b = new BeatBuilder(world)
  const task = taskByAssignee(world, "a22")
  if (!task) return b.status("No assigned task").build()

  if (task.status === "todo") {
    return b
      .status("Querying ServiceNow")
      .startTask(task.id)
      .act("queried ServiceNow — 3,902 tickets in the 90-day window")
      .log("info", "ServiceNow query returned 3,902 incidents")
      .build()
  }

  if (task.status === "in_progress") {
    if (!didAct(world, "fetched 47 Gong")) {
      return b
        .status("Fetching call transcripts")
        .act("fetched 47 Gong call transcripts and 1,000+ tagged moments")
        .build()
    }
    if (!didAct(world, "tagged recurring pain points")) {
      return b
        .status("Tagging pain points")
        .act("tagged recurring pain points across tickets and calls")
        .log("warn", "Onboarding/SSO is 31% of detractor volume")
        .build()
    }
    if (!didAct(world, "masked customer identities")) {
      return b
        .status("Masking customer identities")
        .act("masked customer identities via vault before writing to workspace")
        .build()
    }
    return b
      .status("Reporting to editor")
      .completeTask(task.id)
      .message(
        EDITOR_ID,
        "agent",
        "Support signals ready — 3,902 tickets + 47 transcripts tagged. Top driver: onboarding/SSO friction.",
      )
      .act("completed support signal extraction")
      .build()
  }

  if (!didAct(world, "standing by for new tickets")) {
    return b
      .status("Monitoring ServiceNow")
      .act("standing by for new tickets and calls")
      .build()
  }
  return b.status("Monitoring ServiceNow").build()
}

function themeSynthesizerBeat(world: BeatWorld): DemoBeatOutcome {
  const b = new BeatBuilder(world)
  const task = taskByAssignee(world, "a23")
  if (!task) return b.status("No assigned task").build()

  const salesforceTask = taskByAssignee(world, "a21")
  const supportTask = taskByAssignee(world, "a22")
  const sourcesReady =
    salesforceTask?.status === "done" && supportTask?.status === "done"

  if (!sourcesReady) {
    if (!didAct(world, "waiting on source extractions")) {
      return b
        .status("Waiting for source data")
        .act("waiting on Salesforce & Support extractions before synthesis")
        .build()
    }
    return b.status("Waiting for source data").build()
  }

  if (task.status === "todo") {
    return b
      .status("Merging sources")
      .startTask(task.id)
      .act("merged Salesforce, ServiceNow & Gong signals (5,186 total)")
      .log("info", "merged 5,186 signals across three sources")
      .build()
  }

  if (task.status === "in_progress") {
    if (!didAct(world, "de-duplicated")) {
      return b
        .status("De-duplicating signals")
        .act("de-duplicated 84 cross-source signals")
        .build()
    }
    if (!didAct(world, "clustered signals into 6")) {
      return b
        .status("Clustering themes")
        .act("clustered signals into 6 ARR-weighted themes")
        .build()
    }
    if (!didAct(world, "scored sentiment")) {
      return b
        .status("Scoring sentiment")
        .act("scored sentiment by segment and region (+38 NPS)")
        .build()
    }
    return b
      .status("Handing off to editor")
      .completeTask(task.id)
      .message(
        EDITOR_ID,
        "agent",
        "Synthesis done — 6 themes; onboarding friction & EMEA reliability lead. Overall sentiment +0.41.",
      )
      .act("completed theme synthesis")
      .build()
  }

  if (!didAct(world, "standing by for re-synthesis")) {
    return b
      .status("Idle")
      .act("standing by for re-synthesis if new signals arrive")
      .build()
  }
  return b.status("Idle").build()
}

function editorBeat(world: BeatWorld): DemoBeatOutcome {
  const b = new BeatBuilder(world)
  const task = taskByAssignee(world, "a20")
  if (!task) return b.status("No assigned task").build()

  const synthesisTask = taskByAssignee(world, "a23")
  const synthesisReady = synthesisTask?.status === "done"

  // Wait for synthesized themes before drafting.
  if (!synthesisReady) {
    if (!didAct(world, "waiting on theme synthesis")) {
      return b
        .status("Waiting for synthesized themes")
        .act("waiting on theme synthesis before drafting the report")
        .build()
    }
    return b.status("Waiting for synthesized themes").build()
  }

  // Publish task approved by the human → publish, then notify the manager.
  if (task.status === "done") {
    if (!didAct(world, "published voice-of-the-customer-q2-2026.md")) {
      return b
        .status("Publishing report")
        .act("published voice-of-the-customer-q2-2026.md to report/")
        .log("info", "published report to report/ folder")
        .message(
          MANAGER_USER_ID,
          "user",
          "Report published to report/voice-of-the-customer-q2-2026.md — masked and ready for the QBR.",
        )
        .build()
    }
    return b.status("Report published — monitoring for feedback").build()
  }

  // Draft autonomously, then gate publishing on human approval.
  if (task.status === "todo") {
    return b
      .status("Drafting report")
      .startTask(task.id)
      .act("drafted the Voice of the Customer report from synthesized themes")
      .log("info", "assembled report draft (2,310 words)")
      .build()
  }

  // in_progress
  if (!didAct(world, "compiled masked quotes")) {
    return b
      .status("Compiling evidence")
      .act("compiled masked quotes and evidence counts into the narrative")
      .build()
  }

  // Request human approval to publish (raised once; the engine pauses the
  // heartbeat while a proposal is pending, so this won't spam the queue).
  return b
    .status("Requesting publish approval")
    .proposeComplete(
      task.id,
      "Publish Voice of the Customer report to report/ folder",
    )
    .act("requested manager approval to publish the report")
    .build()
}

export function runDemoBeat(world: BeatWorld): DemoBeatOutcome | null {
  switch (world.agent.id) {
    case "a21":
      return salesforceBeat(world)
    case "a22":
      return supportSignalsBeat(world)
    case "a23":
      return themeSynthesizerBeat(world)
    case "a20":
      return editorBeat(world)
    default:
      return null
  }
}

// ── Staged workspace files (proj-7) ─────────────────────────────────────────
// Folders live in mock data; files appear here as the scripted pipeline writes
// them. Activity markers in the beats above drive unlock timing.

export const DEMO_PROJECT_ID = "proj-7"

export const DEMO_WORKSPACE_FILES: ProjectFileNode[] = [
  {
    id: "f110",
    projectId: DEMO_PROJECT_ID,
    name: "sf-customer-feedback-q2.csv",
    kind: "file",
    parentId: "f101",
    size: "1.2 MB",
    updatedAt: "2026-05-19T09:10:00Z",
  },
  {
    id: "f111",
    projectId: DEMO_PROJECT_ID,
    name: "sf-deal-context-masked.csv",
    kind: "file",
    parentId: "f101",
    size: "240 KB",
    updatedAt: "2026-05-19T09:12:00Z",
  },
  {
    id: "f112",
    projectId: DEMO_PROJECT_ID,
    name: "snow-tickets-90d.csv",
    kind: "file",
    parentId: "f102",
    size: "48 MB",
    updatedAt: "2026-05-19T08:50:00Z",
  },
  {
    id: "f113",
    projectId: DEMO_PROJECT_ID,
    name: "gong-call-highlights.md",
    kind: "file",
    parentId: "f103",
    size: "22 KB",
    updatedAt: "2026-05-19T08:45:00Z",
    contentPath: "proj-7/gong-call-highlights.md",
  },
  {
    id: "f114",
    projectId: DEMO_PROJECT_ID,
    name: "themes-clustered.md",
    kind: "file",
    parentId: "f104",
    size: "16 KB",
    updatedAt: "2026-05-19T09:22:00Z",
    contentPath: "proj-7/themes-clustered.md",
  },
  {
    id: "f115",
    projectId: DEMO_PROJECT_ID,
    name: "sentiment-by-segment.md",
    kind: "file",
    parentId: "f104",
    size: "11 KB",
    updatedAt: "2026-05-19T09:24:00Z",
    contentPath: "proj-7/sentiment-by-segment.md",
  },
  {
    id: "f116",
    projectId: DEMO_PROJECT_ID,
    name: "voice-of-the-customer-q2-2026.md",
    kind: "file",
    parentId: "f105",
    size: "28 KB",
    updatedAt: "2026-05-19T09:30:00Z",
    contentPath: "proj-7/voice-of-the-customer-q2-2026.md",
  },
  {
    id: "f117",
    projectId: DEMO_PROJECT_ID,
    name: "voc-report-template.md",
    kind: "file",
    parentId: "f106",
    size: "6 KB",
    updatedAt: "2026-05-17T10:00:00Z",
    contentPath: "proj-7/voc-report-template.md",
  },
]

/** Activity substrings → file IDs to reveal when that step completes. */
const DEMO_ACTIVITY_FILE_UNLOCKS: [string, string[]][] = [
  ["masked deal sizes into ARR bands", ["f110", "f111"]],
  ["masked customer identities via vault", ["f112", "f113"]],
  ["scored sentiment by segment", ["f114", "f115"]],
  ["drafted the Voice of the Customer report", ["f117"]],
  ["published voice-of-the-customer-q2-2026.md", ["f116"]],
]

const unlockedDemoFileIds = new Set<string>()
const unlockedDemoFileAt = new Map<string, string>()

export function resetDemoWorkspace() {
  unlockedDemoFileIds.clear()
  unlockedDemoFileAt.clear()
}

/** Call after each demo beat; returns true when new files were revealed. */
export function syncDemoWorkspaceFromBeat(
  projectId: string,
  activity: ActivityItem[],
): boolean {
  if (projectId !== DEMO_PROJECT_ID || activity.length === 0) return false

  let changed = false
  for (const item of activity) {
    for (const [marker, fileIds] of DEMO_ACTIVITY_FILE_UNLOCKS) {
      if (!item.action.includes(marker)) continue
      for (const fileId of fileIds) {
        if (unlockedDemoFileIds.has(fileId)) continue
        unlockedDemoFileIds.add(fileId)
        unlockedDemoFileAt.set(fileId, item.createdAt)
        changed = true
      }
    }
  }
  return changed
}

/** Merge folder tree from mock with demo files unlocked so far. */
export function applyDemoWorkspaceFilter(
  projectId: string,
  files: ProjectFileNode[],
): ProjectFileNode[] {
  if (projectId !== DEMO_PROJECT_ID) return files

  const unlocked = DEMO_WORKSPACE_FILES.filter((file) =>
    unlockedDemoFileIds.has(file.id),
  ).map((file) => ({
    ...file,
    updatedAt: unlockedDemoFileAt.get(file.id) ?? file.updatedAt,
  }))

  return [...files, ...unlocked]
}
