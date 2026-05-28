import { useEffect, useMemo, useState } from "react"
import { useApp } from "@/context/app-context"
import {
  getAgentProjectConfig,
  getInjectableContextsForProject,
  getOrgMemoryStores,
} from "@/data/agent-config-mock"
import { MultiSelectPanel } from "@/components/team/agent-detail/multi-select-panel"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

interface AgentContextTabProps {
  agentId: string
  projectId: string
  onSaved?: () => void
}

export function AgentContextTab({ agentId, projectId, onSaved }: AgentContextTabProps) {
  const { currentOrg, agentProjectConfigs, updateAgentProjectConfig } = useApp()
  const saved = useMemo(
    () => getAgentProjectConfig(agentId, projectId, agentProjectConfigs),
    [agentId, projectId, agentProjectConfigs],
  )

  const injectableContexts = useMemo(
    () => getInjectableContextsForProject(currentOrg.id, projectId),
    [currentOrg.id, projectId],
  )
  const memoryStores = useMemo(() => getOrgMemoryStores(currentOrg.id), [currentOrg.id])

  const platformContexts = injectableContexts.filter((ctx) => ctx.scope === "platform")
  const orgContexts = injectableContexts.filter((ctx) => ctx.scope === "org")
  const projectContexts = injectableContexts.filter((ctx) => ctx.scope === "project")

  const [platformIds, setPlatformIds] = useState(saved.contextScope.platformContextIds)
  const [orgIds, setOrgIds] = useState(saved.contextScope.orgContextIds)
  const [projectIds, setProjectIds] = useState(saved.contextScope.projectContextIds)
  const [memoryIds, setMemoryIds] = useState(saved.contextScope.memoryStoreIds)

  useEffect(() => {
    setPlatformIds(saved.contextScope.platformContextIds)
    setOrgIds(saved.contextScope.orgContextIds)
    setProjectIds(saved.contextScope.projectContextIds)
    setMemoryIds(saved.contextScope.memoryStoreIds)
  }, [saved])

  function handleSave(e: React.FormEvent) {
    e.preventDefault()
    updateAgentProjectConfig(agentId, projectId, {
      contextScope: {
        platformContextIds: platformIds,
        orgContextIds: orgIds,
        projectContextIds: projectIds,
        memoryStoreIds: memoryIds,
      },
    })
    onSaved?.()
  }

  return (
    <form onSubmit={handleSave} className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Injectable context</CardTitle>
          <CardDescription>
            Org, project, and platform context blocks injected at run start. Context registry admin
            coming later.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h4 className="mb-2 text-sm font-medium">Platform</h4>
            <MultiSelectPanel
              items={platformContexts.map((ctx) => ({
                id: ctx.id,
                label: ctx.name,
                description: ctx.description,
                badge: "platform",
              }))}
              selectedIds={platformIds}
              onChange={setPlatformIds}
              emptyMessage="No platform context registered."
            />
          </div>
          <div>
            <h4 className="mb-2 text-sm font-medium">Organization</h4>
            <MultiSelectPanel
              items={orgContexts.map((ctx) => ({
                id: ctx.id,
                label: ctx.name,
                description: ctx.description,
                badge: "org",
              }))}
              selectedIds={orgIds}
              onChange={setOrgIds}
              emptyMessage="No org context for this organization."
            />
          </div>
          <div>
            <h4 className="mb-2 text-sm font-medium">Project</h4>
            <MultiSelectPanel
              items={projectContexts.map((ctx) => ({
                id: ctx.id,
                label: ctx.name,
                description: ctx.description,
                badge: "project",
              }))}
              selectedIds={projectIds}
              onChange={setProjectIds}
              emptyMessage="No project-specific context blocks."
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Memory & RAG</CardTitle>
          <CardDescription>
            Long-term memory and retrieval sources. Memory store admin coming later.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <MultiSelectPanel
            items={memoryStores.map((store) => ({
              id: store.id,
              label: store.name,
              description: store.description,
              badge: store.sourceType,
            }))}
            selectedIds={memoryIds}
            onChange={setMemoryIds}
            emptyMessage="No memory stores configured for this org."
          />
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="submit">Save & Close</Button>
      </div>
    </form>
  )
}
