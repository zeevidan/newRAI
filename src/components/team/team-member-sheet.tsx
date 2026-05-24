import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  resolveMemberName,
  type OrgChartMember,
  type OrgChartMemberKind,
} from "@/data/mock"
import { useApp } from "@/context/app-context"
import { AgentDetailPane } from "@/components/team/agent-detail-pane"
import { PersonDetailPane } from "@/components/team/person-detail-pane"
import { TeamMemberCreatePane } from "@/components/team/team-member-create-pane"
import { TeamBreadcrumbs } from "@/components/team/team-breadcrumbs"

export type TeamSheetState =
  | { open: false }
  | { open: true; mode: "detail"; kind: OrgChartMemberKind; id: string }
  | {
      open: true
      mode: "create"
      kind: OrgChartMemberKind
      managerId?: string | null
    }

interface TeamMemberSheetProps {
  state: TeamSheetState
  projectId: string
  projectName: string
  orgChartMembers: OrgChartMember[]
  onOpenChange: (open: boolean) => void
  onBackToProject: () => void
  onCloseTeamContext: () => void
  onCreated: (kind: OrgChartMemberKind, id: string) => void
}

export function TeamMemberSheet({
  state,
  projectId,
  projectName,
  orgChartMembers,
  onOpenChange,
  onBackToProject,
  onCloseTeamContext,
  onCreated,
}: TeamMemberSheetProps) {
  const { users, agents } = useApp()
  const isOpen = state.open

  const title = (() => {
    if (!state.open) return ""
    if (state.mode === "create") {
      return state.kind === "agent" ? "Add agent" : "Add person"
    }
    return resolveMemberName(state.id, users, agents) ?? "Member details"
  })()

  const description =
    state.open && state.mode === "create"
      ? state.kind === "agent"
        ? "Configure a new AI agent for this project."
        : "Add someone from your corporate directory."
      : "View and manage team member details."

  const breadcrumbSegments = (() => {
    if (!state.open) return [{ label: "Team" }]
    if (state.mode === "create") {
      return [
        { label: "Team", onClick: onCloseTeamContext },
        { label: state.kind === "agent" ? "Add agent" : "Add person" },
      ]
    }
    return [
      { label: "Team", onClick: onCloseTeamContext },
      { label: title },
    ]
  })()

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        size="wide"
        className="flex flex-col gap-0 overflow-hidden p-0"
      >
        <SheetHeader className="shrink-0 space-y-3 border-b border-border px-4 py-4 text-left">
          <TeamBreadcrumbs
            className="mb-0"
            projectName={projectName}
            onProjectClick={onBackToProject}
            segments={breadcrumbSegments}
          />
          <div>
            <SheetTitle>{title}</SheetTitle>
            <SheetDescription>{description}</SheetDescription>
          </div>
        </SheetHeader>

        <div className="min-h-0 flex-1 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="p-6 pb-8">
              {state.open && state.mode === "create" && (
                <TeamMemberCreatePane
                  embedded
                  kind={state.kind}
                  projectId={projectId}
                  managerId={state.managerId}
                  orgChartMembers={orgChartMembers}
                  onCancel={onCloseTeamContext}
                  onCreated={onCreated}
                />
              )}
              {state.open && state.mode === "detail" && state.kind === "user" && (
                <PersonDetailPane
                  userId={state.id}
                  projectId={projectId}
                  orgChartMembers={orgChartMembers}
                />
              )}
              {state.open && state.mode === "detail" && state.kind === "agent" && (
                <AgentDetailPane
                  agentId={state.id}
                  projectId={projectId}
                  orgChartMembers={orgChartMembers}
                />
              )}
            </div>
          </ScrollArea>
        </div>
      </SheetContent>
    </Sheet>
  )
}
