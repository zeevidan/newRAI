import { useEffect, useMemo, useState } from "react"
import { useApp } from "@/context/app-context"
import {
  dataClassificationOptions,
  getAgentAccessGrant,
  getAgentProjectConfig,
  type DataClassificationTier,
  type WorkspaceScope,
} from "@/data/agent-config-mock"
import {
  getProjectFiles,
  getProjectIntegrations,
  getProjectVaults,
} from "@/data/mock"
import { MultiSelectPanel } from "@/components/team/agent-detail/multi-select-panel"
import { WorkspaceFolderTree } from "@/components/team/agent-detail/workspace-folder-tree"
import { fromValueLabelPairs, WORKSPACE_SCOPE_ITEMS } from "@/lib/select-items"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface AgentAccessDataTabProps {
  agentId: string
  projectId: string
  onSaved?: () => void
}

export function AgentAccessDataTab({ agentId, projectId, onSaved }: AgentAccessDataTabProps) {
  const {
    vaults,
    resources,
    agentAccessGrants,
    agentProjectConfigs,
    updateAgentAccessGrant,
    updateAgentProjectConfig,
  } = useApp()

  const grant = useMemo(
    () => getAgentAccessGrant(agentAccessGrants, agentId, projectId),
    [agentAccessGrants, agentId, projectId],
  )
  const config = useMemo(
    () => getAgentProjectConfig(agentId, projectId, agentProjectConfigs),
    [agentId, projectId, agentProjectConfigs],
  )

  const projectFiles = useMemo(() => getProjectFiles(projectId), [projectId])
  const projectVaults = useMemo(() => getProjectVaults(projectId, vaults), [projectId, vaults])
  const projectIntegrations = useMemo(
    () => getProjectIntegrations(projectId, resources),
    [projectId, resources],
  )

  const [workspaceScope, setWorkspaceScope] = useState<WorkspaceScope>(config.workspaceScope)
  const [folderIds, setFolderIds] = useState<string[]>(grant?.workspaceFolderIds ?? [])
  const [vaultIds, setVaultIds] = useState<string[]>(grant?.vaultIds ?? [])
  const [integrationIds, setIntegrationIds] = useState<string[]>(grant?.integrationIds ?? [])
  const [classification, setClassification] = useState<DataClassificationTier>(
    config.dataClassificationTier,
  )

  useEffect(() => {
    const inferredScope: WorkspaceScope =
      (grant?.workspaceFolderIds?.length ?? 0) > 0 ? "folders" : config.workspaceScope
    setWorkspaceScope(inferredScope)
    setFolderIds(grant?.workspaceFolderIds ?? [])
    setVaultIds(grant?.vaultIds ?? [])
    setIntegrationIds(grant?.integrationIds ?? [])
    setClassification(config.dataClassificationTier)
  }, [config, grant])

  function handleSave(e: React.FormEvent) {
    e.preventDefault()
    updateAgentAccessGrant(agentId, projectId, {
      workspaceFolderIds: workspaceScope === "folders" ? folderIds : [],
      vaultIds,
      integrationIds,
    })
    updateAgentProjectConfig(agentId, projectId, {
      workspaceScope,
      dataClassificationTier: classification,
    })
    onSaved?.()
  }

  return (
    <form onSubmit={handleSave} className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Workspace access</CardTitle>
          <CardDescription>
            Full workspace or scoped folders. Empty folder selection with full scope grants entire
            project workspace.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2 max-w-xs">
            <Label>Scope</Label>
            <Select
              items={WORKSPACE_SCOPE_ITEMS}
              value={workspaceScope}
              onValueChange={(v) => v && setWorkspaceScope(v as WorkspaceScope)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="full">Full project workspace</SelectItem>
                <SelectItem value="folders">Specific folders only</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {workspaceScope === "folders" && (
            <WorkspaceFolderTree
              files={projectFiles}
              selectedIds={folderIds}
              onChange={setFolderIds}
              emptyMessage="No folders in this project workspace."
            />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Vaults</CardTitle>
          <CardDescription>Secret stores this agent may read on this project.</CardDescription>
        </CardHeader>
        <CardContent>
          <MultiSelectPanel
            items={projectVaults.map((vault) => ({
              id: vault.id,
              label: vault.name,
              description: vault.description ?? `${vault.secrets} secrets`,
              badge: "vault",
            }))}
            selectedIds={vaultIds}
            onChange={setVaultIds}
            emptyMessage="No vaults linked to this project."
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Integrations & datasets</CardTitle>
          <CardDescription>
            Connected resources the agent can query. Sensitivity tags on resources — admin UI later.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <MultiSelectPanel
            items={projectIntegrations.map((resource) => ({
              id: resource.id,
              label: resource.name,
              description: resource.provider ?? resource.type,
              badge: resource.type,
            }))}
            selectedIds={integrationIds}
            onChange={setIntegrationIds}
            emptyMessage="No integrations on this project."
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Data classification</CardTitle>
          <CardDescription>
            Maximum sensitivity tier this agent may handle. Taxonomy admin coming later.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 max-w-md">
            <Label>Classification tier</Label>
            <Select
              items={fromValueLabelPairs(dataClassificationOptions)}
              value={classification}
              onValueChange={(v) => v && setClassification(v as DataClassificationTier)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {dataClassificationOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              {dataClassificationOptions.find((o) => o.value === classification)?.description}
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="submit">Save & Close</Button>
      </div>
    </form>
  )
}
