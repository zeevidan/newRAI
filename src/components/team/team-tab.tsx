import { useEffect, useMemo, useRef, useState } from "react"
import {
  Bot,
  GitBranch,
  List,
  Maximize2,
  Minimize2,
  Scan,
  UserPlus,
} from "lucide-react"
import { useApp } from "@/context/app-context"
import {
  buildProjectOrgChart,
  getProjectAgents,
  getProjectUsers,
  type OrgChartMemberKind,
} from "@/data/mock"
import { OrgChart, type OrgChartHandle } from "@/components/team/org-chart"
import { TeamMemberList } from "@/components/team/team-member-list"
import {
  TeamMemberSheet,
  type TeamSheetState,
} from "@/components/team/team-member-sheet"
import { TeamBreadcrumbs } from "@/components/team/team-breadcrumbs"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { cn } from "@/lib/utils"

type TeamDisplayMode = "chart" | "list"

interface TeamTabProps {
  projectId: string
  projectName: string
  isActive: boolean
  onBackToProject: () => void
}

export function TeamTab({
  projectId,
  projectName,
  isActive,
  onBackToProject,
}: TeamTabProps) {
  const { users, agents } = useApp()
  const chartRef = useRef<OrgChartHandle>(null)
  const [displayMode, setDisplayMode] = useState<TeamDisplayMode>("chart")
  const [sheetState, setSheetState] = useState<TeamSheetState>({ open: false })

  const projectUsers = useMemo(
    () => getProjectUsers(projectId, users),
    [projectId, users],
  )
  const projectAgents = useMemo(
    () => getProjectAgents(projectId, agents),
    [projectId, agents],
  )
  const orgChartMembers = useMemo(
    () => buildProjectOrgChart(projectId, users, agents),
    [projectId, users, agents],
  )

  const memberCount = projectUsers.length + projectAgents.length
  const chartRootId =
    orgChartMembers.find((member) => !member.managerId)?.id ?? null

  useEffect(() => {
    if (!isActive) {
      setSheetState({ open: false })
      setDisplayMode("chart")
    }
  }, [isActive])

  const closeSheet = () => setSheetState({ open: false })

  const openDetail = (kind: OrgChartMemberKind, id: string) => {
    setSheetState({ open: true, mode: "detail", kind, id })
  }

  const openCreate = (kind: OrgChartMemberKind, managerId?: string | null) => {
    setSheetState({
      open: true,
      mode: "create",
      kind,
      managerId: managerId ?? chartRootId,
    })
  }

  const breadcrumbSegments = [{ label: "Team" }]

  return (
    <div className="space-y-4">
      <TeamBreadcrumbs
        projectName={projectName}
        onProjectClick={() => {
          closeSheet()
          onBackToProject()
        }}
        segments={breadcrumbSegments}
      />

      <Card className="gap-0 overflow-hidden py-0">
        <CardHeader className="flex flex-col gap-4 border-b border-border/60 bg-muted/30 px-4 py-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle>Team</CardTitle>
            <CardDescription>
              {memberCount} {memberCount === 1 ? "member" : "members"} on this
              project · switch between org chart and list
            </CardDescription>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex rounded-lg border border-border bg-background p-0.5">
              <Button
                type="button"
                variant={displayMode === "chart" ? "secondary" : "ghost"}
                size="sm"
                className="gap-1.5"
                onClick={() => setDisplayMode("chart")}
              >
                <GitBranch className="size-3.5" />
                Org chart
              </Button>
              <Button
                type="button"
                variant={displayMode === "list" ? "secondary" : "ghost"}
                size="sm"
                className="gap-1.5"
                onClick={() => setDisplayMode("list")}
              >
                <List className="size-3.5" />
                List
              </Button>
            </div>

            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={() => openCreate("user")}
            >
              <UserPlus className="size-3.5" />
              Add person
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={() => openCreate("agent")}
            >
              <Bot className="size-3.5" />
              Add agent
            </Button>

            {displayMode === "chart" && orgChartMembers.length > 0 && (
              <>
                <Button
                  variant="outline"
                  size="icon-sm"
                  onClick={() => chartRef.current?.fit()}
                  title="Fit to screen"
                >
                  <Scan className="size-3.5" />
                </Button>
                <Button
                  variant="outline"
                  size="icon-sm"
                  onClick={() => chartRef.current?.expandAll()}
                  title="Expand all"
                >
                  <Maximize2 className="size-3.5" />
                </Button>
                <Button
                  variant="outline"
                  size="icon-sm"
                  onClick={() => chartRef.current?.collapseAll()}
                  title="Collapse all"
                >
                  <Minimize2 className="size-3.5" />
                </Button>
              </>
            )}
          </div>
        </CardHeader>

        <CardContent className={cn("p-0", displayMode === "list" && "pb-0")}>
          {displayMode === "chart" ? (
            <OrgChart
              ref={chartRef}
              variant="content"
              members={orgChartMembers}
              projectId={projectId}
              onSelectMember={openDetail}
              onCreateMember={openCreate}
            />
          ) : (
            <TeamMemberList
              users={projectUsers}
              agents={projectAgents}
              onSelectMember={openDetail}
            />
          )}
        </CardContent>
      </Card>

      <TeamMemberSheet
        state={sheetState}
        projectId={projectId}
        projectName={projectName}
        orgChartMembers={orgChartMembers}
        onOpenChange={(open) => !open && closeSheet()}
        onBackToProject={() => {
          closeSheet()
          onBackToProject()
        }}
        onCloseTeamContext={closeSheet}
        onCreated={(kind, id) => setSheetState({ open: true, mode: "detail", kind, id })}
      />
    </div>
  )
}
