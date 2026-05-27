import { useEffect, useMemo, useState } from "react"
import { Code2, Layers, Save, ShieldCheck } from "lucide-react"
import type { SkillRecord } from "@/data/skills-mock"
import {
  composeSkillMarkdown,
  parseSkillMarkdown,
  validateSkillContent,
  type ParsedSkill,
} from "@/lib/skills"
import { SkillSafetyPanel } from "@/components/admin/skills/skill-safety-panel"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"

interface SkillEditorProps {
  skill: SkillRecord
  readOnly?: boolean
  onSave: (skill: SkillRecord) => void
}

export function SkillEditor({ skill, readOnly = false, onSave }: SkillEditorProps) {
  const [editorView, setEditorView] = useState<"structured" | "raw">("structured")
  const [rawContent, setRawContent] = useState(skill.rawContent)
  const [parsed, setParsed] = useState<ParsedSkill>(() => parseSkillMarkdown(skill.rawContent))
  const [validation, setValidation] = useState(skill.validation)

  useEffect(() => {
    setRawContent(skill.rawContent)
    setParsed(parseSkillMarkdown(skill.rawContent))
    setValidation(skill.validation)
    setEditorView("structured")
  }, [skill.id, skill.rawContent, skill.validation])

  const resourceList = useMemo(
    () => parseSkillMarkdown(rawContent).resources,
    [rawContent],
  )

  function syncFromRaw(nextRaw: string) {
    setRawContent(nextRaw)
    setParsed(parseSkillMarkdown(nextRaw))
  }

  function syncFromStructured(nextParsed: ParsedSkill) {
    setParsed(nextParsed)
    setRawContent(composeSkillMarkdown(nextParsed))
  }

  function updateMetadata(field: "name" | "description", value: string) {
    const next = {
      ...parsed,
      metadata: { ...parsed.metadata, [field]: value },
    }
    syncFromStructured(next)
  }

  function updateSection(index: number, content: string) {
    const sections = parsed.sections.map((section, i) =>
      i === index ? { ...section, content } : section,
    )
    syncFromStructured({ ...parsed, sections })
  }

  function runValidation() {
    const result = validateSkillContent(rawContent, parsed.metadata)
    setValidation({
      status: result.status,
      checks: result.checks,
      warnings: result.warnings,
      validatedAt: new Date().toISOString(),
      validatedBy: readOnly ? validation.validatedBy : "You",
    })
  }

  function handleSave() {
    onSave({
      ...skill,
      metadata: parsed.metadata,
      rawContent,
      updatedAt: new Date().toISOString(),
      validation,
    })
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3">
        <Tabs
          value={editorView}
          onValueChange={(value) => setEditorView(value as "structured" | "raw")}
        >
          <TabsList>
            <TabsTrigger value="structured" className="gap-1.5">
              <Layers className="size-3.5" />
              Structured
            </TabsTrigger>
            <TabsTrigger value="raw" className="gap-1.5">
              <Code2 className="size-3.5" />
              Raw
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {!readOnly && (
          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" size="sm" onClick={runValidation}>
              <ShieldCheck className="size-3.5" />
              Validate safety
            </Button>
            <Button type="button" size="sm" onClick={handleSave}>
              <Save className="size-3.5" />
              Save skill
            </Button>
          </div>
        )}
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 overflow-hidden p-4 xl:grid-cols-[1fr_320px]">
        <div className="min-h-0 overflow-hidden">
          {editorView === "structured" ? (
            <div className="grid h-full min-h-0 grid-cols-1 gap-3 lg:grid-cols-2">
              <SkillSectionCard title="Level 1 · Metadata" subtitle="Always loaded (~100 tokens)">
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="skill-name">name</Label>
                    <Input
                      id="skill-name"
                      value={parsed.metadata.name}
                      disabled={readOnly}
                      placeholder="your-skill-name"
                      className="font-mono text-sm"
                      onChange={(e) => updateMetadata("name", e.target.value)}
                    />
                    <p className="text-[11px] text-muted-foreground">
                      Lowercase letters, numbers, and hyphens only (max 64 chars).
                    </p>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="skill-description">description</Label>
                    <Textarea
                      id="skill-description"
                      value={parsed.metadata.description}
                      disabled={readOnly}
                      placeholder="What this skill does and when Claude should use it..."
                      className="min-h-24 font-mono text-sm"
                      onChange={(e) => updateMetadata("description", e.target.value)}
                    />
                  </div>
                </div>
              </SkillSectionCard>

              {parsed.sections.map((section, index) => (
                <SkillSectionCard
                  key={`${section.title}-${index}`}
                  title={`Level 2 · ${section.title}`}
                  subtitle="Loaded when the skill is triggered"
                >
                  <Textarea
                    value={section.content}
                    disabled={readOnly}
                    className="min-h-[180px] flex-1 resize-none font-mono text-sm"
                    onChange={(e) => updateSection(index, e.target.value)}
                  />
                </SkillSectionCard>
              ))}

              <SkillSectionCard
                title="Level 3 · Resources"
                subtitle="Bundled files loaded as needed"
                className="lg:col-span-2"
              >
                {resourceList.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No bundled resources referenced yet. Link files in markdown like{" "}
                    <code className="rounded bg-muted px-1 py-0.5 text-xs">[FORMS.md](FORMS.md)</code>{" "}
                    or mention scripts under <code className="rounded bg-muted px-1 py-0.5 text-xs">scripts/</code>.
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {resourceList.map((resource) => (
                      <Badge key={resource.path} variant="outline" className="font-mono">
                        {resource.type === "script" ? "code" : "doc"} · {resource.path}
                      </Badge>
                    ))}
                  </div>
                )}
              </SkillSectionCard>
            </div>
          ) : (
            <div className="flex h-full min-h-[480px] flex-col overflow-hidden rounded-lg border border-border">
              <div className="shrink-0 border-b border-border px-3 py-2">
                <p className="font-mono text-xs text-muted-foreground">SKILL.md</p>
              </div>
              <Textarea
                value={rawContent}
                disabled={readOnly}
                spellCheck={false}
                className="min-h-0 flex-1 resize-none rounded-none border-0 bg-transparent px-4 py-3 font-mono text-sm leading-relaxed focus-visible:ring-0"
                onChange={(e) => syncFromRaw(e.target.value)}
              />
            </div>
          )}
        </div>

        <SkillSafetyPanel
          checks={validation.checks}
          warnings={validation.warnings}
          status={validation.status}
          validatedAt={validation.validatedAt}
          validatedBy={validation.validatedBy}
        />
      </div>
    </div>
  )
}

function SkillSectionCard({
  title,
  subtitle,
  className,
  children,
}: {
  title: string
  subtitle: string
  className?: string
  children: React.ReactNode
}) {
  return (
    <div
      className={`flex min-h-[220px] flex-col overflow-hidden rounded-lg border border-border bg-background ${className ?? ""}`}
    >
      <div className="shrink-0 border-b border-border px-3 py-2">
        <p className="text-sm font-medium">{title}</p>
        <p className="text-[11px] text-muted-foreground">{subtitle}</p>
      </div>
      <ScrollArea className="min-h-0 flex-1">
        <div className="p-3">{children}</div>
      </ScrollArea>
    </div>
  )
}
