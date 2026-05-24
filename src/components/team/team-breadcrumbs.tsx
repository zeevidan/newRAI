import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import type { OrgChartMemberKind } from "@/data/mock"

export interface TeamBreadcrumbSegment {
  label: string
  onClick?: () => void
}

interface TeamBreadcrumbsProps {
  projectName: string
  onProjectClick?: () => void
  segments: TeamBreadcrumbSegment[]
  className?: string
}

export function TeamBreadcrumbs({
  projectName,
  onProjectClick,
  segments,
  className,
}: TeamBreadcrumbsProps) {
  return (
    <Breadcrumb className={className ?? "mb-6"}>
      <BreadcrumbList>
        <BreadcrumbItem>
          {onProjectClick ? (
            <BreadcrumbLink onClick={onProjectClick}>{projectName}</BreadcrumbLink>
          ) : (
            <span className="text-muted-foreground">{projectName}</span>
          )}
        </BreadcrumbItem>
        {segments.map((segment, index) => {
          const isLast = index === segments.length - 1
          return (
            <BreadcrumbItem key={`${segment.label}-${index}`}>
              <BreadcrumbSeparator />
              {isLast || !segment.onClick ? (
                <BreadcrumbPage>{segment.label}</BreadcrumbPage>
              ) : (
                <BreadcrumbLink onClick={segment.onClick}>{segment.label}</BreadcrumbLink>
              )}
            </BreadcrumbItem>
          )
        })}
      </BreadcrumbList>
    </Breadcrumb>
  )
}

export function memberKindLabel(kind: OrgChartMemberKind, plural = false) {
  if (kind === "agent") return plural ? "Agents" : "Agent"
  return plural ? "People" : "Person"
}
