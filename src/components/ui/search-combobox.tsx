import { useMemo } from "react"
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox"
import { cn } from "@/lib/utils"

const NULL_SENTINEL = "__search_combobox_none__"

export type SearchComboboxOption = {
  value: string
  label: string
  description?: string
}

type SearchComboboxItem = SearchComboboxOption & {
  value: string
}

interface SearchComboboxProps {
  options: SearchComboboxOption[]
  value: string | null
  onValueChange: (value: string | null) => void
  placeholder?: string
  emptyMessage?: string
  nullOption?: { label: string }
  disabled?: boolean
  className?: string
  id?: string
}

export function SearchCombobox({
  options,
  value,
  onValueChange,
  placeholder = "Search...",
  emptyMessage = "No results found.",
  nullOption,
  disabled = false,
  className,
  id,
}: SearchComboboxProps) {
  const items = useMemo<SearchComboboxItem[]>(() => {
    const next = options.map((option) => ({ ...option }))
    if (nullOption) {
      next.unshift({ value: NULL_SENTINEL, label: nullOption.label })
    }
    return next
  }, [nullOption, options])

  const selectedItem = useMemo(() => {
    if (!value) {
      return nullOption ? items.find((item) => item.value === NULL_SENTINEL) ?? null : null
    }
    return items.find((item) => item.value === value) ?? null
  }, [items, nullOption, value])

  return (
    <Combobox
      items={items}
      value={selectedItem}
      onValueChange={(next) => {
        if (!next) {
          onValueChange(null)
          return
        }
        onValueChange(next.value === NULL_SENTINEL ? null : next.value)
      }}
      isItemEqualToValue={(item, selected) => item.value === selected.value}
      itemToStringLabel={(item) => item.label}
      disabled={disabled}
      autoHighlight
    >
      <ComboboxInput
        id={id}
        placeholder={placeholder}
        className={cn("w-full", className)}
        showClear={Boolean(value)}
      />
      <ComboboxContent>
        <ComboboxList>
          {(item: SearchComboboxItem) => (
            <ComboboxItem key={item.value} value={item}>
              <div className="min-w-0">
                <p className="truncate">{item.label}</p>
                {item.description && (
                  <p className="truncate text-xs text-muted-foreground">
                    {item.description}
                  </p>
                )}
              </div>
            </ComboboxItem>
          )}
        </ComboboxList>
        <ComboboxEmpty>{emptyMessage}</ComboboxEmpty>
      </ComboboxContent>
    </Combobox>
  )
}
