import { useMemo } from "react"
import { SearchCombobox } from "@/components/ui/search-combobox"
import type { OrgChartMember } from "@/data/mock"
import { buildTeamMemberComboboxOptions } from "@/components/team/team-member-combobox-options"

interface ReportsToComboboxProps {
  members: OrgChartMember[]
  value: string | null
  onValueChange: (value: string | null) => void
  excludeId?: string
  allowTopLevel?: boolean
  disabled?: boolean
  id?: string
}

export function ReportsToCombobox({
  members,
  value,
  onValueChange,
  excludeId,
  allowTopLevel = false,
  disabled = false,
  id,
}: ReportsToComboboxProps) {
  const options = useMemo(
    () => buildTeamMemberComboboxOptions(members, excludeId),
    [excludeId, members],
  )

  return (
    <SearchCombobox
      id={id}
      options={options}
      value={value}
      onValueChange={onValueChange}
      placeholder="Search team members..."
      emptyMessage="No matching team members."
      nullOption={
        allowTopLevel ? { label: "No manager (top level)" } : undefined
      }
      disabled={disabled}
    />
  )
}
