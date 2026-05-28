import { useEffect, useMemo, useState } from "react"
import { useApp } from "@/context/app-context"
import { getAgentProjectConfig } from "@/data/agent-config-mock"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

interface AgentBudgetTabProps {
  agentId: string
  projectId: string
  onSaved?: () => void
}

export function AgentBudgetTab({ agentId, projectId, onSaved }: AgentBudgetTabProps) {
  const { selectedProject, agentProjectConfigs, updateAgentProjectConfig } = useApp()
  const saved = useMemo(
    () => getAgentProjectConfig(agentId, projectId, agentProjectConfigs),
    [agentId, projectId, agentProjectConfigs],
  )

  const [spendCap, setSpendCap] = useState(
    saved.budget.spendCapUsd != null ? String(saved.budget.spendCapUsd) : "",
  )
  const [tokenLimit, setTokenLimit] = useState(
    saved.budget.tokenLimitPerRun != null ? String(saved.budget.tokenLimitPerRun) : "",
  )
  const [rateLimit, setRateLimit] = useState(
    saved.budget.rateLimitPerMin != null ? String(saved.budget.rateLimitPerMin) : "",
  )
  const [scheduleWindow, setScheduleWindow] = useState(saved.budget.scheduleWindow ?? "")
  const [quotaNotes, setQuotaNotes] = useState(saved.budget.quotaNotes ?? "")

  useEffect(() => {
    setSpendCap(saved.budget.spendCapUsd != null ? String(saved.budget.spendCapUsd) : "")
    setTokenLimit(saved.budget.tokenLimitPerRun != null ? String(saved.budget.tokenLimitPerRun) : "")
    setRateLimit(saved.budget.rateLimitPerMin != null ? String(saved.budget.rateLimitPerMin) : "")
    setScheduleWindow(saved.budget.scheduleWindow ?? "")
    setQuotaNotes(saved.budget.quotaNotes ?? "")
  }, [saved])

  function handleSave(e: React.FormEvent) {
    e.preventDefault()
    updateAgentProjectConfig(agentId, projectId, {
      budget: {
        spendCapUsd: spendCap ? Number.parseFloat(spendCap) : undefined,
        tokenLimitPerRun: tokenLimit ? Number.parseInt(tokenLimit, 10) : undefined,
        rateLimitPerMin: rateLimit ? Number.parseInt(rateLimit, 10) : undefined,
        scheduleWindow: scheduleWindow.trim() || undefined,
        quotaNotes: quotaNotes.trim() || undefined,
      },
    })
    onSaved?.()
  }

  const projectBudgetUsed = selectedProject?.budgetUsed ?? 0
  const projectBudgetTotal = selectedProject?.budgetTotal ?? 0

  return (
    <form onSubmit={handleSave} className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Project budget pool</CardTitle>
          <CardDescription>
            Per-agent allocation is carved from the project pool. Project-level budget admin only
            today.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-baseline gap-2 text-sm">
            <span className="text-2xl font-semibold tabular-nums">
              ${projectBudgetUsed.toLocaleString()}
            </span>
            <span className="text-muted-foreground">
              of ${projectBudgetTotal.toLocaleString()} used
            </span>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{
                width: `${projectBudgetTotal ? Math.min(100, (projectBudgetUsed / projectBudgetTotal) * 100) : 0}%`,
              }}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Agent limits</CardTitle>
          <CardDescription>Spend cap and rate limits for this agent on this project.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="spend-cap">Spend cap (USD)</Label>
            <Input
              id="spend-cap"
              type="number"
              min={0}
              placeholder="1200"
              value={spendCap}
              onChange={(e) => setSpendCap(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="token-limit">Token limit per run</Label>
            <Input
              id="token-limit"
              type="number"
              min={256}
              step={256}
              placeholder="32000"
              value={tokenLimit}
              onChange={(e) => setTokenLimit(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="rate-limit">Rate limit (runs / min)</Label>
            <Input
              id="rate-limit"
              type="number"
              min={1}
              placeholder="30"
              value={rateLimit}
              onChange={(e) => setRateLimit(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="schedule">Schedule window</Label>
            <Input
              id="schedule"
              placeholder="Mon–Fri 07:00–20:00 UTC"
              value={scheduleWindow}
              onChange={(e) => setScheduleWindow(e.target.value)}
            />
          </div>
          <div className="grid gap-2 sm:col-span-2">
            <Label htmlFor="quota-notes">Quota notes</Label>
            <Textarea
              id="quota-notes"
              value={quotaNotes}
              onChange={(e) => setQuotaNotes(e.target.value)}
              placeholder="Optional notes for finance or ops review"
              className="min-h-16"
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="submit">Save & Close</Button>
      </div>
    </form>
  )
}
