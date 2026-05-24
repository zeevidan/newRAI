import { Check, ChevronsUpDown } from "lucide-react"
import { useLocation, useNavigate } from "react-router-dom"
import { useApp } from "@/context/app-context"
import {
  mockSessionProfileOptions,
  mockSessionProfiles,
  type MockSessionProfileKey,
} from "@/data/mock"
import {
  canAccessAdmin,
  planeFromPathname,
} from "@/lib/auth"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

function roleLabel(platformRole: string) {
  switch (platformRole) {
    case "platform_admin":
      return "Platform admin"
    case "org_admin":
      return "Org admin"
    default:
      return "Member"
  }
}

function findActiveProfileKey(userId: string): MockSessionProfileKey | null {
  for (const key of Object.keys(mockSessionProfiles) as MockSessionProfileKey[]) {
    if (mockSessionProfiles[key].id === userId) return key
  }
  return null
}

export function SidebarUserSwitcher() {
  const { sessionUser, switchSessionUser, currentOrg } = useApp()
  const navigate = useNavigate()
  const location = useLocation()
  const activeKey = findActiveProfileKey(sessionUser.id)

  function handleSwitch(key: MockSessionProfileKey) {
    const nextUser = mockSessionProfiles[key]
    switchSessionUser(key)

    const plane = planeFromPathname(location.pathname)
    const orgId =
      key === "orgAdmin" ? (nextUser.orgAdminOrgIds?.[0] ?? currentOrg.id) : currentOrg.id

    if (plane === "admin" && !canAccessAdmin(nextUser, orgId)) {
      navigate("/projects")
    }
  }

  return (
    <div className="shrink-0 border-t border-border p-3">
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <button
              type="button"
              className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            >
              <Avatar className="size-9">
                <AvatarFallback className="bg-primary/10 text-sm font-medium text-primary">
                  {sessionUser.avatar}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{sessionUser.name}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {roleLabel(sessionUser.platformRole)}
                </p>
              </div>
              <ChevronsUpDown className="size-4 shrink-0 text-muted-foreground" />
            </button>
          }
        />
        <DropdownMenuContent side="top" align="start" className="w-64">
          <DropdownMenuGroup>
            <DropdownMenuLabel>Switch user</DropdownMenuLabel>
            {mockSessionProfileOptions.map((option) => (
              <DropdownMenuItem
                key={option.key}
                onClick={() => handleSwitch(option.key)}
                className="flex items-start gap-2 py-2"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-medium">{option.label}</p>
                  <p className="text-xs text-muted-foreground">{option.description}</p>
                </div>
                {activeKey === option.key && (
                  <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                )}
              </DropdownMenuItem>
            ))}
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
