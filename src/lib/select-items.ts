import type { ReactNode } from "react"

export type SelectItemDef = { value: string; label: ReactNode }

/** Base UI Select needs `items` on Root to render labels instead of raw values. */
export function selectItems(options: SelectItemDef[]): SelectItemDef[] {
  return options
}

export const ENTITY_STATUS_ITEMS: SelectItemDef[] = [
  { value: "active", label: "Active" },
  { value: "paused", label: "Paused" },
  { value: "archived", label: "Archived" },
]

export const TASK_STATUS_ITEMS: SelectItemDef[] = [
  { value: "todo", label: "Todo" },
  { value: "in_progress", label: "In progress" },
  { value: "blocked", label: "Blocked" },
  { value: "done", label: "Done" },
]

export const TEAM_KIND_FILTER_ITEMS: SelectItemDef[] = [
  { value: "all", label: "All types" },
  { value: "user", label: "People" },
  { value: "agent", label: "Agents" },
]

export const TEAM_STATUS_FILTER_ITEMS: SelectItemDef[] = [
  { value: "all", label: "All statuses" },
  { value: "active", label: "Active" },
  { value: "paused", label: "Paused" },
  { value: "archived", label: "Archived" },
]

export const RESPONSE_FORMAT_ITEMS: SelectItemDef[] = [
  { value: "markdown", label: "Markdown" },
  { value: "plain", label: "Plain text" },
  { value: "json", label: "JSON" },
]

export const CITATION_STYLE_ITEMS: SelectItemDef[] = [
  { value: "inline", label: "Inline" },
  { value: "footnotes", label: "Footnotes" },
  { value: "none", label: "None" },
]

export const WORKSPACE_SCOPE_ITEMS: SelectItemDef[] = [
  { value: "full", label: "Full project workspace" },
  { value: "folders", label: "Specific folders only" },
]

export const HEARTBEAT_AUTONOMY_ITEMS: SelectItemDef[] = [
  { value: "manual", label: "Manual — proposals need approval" },
  { value: "suggest", label: "Suggest — acts with activity trail" },
  { value: "full", label: "Full — autonomous execution" },
]

export const NONE_SELECT_VALUE = "__none__"

export function noneSelectItem(label: string): SelectItemDef {
  return { value: NONE_SELECT_VALUE, label }
}

export function fromValueLabelPairs(
  pairs: ReadonlyArray<{ value: string; label: string }>,
): SelectItemDef[] {
  return pairs.map((pair) => ({ value: pair.value, label: pair.label }))
}
