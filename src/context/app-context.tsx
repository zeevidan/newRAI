import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react"
import {
  agents as initialAgents,
  configurations as initialConfigurations,
  organizations,
  projects as initialProjects,
  resources as initialResources,
  mockSessionProfiles,
  users as initialUsers,
  vaults as initialVaults,
  type Agent,
  type AgentAvatar,
  type Configuration,
  type EntityStatus,
  type MockSessionProfileKey,
  type Organization,
  type Project,
  type Resource,
  type SessionUser,
  type User,
  type Vault,
} from "@/data/mock"

type CreateType = "project" | "user" | "agent" | "resource" | "vault" | "configuration"

interface AppContextValue {
  sessionUser: SessionUser
  switchSessionUser: (profileKey: MockSessionProfileKey) => void
  organizations: Organization[]
  currentOrg: Organization
  setCurrentOrgId: (id: string) => void
  orgProjects: Project[]
  recentProjects: Project[]
  selectedProjectId: string | null
  setSelectedProjectId: (id: string | null) => void
  selectedProject: Project | null
  projectSearch: string
  setProjectSearch: (value: string) => void
  filteredProjects: Project[]
  users: User[]
  agents: Agent[]
  resources: Resource[]
  vaults: Vault[]
  configurations: Configuration[]
  addProject: (name: string, description: string) => string
  addUser: (input: {
    name: string
    email: string
    role?: string
    title?: string
    managerId?: string | null
    projectId?: string
  }) => string
  addAgent: (input: {
    name: string
    description?: string
    model: string
    status?: EntityStatus
    managerId?: string | null
    projectId?: string
    avatar?: AgentAvatar
  }) => string
  updateUser: (
    id: string,
    input: {
      name?: string
      email?: string
      role?: string
      title?: string
      managerId?: string | null
      projectId?: string
      onProject?: boolean
    },
  ) => void
  updateAgent: (
    id: string,
    input: {
      name?: string
      description?: string
      model?: string
      status?: EntityStatus
      managerId?: string | null
      projectId?: string
      onProject?: boolean
      avatar?: AgentAvatar
    },
  ) => void
  addResource: (name: string, type: Resource["type"]) => void
  addVault: (name: string) => void
  addConfiguration: (key: string, environment: string) => void
}

const AppContext = createContext<AppContextValue | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [currentOrgId, setCurrentOrgId] = useState(organizations[0].id)
  const [sessionUserState, setSessionUserState] = useState<SessionUser>(
    mockSessionProfiles.platformAdmin,
  )
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>("proj-1")
  const [projectSearch, setProjectSearch] = useState("")
  const [projectList, setProjectList] = useState(initialProjects)
  const [userList, setUserList] = useState(initialUsers)
  const [agentList, setAgentList] = useState(initialAgents)
  const [resourceList, setResourceList] = useState(initialResources)
  const [vaultList, setVaultList] = useState(initialVaults)
  const [configList, setConfigList] = useState(initialConfigurations)

  const currentOrg = organizations.find((o) => o.id === currentOrgId) ?? organizations[0]

  const orgProjects = useMemo(
    () =>
      projectList
        .filter((p) => p.orgId === currentOrgId)
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()),
    [projectList, currentOrgId],
  )

  const filteredProjects = useMemo(() => {
    const q = projectSearch.trim().toLowerCase()
    if (!q) return orgProjects
    return orgProjects.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q),
    )
  }, [orgProjects, projectSearch])

  const recentProjects = orgProjects.slice(0, 6)

  const selectedProject =
    orgProjects.find((p) => p.id === selectedProjectId) ?? orgProjects[0] ?? null

  const orgScoped = <T extends { orgId: string }>(items: T[]) =>
    items.filter((item) => item.orgId === currentOrgId)

  const value: AppContextValue = {
    sessionUser: sessionUserState,
    switchSessionUser: (profileKey) => {
      const user = mockSessionProfiles[profileKey]
      setSessionUserState(user)

      if (profileKey === "orgAdmin" && user.orgAdminOrgIds?.[0]) {
        const orgId = user.orgAdminOrgIds[0]
        setCurrentOrgId(orgId)
        const first = projectList.find((p) => p.orgId === orgId)
        setSelectedProjectId(first?.id ?? null)
        return
      }

      if (profileKey === "member") {
        const memberOrg = initialUsers.find((item) => item.id === user.id)?.orgId
        if (memberOrg) {
          setCurrentOrgId(memberOrg)
          const first = projectList.find((p) => p.orgId === memberOrg)
          setSelectedProjectId(first?.id ?? null)
        }
        return
      }

      if (profileKey === "platformAdmin") {
        setCurrentOrgId("org-1")
        const first = projectList.find((p) => p.orgId === "org-1")
        setSelectedProjectId(first?.id ?? null)
      }
    },
    organizations,
    currentOrg,
    setCurrentOrgId: (id) => {
      setCurrentOrgId(id)
      const first = projectList.find((p) => p.orgId === id)
      setSelectedProjectId(first?.id ?? null)
    },
    orgProjects,
    recentProjects,
    selectedProjectId,
    setSelectedProjectId,
    selectedProject,
    projectSearch,
    setProjectSearch,
    filteredProjects,
    users: orgScoped(userList),
    agents: orgScoped(agentList),
    resources: orgScoped(resourceList),
    vaults: orgScoped(vaultList),
    configurations: orgScoped(configList),
    addProject: (name, description) => {
      const project: Project = {
        id: `proj-${Date.now()}`,
        orgId: currentOrgId,
        name,
        description,
        status: "active",
        updatedAt: new Date().toISOString(),
        budgetUsed: 0,
        budgetTotal: 25000,
      }
      setProjectList((prev) => [project, ...prev])
      setSelectedProjectId(project.id)
      return project.id
    },
    addUser: (input) => {
      const id = `u-${Date.now()}`
      setUserList((prev) => [
        ...prev,
        {
          id,
          orgId: currentOrgId,
          name: input.name,
          email: input.email,
          role: input.role ?? "Member",
          title: input.title,
          managerId: input.managerId ?? null,
          projectIds: input.projectId ? [input.projectId] : [],
        },
      ])
      return id
    },
    addAgent: (input) => {
      const id = `a-${Date.now()}`
      setAgentList((prev) => [
        ...prev,
        {
          id,
          orgId: currentOrgId,
          name: input.name,
          description: input.description?.trim() || undefined,
          model: input.model,
          status: input.status ?? "active",
          managerId: input.managerId ?? null,
          projectIds: input.projectId ? [input.projectId] : [],
          avatar: input.avatar,
        },
      ])
      return id
    },
    updateUser: (id, input) => {
      setUserList((prev) =>
        prev.map((user) => {
          if (user.id !== id) return user
          const projectIds = input.projectId
            ? input.onProject
              ? Array.from(new Set([...(user.projectIds ?? []), input.projectId]))
              : (user.projectIds ?? []).filter((pid) => pid !== input.projectId)
            : user.projectIds

          return {
            ...user,
            name: input.name ?? user.name,
            email: input.email ?? user.email,
            role: input.role ?? user.role,
            title: input.title ?? user.title,
            managerId: input.managerId !== undefined ? input.managerId : user.managerId,
            projectIds,
          }
        }),
      )
    },
    updateAgent: (id, input) => {
      setAgentList((prev) =>
        prev.map((agent) => {
          if (agent.id !== id) return agent
          const projectIds = input.projectId
            ? input.onProject
              ? Array.from(new Set([...(agent.projectIds ?? []), input.projectId]))
              : (agent.projectIds ?? []).filter((pid) => pid !== input.projectId)
            : agent.projectIds

          return {
            ...agent,
            name: input.name ?? agent.name,
            description:
              input.description !== undefined
                ? input.description.trim() || undefined
                : agent.description,
            model: input.model ?? agent.model,
            status: input.status ?? agent.status,
            managerId: input.managerId !== undefined ? input.managerId : agent.managerId,
            projectIds,
            avatar: input.avatar !== undefined ? input.avatar : agent.avatar,
          }
        }),
      )
    },
    addResource: (name, type) => {
      setResourceList((prev) => [
        ...prev,
        {
          id: `r-${Date.now()}`,
          orgId: currentOrgId,
          projectId: selectedProject?.id,
          name,
          type,
          size: "—",
        },
      ])
    },
    addVault: (name) => {
      setVaultList((prev) => [
        ...prev,
        { id: `v-${Date.now()}`, orgId: currentOrgId, name, secrets: 0 },
      ])
    },
    addConfiguration: (key, environment) => {
      setConfigList((prev) => [
        ...prev,
        {
          id: `c-${Date.now()}`,
          orgId: currentOrgId,
          projectId: selectedProject?.id,
          key,
          environment,
        },
      ])
    },
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error("useApp must be used within AppProvider")
  return ctx
}

export type { CreateType }
