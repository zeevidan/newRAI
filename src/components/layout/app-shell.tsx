import { Outlet } from "react-router-dom"
import { AppHeader } from "@/components/layout/app-header"

export function AppShell() {
  return (
    <div className="flex h-svh flex-col overflow-hidden bg-background">
      <AppHeader />
      <Outlet />
    </div>
  )
}
