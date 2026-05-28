import { useEffect, useMemo, useState } from "react"
import { ChevronDown } from "lucide-react"
import { useApp } from "@/context/app-context"
import {
  getAgentProjectConfig,
  type AgentProjectConfig,
} from "@/data/agent-config-mock"
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
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

interface AgentBehaviorTabProps {
  agentId: string
  projectId: string
  onSaved?: () => void
}

export function AgentBehaviorTab({ agentId, projectId, onSaved }: AgentBehaviorTabProps) {
  const { agentProjectConfigs, updateAgentProjectConfig } = useApp()
  const saved = useMemo(
    () => getAgentProjectConfig(agentId, projectId, agentProjectConfigs),
    [agentId, projectId, agentProjectConfigs],
  )

  const [goalsText, setGoalsText] = useState(saved.goals.join("\n"))
  const [systemPrompt, setSystemPrompt] = useState(saved.systemPrompt)
  const [advancedOpen, setAdvancedOpen] = useState(false)
  const [temperature, setTemperature] = useState(String(saved.modelParams.temperature))
  const [maxTokens, setMaxTokens] = useState(String(saved.modelParams.maxTokens))
  const [topP, setTopP] = useState(String(saved.modelParams.topP))
  const [format, setFormat] = useState(saved.responseSettings.format)
  const [language, setLanguage] = useState(saved.responseSettings.language)
  const [citationStyle, setCitationStyle] = useState(saved.responseSettings.citationStyle)

  useEffect(() => {
    setGoalsText(saved.goals.join("\n"))
    setSystemPrompt(saved.systemPrompt)
    setTemperature(String(saved.modelParams.temperature))
    setMaxTokens(String(saved.modelParams.maxTokens))
    setTopP(String(saved.modelParams.topP))
    setFormat(saved.responseSettings.format)
    setLanguage(saved.responseSettings.language)
    setCitationStyle(saved.responseSettings.citationStyle)
  }, [saved])

  function handleSave(e: React.FormEvent) {
    e.preventDefault()
    const goals = goalsText
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)

    updateAgentProjectConfig(agentId, projectId, {
      goals,
      systemPrompt: systemPrompt.trim(),
      modelParams: {
        temperature: Number.parseFloat(temperature) || 0.4,
        maxTokens: Number.parseInt(maxTokens, 10) || 4096,
        topP: Number.parseFloat(topP) || 1,
      },
      responseSettings: {
        format,
        language: language.trim() || "en",
        citationStyle,
      },
    })
    onSaved?.()
  }

  return (
    <form onSubmit={handleSave} className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Goals</CardTitle>
          <CardDescription>
            What this agent should accomplish on this project — one goal per line.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            value={goalsText}
            onChange={(e) => setGoalsText(e.target.value)}
            placeholder={"Summarize competitive landscape weekly\nFlag pricing shifts above 5%"}
            className="min-h-24 font-mono text-sm"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">System prompt</CardTitle>
          <CardDescription>
            Core instructions prepended to every run. Instruction-style guidance lives in the org
            skill library — assign skills on the Skills & Tools tab.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            value={systemPrompt}
            onChange={(e) => setSystemPrompt(e.target.value)}
            placeholder="You are a research assistant for..."
            className="min-h-32 font-mono text-sm"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <button
            type="button"
            className="flex w-full items-start justify-between gap-4 text-left"
            onClick={() => setAdvancedOpen((open) => !open)}
            aria-expanded={advancedOpen}
          >
            <div>
              <CardTitle className="text-base">Advanced</CardTitle>
              <CardDescription>Model parameters and response settings.</CardDescription>
            </div>
            <ChevronDown
              className={cn(
                "mt-0.5 size-4 shrink-0 text-muted-foreground transition-transform",
                advancedOpen && "rotate-180",
              )}
            />
          </button>
        </CardHeader>
        {advancedOpen && (
          <CardContent className="space-y-6 border-t pt-4">
            <div>
              <p className="mb-3 text-sm font-medium">Model parameters</p>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="grid gap-2">
                  <Label htmlFor="temperature">Temperature</Label>
                  <Input
                    id="temperature"
                    type="number"
                    min={0}
                    max={2}
                    step={0.1}
                    value={temperature}
                    onChange={(e) => setTemperature(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="max-tokens">Max tokens</Label>
                  <Input
                    id="max-tokens"
                    type="number"
                    min={256}
                    step={256}
                    value={maxTokens}
                    onChange={(e) => setMaxTokens(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="top-p">Top P</Label>
                  <Input
                    id="top-p"
                    type="number"
                    min={0}
                    max={1}
                    step={0.05}
                    value={topP}
                    onChange={(e) => setTopP(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div>
              <p className="mb-3 text-sm font-medium">Response settings</p>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="grid gap-2">
                  <Label>Format</Label>
                  <Select
                    value={format}
                    onValueChange={(v) =>
                      v && setFormat(v as AgentProjectConfig["responseSettings"]["format"])
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="markdown">Markdown</SelectItem>
                      <SelectItem value="plain">Plain text</SelectItem>
                      <SelectItem value="json">JSON</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="language">Language</Label>
                  <Input
                    id="language"
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    placeholder="en"
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Citation style</Label>
                  <Select
                    value={citationStyle}
                    onValueChange={(v) =>
                      v &&
                      setCitationStyle(v as AgentProjectConfig["responseSettings"]["citationStyle"])
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="inline">Inline</SelectItem>
                      <SelectItem value="footnotes">Footnotes</SelectItem>
                      <SelectItem value="none">None</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      <div className="flex justify-end">
        <Button type="submit">Save & Close</Button>
      </div>
    </form>
  )
}
