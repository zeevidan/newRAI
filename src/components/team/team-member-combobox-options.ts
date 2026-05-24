import type { SearchComboboxOption } from "@/components/ui/search-combobox"
import type { OrgChartMember } from "@/data/mock"

export function buildTeamMemberComboboxOptions(
  members: OrgChartMember[],
  excludeId?: string,
): SearchComboboxOption[] {
  return members
    .filter((member) => member.id !== excludeId)
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((member) => ({
      value: member.id,
      label: member.name,
      description: `${member.title} · ${member.kind === "agent" ? "Agent" : "Person"}`,
    }))
}
