import { useEffect, useMemo, useState } from "react"
import { useApp } from "@/context/app-context"
import {
  getAgentProjectConfig,
  type AutonomyLevel,
} from "@/data/agent-config-mock"
import { HEARTBEAT_AUTONOMY_ITEMS } from "@/lib/select-items"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface AgentHeartbeatTabProps {
  agentId: string
  projectId: string
  onSaved?: () => void
}

export function AgentHeartbeatTab({ agentId, projectId, onSaved }: AgentHeartbeatTabProps) {
  const { agentProjectConfigs, updateAgentProjectConfig } = useApp()
  const saved = useMemo(
    () => getAgentProjectConfig(agentId, projectId, agentProjectConfigs),
    [agentId, projectId, agentProjectConfigs],
  )

  const [enabled, setEnabled] = useState(saved.heartbeat.enabled)
  const [intervalSec, setIntervalSec] = useState(String(saved.heartbeat.intervalSec))
  const [autonomy, setAutonomy] = useState<AutonomyLevel>(saved.heartbeat.autonomy)
  const [maxActions, setMaxActions] = useState(String(saved.heartbeat.maxActionsPerBeat))
  const [activeWindow, setActiveWindow] = useState(saved.heartbeat.activeWindow ?? "")

  useEffect(() => {
    setEnabled(saved.heartbeat.enabled)
    setIntervalSec(String(saved.heartbeat.intervalSec))
    setAutonomy(saved.heartbeat.autonomy)
    setMaxActions(String(saved.heartbeat.maxActionsPerBeat))
    setActiveWindow(saved.heartbeat.activeWindow ?? "")
  }, [saved])

  function handleSave(e: React.FormEvent) {
    e.preventDefault()
    updateAgentProjectConfig(agentId, projectId, {
      heartbeat: {
        enabled,
        intervalSec: Number.parseInt(intervalSec, 10) || 30,
        autonomy,
        maxActionsPerBeat: Number.parseInt(maxActions, 10) || 1,
        activeWindow: activeWindow.trim() || undefined,
      },
    })
    onSaved?.()
  }

  return (
    <form onSubmit={handleSave} className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Heartbeat protocol</CardTitle>
          <CardDescription>
            Per-agent cadence and autonomy on this project. Running agents tick on the simulated
            clock and produce messages, tasks, and activity.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="flex items-center gap-2 sm:col-span-2">
            <input
              id="heartbeat-enabled"
              type="checkbox"
              checked={enabled}
              onChange={(e) => setEnabled(e.target.checked)}
              className="size-4 rounded border-border"
            />
            <Label htmlFor="heartbeat-enabled">Heartbeat enabled</Label>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="interval-sec">Interval (sim seconds)</Label>
            <Input
              id="interval-sec"
              type="number"
              min={5}
              value={intervalSec}
              onChange={(e) => setIntervalSec(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label>Autonomy</Label>
            <Select
              items={HEARTBEAT_AUTONOMY_ITEMS}
              value={autonomy}
              onValueChange={(v) => v && setAutonomy(v as AutonomyLevel)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="manual">Manual — proposals need approval</SelectItem>
                <SelectItem value="suggest">Suggest — acts with activity trail</SelectItem>
                <SelectItem value="full">Full — autonomous execution</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="max-actions">Max actions per beat</Label>
            <Input
              id="max-actions"
              type="number"
              min={1}
              max={5}
              value={maxActions}
              onChange={(e) => setMaxActions(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="active-window">Active window</Label>
            <Input
              id="active-window"
              value={activeWindow}
              onChange={(e) => setActiveWindow(e.target.value)}
              placeholder="Mon–Fri 07:00–20:00 UTC"
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
