import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react"
import { useApp } from "@/context/app-context"
import { getAgentProjectConfig } from "@/data/agent-config-mock"
import type {
  ActivityItem,
  Agent,
  AgentLogEntry,
  MemberKind,
  Message,
  Task,
} from "@/data/mock"
import {
  activityForAgent,
  activityForProject,
  initialActivity,
  initialAgentLogs,
  initialMessages,
  initialTasks,
  logsForAgent,
  messagesForProject,
  tasksForProject,
} from "@/data/workflow-seed"
import { getDueAgents, runBeat } from "@/lib/workflow/engine"
import {
  DEMO_PROJECT_ID,
  resetDemoWorkspace,
  syncDemoWorkspaceFromBeat,
} from "@/lib/workflow/demo-scripts"
import {
  appendBeatInteractionPulses,
  appendMessagePulse,
  appendTaskPulse,
  pruneInteractionPulses,
} from "@/lib/workflow/interaction-pulses"
import {
  WORKFLOW_LIMITS,
  runtimeKey,
  type AgentRuntime,
  type GraphInteractionPulse,
  type ProjectRuntime,
  type RunState,
  type WorkflowClock,
  type WorkflowProposal,
} from "@/lib/workflow/types"

function capActivity(items: ActivityItem[]) {
  return items.slice(-WORKFLOW_LIMITS.maxActivityPerScope)
}

function capLogs(items: AgentLogEntry[]) {
  return items.slice(-WORKFLOW_LIMITS.maxLogsPerAgent)
}

function buildInitialRuntimes(agents: Agent[]): AgentRuntime[] {
  const runtimes: AgentRuntime[] = []
  for (const agent of agents) {
    for (const projectId of agent.projectIds ?? []) {
      runtimes.push({
        agentId: agent.id,
        projectId,
        runState: "stopped",
        beats: 0,
      })
    }
  }
  return runtimes
}

function buildInitialProjectRuntimes(projects: { id: string }[]): ProjectRuntime[] {
  return projects.map((project) => ({ projectId: project.id, runState: "stopped" }))
}

interface WorkflowContextValue {
  clock: WorkflowClock
  tasks: Task[]
  messages: Message[]
  activity: ActivityItem[]
  logs: AgentLogEntry[]
  proposals: WorkflowProposal[]
  interactionPulses: GraphInteractionPulse[]
  agentRuntimes: AgentRuntime[]
  projectRuntimes: ProjectRuntime[]
  getProjectTasks: (projectId: string) => Task[]
  getProjectMessages: (projectId: string) => Message[]
  getProjectActivity: (projectId: string) => ActivityItem[]
  getAgentActivityItems: (agentId: string) => ActivityItem[]
  getAgentLogItems: (agentId: string) => AgentLogEntry[]
  getAgentRuntime: (agentId: string, projectId: string) => AgentRuntime | undefined
  getProjectRuntime: (projectId: string) => ProjectRuntime | undefined
  getProjectInteractionPulses: (projectId: string) => GraphInteractionPulse[]
  runningAgentCount: (projectId: string) => number
  pendingProposalCount: (projectId: string) => number
  /** Bumps when the VoC demo reveals workspace files — use as a useMemo dep. */
  demoWorkspaceRevision: number
  startAgent: (agentId: string, projectId: string) => void
  pauseAgent: (agentId: string, projectId: string) => void
  stopAgent: (agentId: string, projectId: string) => void
  startProject: (projectId: string) => void
  pauseProject: (projectId: string) => void
  stopProject: (projectId: string) => void
  nudgeAgent: (agentId: string, projectId: string) => void
  sendMessage: (input: {
    projectId: string
    authorId: string
    authorKind: MemberKind
    content: string
    recipientId?: string
    recipientKind?: MemberKind
    threadId?: string
  }) => void
  createTask: (input: {
    projectId: string
    title: string
    description?: string
    assigneeId?: string
    assigneeKind?: MemberKind
    creatorId: string
    creatorKind: MemberKind
    dueAt?: string
  }) => void
  updateTaskStatus: (taskId: string, status: Task["status"]) => void
  assignTask: (taskId: string, assigneeId: string, assigneeKind: MemberKind) => void
  approveProposal: (proposalId: string) => void
  rejectProposal: (proposalId: string) => void
  setSpeed: (speed: number) => void
  pauseClock: () => void
  resumeClock: () => void
}

const WorkflowContext = createContext<WorkflowContextValue | null>(null)

export function WorkflowProvider({ children }: { children: ReactNode }) {
  const { agents, users, agentProjectConfigs, orgProjects } = useApp()

  const [clock, setClock] = useState<WorkflowClock>({
    simNow: Date.now(),
    speed: 5,
    ticking: true,
  })
  const [tasks, setTasks] = useState<Task[]>(() => [...initialTasks])
  const [messages, setMessages] = useState<Message[]>(() => [...initialMessages])
  const [activity, setActivity] = useState<ActivityItem[]>(() => [...initialActivity])
  const [logs, setLogs] = useState<AgentLogEntry[]>(() => [...initialAgentLogs])
  const [proposals, setProposals] = useState<WorkflowProposal[]>([])
  const [interactionPulses, setInteractionPulses] = useState<GraphInteractionPulse[]>([])
  const [demoWorkspaceRevision, setDemoWorkspaceRevision] = useState(0)
  const [agentRuntimes, setAgentRuntimes] = useState<AgentRuntime[]>(() =>
    buildInitialRuntimes(agents),
  )
  const [projectRuntimes, setProjectRuntimes] = useState<ProjectRuntime[]>(() =>
    buildInitialProjectRuntimes(orgProjects),
  )

  const stateRef = useRef({
    clock,
    tasks,
    messages,
    activity,
    logs,
    proposals,
    agentRuntimes,
    agents,
    users,
    agentProjectConfigs,
  })
  stateRef.current = {
    clock,
    tasks,
    messages,
    activity,
    logs,
    proposals,
    agentRuntimes,
    agents,
    users,
    agentProjectConfigs,
  }

  useEffect(() => {
    setAgentRuntimes((prev) => {
      const existing = new Set(prev.map((rt) => runtimeKey(rt.agentId, rt.projectId)))
      const next = [...prev]
      for (const agent of agents) {
        for (const projectId of agent.projectIds ?? []) {
          const key = runtimeKey(agent.id, projectId)
          if (!existing.has(key)) {
            next.push({ agentId: agent.id, projectId, runState: "stopped", beats: 0 })
          }
        }
      }
      return next
    })
  }, [agents])

  useEffect(() => {
    const interval = window.setInterval(() => {
      setInteractionPulses((prev) => {
        const next = pruneInteractionPulses(prev)
        return next.length === prev.length ? prev : next
      })
    }, 200)
    return () => window.clearInterval(interval)
  }, [])

  const applyBeatResults = useCallback(
    (
      agentId: string,
      projectId: string,
      beatResult: ReturnType<typeof runBeat>,
      beats: number,
    ) => {
      setTasks((prev) => {
        let next = [...prev, ...beatResult.tasks]
        for (const update of beatResult.taskUpdates) {
          next = next.map((task) =>
            task.id === update.taskId ? { ...task, ...update.patch } : task,
          )
        }
        return next
      })
      if (beatResult.messages.length > 0) {
        setMessages((prev) => [...prev, ...beatResult.messages])
      }
      if (beatResult.activity.length > 0) {
        setActivity((prev) => capActivity([...prev, ...beatResult.activity]))
      }
      if (beatResult.logs.length > 0) {
        setLogs((prev) =>
          capLogs([
            ...prev,
            ...beatResult.logs.map((log) => ({ ...log, agentId: log.agentId ?? agentId })),
          ]),
        )
      }
      if (beatResult.proposals.length > 0) {
        setProposals((prev) => [...prev, ...beatResult.proposals])
      }
      setInteractionPulses((prev) =>
        appendBeatInteractionPulses(prev, projectId, agentId, beatResult),
      )
      setAgentRuntimes((prev) =>
        prev.map((rt) =>
          rt.agentId === agentId && rt.projectId === projectId
            ? {
                ...rt,
                beats: beats + 1,
                lastBeatAt: stateRef.current.clock.simNow,
                nextBeatAt: beatResult.nextBeatAt,
                currentAction: beatResult.currentAction,
              }
            : rt,
        ),
      )
      if (syncDemoWorkspaceFromBeat(projectId, beatResult.activity)) {
        setDemoWorkspaceRevision((revision) => revision + 1)
      }
    },
    [],
  )

  useEffect(() => {
    if (!clock.ticking) return

    const interval = window.setInterval(() => {
      const snapshot = stateRef.current
      const delta = WORKFLOW_LIMITS.realTickMs * snapshot.clock.speed
      const simNow = snapshot.clock.simNow + delta

      setClock((prev) => ({ ...prev, simNow }))

      const due = getDueAgents(snapshot.agentRuntimes, simNow)
      for (const { agentId, projectId } of due) {
        const agent = snapshot.agents.find((item) => item.id === agentId)
        if (!agent || agent.status === "archived") continue

        const runtime = snapshot.agentRuntimes.find(
          (rt) => rt.agentId === agentId && rt.projectId === projectId,
        )
        if (!runtime || runtime.runState !== "running") continue

        const config = getAgentProjectConfig(agentId, projectId, snapshot.agentProjectConfigs)
        const beatResult = runBeat(
          {
            simNow,
            agent,
            projectId,
            config,
            users: snapshot.users,
            agents: snapshot.agents,
            tasks: snapshot.tasks,
            messages: snapshot.messages,
            proposals: snapshot.proposals,
            activity: snapshot.activity,
          },
          runtime.beats,
        )
        applyBeatResults(agentId, projectId, beatResult, runtime.beats)
      }
    }, WORKFLOW_LIMITS.realTickMs)

    return () => window.clearInterval(interval)
  }, [clock.ticking, applyBeatResults])

  const updateAgentRunState = useCallback(
    (agentId: string, projectId: string, runState: RunState, scheduleNext = false) => {
      setAgentRuntimes((prev) =>
        prev.map((rt) => {
          if (rt.agentId !== agentId || rt.projectId !== projectId) return rt
          const config = getAgentProjectConfig(agentId, projectId, agentProjectConfigs)
          return {
            ...rt,
            runState,
            currentAction: runState === "stopped" ? undefined : rt.currentAction,
            nextBeatAt:
              runState === "running" && scheduleNext
                ? stateRef.current.clock.simNow + config.heartbeat.intervalSec * 1000
                : runState === "running"
                  ? rt.nextBeatAt
                  : undefined,
          }
        }),
      )
    },
    [agentProjectConfigs],
  )

  const syncProjectRunState = useCallback((projectId: string) => {
    setProjectRuntimes((prev) =>
      prev.map((pr) => {
        if (pr.projectId !== projectId) return pr
        const projectAgents = stateRef.current.agentRuntimes.filter(
          (rt) => rt.projectId === projectId,
        )
        if (projectAgents.every((rt) => rt.runState === "stopped")) {
          return { ...pr, runState: "stopped" }
        }
        if (projectAgents.some((rt) => rt.runState === "running")) {
          return { ...pr, runState: "running" }
        }
        return { ...pr, runState: "paused" }
      }),
    )
  }, [])

  const startAgent = useCallback(
    (agentId: string, projectId: string) => {
      const agent = agents.find((item) => item.id === agentId)
      if (!agent || agent.status === "archived") return
      updateAgentRunState(agentId, projectId, "running", true)
      syncProjectRunState(projectId)
    },
    [agents, syncProjectRunState, updateAgentRunState],
  )

  const pauseAgent = useCallback(
    (agentId: string, projectId: string) => {
      updateAgentRunState(agentId, projectId, "paused")
      syncProjectRunState(projectId)
    },
    [syncProjectRunState, updateAgentRunState],
  )

  const stopAgent = useCallback(
    (agentId: string, projectId: string) => {
      updateAgentRunState(agentId, projectId, "stopped")
      syncProjectRunState(projectId)
    },
    [syncProjectRunState, updateAgentRunState],
  )

  const startProject = useCallback(
    (projectId: string) => {
      if (projectId === DEMO_PROJECT_ID) {
        resetDemoWorkspace()
        setDemoWorkspaceRevision((revision) => revision + 1)
      }
      const projectAgents = agents.filter((agent) => agent.projectIds?.includes(projectId))
      for (const agent of projectAgents) {
        if (agent.status !== "archived") startAgent(agent.id, projectId)
      }
      setProjectRuntimes((prev) =>
        prev.map((pr) => (pr.projectId === projectId ? { ...pr, runState: "running" } : pr)),
      )
    },
    [agents, startAgent],
  )

  const pauseProject = useCallback(
    (projectId: string) => {
      const projectAgents = agents.filter((agent) => agent.projectIds?.includes(projectId))
      for (const agent of projectAgents) {
        pauseAgent(agent.id, projectId)
      }
      setProjectRuntimes((prev) =>
        prev.map((pr) => (pr.projectId === projectId ? { ...pr, runState: "paused" } : pr)),
      )
    },
    [agents, pauseAgent],
  )

  const stopProject = useCallback(
    (projectId: string) => {
      const projectAgents = agents.filter((agent) => agent.projectIds?.includes(projectId))
      for (const agent of projectAgents) {
        stopAgent(agent.id, projectId)
      }
      setProjectRuntimes((prev) =>
        prev.map((pr) => (pr.projectId === projectId ? { ...pr, runState: "stopped" } : pr)),
      )
    },
    [agents, stopAgent],
  )

  const nudgeAgent = useCallback((agentId: string, projectId: string) => {
    setAgentRuntimes((prev) =>
      prev.map((rt) =>
        rt.agentId === agentId && rt.projectId === projectId && rt.runState === "running"
          ? { ...rt, nextBeatAt: stateRef.current.clock.simNow }
          : rt,
      ),
    )
  }, [])

  const sendMessage = useCallback(
    (input: {
      projectId: string
      authorId: string
      authorKind: MemberKind
      content: string
      recipientId?: string
      recipientKind?: MemberKind
      threadId?: string
    }) => {
      const iso = new Date(stateRef.current.clock.simNow).toISOString()
      const message: Message = {
        id: `msg-${Date.now()}`,
        projectId: input.projectId,
        authorId: input.authorId,
        authorKind: input.authorKind,
        recipientId: input.recipientId,
        recipientKind: input.recipientKind,
        threadId: input.threadId,
        content: input.content.trim(),
        createdAt: iso,
      }
      setMessages((prev) => [...prev, message])
      setInteractionPulses((prev) => appendMessagePulse(prev, message))
      setActivity((prev) =>
        capActivity([
          ...prev,
          {
            id: `act-${Date.now()}`,
            projectId: input.projectId,
            actorId: input.authorId,
            actorKind: input.authorKind,
            action: input.recipientId ? "sent a message" : "posted a project update",
            createdAt: iso,
          },
        ]),
      )
      if (input.recipientKind === "agent" && input.recipientId) {
        nudgeAgent(input.recipientId, input.projectId)
      }
    },
    [nudgeAgent],
  )

  const createTask = useCallback(
    (input: {
      projectId: string
      title: string
      description?: string
      assigneeId?: string
      assigneeKind?: MemberKind
      creatorId: string
      creatorKind: MemberKind
      dueAt?: string
    }) => {
      const iso = new Date(stateRef.current.clock.simNow).toISOString()
      const task: Task = {
        id: `task-${Date.now()}`,
        projectId: input.projectId,
        title: input.title.trim(),
        description: input.description?.trim(),
        assigneeId: input.assigneeId,
        assigneeKind: input.assigneeKind,
        creatorId: input.creatorId,
        creatorKind: input.creatorKind,
        status: "todo",
        createdAt: iso,
        updatedAt: iso,
        dueAt: input.dueAt,
      }
      setTasks((prev) => [...prev, task])
      setInteractionPulses((prev) => appendTaskPulse(prev, task))
      setActivity((prev) =>
        capActivity([
          ...prev,
          {
            id: `act-${Date.now()}-task`,
            projectId: input.projectId,
            actorId: input.creatorId,
            actorKind: input.creatorKind,
            action: `created task "${task.title}"`,
            createdAt: iso,
          },
        ]),
      )
      if (input.assigneeKind === "agent" && input.assigneeId) {
        nudgeAgent(input.assigneeId, input.projectId)
      }
    },
    [nudgeAgent],
  )

  const updateTaskStatus = useCallback((taskId: string, status: Task["status"]) => {
    const iso = new Date(stateRef.current.clock.simNow).toISOString()
    setTasks((prev) =>
      prev.map((task) => (task.id === taskId ? { ...task, status, updatedAt: iso } : task)),
    )
  }, [])

  const assignTask = useCallback(
    (taskId: string, assigneeId: string, assigneeKind: MemberKind) => {
      const iso = new Date(stateRef.current.clock.simNow).toISOString()
      setTasks((prev) =>
        prev.map((task) =>
          task.id === taskId
            ? { ...task, assigneeId, assigneeKind, updatedAt: iso }
            : task,
        ),
      )
      const task = stateRef.current.tasks.find((item) => item.id === taskId)
      if (task) {
        setInteractionPulses((prev) =>
          appendTaskPulse(prev, {
            projectId: task.projectId,
            creatorId: task.creatorId,
            creatorKind: task.creatorKind,
            assigneeId,
            assigneeKind,
            title: task.title,
          }),
        )
      }
      if (task && assigneeKind === "agent") {
        nudgeAgent(assigneeId, task.projectId)
      }
    },
    [nudgeAgent],
  )

  const approveProposal = useCallback((proposalId: string) => {
    setProposals((prev) => {
      const target = prev.find((p) => p.id === proposalId)
      if (!target) return prev

      if (target.kind === "message" && target.payload.message) {
        const message = target.payload.message as Message
        setMessages((m) => [...m, message])
        setInteractionPulses((prev) => appendMessagePulse(prev, message))
      }
      if (target.kind === "task" && target.payload.task) {
        const task = target.payload.task as Task
        setTasks((t) => [...t, task])
        setInteractionPulses((prev) => appendTaskPulse(prev, task))
      }
      if (target.kind === "task_update" && target.payload.taskId && target.payload.patch) {
        const { taskId, patch } = target.payload as { taskId: string; patch: Partial<Task> }
        setTasks((t) => t.map((task) => (task.id === taskId ? { ...task, ...patch } : task)))
      }

      return prev.map((p) => (p.id === proposalId ? { ...p, status: "approved" as const } : p))
    })
  }, [])

  const rejectProposal = useCallback((proposalId: string) => {
    setProposals((prev) =>
      prev.map((p) => (p.id === proposalId ? { ...p, status: "rejected" } : p)),
    )
  }, [])

  const value = useMemo<WorkflowContextValue>(
    () => ({
      clock,
      tasks,
      messages,
      activity,
      logs,
      proposals,
      interactionPulses,
      agentRuntimes,
      projectRuntimes,
      getProjectTasks: (projectId) => tasksForProject(tasks, projectId),
      getProjectMessages: (projectId) => messagesForProject(messages, projectId),
      getProjectActivity: (projectId) => activityForProject(activity, projectId),
      getAgentActivityItems: (agentId) => activityForAgent(activity, agentId),
      getAgentLogItems: (agentId) => logsForAgent(logs, agentId),
      getAgentRuntime: (agentId, projectId) =>
        agentRuntimes.find((rt) => rt.agentId === agentId && rt.projectId === projectId),
      getProjectRuntime: (projectId) =>
        projectRuntimes.find((pr) => pr.projectId === projectId),
      getProjectInteractionPulses: (projectId) =>
        interactionPulses.filter((pulse) => pulse.projectId === projectId),
      runningAgentCount: (projectId) =>
        agentRuntimes.filter(
          (rt) => rt.projectId === projectId && rt.runState === "running",
        ).length,
      pendingProposalCount: (projectId) =>
        proposals.filter((p) => p.projectId === projectId && p.status === "pending").length,
      demoWorkspaceRevision,
      startAgent,
      pauseAgent,
      stopAgent,
      startProject,
      pauseProject,
      stopProject,
      nudgeAgent,
      sendMessage,
      createTask,
      updateTaskStatus,
      assignTask,
      approveProposal,
      rejectProposal,
      setSpeed: (speed) => setClock((prev) => ({ ...prev, speed })),
      pauseClock: () => setClock((prev) => ({ ...prev, ticking: false })),
      resumeClock: () => setClock((prev) => ({ ...prev, ticking: true })),
    }),
    [
      clock,
      tasks,
      messages,
      activity,
      logs,
      proposals,
      interactionPulses,
      agentRuntimes,
      projectRuntimes,
      demoWorkspaceRevision,
      startAgent,
      pauseAgent,
      stopAgent,
      startProject,
      pauseProject,
      stopProject,
      nudgeAgent,
      sendMessage,
      createTask,
      updateTaskStatus,
      assignTask,
      approveProposal,
      rejectProposal,
    ],
  )

  return <WorkflowContext.Provider value={value}>{children}</WorkflowContext.Provider>
}

export function useWorkflow() {
  const ctx = useContext(WorkflowContext)
  if (!ctx) throw new Error("useWorkflow must be used within WorkflowProvider")
  return ctx
}
