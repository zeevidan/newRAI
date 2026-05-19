import { useState } from "react"
import {
  Bot,
  ChevronDown,
  FileStack,
  FolderPlus,
  KeyRound,
  Plus,
  Settings2,
  UserPlus,
} from "lucide-react"
import { useApp } from "@/context/app-context"
import { currentUser } from "@/data/mock"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { CreateEntityDialog } from "@/components/dialogs/create-entity-dialog"
import type { CreateType } from "@/context/app-context"

const createActions: { type: CreateType; label: string; icon: typeof Plus }[] = [
  { type: "project", label: "Project", icon: FolderPlus },
  { type: "user", label: "User", icon: UserPlus },
  { type: "agent", label: "AI Agent", icon: Bot },
  { type: "resource", label: "Resource", icon: FileStack },
  { type: "vault", label: "Vault", icon: KeyRound },
  { type: "configuration", label: "Configuration", icon: Settings2 },
]

export function AppHeader() {
  const { organizations, currentOrg, setCurrentOrgId } = useApp()
  const [createType, setCreateType] = useState<CreateType | null>(null)

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
                  className={org.id === currentOrg.id ? "bg-accent" : undefined}
                >
                  <div className="flex w-full items-center justify-between">
                    <span>{org.name}</span>
                    <span className="text-xs text-muted-foreground">{org.slug}</span>
                  </div>
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="ml-auto flex items-center gap-2">
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
                {createActions.map(({ type, label, icon: Icon }) => (
                  <DropdownMenuItem key={type} onClick={() => setCreateType(type)}>
                    <Icon className="size-4" />
                    {label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button variant="ghost" size="icon-sm" className="rounded-full">
            <Avatar className="size-7">
              <AvatarFallback className="bg-primary/10 text-xs text-primary">
                {currentUser.avatar}
              </AvatarFallback>
            </Avatar>
          </Button>
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
