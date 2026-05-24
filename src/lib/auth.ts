import type { SessionUser } from "@/data/mock"

export type AppPlane = "projects" | "admin"

export function canAccessPlatformAdmin(user: SessionUser) {
  return user.platformRole === "platform_admin"
}

export function canAccessOrgAdmin(user: SessionUser, orgId: string) {
  if (user.platformRole === "platform_admin") return true
  return user.orgAdminOrgIds?.includes(orgId) ?? false
}

export function canAccessAdmin(user: SessionUser, orgId: string) {
  return canAccessOrgAdmin(user, orgId)
}

export function availableAppPlanes(user: SessionUser, orgId: string): AppPlane[] {
  const planes: AppPlane[] = ["projects"]
  if (canAccessAdmin(user, orgId)) {
    planes.push("admin")
  }
  return planes
}

export function planeFromPathname(pathname: string): AppPlane {
  if (
    pathname.startsWith("/admin") ||
    pathname.startsWith("/platform") ||
    pathname.startsWith("/org-admin")
  ) {
    return "admin"
  }
  return "projects"
}
