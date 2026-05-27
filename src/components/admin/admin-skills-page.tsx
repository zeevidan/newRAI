import { useMemo, useState } from "react"
import {
  BookOpen,
  Compass,
  Download,
  Eye,
  Plus,
  Search,
  Sparkles,
} from "lucide-react"
import { useApp } from "@/context/app-context"
import {
  createEmptyOrgSkill,
  orgSkillAdoptions as initialAdoptions,
  orgSkills as initialOrgSkills,
  platformSkills as initialPlatformSkills,
  skillCategories,
  type SkillRecord,
  type OrgSkillAdoption,
} from "@/data/skills-mock"
import { SkillEditorSheet } from "@/components/admin/skills/skill-editor-sheet"
import { SkillValidationBadge } from "@/components/admin/skills/skill-safety-panel"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

function AdminPage({
  title,
  description,
  children,
}: {
  title: string
  description: string
  children: React.ReactNode
}) {
  return (
    <ScrollArea className="min-h-0 flex-1">
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        </div>
        {children}
      </div>
    </ScrollArea>
  )
}

function SkillCard({
  skill,
  action,
  onOpen,
}: {
  skill: SkillRecord
  action?: React.ReactNode
  onOpen: () => void
}) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="space-y-3 pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 space-y-1">
            <CardTitle className="truncate font-mono text-base">{skill.metadata.name}</CardTitle>
            <CardDescription className="line-clamp-2">{skill.metadata.description}</CardDescription>
          </div>
          <SkillValidationBadge status={skill.validation.status} />
        </div>
        <div className="flex flex-wrap gap-1.5">
          <Badge variant="outline">{skill.scope === "platform" ? "Platform" : "Custom"}</Badge>
          <Badge variant="secondary">{skill.category}</Badge>
          {skill.tags.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="outline" className="text-[10px]">
              {tag}
            </Badge>
          ))}
        </div>
      </CardHeader>
      <CardContent className="flex items-center justify-between gap-2 border-t border-border pt-3">
        <p className="truncate text-xs text-muted-foreground">{skill.source}</p>
        <div className="flex shrink-0 items-center gap-2">
          <Button type="button" variant="ghost" size="sm" onClick={onOpen}>
            <Eye className="size-3.5" />
            {skill.scope === "org" ? "Edit" : "View"}
          </Button>
          {action}
        </div>
      </CardContent>
    </Card>
  )
}

export function AdminSkillsPage() {
  const { currentOrg } = useApp()
  const [platformSkills, setPlatformSkills] = useState(initialPlatformSkills)
  const [orgSkills, setOrgSkills] = useState(initialOrgSkills)
  const [adoptions, setAdoptions] = useState<OrgSkillAdoption[]>(initialAdoptions)
  const [search, setSearch] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null)
  const [editorSkill, setEditorSkill] = useState<SkillRecord | null>(null)
  const [editorOpen, setEditorOpen] = useState(false)

  const adoptedIds = useMemo(
    () =>
      new Set(
        adoptions
          .filter((item) => item.orgId === currentOrg.id && item.enabled)
          .map((item) => item.skillId),
      ),
    [adoptions, currentOrg.id],
  )

  const librarySkills = useMemo(() => {
    const adoptedPlatform = platformSkills.filter((skill) => adoptedIds.has(skill.id))
    const custom = orgSkills.filter((skill) => skill.orgId === currentOrg.id)
    return [...adoptedPlatform, ...custom]
  }, [platformSkills, orgSkills, adoptedIds, currentOrg.id])

  const discoverSkills = useMemo(
    () => platformSkills.filter((skill) => !adoptedIds.has(skill.id)),
    [platformSkills, adoptedIds],
  )

  const customSkills = useMemo(
    () => orgSkills.filter((skill) => skill.orgId === currentOrg.id),
    [orgSkills, currentOrg.id],
  )

  function filterSkills(skills: SkillRecord[]) {
    const q = search.trim().toLowerCase()
    return skills.filter((skill) => {
      const matchesSearch =
        !q ||
        skill.metadata.name.toLowerCase().includes(q) ||
        skill.metadata.description.toLowerCase().includes(q) ||
        skill.tags.some((tag) => tag.toLowerCase().includes(q))
      const matchesCategory = !categoryFilter || skill.category === categoryFilter
      return matchesSearch && matchesCategory
    })
  }

  function openSkill(skill: SkillRecord) {
    setEditorSkill(skill)
    setEditorOpen(true)
  }

  function adoptPlatformSkill(skill: SkillRecord) {
    setAdoptions((prev) => [
      ...prev.filter((item) => !(item.orgId === currentOrg.id && item.skillId === skill.id)),
      {
        orgId: currentOrg.id,
        skillId: skill.id,
        enabled: true,
        adoptedAt: new Date().toISOString(),
      },
    ])
  }

  function createCustomSkill() {
    const skill = createEmptyOrgSkill(currentOrg.id)
    setOrgSkills((prev) => [skill, ...prev])
    openSkill(skill)
  }

  function saveSkill(updated: SkillRecord) {
    if (updated.scope === "org") {
      setOrgSkills((prev) => prev.map((skill) => (skill.id === updated.id ? updated : skill)))
    } else {
      setPlatformSkills((prev) => prev.map((skill) => (skill.id === updated.id ? updated : skill)))
    }
    setEditorSkill(updated)
  }

  const filteredLibrary = filterSkills(librarySkills)
  const filteredDiscover = filterSkills(discoverSkills)
  const filteredCustom = filterSkills(customSkills)

  return (
    <>
      <AdminPage
        title="Skills"
        description={`Manage agent skills for ${currentOrg.name}. Adopt validated platform skills or create custom org skills.`}
      >
        <Tabs defaultValue="library" className="gap-4">
          <TabsList>
            <TabsTrigger value="library" className="gap-1.5">
              <BookOpen className="size-3.5" />
              Library
              <Badge variant="secondary" className="h-4 px-1.5 text-[10px]">
                {librarySkills.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="discover" className="gap-1.5">
              <Compass className="size-3.5" />
              Discover
              <Badge variant="secondary" className="h-4 px-1.5 text-[10px]">
                {discoverSkills.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="custom" className="gap-1.5">
              <Sparkles className="size-3.5" />
              Custom
              <Badge variant="secondary" className="h-4 px-1.5 text-[10px]">
                {customSkills.length}
              </Badge>
            </TabsTrigger>
          </TabsList>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search skills by name, description, or tag..."
                className="pl-8"
              />
            </div>
            <div className="flex flex-wrap gap-1.5">
              <Button
                type="button"
                size="sm"
                variant={categoryFilter === null ? "secondary" : "outline"}
                onClick={() => setCategoryFilter(null)}
              >
                All
              </Button>
              {skillCategories.map((category) => (
                <Button
                  key={category}
                  type="button"
                  size="sm"
                  variant={categoryFilter === category ? "secondary" : "outline"}
                  onClick={() =>
                    setCategoryFilter((current) => (current === category ? null : category))
                  }
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>

          <TabsContent value="library">
            <Card className="mb-4 border-dashed">
              <CardContent className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-medium">Org skill library</p>
                  <p className="text-sm text-muted-foreground">
                    Skills available to attach to agents in this organization. Only validated skills
                    are recommended for production use.
                  </p>
                </div>
                <div className="flex gap-2 text-sm text-muted-foreground">
                  <span>{librarySkills.filter((s) => s.validation.status === "validated").length} validated</span>
                  <span>·</span>
                  <span>{librarySkills.filter((s) => s.validation.status === "flagged").length} flagged</span>
                </div>
              </CardContent>
            </Card>

            {filteredLibrary.length === 0 ? (
              <EmptyState
                title="No skills in your library yet"
                description="Discover platform skills or create a custom skill for your org."
              />
            ) : (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {filteredLibrary.map((skill) => (
                  <SkillCard key={skill.id} skill={skill} onOpen={() => openSkill(skill)} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="discover">
            <Card className="mb-4">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Platform skill catalog</CardTitle>
                <CardDescription>
                  Browse global skills maintained by the platform. Adopt validated skills into your
                  org library — flagged skills require a safety review before use.
                </CardDescription>
              </CardHeader>
            </Card>

            {filteredDiscover.length === 0 ? (
              <EmptyState
                title="All platform skills adopted"
                description="Your org has already added every available platform skill."
              />
            ) : (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {filteredDiscover.map((skill) => (
                  <SkillCard
                    key={skill.id}
                    skill={skill}
                    onOpen={() => openSkill(skill)}
                    action={
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        disabled={skill.validation.status === "flagged"}
                        onClick={() => adoptPlatformSkill(skill)}
                      >
                        <Download className="size-3.5" />
                        Add to org
                      </Button>
                    }
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="custom">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium">Custom org skills</p>
                <p className="text-sm text-muted-foreground">
                  Author SKILL.md files with YAML frontmatter following the Claude Agent Skills
                  structure.
                </p>
              </div>
              <Button type="button" size="sm" onClick={createCustomSkill}>
                <Plus className="size-3.5" />
                Create skill
              </Button>
            </div>

            {filteredCustom.length === 0 ? (
              <EmptyState
                title="No custom skills yet"
                description="Create a skill to capture org-specific workflows and expertise."
                action={
                  <Button type="button" size="sm" onClick={createCustomSkill}>
                    <Plus className="size-3.5" />
                    Create skill
                  </Button>
                }
              />
            ) : (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {filteredCustom.map((skill) => (
                  <SkillCard key={skill.id} skill={skill} onOpen={() => openSkill(skill)} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </AdminPage>

      <SkillEditorSheet
        skill={editorSkill}
        open={editorOpen}
        readOnly={editorSkill?.scope === "platform"}
        onOpenChange={setEditorOpen}
        onSave={saveSkill}
      />
    </>
  )
}

function EmptyState({
  title,
  description,
  action,
}: {
  title: string
  description: string
  action?: React.ReactNode
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-lg border border-dashed border-border px-6 py-16 text-center",
      )}
    >
      <p className="text-sm font-medium">{title}</p>
      <p className="mt-1 max-w-md text-sm text-muted-foreground">{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}
