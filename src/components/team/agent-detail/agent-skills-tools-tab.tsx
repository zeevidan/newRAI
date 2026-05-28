import { useEffect, useMemo, useState } from "react"
import { useApp } from "@/context/app-context"
import { getAgentAccessGrant } from "@/data/agent-config-mock"
import { getOrgLibrarySkills } from "@/data/skills-mock"
import { SearchAddPanel } from "@/components/team/agent-detail/search-add-panel"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

interface AgentSkillsToolsTabProps {
  agentId: string
  projectId: string
  onSaved?: () => void
}

export function AgentSkillsToolsTab({ agentId, projectId, onSaved }: AgentSkillsToolsTabProps) {
  const { currentOrg, tools, agentAccessGrants, updateAgentAccessGrant } = useApp()
  const grant = useMemo(
    () => getAgentAccessGrant(agentAccessGrants, agentId, projectId),
    [agentAccessGrants, agentId, projectId],
  )

  const [skillIds, setSkillIds] = useState<string[]>(grant?.skillIds ?? [])
  const [toolIds, setToolIds] = useState<string[]>(grant?.toolIds ?? [])

  const skills = useMemo(() => getOrgLibrarySkills(currentOrg.id), [currentOrg.id])

  useEffect(() => {
    setSkillIds(grant?.skillIds ?? [])
    setToolIds(grant?.toolIds ?? [])
  }, [grant])

  function handleSave(e: React.FormEvent) {
    e.preventDefault()
    updateAgentAccessGrant(agentId, projectId, { skillIds, toolIds })
    onSaved?.()
  }

  return (
    <form onSubmit={handleSave} className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Skills</CardTitle>
          <CardDescription>
            Skills are centrally managed at the org level. Search to add from the library; only
            assigned skills appear below.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SearchAddPanel
            catalog={skills.map((skill) => ({
              id: skill.id,
              label: skill.metadata.name,
              description: skill.metadata.description,
              badge: skill.scope,
            }))}
            selectedIds={skillIds}
            onChange={setSkillIds}
            placeholder="Search org skills to add…"
            emptyAssignedMessage="No skills assigned. Search the org library to add skills for this agent."
            emptySearchMessage="No skills match your search."
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Tools</CardTitle>
          <CardDescription>
            Tools are centrally managed at the org level. Search to add from the catalog; only
            assigned tools appear below.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SearchAddPanel
            catalog={tools.map((tool) => ({
              id: tool.id,
              label: tool.name,
              description: tool.description,
              badge: tool.type,
            }))}
            selectedIds={toolIds}
            onChange={setToolIds}
            placeholder="Search org tools to add…"
            emptyAssignedMessage="No tools assigned. Search the org catalog to add tools for this agent."
            emptySearchMessage="No tools match your search."
          />
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="submit">Save & Close</Button>
      </div>
    </form>
  )
}
