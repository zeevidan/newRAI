import type { PlaybookActionType } from "@/lib/workflow/types"

export function getPlaybookForAgent(agentId: string, goals: string[]): PlaybookActionType[] {
  const base: PlaybookActionType[] = ["emit_finding", "progress_task", "report_to_manager"]

  if (agentId === "a1") {
    return ["emit_finding", "progress_task", "complete_task", "report_to_manager", "ask_person"]
  }
  if (agentId === "a4") {
    return ["progress_task", "complete_task", "report_to_manager", "emit_finding"]
  }
  if (agentId === "a2") {
    return ["emit_finding", "progress_task", "handoff_to_teammate", "ask_person"]
  }
  if (agentId === "a5" || agentId === "a3") {
    return ["emit_finding", "progress_task", "report_to_manager"]
  }
  if (agentId === "a7" || agentId === "a8") {
    return ["progress_task", "complete_task", "report_to_manager", "emit_finding"]
  }
  if (agentId === "a6") {
    return ["progress_task", "handoff_to_teammate", "emit_finding"]
  }

  // Voice of the Customer Report
  if (agentId === "a20") {
    // Lead editor (manual autonomy): proposes the publish step for human approval.
    return ["complete_task", "report_to_manager", "progress_task"]
  }
  if (agentId === "a21") {
    return ["emit_finding", "progress_task", "report_to_manager", "complete_task"]
  }
  if (agentId === "a22") {
    return ["emit_finding", "progress_task", "ask_person", "report_to_manager"]
  }
  if (agentId === "a23") {
    return ["emit_finding", "progress_task", "handoff_to_teammate", "report_to_manager"]
  }

  if (goals.length > 1) {
    return [...base, "complete_task", "ask_person"]
  }
  return base
}

export function seededPick<T>(items: T[], seed: number): T {
  if (items.length === 0) throw new Error("seededPick requires items")
  return items[seed % items.length]!
}
