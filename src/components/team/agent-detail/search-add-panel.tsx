import { useMemo, useState } from "react"
import { Plus, X } from "lucide-react"
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export interface SearchAddItem {
  id: string
  label: string
  description?: string
  badge?: string
}

interface SearchAddPanelProps {
  catalog: SearchAddItem[]
  selectedIds: string[]
  onChange: (selectedIds: string[]) => void
  placeholder?: string
  emptyAssignedMessage?: string
  emptySearchMessage?: string
  className?: string
}

type PickerItem = SearchAddItem & { value: string }

export function SearchAddPanel({
  catalog,
  selectedIds,
  onChange,
  placeholder = "Search to add…",
  emptyAssignedMessage = "Nothing assigned yet. Search above to add.",
  emptySearchMessage = "No matching items.",
  className,
}: SearchAddPanelProps) {
  const [pickerValue, setPickerValue] = useState<PickerItem | null>(null)

  const catalogById = useMemo(
    () => new Map(catalog.map((item) => [item.id, item])),
    [catalog],
  )

  const assignedItems = useMemo(
    () =>
      selectedIds
        .map((id) => catalogById.get(id))
        .filter((item): item is SearchAddItem => item != null),
    [catalogById, selectedIds],
  )

  const pickerItems = useMemo<PickerItem[]>(
    () =>
      catalog
        .filter((item) => !selectedIds.includes(item.id))
        .map((item) => ({ ...item, value: item.id })),
    [catalog, selectedIds],
  )

  function handleAdd(item: PickerItem | null) {
    if (!item) return
    onChange([...selectedIds, item.id])
    setPickerValue(null)
  }

  function handleRemove(id: string) {
    onChange(selectedIds.filter((itemId) => itemId !== id))
  }

  return (
    <div className={cn("space-y-4", className)}>
      <Combobox
        items={pickerItems}
        value={pickerValue}
        onValueChange={(next) => {
          if (next) {
            handleAdd(next)
            return
          }
          setPickerValue(null)
        }}
        isItemEqualToValue={(item, selected) => item.value === selected.value}
        itemToStringLabel={(item) => item.label}
        disabled={pickerItems.length === 0}
        autoHighlight
      >
        <ComboboxInput
          placeholder={
            pickerItems.length === 0 ? "All available items are assigned" : placeholder
          }
          className="w-full"
          showClear={Boolean(pickerValue)}
        />
        <ComboboxContent>
          <ComboboxList>
            {(item: PickerItem) => (
              <ComboboxItem key={item.value} value={item}>
                <div className="flex min-w-0 flex-1 items-start gap-2">
                  <Plus className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate text-sm">{item.label}</p>
                      {item.badge && (
                        <Badge variant="outline" className="text-[10px] uppercase">
                          {item.badge}
                        </Badge>
                      )}
                    </div>
                    {item.description && (
                      <p className="truncate text-xs text-muted-foreground">{item.description}</p>
                    )}
                  </div>
                </div>
              </ComboboxItem>
            )}
          </ComboboxList>
          <ComboboxEmpty>{emptySearchMessage}</ComboboxEmpty>
        </ComboboxContent>
      </Combobox>

      <div className="space-y-2">
        {assignedItems.length === 0 ? (
          <p className="rounded-lg border border-dashed border-border px-4 py-6 text-center text-sm text-muted-foreground">
            {emptyAssignedMessage}
          </p>
        ) : (
          assignedItems.map((item) => (
            <div
              key={item.id}
              className="flex items-start gap-3 rounded-lg border border-border bg-muted/20 px-4 py-3"
            >
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
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                className="shrink-0 text-muted-foreground hover:text-foreground"
                aria-label={`Remove ${item.label}`}
                onClick={() => handleRemove(item.id)}
              >
                <X className="size-3.5" />
              </Button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
