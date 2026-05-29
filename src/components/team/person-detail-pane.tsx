import { useEffect, useMemo, useState } from "react"
import { Building2, ListTodo, Mail, RefreshCw, Shield, UserRound } from "lucide-react"
import { useApp } from "@/context/app-context"
import { useWorkflow } from "@/context/workflow-context"
import {
  getDirectoryProfile,
  resolveMemberName,
  type OrgChartMember,
} from "@/data/mock"
import { formatRelativeTime } from "@/lib/workflow/format"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { ReportsToCombobox } from "@/components/team/reports-to-combobox"

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()
}

function getChartRootId(members: OrgChartMember[], excludeId?: string) {
  return members.find((member) => !member.managerId && member.id !== excludeId)?.id ?? null
}

function ReadOnlyField({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="text-sm">{value}</p>
    </div>
  )
}

interface PersonDetailPaneProps {
  userId: string
  projectId: string
  orgChartMembers: OrgChartMember[]
  onSaved?: () => void
}

export function PersonDetailPane({
  userId,
  projectId,
  orgChartMembers,
  onSaved,
}: PersonDetailPaneProps) {
  const { users, agents, updateUser } = useApp()
  const { clock, getProjectTasks, getProjectMessages } = useWorkflow()
  const user = users.find((item) => item.id === userId)
  const directory = getDirectoryProfile(userId)

  const [managerId, setManagerId] = useState<string | null>(user?.managerId ?? null)

  const chartRootId = useMemo(
    () => getChartRootId(orgChartMembers, userId),
    [orgChartMembers, userId],
  )
  const isRoot = userId === chartRootId
  const allowTopLevel = !chartRootId || isRoot

  useEffect(() => {
    if (!user) return
    setManagerId(user.managerId ?? null)
  }, [user])

  if (!user) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-sm text-muted-foreground">
          Person not found.
        </CardContent>
      </Card>
    )
  }

  function handleSave(e: React.FormEvent) {
    e.preventDefault()
    const resolvedManagerId = allowTopLevel
      ? managerId || null
      : managerId || chartRootId

    updateUser(userId, {
      managerId: resolvedManagerId,
      projectId,
      onProject: true,
    })
    onSaved?.()
  }

  const managerName = user.managerId
    ? resolveMemberName(user.managerId, users, agents)
    : null

  const inboxTasks = useMemo(
    () =>
      getProjectTasks(projectId).filter(
        (task) => task.assigneeId === userId && task.assigneeKind === "user",
      ),
    [getProjectTasks, projectId, userId],
  )

  const inboxMessages = useMemo(
    () =>
      getProjectMessages(projectId).filter(
        (message) => message.recipientId === userId && message.recipientKind === "user",
      ),
    [getProjectMessages, projectId, userId],
  )

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-start gap-4 space-y-0">
          <Avatar className="size-14">
            <AvatarFallback className="bg-primary/10 text-base font-medium text-primary">
              {getInitials(user.name)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <CardTitle className="text-xl">{user.name}</CardTitle>
              <Badge variant="outline" className="gap-1 capitalize">
                <Shield className="size-3" />
                {directory?.source ?? "Directory"}
              </Badge>
            </div>
            <CardDescription className="mt-1">
              {user.title ? `${user.title} · ` : ""}
              {user.email}
            </CardDescription>
            {directory && (
              <p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
                <RefreshCw className="size-3" />
                Last synced {new Date(directory.lastSyncedAt).toLocaleString()}
              </p>
            )}
          </div>
        </CardHeader>
      </Card>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Building2 className="size-4" />
              Directory profile
            </CardTitle>
            <CardDescription>
              Identity managed in {directory?.source ?? "corporate directory"}. Read-only in RAI.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {directory ? (
              <>
                <ReadOnlyField label="Display name" value={user.name} />
                <ReadOnlyField label="Email" value={user.email} />
                <ReadOnlyField label="User principal name" value={directory.upn} />
                <ReadOnlyField label="Employee ID" value={directory.employeeId} />
                <ReadOnlyField label="Job title" value={user.title ?? "—"} />
                <ReadOnlyField label="Department" value={directory.department} />
                <ReadOnlyField label="Office" value={directory.office} />
                <ReadOnlyField label="AD manager" value={directory.adManagerName} />
                <ReadOnlyField
                  label="Account status"
                  value={directory.accountEnabled ? "Enabled" : "Disabled"}
                />
                <div className="space-y-1 sm:col-span-2">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Security groups
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {directory.groups.map((group) => (
                      <Badge key={group} variant="secondary" className="font-normal">
                        {group}
                      </Badge>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <>
                <ReadOnlyField label="Display name" value={user.name} />
                <ReadOnlyField label="Email" value={user.email} />
                <ReadOnlyField label="Job title" value={user.title ?? "—"} />
                <ReadOnlyField label="Department" value="—" />
                <p className="text-sm text-muted-foreground sm:col-span-2">
                  No directory profile linked. This account may have been created manually.
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <UserRound className="size-4" />
              Project assignment
            </CardTitle>
            <CardDescription>
              Reporting line on this project.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid gap-2">
                <Label>Reports to (org chart)</Label>
                <ReportsToCombobox
                  members={orgChartMembers}
                  excludeId={userId}
                  value={managerId}
                  onValueChange={setManagerId}
                  allowTopLevel={allowTopLevel}
                />
                {managerName && (
                  <p className="text-xs text-muted-foreground">
                    Current manager: {managerName}
                  </p>
                )}
              </div>

              <Separator />

              <div className="flex items-center gap-3">
                <Button type="submit">Save and close</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Mail className="size-4" />
            Inbox on this project
          </CardTitle>
          <CardDescription>
            Tasks assigned to {user.name} and messages directed to them.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-3">
            <p className="flex items-center gap-2 text-sm font-medium">
              <ListTodo className="size-4" />
              Assigned tasks ({inboxTasks.length})
            </p>
            {inboxTasks.length === 0 ? (
              <p className="text-sm text-muted-foreground">No tasks assigned.</p>
            ) : (
              inboxTasks.map((task) => (
                <div key={task.id} className="rounded-lg border border-border px-3 py-2 text-sm">
                  <p className="font-medium">{task.title}</p>
                  <p className="text-xs capitalize text-muted-foreground">
                    {task.status.replace("_", " ")} · updated{" "}
                    {formatRelativeTime(task.updatedAt, clock.simNow)}
                  </p>
                </div>
              ))
            )}
          </div>
          <div className="space-y-3">
            <p className="flex items-center gap-2 text-sm font-medium">
              <Mail className="size-4" />
              Direct messages ({inboxMessages.length})
            </p>
            {inboxMessages.length === 0 ? (
              <p className="text-sm text-muted-foreground">No direct messages.</p>
            ) : (
              inboxMessages.map((message) => (
                <div key={message.id} className="rounded-lg border border-border px-3 py-2 text-sm">
                  <p className="text-xs text-muted-foreground">
                    From {resolveMemberName(message.authorId, users, agents)} ·{" "}
                    {formatRelativeTime(message.createdAt, clock.simNow)}
                  </p>
                  <p className="mt-1">{message.content}</p>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
