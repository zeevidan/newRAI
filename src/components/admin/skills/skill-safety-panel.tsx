import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  FileWarning,
  Shield,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react"
import type { SkillValidationStatus } from "@/data/skills-mock"
import type { SkillSafetyCheck } from "@/lib/skills"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

const statusConfig: Record<
  SkillValidationStatus,
  {
    label: string
    variant: "default" | "secondary" | "outline" | "destructive"
    icon: typeof ShieldCheck
    className?: string
  }
> = {
  validated: {
    label: "Validated & safe",
    variant: "default",
    icon: ShieldCheck,
    className: "bg-emerald-600 hover:bg-emerald-600/90",
  },
  pending: {
    label: "Pending review",
    variant: "secondary",
    icon: Clock,
  },
  flagged: {
    label: "Safety flagged",
    variant: "destructive",
    icon: ShieldAlert,
  },
  draft: {
    label: "Draft",
    variant: "outline",
    icon: FileWarning,
  },
}

export function SkillValidationBadge({
  status,
  className,
}: {
  status: SkillValidationStatus
  className?: string
}) {
  const config = statusConfig[status]
  const Icon = config.icon

  return (
    <Badge variant={config.variant} className={cn("gap-1", config.className, className)}>
      <Icon className="size-3" />
      {config.label}
    </Badge>
  )
}

export function SkillSafetyPanel({
  checks,
  warnings,
  status,
  validatedAt,
  validatedBy,
}: {
  checks: SkillSafetyCheck[]
  warnings: string[]
  status: SkillValidationStatus
  validatedAt?: string
  validatedBy?: string
}) {
  return (
    <div className="flex h-full flex-col rounded-lg border border-border bg-muted/20">
      <div className="flex items-center justify-between gap-2 border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <Shield className="size-4 text-muted-foreground" />
          <p className="text-sm font-medium">Skill safety</p>
        </div>
        <SkillValidationBadge status={status} />
      </div>

      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4">
        <p className="text-xs text-muted-foreground">
          Skills are audited for poisoning risks: external fetches, tool misuse, data
          exfiltration, and metadata integrity. Only validated skills should be attached to
          production agents.
        </p>

        {validatedAt && (
          <p className="text-xs text-muted-foreground">
            Last reviewed {new Date(validatedAt).toLocaleDateString()}
            {validatedBy ? ` by ${validatedBy}` : ""}
          </p>
        )}

        {warnings.length > 0 && (
          <div className="space-y-2 rounded-lg border border-amber-500/30 bg-amber-500/5 p-3">
            {warnings.map((warning) => (
              <div key={warning} className="flex gap-2 text-xs text-amber-800 dark:text-amber-200">
                <AlertTriangle className="mt-0.5 size-3.5 shrink-0" />
                <span>{warning}</span>
              </div>
            ))}
          </div>
        )}

        {checks.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Run validation to scan this skill for safety issues.
          </p>
        ) : (
          <ul className="space-y-2">
            {checks.map((check) => (
              <li
                key={check.id}
                className="flex gap-2 rounded-md border border-border bg-background px-3 py-2"
              >
                {check.status === "pass" ? (
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-600" />
                ) : check.status === "warn" ? (
                  <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-500" />
                ) : (
                  <ShieldAlert className="mt-0.5 size-4 shrink-0 text-destructive" />
                )}
                <div className="min-w-0">
                  <p className="text-sm font-medium">{check.label}</p>
                  {check.detail && (
                    <p className="mt-0.5 text-xs text-muted-foreground">{check.detail}</p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
