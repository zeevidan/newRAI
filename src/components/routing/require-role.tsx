import { Navigate, Outlet } from "react-router-dom"
import { useApp } from "@/context/app-context"
import { canAccessAdmin, canAccessPlatformAdmin } from "@/lib/auth"

export function RequireAdmin() {
  const { currentOrg, sessionUser } = useApp()

  if (!canAccessAdmin(sessionUser, currentOrg.id)) {
    return <Navigate to="/projects" replace />
  }

  return <Outlet />
}

export function RequirePlatformAdmin() {
  const { sessionUser } = useApp()

  if (!canAccessPlatformAdmin(sessionUser)) {
    return <Navigate to="/admin/overview" replace />
  }

  return <Outlet />
}
