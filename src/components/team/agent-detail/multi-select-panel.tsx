import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export interface MultiSelectItem {
  id: string
  label: string
  description?: string
  badge?: string
  disabled?: boolean
}

interface MultiSelectPanelProps {
  items: MultiSelectItem[]
  selectedIds: string[]
  onChange: (selectedIds: string[]) => void
  emptyMessage?: string
  className?: string
}

export function MultiSelectPanel({
  items,
  selectedIds,
  onChange,
  emptyMessage = "No items available.",
  className,
}: MultiSelectPanelProps) {
  if (items.length === 0) {
    return <p className="text-sm text-muted-foreground">{emptyMessage}</p>
  }

  function toggle(id: string) {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter((item) => item !== id))
      return
    }
    onChange([...selectedIds, id])
  }

  return (
    <div className={cn("space-y-2", className)}>
      {items.map((item) => {
        const checked = selectedIds.includes(item.id)
        return (
          <label
            key={item.id}
            className={cn(
              "flex cursor-pointer items-start gap-3 rounded-lg border border-border px-4 py-3 transition-colors",
              checked && "border-primary/40 bg-primary/5",
              item.disabled && "cursor-not-allowed opacity-60",
            )}
          >
            <input
              type="checkbox"
              checked={checked}
              disabled={item.disabled}
              onChange={() => toggle(item.id)}
              className="mt-0.5 size-4 shrink-0 rounded border-border"
            />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-medium">{item.label}</span>
                {item.badge && (
                  <Badge variant="outline" className="text-[10px] uppercase">
                    {item.badge}
                  </Badge>
                )}
              </div>
              {item.description && (
                <p className="mt-0.5 text-xs text-muted-foreground">{item.description}</p>
              )}
            </div>
          </label>
        )
      })}
    </div>
  )
}
