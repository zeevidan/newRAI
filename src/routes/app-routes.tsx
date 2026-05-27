import { Navigate, Route, Routes } from "react-router-dom"
import {
  AdminLayout,
} from "@/components/layout/admin-layout"
import { AppShell } from "@/components/layout/app-shell"
import {
  ProjectIndexRedirect,
  ProjectWorkspaceLayout,
} from "@/components/layout/project-workspace-layout"
import { ProjectWorkspaceShell } from "@/components/layout/project-workspace-shell"
import { AdminSkillsPage } from "@/components/admin/admin-skills-page"
import {
  AdminOrganizationsPage,
  AdminOverviewPage,
  AdminPlatformConfigurationsPage,
  AdminPoliciesPage,
  AdminSettingsPage,
  AdminUsersPage,
  AdminVaultsPage,
} from "@/components/admin/admin-pages"
import { RequireAdmin, RequirePlatformAdmin } from "@/components/routing/require-role"

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<Navigate to="/projects" replace />} />

        <Route path="projects" element={<ProjectWorkspaceLayout />}>
          <Route index element={<ProjectIndexRedirect />} />
          <Route path=":projectId" element={<ProjectWorkspaceShell />} />
        </Route>

        <Route path="admin" element={<RequireAdmin />}>
          <Route element={<AdminLayout />}>
            <Route index element={<Navigate to="overview" replace />} />
            <Route path="overview" element={<AdminOverviewPage />} />
            <Route path="users" element={<AdminUsersPage />} />
            <Route path="settings" element={<AdminSettingsPage />} />
            <Route path="vaults" element={<AdminVaultsPage />} />
            <Route path="policies" element={<AdminPoliciesPage />} />
            <Route path="skills" element={<AdminSkillsPage />} />
            <Route element={<RequirePlatformAdmin />}>
              <Route path="organizations" element={<AdminOrganizationsPage />} />
              <Route
                path="platform-configurations"
                element={<AdminPlatformConfigurationsPage />}
              />
            </Route>
          </Route>
        </Route>

        {/* Legacy redirects */}
        <Route path="platform/*" element={<Navigate to="/admin/overview" replace />} />
        <Route path="org-admin/*" element={<Navigate to="/admin/overview" replace />} />

        <Route path="*" element={<Navigate to="/projects" replace />} />
      </Route>
    </Routes>
  )
}
