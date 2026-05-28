import { useEffect, useMemo, useRef, useState } from "react"
import { ChevronRight, Folder } from "lucide-react"
import type { ProjectFileNode } from "@/data/mock"
import { cn } from "@/lib/utils"

interface FolderTreeNode {
  id: string
  name: string
  children: FolderTreeNode[]
}

interface WorkspaceFolderTreeProps {
  files: ProjectFileNode[]
  selectedIds: string[]
  onChange: (selectedIds: string[]) => void
  emptyMessage?: string
  className?: string
}

function buildFolderTree(files: ProjectFileNode[]): FolderTreeNode[] {
  const folders = files.filter((file) => file.kind === "folder")
  const byParent = new Map<string | null, ProjectFileNode[]>()

  for (const folder of folders) {
    const parentKey = folder.parentId
    const siblings = byParent.get(parentKey) ?? []
    siblings.push(folder)
    byParent.set(parentKey, siblings)
  }

  function build(parentId: string | null): FolderTreeNode[] {
    return (byParent.get(parentId) ?? [])
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((folder) => ({
        id: folder.id,
        name: folder.name,
        children: build(folder.id),
      }))
  }

  return build(null)
}

function collectExpandableIds(nodes: FolderTreeNode[]): string[] {
  const ids: string[] = []
  for (const node of nodes) {
    if (node.children.length > 0) {
      ids.push(node.id)
      ids.push(...collectExpandableIds(node.children))
    }
  }
  return ids
}

function collectSubtreeIds(node: FolderTreeNode): string[] {
  const ids = [node.id]
  for (const child of node.children) {
    ids.push(...collectSubtreeIds(child))
  }
  return ids
}

function getSubtreeSelectionState(node: FolderTreeNode, selectedIds: string[]) {
  const subtreeIds = collectSubtreeIds(node)
  const selectedCount = subtreeIds.filter((id) => selectedIds.includes(id)).length

  if (selectedCount === 0) {
    return { checked: false, indeterminate: false }
  }
  if (selectedCount === subtreeIds.length) {
    return { checked: true, indeterminate: false }
  }
  return { checked: false, indeterminate: true }
}

interface FolderTreeRowProps {
  node: FolderTreeNode
  depth: number
  selectedIds: string[]
  expandedIds: Set<string>
  onToggleExpand: (id: string) => void
  onToggleSelect: (node: FolderTreeNode) => void
}

function FolderTreeRow({
  node,
  depth,
  selectedIds,
  expandedIds,
  onToggleExpand,
  onToggleSelect,
}: FolderTreeRowProps) {
  const hasChildren = node.children.length > 0
  const isExpanded = expandedIds.has(node.id)
  const { checked, indeterminate } = getSubtreeSelectionState(node, selectedIds)
  const checkboxRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (checkboxRef.current) {
      checkboxRef.current.indeterminate = indeterminate
    }
  }, [indeterminate])

  return (
    <>
      <div
        className={cn(
          "flex items-center gap-1 rounded-md py-1.5 pr-2 transition-colors hover:bg-muted/50",
          checked && "bg-primary/5",
          indeterminate && "bg-primary/5",
        )}
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
      >
        {hasChildren ? (
          <button
            type="button"
            onClick={() => onToggleExpand(node.id)}
            className="flex size-6 shrink-0 items-center justify-center rounded-sm text-muted-foreground hover:bg-muted hover:text-foreground"
            aria-label={isExpanded ? `Collapse ${node.name}` : `Expand ${node.name}`}
          >
            <ChevronRight
              className={cn("size-3.5 transition-transform", isExpanded && "rotate-90")}
            />
          </button>
        ) : (
          <span className="size-6 shrink-0" aria-hidden />
        )}

        <label className="flex min-w-0 flex-1 cursor-pointer items-center gap-2">
          <input
            ref={checkboxRef}
            type="checkbox"
            checked={checked}
            onChange={() => onToggleSelect(node)}
            className="size-4 shrink-0 rounded border-border"
          />
          <Folder className="size-4 shrink-0 text-amber-500/80" />
          <span className="truncate text-sm">{node.name}</span>
        </label>
      </div>

      {hasChildren &&
        isExpanded &&
        node.children.map((child) => (
          <FolderTreeRow
            key={child.id}
            node={child}
            depth={depth + 1}
            selectedIds={selectedIds}
            expandedIds={expandedIds}
            onToggleExpand={onToggleExpand}
            onToggleSelect={onToggleSelect}
          />
        ))}
    </>
  )
}

export function WorkspaceFolderTree({
  files,
  selectedIds,
  onChange,
  emptyMessage = "No folders in this project workspace.",
  className,
}: WorkspaceFolderTreeProps) {
  const tree = useMemo(() => buildFolderTree(files), [files])
  const [expandedIds, setExpandedIds] = useState<Set<string>>(
    () => new Set(collectExpandableIds(tree)),
  )

  function toggleExpand(id: string) {
    setExpandedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function toggleSelect(node: FolderTreeNode) {
    const subtreeIds = collectSubtreeIds(node)
    const allSelected = subtreeIds.every((id) => selectedIds.includes(id))

    if (allSelected) {
      const remove = new Set(subtreeIds)
      onChange(selectedIds.filter((id) => !remove.has(id)))
      return
    }

    onChange([...new Set([...selectedIds, ...subtreeIds])])
  }

  if (tree.length === 0) {
    return <p className="text-sm text-muted-foreground">{emptyMessage}</p>
  }

  return (
    <div className={cn("rounded-lg border border-border bg-muted/10 p-2", className)}>
      {tree.map((node) => (
        <FolderTreeRow
          key={node.id}
          node={node}
          depth={0}
          selectedIds={selectedIds}
          expandedIds={expandedIds}
          onToggleExpand={toggleExpand}
          onToggleSelect={toggleSelect}
        />
      ))}
    </div>
  )
}
