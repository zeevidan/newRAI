import { AppHeader } from "@/components/layout/app-header"
import { AppSidebar } from "@/components/layout/app-sidebar"
import { ProjectMainPane } from "@/components/project/project-main-pane"

export function AdminShell() {
  return (
    <div className="flex h-svh flex-col overflow-hidden bg-background">
      <AppHeader />
      <div className="flex min-h-0 flex-1">
        <AppSidebar />
        <main className="flex min-h-0 min-w-0 flex-1 flex-col bg-background">
          <ProjectMainPane />
        </main>
      </div>
    </div>
  )
}
