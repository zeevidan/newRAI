import { useApp } from "@/context/app-context"
import {
  getOrgPolicies,
  organizations,
  platformConfigurations,
  users as allUsers,
} from "@/data/mock"
import { canAccessPlatformAdmin } from "@/lib/auth"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"

function AdminPage({
  title,
  description,
  children,
}: {
  title: string
  description: string
  children: React.ReactNode
}) {
  return (
    <ScrollArea className="min-h-0 flex-1">
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        </div>
        {children}
      </div>
    </ScrollArea>
  )
}

export function AdminOverviewPage() {
  const { currentOrg, users, vaults, orgProjects, sessionUser } = useApp()
  const isPlatformAdmin = canAccessPlatformAdmin(sessionUser)

  return (
    <AdminPage
      title="Admin overview"
      description={`Managing ${currentOrg.name}.`}
    >
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Users</CardDescription>
            <CardTitle className="text-2xl">{users.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Projects</CardDescription>
            <CardTitle className="text-2xl">{orgProjects.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Vaults</CardDescription>
            <CardTitle className="text-2xl">{vaults.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Policies</CardDescription>
            <CardTitle className="text-2xl">
              {getOrgPolicies(currentOrg.id).length}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>
      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="text-base">Signed in as</CardTitle>
        </CardHeader>
        <CardContent className="text-sm">
          {sessionUser.name} · {isPlatformAdmin ? "Platform admin" : "Org admin"} ·{" "}
          {currentOrg.name}
        </CardContent>
      </Card>
    </AdminPage>
  )
}

export function AdminUsersPage() {
  const { users, currentOrg } = useApp()

  return (
    <AdminPage
      title="Users"
      description={`Users in ${currentOrg.name}.`}
    >
      <Card>
        <CardContent className="divide-y divide-border p-0">
          {users.length === 0 ? (
            <p className="px-4 py-6 text-sm text-muted-foreground">No users in this org.</p>
          ) : (
            users.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between gap-4 px-4 py-3 text-sm"
              >
                <div className="min-w-0">
                  <p className="font-medium">{user.name}</p>
                  <p className="truncate text-muted-foreground">{user.email}</p>
                </div>
                <Badge variant="secondary">{user.role}</Badge>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </AdminPage>
  )
}

export function AdminSettingsPage() {
  const { currentOrg } = useApp()
  const orgRecord = organizations.find((org) => org.id === currentOrg.id)

  return (
    <AdminPage
      title="Organization settings"
      description={`Configure ${currentOrg.name}.`}
    >
      <Card>
        <CardHeader>
          <CardTitle className="text-base">General</CardTitle>
          <CardDescription>Organization identity and plan.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Name
            </p>
            <p className="text-sm">{orgRecord?.name}</p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Slug
            </p>
            <p className="text-sm">{orgRecord?.slug}</p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Plan
            </p>
            <p className="text-sm">{orgRecord?.plan}</p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Total users
            </p>
            <p className="text-sm">
              {allUsers.filter((user) => user.orgId === currentOrg.id).length}
            </p>
          </div>
        </CardContent>
      </Card>
    </AdminPage>
  )
}

export function AdminVaultsPage() {
  const { vaults, currentOrg } = useApp()

  return (
    <AdminPage
      title="Vaults"
      description={`Secret vaults for ${currentOrg.name}.`}
    >
      <Card>
        <CardContent className="space-y-3 p-4">
          {vaults.length === 0 ? (
            <p className="text-sm text-muted-foreground">No vaults configured.</p>
          ) : (
            vaults.map((vault) => (
              <div
                key={vault.id}
                className="flex flex-col gap-2 rounded-lg border border-border px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-medium">{vault.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {vault.description ?? `${vault.secrets} secrets`}
                  </p>
                </div>
                <Badge variant="outline">{vault.secrets} secrets</Badge>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </AdminPage>
  )
}

export function AdminPoliciesPage() {
  const { currentOrg } = useApp()
  const orgPolicies = getOrgPolicies(currentOrg.id)

  return (
    <AdminPage
      title="Policies"
      description={`Policies for ${currentOrg.name}.`}
    >
      <Card>
        <CardContent className="space-y-3 p-4">
          {orgPolicies.length === 0 ? (
            <p className="text-sm text-muted-foreground">No policies defined.</p>
          ) : (
            orgPolicies.map((policy) => (
              <div
                key={policy.id}
                className="flex flex-col gap-2 rounded-lg border border-border px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-medium">{policy.name}</p>
                  <p className="text-sm text-muted-foreground">{policy.description}</p>
                </div>
                <Badge variant={policy.status === "active" ? "default" : "outline"}>
                  {policy.status}
                </Badge>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </AdminPage>
  )
}

export function AdminOrganizationsPage() {
  const { currentOrg, setCurrentOrgId } = useApp()

  return (
    <AdminPage
      title="Organizations"
      description="View and manage all organizations on the platform."
    >
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle className="text-base">All organizations</CardTitle>
            <CardDescription>Select an org to manage it in the admin views.</CardDescription>
          </div>
          <Button variant="outline" size="sm" disabled>
            Add organization
          </Button>
        </CardHeader>
        <CardContent className="divide-y divide-border p-0">
          {organizations.map((org) => (
            <button
              key={org.id}
              type="button"
              onClick={() => setCurrentOrgId(org.id)}
              className="flex w-full items-center justify-between px-4 py-3 text-left text-sm transition-colors hover:bg-muted/50"
            >
              <div>
                <p className="font-medium">{org.name}</p>
                <p className="text-muted-foreground">{org.slug}</p>
              </div>
              <div className="flex items-center gap-2">
                {org.id === currentOrg.id && (
                  <Badge variant="default">Active</Badge>
                )}
                <Badge variant="outline">{org.plan}</Badge>
              </div>
            </button>
          ))}
        </CardContent>
      </Card>
    </AdminPage>
  )
}

export function AdminPlatformConfigurationsPage() {
  return (
    <AdminPage
      title="Platform configurations"
      description="Global settings that apply across the entire platform."
    >
      <Card>
        <CardContent className="space-y-3 p-4">
          {platformConfigurations.map((config) => (
            <div
              key={config.id}
              className="flex flex-col gap-2 rounded-lg border border-border px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <code className="font-mono text-sm text-primary">{config.key}</code>
                {config.description && (
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {config.description}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="font-mono">{config.value}</span>
                <Badge variant="outline">{config.environment}</Badge>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </AdminPage>
  )
}
