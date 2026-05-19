import { FolderKanban, Search } from "lucide-react"
import { useApp } from "@/context/app-context"
import { formatRelativeDate } from "@/data/mock"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

export function AppSidebar() {
  const {
    projectSearch,
    setProjectSearch,
    filteredProjects,
    recentProjects,
    selectedProjectId,
    setSelectedProjectId,
  } = useApp()

  return (
    <aside className="flex w-72 shrink-0 flex-col border-r border-border bg-sidebar text-sidebar-foreground">
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
            const active = project.id === selectedProjectId
            return (
              <button
                key={project.id}
                type="button"
                onClick={() => setSelectedProjectId(project.id)}
                className={cn(
                  "flex w-full flex-col gap-1 rounded-lg px-3 py-2.5 text-left transition-colors",
                  active
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
                    active ? "text-sidebar-primary-foreground/80" : "text-muted-foreground",
                  )}
                >
                  <span>{formatRelativeDate(project.updatedAt)}</span>
                  <Badge
                    variant={active ? "secondary" : "outline"}
                    className="h-4 px-1.5 text-[10px] capitalize"
                  >
                    {project.status}
                  </Badge>
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
                const active = project.id === selectedProjectId
                return (
                  <button
                    key={project.id}
                    type="button"
                    onClick={() => setSelectedProjectId(project.id)}
                    className={cn(
                      "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors",
                      active
                        ? "bg-sidebar-primary text-sidebar-primary-foreground"
                        : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                    )}
                  >
                    <FolderKanban className="size-4 shrink-0 opacity-70" />
                    <span className="truncate">{project.name}</span>
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
    </aside>
  )
}
