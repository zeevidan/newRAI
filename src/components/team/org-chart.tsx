import { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef } from "react"
import { OrgChart as D3OrgChart } from "d3-org-chart"
import { select } from "d3"
import { Bot, Maximize2, Minimize2, Plus, Scan, UserPlus } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import type { OrgChartMember, OrgChartMemberKind } from "@/data/mock"
import { cn } from "@/lib/utils"

const BRAND = "#0049FF"

interface ChartDatum {
  id: string
  parentId: string
  name: string
  title: string
  role: string
  email: string
  initials: string
  kind: "user" | "agent"
  model?: string
  status?: string
  _expanded?: boolean
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()
}

function agentInitials(name: string) {
  if (name.length <= 2) return name.toUpperCase()
  return name.slice(0, 2).toUpperCase()
}

function getChartRootId(members: OrgChartMember[], excludeId?: string): string | null {
  const root = members.find(
    (member) => !member.managerId && member.id !== excludeId,
  )
  return root?.id ?? null
}

function membersToChartData(members: OrgChartMember[]): ChartDatum[] {
  const data = members.map((member) => ({
    id: member.id,
    parentId: member.managerId ?? "",
    name: member.name,
    title: member.title,
    role: member.role,
    email: member.email ?? "",
    initials: member.kind === "agent" ? agentInitials(member.name) : getInitials(member.name),
    kind: member.kind,
    model: member.model,
    status: member.status,
    _expanded: true,
  }))

  const roots = data.filter((node) => !node.parentId)
  if (roots.length <= 1) return data

  const primaryRootId = roots[0].id
  return data.map((node) =>
    !node.parentId && node.id !== primaryRootId
      ? { ...node, parentId: primaryRootId }
      : node,
  )
}

function renderNodeContent(node: {
  data: ChartDatum
  width: number
  height: number
  depth: number
}) {
  const { data, width, height, depth } = node
  const isRoot = depth === 0
  const isAgent = data.kind === "agent"
  const isPaused = data.status === "paused"

  const avatarBg = isAgent
    ? isPaused
      ? "#94a3b8"
      : "#6366f1"
    : isRoot
      ? BRAND
      : "rgba(0,73,255,0.1)"
  const avatarColor = isAgent || isRoot ? "#ffffff" : BRAND
  const badgeBg = isAgent
    ? isPaused
      ? "rgba(148,163,184,0.2)"
      : "rgba(99,102,241,0.12)"
    : isRoot
      ? BRAND
      : "rgba(0,73,255,0.08)"
  const badgeColor = isAgent
    ? isPaused
      ? "#64748b"
      : "#6366f1"
    : isRoot
      ? "#ffffff"
      : BRAND

  return `
    <div style="width:${width}px;height:${height}px;display:flex;align-items:center;justify-content:center;font-family:'Geist Variable',system-ui,sans-serif;cursor:pointer;">
      <div style="
        width:${width - 10}px;
        background:#ffffff;
        border-radius:12px;
        border:1px solid ${isAgent ? "rgba(99,102,241,0.35)" : isRoot ? "rgba(0,73,255,0.35)" : "rgba(15,23,42,0.1)"};
        border-style:${isAgent ? "dashed" : "solid"};
        box-shadow:0 1px 2px rgba(15,23,42,0.06), 0 4px 12px rgba(15,23,42,0.04);
        padding:14px 12px 12px;
        text-align:center;
        cursor:pointer;
        ${isRoot ? "box-shadow:0 0 0 2px rgba(0,73,255,0.12), 0 4px 16px rgba(0,73,255,0.12);" : ""}
        ${isPaused ? "opacity:0.72;" : ""}
      ">
        <div style="
          width:42px;height:42px;border-radius:999px;
          background:${avatarBg};
          color:${avatarColor};
          display:flex;align-items:center;justify-content:center;
          margin:0 auto 10px;font-weight:600;font-size:${isAgent ? "11px" : "13px"};
          ${isRoot && !isAgent ? "box-shadow:0 0 0 3px rgba(0,73,255,0.15);" : ""}
        ">${data.initials}</div>
        <div style="font-size:13px;font-weight:600;color:#0f172a;line-height:1.2;margin-bottom:3px;">${data.name}</div>
        <div style="font-size:11px;color:#64748b;line-height:1.3;margin-bottom:8px;">${data.title}</div>
        <div style="
          display:inline-block;padding:2px 8px;border-radius:6px;
          background:${badgeBg};
          color:${badgeColor};
          font-size:10px;font-weight:500;letter-spacing:0.02em;text-transform:capitalize;
        ">${isAgent ? data.title : data.role}</div>
        ${isAgent && data.model ? `<div style="font-size:10px;color:#94a3b8;margin-top:6px;">${data.model}</div>` : ""}
      </div>
    </div>
  `
}

function createChart(
  container: HTMLElement,
  data: ChartDatum[],
  onNodeClick: (node: { data: ChartDatum }) => void,
) {
  const chart = new D3OrgChart<ChartDatum>()
    .container(container)
    .data(data)
    .nodeWidth(() => 220)
    .nodeHeight((node) => (node.data.kind === "agent" ? 148 : 130))
    .childrenMargin(() => 56)
    .neighbourMargin(() => 28)
    .compact(false)
    .initialExpandLevel(10)
    .svgHeight(560)
    .duration(400)
    .nodeContent((node) => renderNodeContent(node as typeof node & { data: ChartDatum }))
    .linkUpdate(function () {
      select(this)
        .attr("stroke", BRAND)
        .attr("stroke-width", 1.5)
        .attr("stroke-opacity", 0.22)
        .attr("fill", "none")
    })
    .onNodeClick((node) => onNodeClick(node as unknown as { data: ChartDatum }))
    .render()

  chart.expandAll()
  return chart
}

export interface OrgChartHandle {
  fit: () => void
  expandAll: () => void
  collapseAll: () => void
}

interface OrgChartProps {
  members: OrgChartMember[]
  projectId: string | null
  className?: string
  variant?: "card" | "content"
  onSelectMember: (kind: OrgChartMemberKind, id: string) => void
  onCreateMember: (kind: OrgChartMemberKind, managerId?: string | null) => void
}

export const OrgChart = forwardRef<OrgChartHandle, OrgChartProps>(function OrgChart(
  {
    members,
    projectId: _projectId,
    className,
    variant = "card",
    onSelectMember,
    onCreateMember,
  },
  ref,
) {
  const containerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<D3OrgChart<ChartDatum> | null>(null)
  const chartData = useMemo(() => membersToChartData(members), [members])

  const chartRootId = useMemo(() => getChartRootId(members), [members])

  const handleNodeClick = useCallback(
    (node: { data: ChartDatum }) => {
      onSelectMember(node.data.kind, node.data.id)
    },
    [onSelectMember],
  )

  const openCreate = (kind: OrgChartMemberKind, managerId?: string | null) => {
    onCreateMember(kind, managerId ?? chartRootId)
  }

  useEffect(() => {
    const container = containerRef.current
    if (!container || chartData.length === 0) return

    container.innerHTML = ""
    const chart = createChart(container, chartData, handleNodeClick)
    chartRef.current = chart
    chart.fit({ animate: false, scale: true })

    return () => {
      container.innerHTML = ""
      chartRef.current = null
    }
  }, [chartData, handleNodeClick])

  const runChartAction = useCallback((action: "fit" | "expand" | "collapse") => {
    const chart = chartRef.current
    if (!chart) return
    if (action === "fit") chart.fit({ animate: true, scale: true })
    if (action === "expand") chart.expandAll()
    if (action === "collapse") chart.collapseAll()
  }, [])

  useImperativeHandle(ref, () => ({
    fit: () => runChartAction("fit"),
    expandAll: () => runChartAction("expand"),
    collapseAll: () => runChartAction("collapse"),
  }))

  const userCount = members.filter((member) => member.kind === "user").length
  const agentCount = members.filter((member) => member.kind === "agent").length

  const chartBody =
    members.length === 0 ? (
      <div className="flex flex-col items-center justify-center gap-3 px-4 py-16 text-center">
        <p className="text-sm text-muted-foreground">
          No team members on this project yet. Add a person or agent to build the org chart.
        </p>
        <div className="flex gap-2">
          <Button size="sm" className="gap-1.5" onClick={() => openCreate("user")}>
            <Plus className="size-4" />
            Add person
          </Button>
          <Button size="sm" variant="outline" className="gap-1.5" onClick={() => openCreate("agent")}>
            <Plus className="size-4" />
            Add agent
          </Button>
        </div>
      </div>
    ) : (
      <div
        ref={containerRef}
        className="rai-org-chart h-[560px] w-full overflow-hidden bg-[linear-gradient(180deg,rgba(0,73,255,0.03)_0%,transparent_40%)]"
      />
    )

  if (variant === "content") {
    return chartBody
  }

  const headerActions = (
    <div className="flex shrink-0 flex-wrap items-center gap-1">
      <Button variant="outline" size="sm" className="gap-1.5" onClick={() => openCreate("user")}>
        <UserPlus className="size-3.5" />
        Add person
      </Button>
      <Button variant="outline" size="sm" className="gap-1.5" onClick={() => openCreate("agent")}>
        <Bot className="size-3.5" />
        Add agent
      </Button>
      {members.length > 0 && (
        <>
          <Button
            variant="outline"
            size="icon-sm"
            onClick={() => runChartAction("fit")}
            title="Fit to screen"
          >
            <Scan className="size-3.5" />
          </Button>
          <Button
            variant="outline"
            size="icon-sm"
            onClick={() => runChartAction("expand")}
            title="Expand all"
          >
            <Maximize2 className="size-3.5" />
          </Button>
          <Button
            variant="outline"
            size="icon-sm"
            onClick={() => runChartAction("collapse")}
            title="Collapse all"
          >
            <Minimize2 className="size-3.5" />
          </Button>
        </>
      )}
    </div>
  )

  if (members.length === 0) {
    return (
      <Card className={className}>
        <CardHeader className="flex flex-row items-start justify-between gap-4 border-b border-border/60 bg-muted/30 px-4 py-4">
          <div>
            <CardTitle>Organization chart</CardTitle>
            <CardDescription>People and agents on this project</CardDescription>
          </div>
          {headerActions}
        </CardHeader>
        <CardContent>{chartBody}</CardContent>
      </Card>
    )
  }

  return (
    <Card className={cn("gap-0 overflow-hidden py-0", className)}>
      <CardHeader className="flex flex-row items-start justify-between gap-4 border-b border-border/60 bg-muted/30 px-4 py-4">
        <div>
          <CardTitle>Organization chart</CardTitle>
          <CardDescription>
            {members.length} on chart · {userCount}{" "}
            {userCount === 1 ? "person" : "people"} · {agentCount}{" "}
            {agentCount === 1 ? "agent" : "agents"} · click a node to view details
          </CardDescription>
        </div>
        {headerActions}
      </CardHeader>
      <CardContent className="p-0">{chartBody}</CardContent>
    </Card>
  )
})
