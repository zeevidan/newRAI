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
  users as initialUsers,
  vaults as initialVaults,
  type Agent,
  type Configuration,
  type Organization,
  type Project,
  type Resource,
  type User,
  type Vault,
} from "@/data/mock"

type CreateType = "project" | "user" | "agent" | "resource" | "vault" | "configuration"

interface AppContextValue {
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
  addProject: (name: string, description: string) => void
  addUser: (name: string, email: string, role: string) => void
  addAgent: (name: string, model: string) => void
  addResource: (name: string, type: Resource["type"]) => void
  addVault: (name: string) => void
  addConfiguration: (key: string, environment: string) => void
}

const AppContext = createContext<AppContextValue | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [currentOrgId, setCurrentOrgId] = useState(organizations[0].id)
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
    organizations,
    currentOrg,
    setCurrentOrgId: (id) => {
      setCurrentOrgId(id)
      const first = projectList.find((p) => p.orgId === id)
      setSelectedProjectId(first?.id ?? null)
    },
    orgProjects,
    recentProjects,
    selectedProjectId: selectedProject?.id ?? null,
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
    },
    addUser: (name, email, role) => {
      setUserList((prev) => [
        ...prev,
        { id: `u-${Date.now()}`, orgId: currentOrgId, name, email, role },
      ])
    },
    addAgent: (name, model) => {
      setAgentList((prev) => [
        ...prev,
        { id: `a-${Date.now()}`, orgId: currentOrgId, name, model, status: "active" },
      ])
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
