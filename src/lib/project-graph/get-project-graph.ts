import {
  agentAccessGrants,
  projectFiles,
  projects,
  tools,
  type Agent,
  type AgentAccessGrant,
  type Resource,
  type Tool,
  type User,
  type Vault,
} from "@/data/mock"
import { getOrgLibrarySkills } from "@/data/skills-mock"
import { buildProjectGraph, type BuildProjectGraphInput } from "@/lib/project-graph/build-project-graph"
import type { GraphBuildOptions, ProjectGraph } from "@/lib/project-graph/types"

export function getProjectAccessGrants(
  projectId: string,
  grants: AgentAccessGrant[] = agentAccessGrants,
) {
  return grants.filter((grant) => grant.projectId === projectId)
}

export function createProjectGraphInput(
  projectId: string,
  ctx: {
    users: User[]
    agents: Agent[]
    vaults: Vault[]
    resources: Resource[]
    grants?: AgentAccessGrant[]
    toolList?: Tool[]
  },
  options?: GraphBuildOptions,
): BuildProjectGraphInput | null {
  const project = projects.find((item) => item.id === projectId)
  if (!project) return null

  return {
    project,
    users: ctx.users,
    agents: ctx.agents,
    vaults: ctx.vaults,
    resources: ctx.resources,
    files: projectFiles,
    skills: getOrgLibrarySkills(project.orgId),
    tools: ctx.toolList ?? tools,
    grants: ctx.grants ?? agentAccessGrants,
    options,
  }
}

export function getProjectGraph(
  projectId: string,
  ctx: {
    users: User[]
    agents: Agent[]
    vaults: Vault[]
    resources: Resource[]
    grants?: AgentAccessGrant[]
    toolList?: Tool[]
  },
  options?: GraphBuildOptions,
): ProjectGraph | null {
  const input = createProjectGraphInput(projectId, ctx, options)
  if (!input) return null
  return buildProjectGraph(input)
}
