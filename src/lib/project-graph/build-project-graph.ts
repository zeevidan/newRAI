import type { SkillRecord } from "@/data/skills-mock"
import type {
  Agent,
  AgentAccessGrant,
  Project,
  ProjectFileNode,
  Resource,
  Tool,
  User,
  Vault,
} from "@/data/mock"
import {
  getProjectAgents,
  getProjectIntegrations,
  getProjectUsers,
  getProjectVaults,
} from "@/data/mock"
import type { GraphBuildOptions, GraphEdge, GraphNode, ProjectGraph } from "@/lib/project-graph/types"
import { graphNodeId } from "@/lib/project-graph/types"
import {
  applyWorkspaceAccessRules,
  folderNodeId,
  workspaceNodeId,
} from "@/lib/project-graph/rules/workspace-access"

export interface BuildProjectGraphInput {
  project: Project
  users: User[]
  agents: Agent[]
  vaults: Vault[]
  resources: Resource[]
  files: ProjectFileNode[]
  skills: SkillRecord[]
  tools: Tool[]
  grants: AgentAccessGrant[]
  options?: GraphBuildOptions
}

function edgeId(kind: string, source: string, target: string) {
  return `${kind}:${source}->${target}`
}

function grantForAgent(
  grants: AgentAccessGrant[],
  agentId: string,
  projectId: string,
) {
  return grants.find(
    (grant) => grant.agentId === agentId && grant.projectId === projectId,
  )
}

function ensureNode(nodes: GraphNode[], node: GraphNode) {
  if (!nodes.some((item) => item.id === node.id)) {
    nodes.push(node)
  }
}

export function buildProjectGraph(input: BuildProjectGraphInput): ProjectGraph {
  const {
    project,
    users,
    agents,
    vaults,
    resources,
    files,
    skills,
    tools,
    grants,
    options = {},
  } = input

  const { showUnusedResources = false } = options
  const projectId = project.id

  const projectUsers = getProjectUsers(projectId, users)
  const projectAgents = getProjectAgents(projectId, agents)
  const projectVaults = getProjectVaults(projectId, vaults)
  const projectIntegrations = getProjectIntegrations(projectId, resources)
  const orgTools = tools.filter((tool) => tool.orgId === project.orgId)

  const nodes: GraphNode[] = []
  const edges: GraphEdge[] = []

  for (const user of projectUsers) {
    const id = graphNodeId("person", user.id)
    nodes.push({
      id,
      kind: "person",
      label: user.name,
      subtitle: user.title ?? user.role,
      entityId: user.id,
      group: "team",
    })
  }

  for (const agent of projectAgents) {
    const id = graphNodeId("agent", agent.id)
    nodes.push({
      id,
      kind: "agent",
      label: agent.name,
      subtitle: agent.model,
      entityId: agent.id,
      group: "team",
      metadata: { status: agent.status },
    })
  }

  for (const user of projectUsers) {
    if (!user.managerId) continue
    const source = graphNodeId("person", user.id)
    const managerUser = projectUsers.find((item) => item.id === user.managerId)
    const managerAgent = projectAgents.find((item) => item.id === user.managerId)
    const target = managerUser
      ? graphNodeId("person", managerUser.id)
      : managerAgent
        ? graphNodeId("agent", managerAgent.id)
        : null
    if (target && nodes.some((node) => node.id === target)) {
      edges.push({
        id: edgeId("reports_to", source, target),
        kind: "reports_to",
        source,
        target,
      })
    }
  }
  for (const agent of projectAgents) {
    if (!agent.managerId) continue
    const source = graphNodeId("agent", agent.id)
    const managerUser = projectUsers.find((item) => item.id === agent.managerId)
    const managerAgent = projectAgents.find((item) => item.id === agent.managerId)
    const target = managerUser
      ? graphNodeId("person", managerUser.id)
      : managerAgent
        ? graphNodeId("agent", managerAgent.id)
        : null
    if (target && nodes.some((node) => node.id === target)) {
      edges.push({
        id: edgeId("reports_to", source, target),
        kind: "reports_to",
        source,
        target,
      })
    }
  }

  const workspaceId = workspaceNodeId(projectId)

  const folderNodesAdded = new Set<string>()

  for (const agent of projectAgents) {
    const agentNodeId = graphNodeId("agent", agent.id)
    const grant = grantForAgent(grants, agent.id, projectId)
    if (!grant) continue

    const folderIds = grant.workspaceFolderIds ?? []
    if (folderIds.length > 0) {
      for (const folderId of folderIds) {
        const folder = files.find(
          (file) =>
            file.id === folderId &&
            file.projectId === projectId &&
            file.kind === "folder",
        )
        if (!folder) continue

        const folderNode = folderNodeId(folderId)
        if (!folderNodesAdded.has(folderNode)) {
          folderNodesAdded.add(folderNode)
          nodes.push({
            id: folderNode,
            kind: "folder",
            label: folder.name,
            subtitle: "Scoped folder",
            entityId: folderId,
            group: "resources",
          })
        }

        edges.push({
          id: edgeId("accesses", agentNodeId, folderNode),
          kind: "accesses",
          source: agentNodeId,
          target: folderNode,
        })
      }
    } else {
      ensureNode(nodes, {
        id: workspaceId,
        kind: "workspace",
        label: "Workspace",
        subtitle: "Project file system",
        entityId: projectId,
        group: "resources",
        abstract: true,
      })
      edges.push({
        id: edgeId("accesses", agentNodeId, workspaceId),
        kind: "accesses",
        source: agentNodeId,
        target: workspaceId,
      })
    }

    const vaultTargets =
      grant.vaultIds === undefined
        ? projectVaults.map((vault) => vault.id)
        : grant.vaultIds

    for (const vaultId of vaultTargets) {
      const vault = projectVaults.find((item) => item.id === vaultId)
      if (!vault) continue
      const target = graphNodeId("vault", vaultId)
      ensureNode(nodes, {
        id: target,
        kind: "vault",
        label: vault.name,
        subtitle: `${vault.secrets} secrets`,
        entityId: vault.id,
        group: "resources",
      })
      edges.push({
        id: edgeId("accesses", agentNodeId, target),
        kind: "accesses",
        source: agentNodeId,
        target,
      })
    }

    const integrationTargets =
      grant.integrationIds === undefined
        ? projectIntegrations.map((item) => item.id)
        : grant.integrationIds

    for (const integrationId of integrationTargets) {
      const integration = projectIntegrations.find((item) => item.id === integrationId)
      if (!integration) continue
      const target = graphNodeId("integration", integrationId)
      ensureNode(nodes, {
        id: target,
        kind: "integration",
        label: integration.name,
        subtitle: integration.provider ?? integration.type,
        entityId: integration.id,
        group: "resources",
        metadata: { status: integration.status },
      })
      edges.push({
        id: edgeId("accesses", agentNodeId, target),
        kind: "accesses",
        source: agentNodeId,
        target,
      })
    }

    for (const skillId of grant.skillIds ?? []) {
      const skill = skills.find((item) => item.id === skillId)
      if (!skill) continue
      const target = graphNodeId("skill", skillId)
      ensureNode(nodes, {
        id: target,
        kind: "skill",
        label: skill.metadata.name,
        subtitle: skill.category,
        entityId: skill.id,
        group: "capabilities",
      })
      edges.push({
        id: edgeId("uses", agentNodeId, target),
        kind: "uses",
        source: agentNodeId,
        target,
      })
    }

    for (const toolId of grant.toolIds ?? []) {
      const tool = orgTools.find((item) => item.id === toolId)
      if (!tool) continue
      const target = graphNodeId("tool", toolId)
      ensureNode(nodes, {
        id: target,
        kind: "tool",
        label: tool.name,
        subtitle: tool.type,
        entityId: tool.id,
        group: "capabilities",
      })
      edges.push({
        id: edgeId("uses", agentNodeId, target),
        kind: "uses",
        source: agentNodeId,
        target,
      })
    }
  }

  let result = applyWorkspaceAccessRules(nodes, edges)

  if (!showUnusedResources) {
    const connected = new Set<string>()
    for (const edge of result.edges) {
      connected.add(edge.source)
      connected.add(edge.target)
    }
    result = {
      ...result,
      nodes: result.nodes.filter(
        (node) =>
          node.kind === "person" ||
          node.kind === "agent" ||
          connected.has(node.id),
      ),
    }
  }

  return {
    projectId,
    nodes: result.nodes,
    edges: result.edges,
  }
}

export function filterProjectGraph(
  graph: ProjectGraph,
  filters: import("@/lib/project-graph/types").GraphNodeFilter[],
): ProjectGraph {
  const allowedKinds = new Set<GraphNode["kind"]>()

  if (filters.includes("people")) allowedKinds.add("person")
  if (filters.includes("agents")) allowedKinds.add("agent")
  if (filters.includes("skills")) allowedKinds.add("skill")
  if (filters.includes("tools")) allowedKinds.add("tool")
  if (filters.includes("vaults")) allowedKinds.add("vault")
  if (filters.includes("integrations")) allowedKinds.add("integration")
  if (filters.includes("workspace")) {
    allowedKinds.add("workspace")
    allowedKinds.add("folder")
  }

  const nodes = graph.nodes.filter((node) => allowedKinds.has(node.kind))
  const nodeIds = new Set(nodes.map((node) => node.id))
  const edges = graph.edges.filter(
    (edge) => nodeIds.has(edge.source) && nodeIds.has(edge.target),
  )

  return { ...graph, nodes, edges }
}
