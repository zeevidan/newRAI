import { useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import {
  Bot,
  Building2,
  ChevronDown,
  FileStack,
  FolderKanban,
  FolderPlus,
  KeyRound,
  Plus,
  ScrollText,
  Settings2,
  Shield,
  SlidersHorizontal,
  UserPlus,
} from "lucide-react"
import { useApp } from "@/context/app-context"
import {
  availableAppPlanes,
  canAccessPlatformAdmin,
  planeFromPathname,
  type AppPlane,
} from "@/lib/auth"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { CreateEntityDialog } from "@/components/dialogs/create-entity-dialog"
import type { CreateType } from "@/context/app-context"
import { cn } from "@/lib/utils"

const projectCreateActions: { type: CreateType; label: string; icon: typeof Plus }[] = [
  { type: "project", label: "Project", icon: FolderPlus },
  { type: "user", label: "User", icon: UserPlus },
  { type: "agent", label: "AI Agent", icon: Bot },
  { type: "resource", label: "Resource", icon: FileStack },
  { type: "vault", label: "Vault", icon: KeyRound },
  { type: "configuration", label: "Configuration", icon: Settings2 },
]

const planeLabels: Record<AppPlane, string> = {
  projects: "Projects",
  admin: "Admin",
}

const planePaths: Record<AppPlane, string> = {
  projects: "/projects",
  admin: "/admin/overview",
}

export function AppHeader() {
  const { organizations, currentOrg, setCurrentOrgId, selectedProjectId, sessionUser } =
    useApp()
  const [createType, setCreateType] = useState<CreateType | null>(null)
  const location = useLocation()
  const navigate = useNavigate()

  const activePlane = planeFromPathname(location.pathname)
  const planes = availableAppPlanes(sessionUser, currentOrg.id)
  const isPlatformAdmin = canAccessPlatformAdmin(sessionUser)

  function handlePlaneChange(plane: AppPlane) {
    if (plane === "projects") {
      navigate(selectedProjectId ? `/projects/${selectedProjectId}` : "/projects")
      return
    }
    navigate(planePaths[plane])
  }

  return (
    <>
      <header className="flex h-14 shrink-0 items-center gap-4 border-b border-border bg-background px-4">
        <div className="flex items-center gap-3">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-sm font-bold tracking-tight text-primary-foreground">
            R
          </div>
          <div className="leading-none">
            <p className="text-sm font-semibold tracking-tight">RAI</p>
            <p className="text-[11px] text-muted-foreground">Admin Console</p>
          </div>
        </div>

        {planes.length > 1 && (
          <>
            <div className="mx-2 h-6 w-px bg-border" />
            <div className="flex rounded-lg border border-border bg-background p-0.5">
              {planes.map((plane) => (
                <Button
                  key={plane}
                  type="button"
                  variant={activePlane === plane ? "secondary" : "ghost"}
                  size="sm"
                  className="gap-1.5"
                  onClick={() => handlePlaneChange(plane)}
                >
                  {plane === "projects" ? (
                    <FolderKanban className="size-3.5" />
                  ) : (
                    <Shield className="size-3.5" />
                  )}
                  {planeLabels[plane]}
                </Button>
              ))}
            </div>
          </>
        )}

        <div className="mx-2 h-6 w-px bg-border" />

        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button variant="outline" size="sm" className="gap-2">
                <span className="max-w-[160px] truncate">{currentOrg.name}</span>
                <Badge variant="secondary" className="text-[10px]">
                  {currentOrg.plan}
                </Badge>
                <ChevronDown className="size-3.5 opacity-60" />
              </Button>
            }
          />
          <DropdownMenuContent align="start" className="w-56">
            <DropdownMenuGroup>
              <DropdownMenuLabel>Organizations</DropdownMenuLabel>
              {organizations.map((org) => (
                <DropdownMenuItem
                  key={org.id}
                  onClick={() => setCurrentOrgId(org.id)}
                  className={cn(org.id === currentOrg.id && "bg-accent")}
                >
                  <div className="flex w-full items-center justify-between">
                    <span>{org.name}</span>
                    <span className="text-xs text-muted-foreground">{org.slug}</span>
                  </div>
                </DropdownMenuItem>
              ))}
              {isPlatformAdmin && activePlane === "admin" && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem disabled>
                    <Building2 className="size-4" />
                    Add organization
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="ml-auto flex items-center gap-2">
          {activePlane === "projects" && (
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button size="sm" className="gap-1.5">
                    <Plus className="size-4" />
                    Create
                  </Button>
                }
              />
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuGroup>
                  <DropdownMenuLabel>New entity</DropdownMenuLabel>
                  {projectCreateActions.map(({ type, label, icon: Icon }) => (
                    <DropdownMenuItem key={type} onClick={() => setCreateType(type)}>
                      <Icon className="size-4" />
                      {label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {activePlane === "admin" && (
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button size="sm" className="gap-1.5" variant="outline">
                    <Plus className="size-4" />
                    Create
                  </Button>
                }
              />
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuGroup>
                  <DropdownMenuLabel>Organization</DropdownMenuLabel>
                  <DropdownMenuItem disabled>
                    <UserPlus className="size-4" />
                    User
                  </DropdownMenuItem>
                  <DropdownMenuItem disabled>
                    <KeyRound className="size-4" />
                    Vault
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                {isPlatformAdmin && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuGroup>
                      <DropdownMenuLabel>Platform</DropdownMenuLabel>
                      <DropdownMenuItem disabled>
                        <Building2 className="size-4" />
                        Organization
                      </DropdownMenuItem>
                      <DropdownMenuItem disabled>
                        <SlidersHorizontal className="size-4" />
                        Platform configuration
                      </DropdownMenuItem>
                      <DropdownMenuItem disabled>
                        <ScrollText className="size-4" />
                        Policy
                      </DropdownMenuItem>
                    </DropdownMenuGroup>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </header>

      {createType && (
        <CreateEntityDialog
          type={createType}
          open={!!createType}
          onOpenChange={(open) => !open && setCreateType(null)}
        />
      )}
    </>
  )
}
