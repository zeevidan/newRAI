import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import type { SkillRecord } from "@/data/skills-mock"
import { SkillEditor } from "@/components/admin/skills/skill-editor"
import { SkillValidationBadge } from "@/components/admin/skills/skill-safety-panel"
import { Badge } from "@/components/ui/badge"

interface SkillEditorSheetProps {
  skill: SkillRecord | null
  open: boolean
  readOnly?: boolean
  onOpenChange: (open: boolean) => void
  onSave: (skill: SkillRecord) => void
}

export function SkillEditorSheet({
  skill,
  open,
  readOnly = false,
  onOpenChange,
  onSave,
}: SkillEditorSheetProps) {
  if (!skill) return null

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        size="wide"
        className="flex w-[min(1400px,96vw)] max-w-[1400px] flex-col gap-0 overflow-hidden p-0 sm:max-w-[1400px]"
        style={{ width: "min(1400px, 96vw)", maxWidth: 1400 }}
      >
        <SheetHeader className="shrink-0 space-y-3 border-b border-border px-4 py-4 text-left">
          <div className="flex flex-wrap items-center gap-2 pr-8">
            <SheetTitle>{skill.metadata.name || "Untitled skill"}</SheetTitle>
            <SkillValidationBadge status={skill.validation.status} />
            <Badge variant="outline">{skill.scope === "platform" ? "Platform" : "Custom"}</Badge>
            <Badge variant="secondary">{skill.category}</Badge>
          </div>
          <SheetDescription>{skill.metadata.description || skill.source}</SheetDescription>
        </SheetHeader>

        <div className="min-h-0 flex-1 overflow-hidden">
          <SkillEditor
            key={skill.id}
            skill={skill}
            readOnly={readOnly}
            onSave={(updated) => {
              onSave(updated)
              onOpenChange(false)
            }}
          />
        </div>
      </SheetContent>
    </Sheet>
  )
}
