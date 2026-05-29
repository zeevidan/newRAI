import { FolderKanban, Search } from "lucide-react"
import { useNavigate, useParams } from "react-router-dom"
import { useApp } from "@/context/app-context"
import { useWorkflow } from "@/context/workflow-context"
import { formatRelativeDate } from "@/data/mock"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { SidebarUserSwitcher } from "@/components/layout/sidebar-user-switcher"
import { cn } from "@/lib/utils"
import type { RunState } from "@/lib/workflow/types"

function ProjectRunBadge({
  runState,
  selected,
}: {
  runState: RunState
  selected: boolean
}) {
  const isRunning = runState === "running"

  return (
    <Badge
      variant={isRunning ? "default" : selected ? "secondary" : "outline"}
      className={cn(
        "h-4 gap-1 px-1.5 text-[10px] capitalize",
        isRunning && "bg-emerald-600 hover:bg-emerald-600",
      )}
    >
      {isRunning && <span className="size-1 animate-pulse rounded-full bg-white" />}
      {runState}
    </Badge>
  )
}

export function AppSidebar() {
  const {
    projectSearch,
    setProjectSearch,
    filteredProjects,
    recentProjects,
  } = useApp()
  const { getProjectRuntime } = useWorkflow()
  const navigate = useNavigate()
  const { projectId: activeProjectId } = useParams()

  function selectProject(projectId: string) {
    navigate(`/projects/${projectId}`)
  }

  return (
    <aside className="flex h-full min-h-0 w-72 shrink-0 flex-col border-r border-border bg-sidebar text-sidebar-foreground">
      <div className="shrink-0 space-y-3 p-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Projects
          </p>
        </div>
        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={projectSearch}
            onChange={(e) => setProjectSearch(e.target.value)}
            placeholder="Search projects..."
            className="bg-background pl-8"
          />
        </div>
      </div>

      <ScrollArea className="min-h-0 flex-1 px-2 pb-4">
        <div className="space-y-1 px-2">
          {(projectSearch ? filteredProjects : recentProjects).map((project) => {
            const isSelected = project.id === activeProjectId
            const runState = getProjectRuntime(project.id)?.runState ?? "stopped"
            return (
              <button
                key={project.id}
                type="button"
                onClick={() => selectProject(project.id)}
                className={cn(
                  "flex w-full flex-col gap-1 rounded-lg px-3 py-2.5 text-left transition-colors",
                  isSelected
                    ? "bg-sidebar-primary text-sidebar-primary-foreground"
                    : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                )}
              >
                <div className="flex items-center gap-2">
                  <FolderKanban className="size-4 shrink-0 opacity-80" />
                  <span className="truncate text-sm font-medium">{project.name}</span>
                </div>
                <div
                  className={cn(
                    "flex items-center justify-between pl-6 text-[11px]",
                    isSelected ? "text-sidebar-primary-foreground/80" : "text-muted-foreground",
                  )}
                >
                  <span>{formatRelativeDate(project.updatedAt)}</span>
                  <ProjectRunBadge runState={runState} selected={isSelected} />
                </div>
              </button>
            )
          })}

          {!projectSearch && filteredProjects.length > recentProjects.length && (
            <>
              <Separator className="my-3" />
              <p className="px-3 pb-1 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                All projects
              </p>
              {filteredProjects.slice(recentProjects.length).map((project) => {
                const isSelected = project.id === activeProjectId
                const runState = getProjectRuntime(project.id)?.runState ?? "stopped"
                return (
                  <button
                    key={project.id}
                    type="button"
                    onClick={() => selectProject(project.id)}
                    className={cn(
                      "flex w-full flex-col gap-1 rounded-lg px-3 py-2 text-left transition-colors",
                      isSelected
                        ? "bg-sidebar-primary text-sidebar-primary-foreground"
                        : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <FolderKanban className="size-4 shrink-0 opacity-70" />
                      <span className="truncate text-sm">{project.name}</span>
                    </div>
                    <div
                      className={cn(
                        "flex items-center justify-end pl-6",
                        isSelected ? "text-sidebar-primary-foreground/80" : "text-muted-foreground",
                      )}
                    >
                      <ProjectRunBadge runState={runState} selected={isSelected} />
                    </div>
                  </button>
                )
              })}
            </>
          )}

          {filteredProjects.length === 0 && (
            <p className="px-3 py-6 text-center text-sm text-muted-foreground">
              No projects match your search.
            </p>
          )}
        </div>
      </ScrollArea>
      <SidebarUserSwitcher />
    </aside>
  )
}
