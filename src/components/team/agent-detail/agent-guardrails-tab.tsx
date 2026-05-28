import { useEffect, useMemo, useState } from "react"
import { useApp } from "@/context/app-context"
import {
  getAgentProjectConfig,
  getOrgApprovalPolicies,
  getOrgEgressAllowlists,
  getOrgGuardrails,
} from "@/data/agent-config-mock"
import { getOrgPolicies, getPlatformPolicies } from "@/data/mock"
import { SearchAddPanel } from "@/components/team/agent-detail/search-add-panel"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface AgentGuardrailsTabProps {
  agentId: string
  projectId: string
  onSaved?: () => void
}

export function AgentGuardrailsTab({ agentId, projectId, onSaved }: AgentGuardrailsTabProps) {
  const { currentOrg, agentProjectConfigs, updateAgentProjectConfig } = useApp()
  const saved = useMemo(
    () => getAgentProjectConfig(agentId, projectId, agentProjectConfigs),
    [agentId, projectId, agentProjectConfigs],
  )

  const policies = useMemo(
    () => [...getPlatformPolicies(), ...getOrgPolicies(currentOrg.id)],
    [currentOrg.id],
  )
  const guardrailOptions = useMemo(() => getOrgGuardrails(currentOrg.id), [currentOrg.id])
  const approvalOptions = useMemo(() => getOrgApprovalPolicies(currentOrg.id), [currentOrg.id])
  const egressOptions = useMemo(() => getOrgEgressAllowlists(currentOrg.id), [currentOrg.id])

  const [policyIds, setPolicyIds] = useState(saved.policyIds)
  const [guardrailIds, setGuardrailIds] = useState(saved.guardrailIds)
  const [approvalPolicyId, setApprovalPolicyId] = useState(saved.approvalPolicyId ?? "")
  const [egressAllowlistId, setEgressAllowlistId] = useState(saved.egressAllowlistId ?? "")

  useEffect(() => {
    setPolicyIds(saved.policyIds)
    setGuardrailIds(saved.guardrailIds)
    setApprovalPolicyId(saved.approvalPolicyId ?? "")
    setEgressAllowlistId(saved.egressAllowlistId ?? "")
  }, [saved])

  function handleSave(e: React.FormEvent) {
    e.preventDefault()
    updateAgentProjectConfig(agentId, projectId, {
      policyIds,
      guardrailIds,
      approvalPolicyId: approvalPolicyId || undefined,
      egressAllowlistId: egressAllowlistId || undefined,
    })
    onSaved?.()
  }

  return (
    <form onSubmit={handleSave} className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Policies</CardTitle>
          <CardDescription>
            Policies are centrally managed at the org/platform level. Search to attach; only bound
            policies appear below.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SearchAddPanel
            catalog={policies.map((policy) => ({
              id: policy.id,
              label: policy.name,
              description: policy.description,
              badge: policy.orgId ? "org" : "platform",
            }))}
            selectedIds={policyIds}
            onChange={setPolicyIds}
            placeholder="Search policies to add…"
            emptyAssignedMessage="No policies attached. Search the org catalog to bind policies to this agent."
            emptySearchMessage="No policies match your search."
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Guardrails</CardTitle>
          <CardDescription>
            Guardrails are centrally managed at the org level. Search to attach; only active
            guardrails for this agent appear below.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SearchAddPanel
            catalog={guardrailOptions.map((item) => ({
              id: item.id,
              label: item.name,
              description: item.description,
              badge: item.severity,
            }))}
            selectedIds={guardrailIds}
            onChange={setGuardrailIds}
            placeholder="Search guardrails to add…"
            emptyAssignedMessage="No guardrails attached. Search the org catalog to add guardrails for this agent."
            emptySearchMessage="No guardrails match your search."
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Human-in-the-loop</CardTitle>
          <CardDescription>
            Approval policy for sensitive actions. HITL policy admin coming later.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 max-w-md">
            <Label>Approval policy</Label>
            <Select
              value={approvalPolicyId || "__none__"}
              onValueChange={(v) => setApprovalPolicyId(!v || v === "__none__" ? "" : v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="None" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">None</SelectItem>
                {approvalOptions.map((policy) => (
                  <SelectItem key={policy.id} value={policy.id}>
                    {policy.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {approvalPolicyId && (
              <p className="text-xs text-muted-foreground">
                {approvalOptions.find((p) => p.id === approvalPolicyId)?.description}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Egress allowlist</CardTitle>
          <CardDescription>
            Permitted external hosts for outbound calls. Egress policy admin coming later.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 max-w-md">
            <Label>Allowlist</Label>
            <Select
              value={egressAllowlistId || "__none__"}
              onValueChange={(v) => setEgressAllowlistId(!v || v === "__none__" ? "" : v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Platform default" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">Platform default</SelectItem>
                {egressOptions.map((list) => (
                  <SelectItem key={list.id} value={list.id}>
                    {list.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {egressAllowlistId && (
              <p className="text-xs text-muted-foreground">
                {egressOptions
                  .find((list) => list.id === egressAllowlistId)
                  ?.allowedHosts.join(", ")}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="submit">Save & Close</Button>
      </div>
    </form>
  )
}
