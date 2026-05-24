import { AppSidebar } from "@/components/layout/app-sidebar"
import { ProjectMainPane } from "@/components/project/project-main-pane"

export function ProjectWorkspaceShell() {
  return (
    <div className="flex min-h-0 flex-1">
      <AppSidebar />
      <main className="flex min-h-0 min-w-0 flex-1 flex-col bg-background">
        <ProjectMainPane />
      </main>
    </div>
  )
}
