import { NavLink, Outlet } from "react-router-dom"
import {
  Building2,
  KeyRound,
  LayoutDashboard,
  ScrollText,
  Settings2,
  SlidersHorizontal,
  Sparkles,
  Users,
} from "lucide-react"
import { useApp } from "@/context/app-context"
import { canAccessPlatformAdmin } from "@/lib/auth"
import { SidebarUserSwitcher } from "@/components/layout/sidebar-user-switcher"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

const orgNavItems = [
  { to: "/admin/overview", label: "Overview", icon: LayoutDashboard },
  { to: "/admin/users", label: "Users", icon: Users },
  { to: "/admin/settings", label: "Settings", icon: Settings2 },
  { to: "/admin/vaults", label: "Vaults", icon: KeyRound },
  { to: "/admin/policies", label: "Policies", icon: ScrollText },
  { to: "/admin/skills", label: "Skills", icon: Sparkles },
] as const

const platformNavItems = [
  { to: "/admin/organizations", label: "Organizations", icon: Building2 },
  {
    to: "/admin/platform-configurations",
    label: "Platform configurations",
    icon: SlidersHorizontal,
  },
] as const

function NavItem({
  to,
  label,
  icon: Icon,
}: {
  to: string
  label: string
  icon: typeof LayoutDashboard
}) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
          "flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors",
          isActive
            ? "bg-sidebar-primary text-sidebar-primary-foreground"
            : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
        )
      }
    >
      <Icon className="size-4 shrink-0 opacity-80" />
      {label}
    </NavLink>
  )
}

export function AdminSidebar() {
  const { currentOrg, sessionUser } = useApp()
  const isPlatformAdmin = canAccessPlatformAdmin(sessionUser)

  return (
    <aside className="flex h-full min-h-0 w-72 shrink-0 flex-col border-r border-border bg-sidebar text-sidebar-foreground">
      <div className="shrink-0 p-4">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Admin
        </p>
        <p className="mt-1 truncate text-sm font-medium">{currentOrg.name}</p>
      </div>

      <nav className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto px-2 pb-2">
        {orgNavItems.map((item) => (
          <NavItem key={item.to} {...item} />
        ))}

        {isPlatformAdmin && (
          <>
            <Separator className="my-2" />
            <p className="px-3 pb-1 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              Platform
            </p>
            {platformNavItems.map((item) => (
              <NavItem key={item.to} {...item} />
            ))}
          </>
        )}
      </nav>

      <SidebarUserSwitcher />
    </aside>
  )
}

export function AdminLayout() {
  return (
    <div className="flex min-h-0 flex-1">
      <AdminSidebar />
      <main className="flex min-h-0 min-w-0 flex-1 flex-col bg-background">
        <Outlet />
      </main>
    </div>
  )
}
