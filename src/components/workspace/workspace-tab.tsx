import { useEffect, useMemo, useState } from "react"
import {
  ChevronRight,
  Database,
  File,
  FileText,
  Folder,
  KeyRound,
  Link2,
  Plug,
  Upload,
} from "lucide-react"
import { useApp } from "@/context/app-context"
import { useWorkflow } from "@/context/workflow-context"
import {
  getProjectFiles,
  getProjectIntegrations,
  getProjectVaults,
  type ProjectFileNode,
  type Resource,
  type Vault,
} from "@/data/mock"
import { applyDemoWorkspaceFilter } from "@/lib/workflow/demo-scripts"
import { FilePreviewSheet } from "@/components/workspace/file-preview-sheet"
import { isViewableFile } from "@/lib/workspace/sample-file-content"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { cn } from "@/lib/utils"

type WorkspaceView = "files" | "integrations" | "vaults"

interface WorkspaceTabProps {
  projectId: string
  isActive: boolean
  focus?: { view: WorkspaceView; folderId?: string | null } | null
  onFocusConsumed?: () => void
}

function formatRelativeTime(iso: string) {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return iso
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  })
}

function integrationStatusVariant(
  status: Resource["status"],
): "default" | "secondary" | "outline" | "destructive" {
  switch (status) {
    case "connected":
      return "default"
    case "syncing":
      return "secondary"
    case "error":
      return "destructive"
    default:
      return "outline"
  }
}

function FileBrowser({
  files,
  currentFolderId,
  selectedFileId,
  onNavigate,
  onSelectFile,
}: {
  files: ProjectFileNode[]
  currentFolderId: string | null
  selectedFileId: string | null
  onNavigate: (folderId: string | null) => void
  onSelectFile: (fileId: string | null) => void
}) {
  const path = useMemo(() => {
    const segments: ProjectFileNode[] = []
    let cursor = currentFolderId
    while (cursor) {
      const folder = files.find((file) => file.id === cursor)
      if (!folder) break
      segments.unshift(folder)
      cursor = folder.parentId
    }
    return segments
  }, [currentFolderId, files])

  const entries = useMemo(
    () =>
      files
        .filter((file) => file.parentId === currentFolderId)
        .sort((a, b) => {
          if (a.kind !== b.kind) return a.kind === "folder" ? -1 : 1
          return a.name.localeCompare(b.name)
        }),
    [currentFolderId, files],
  )

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-1 text-sm">
        <button
          type="button"
          onClick={() => onNavigate(null)}
          className={cn(
            "rounded px-1.5 py-0.5 font-medium transition-colors hover:bg-muted",
            currentFolderId === null ? "text-foreground" : "text-muted-foreground",
          )}
        >
          workspace
        </button>
        {path.map((folder) => (
          <span key={folder.id} className="flex items-center gap-1">
            <ChevronRight className="size-3.5 text-muted-foreground" />
            <button
              type="button"
              onClick={() => onNavigate(folder.id)}
              className={cn(
                "rounded px-1.5 py-0.5 font-medium transition-colors hover:bg-muted",
                folder.id === currentFolderId
                  ? "text-foreground"
                  : "text-muted-foreground",
              )}
            >
              {folder.name}
            </button>
          </span>
        ))}
      </div>

      {entries.length === 0 ? (
        <p className="text-sm text-muted-foreground">This folder is empty.</p>
      ) : (
        <div className="divide-y divide-border rounded-lg border border-border">
          {entries.map((entry) => {
            const isSelected = entry.id === selectedFileId
            const isPreviewable = entry.kind === "file" && isViewableFile(entry)

            return (
              <button
                key={entry.id}
                type="button"
                onClick={() => {
                  if (entry.kind === "folder") {
                    onNavigate(entry.id)
                    return
                  }
                  onSelectFile(isSelected ? null : entry.id)
                }}
                className={cn(
                  "flex w-full items-center justify-between px-4 py-3 text-left text-sm transition-colors",
                  (entry.kind === "folder" || isPreviewable) && "hover:bg-muted/50",
                  isSelected && "bg-primary/5",
                )}
              >
                <div className="flex min-w-0 items-center gap-3">
                  {entry.kind === "folder" ? (
                    <Folder className="size-4 shrink-0 text-primary" />
                  ) : isPreviewable ? (
                    <FileText className="size-4 shrink-0 text-primary" />
                  ) : (
                    <File className="size-4 shrink-0 text-muted-foreground" />
                  )}
                  <span className="truncate font-medium">{entry.name}</span>
                </div>
                <div className="flex shrink-0 items-center gap-4 text-xs text-muted-foreground">
                  {entry.size && <span>{entry.size}</span>}
                  <span>{formatRelativeTime(entry.updatedAt)}</span>
                </div>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

function IntegrationsPanel({ integrations }: { integrations: Resource[] }) {
  if (integrations.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No data integrations linked to this project yet.
      </p>
    )
  }

  return (
    <div className="space-y-3">
      {integrations.map((integration) => (
        <div
          key={integration.id}
          className="flex flex-col gap-3 rounded-lg border border-border px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="flex min-w-0 items-start gap-3">
            <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md bg-primary/10">
              {integration.type === "dataset" ? (
                <Database className="size-4 text-primary" />
              ) : (
                <Plug className="size-4 text-primary" />
              )}
            </div>
            <div className="min-w-0">
              <p className="font-medium">{integration.name}</p>
              <p className="text-sm text-muted-foreground">
                {integration.provider ?? "Unknown provider"} · {integration.type} ·{" "}
                {integration.size}
              </p>
              {integration.lastSyncedAt && (
                <p className="mt-1 text-xs text-muted-foreground">
                  Last synced {formatRelativeTime(integration.lastSyncedAt)}
                </p>
              )}
            </div>
          </div>
          <Badge
            variant={integrationStatusVariant(integration.status)}
            className="w-fit capitalize"
          >
            {integration.status ?? "unknown"}
          </Badge>
        </div>
      ))}
    </div>
  )
}

function VaultsPanel({
  linkedVaults,
  availableVaults,
}: {
  linkedVaults: Vault[]
  availableVaults: Vault[]
}) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="mb-3 text-sm font-medium">Linked vaults</h3>
        {linkedVaults.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No vaults linked to this project.
          </p>
        ) : (
          <div className="space-y-3">
            {linkedVaults.map((vault) => (
              <div
                key={vault.id}
                className="flex flex-col gap-3 rounded-lg border border-border px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex min-w-0 items-start gap-3">
                  <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md bg-primary/10">
                    <KeyRound className="size-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{vault.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {vault.secrets} {vault.secrets === 1 ? "secret" : "secrets"}
                      {vault.description ? ` · ${vault.description}` : ""}
                    </p>
                  </div>
                </div>
                <Badge variant="secondary">Linked</Badge>
              </div>
            ))}
          </div>
        )}
      </div>

      {availableVaults.length > 0 && (
        <div>
          <h3 className="mb-3 text-sm font-medium">Available org vaults</h3>
          <div className="space-y-3">
            {availableVaults.map((vault) => (
              <div
                key={vault.id}
                className="flex flex-col gap-3 rounded-lg border border-dashed border-border px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex min-w-0 items-start gap-3">
                  <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md bg-muted">
                    <KeyRound className="size-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-medium">{vault.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {vault.secrets} secrets · not linked to this project
                    </p>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="gap-1.5" disabled>
                  <Link2 className="size-3.5" />
                  Link vault
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export function WorkspaceTab({
  projectId,
  isActive,
  focus,
  onFocusConsumed,
}: WorkspaceTabProps) {
  const { resources, vaults } = useApp()
  const { demoWorkspaceRevision } = useWorkflow()
  const [view, setView] = useState<WorkspaceView>("files")
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null)
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null)

  const files = useMemo(
    () => applyDemoWorkspaceFilter(projectId, getProjectFiles(projectId)),
    [projectId, demoWorkspaceRevision],
  )
  const selectedFile = useMemo(
    () => files.find((file) => file.id === selectedFileId) ?? null,
    [files, selectedFileId],
  )
  const integrations = useMemo(
    () => getProjectIntegrations(projectId, resources),
    [projectId, resources],
  )
  const linkedVaults = useMemo(
    () => getProjectVaults(projectId, vaults),
    [projectId, vaults],
  )
  const availableVaults = useMemo(
    () => vaults.filter((vault) => !vault.projectIds?.includes(projectId)),
    [projectId, vaults],
  )

  useEffect(() => {
    if (!isActive) {
      setView("files")
      setCurrentFolderId(null)
      setSelectedFileId(null)
    }
  }, [isActive])

  useEffect(() => {
    setSelectedFileId(null)
  }, [currentFolderId, projectId])

  useEffect(() => {
    if (!isActive || !focus) return
    setView(focus.view)
    if (focus.folderId !== undefined) {
      setCurrentFolderId(focus.folderId)
    }
    onFocusConsumed?.()
  }, [isActive, focus, onFocusConsumed])

  const description =
    view === "files"
      ? `${files.length} items in project workspace`
      : view === "integrations"
        ? `${integrations.length} data ${integrations.length === 1 ? "integration" : "integrations"}`
        : `${linkedVaults.length} linked ${linkedVaults.length === 1 ? "vault" : "vaults"}`

  return (
    <Card>
      <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <CardTitle>Workspace</CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex rounded-lg border border-border bg-background p-0.5">
            <Button
              type="button"
              variant={view === "files" ? "secondary" : "ghost"}
              size="sm"
              className="gap-1.5"
              onClick={() => setView("files")}
            >
              <Folder className="size-3.5" />
              Files
            </Button>
            <Button
              type="button"
              variant={view === "integrations" ? "secondary" : "ghost"}
              size="sm"
              className="gap-1.5"
              onClick={() => setView("integrations")}
            >
              <Database className="size-3.5" />
              Integrations
            </Button>
            <Button
              type="button"
              variant={view === "vaults" ? "secondary" : "ghost"}
              size="sm"
              className="gap-1.5"
              onClick={() => setView("vaults")}
            >
              <KeyRound className="size-3.5" />
              Vaults
            </Button>
          </div>

          {view === "files" && (
            <Button variant="outline" size="sm" className="gap-1.5" disabled>
              <Upload className="size-3.5" />
              Upload
            </Button>
          )}
          {view === "integrations" && (
            <Button variant="outline" size="sm" className="gap-1.5" disabled>
              <Plug className="size-3.5" />
              Add integration
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent>
        {view === "files" && (
          <FileBrowser
            files={files}
            currentFolderId={currentFolderId}
            selectedFileId={selectedFileId}
            onNavigate={setCurrentFolderId}
            onSelectFile={setSelectedFileId}
          />
        )}
        {view === "integrations" && <IntegrationsPanel integrations={integrations} />}
        {view === "vaults" && (
          <VaultsPanel linkedVaults={linkedVaults} availableVaults={availableVaults} />
        )}
      </CardContent>

      <FilePreviewSheet
        file={selectedFile}
        onOpenChange={(open) => {
          if (!open) setSelectedFileId(null)
        }}
      />
    </Card>
  )
}
