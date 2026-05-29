import { Check, X } from "lucide-react"
import { useApp } from "@/context/app-context"
import { useWorkflow } from "@/context/workflow-context"
import { resolveMemberName } from "@/data/mock"
import { formatRelativeTime } from "@/lib/workflow/format"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

interface WorkflowApprovalsProps {
  projectId: string
}

export function WorkflowApprovals({ projectId }: WorkflowApprovalsProps) {
  const { users, agents } = useApp()
  const { clock, proposals, approveProposal, rejectProposal } = useWorkflow()

  const pending = proposals.filter(
    (proposal) => proposal.projectId === projectId && proposal.status === "pending",
  )

  if (pending.length === 0) return null

  return (
    <Card className="border-amber-500/40 bg-amber-500/5">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <CardTitle className="text-base">Pending approvals</CardTitle>
          <Badge variant="outline">{pending.length}</Badge>
        </div>
        <CardDescription>
          Agents with manual autonomy need your approval before acting.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {pending.map((proposal) => (
          <div
            key={proposal.id}
            className="flex flex-col gap-2 rounded-lg border border-border bg-background px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="min-w-0">
              <p className="text-sm font-medium">{proposal.summary}</p>
              <p className="text-xs text-muted-foreground">
                {resolveMemberName(proposal.agentId, users, agents)} ·{" "}
                {formatRelativeTime(proposal.createdAt, clock.simNow)}
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                size="sm"
                variant="default"
                className="gap-1"
                onClick={() => approveProposal(proposal.id)}
              >
                <Check className="size-3.5" />
                Approve
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="gap-1"
                onClick={() => rejectProposal(proposal.id)}
              >
                <X className="size-3.5" />
                Reject
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
