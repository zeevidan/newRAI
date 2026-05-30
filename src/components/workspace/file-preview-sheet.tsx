import type { ProjectFileNode } from "@/data/mock"
import { MarkdownFileViewer } from "@/components/workspace/markdown-file-viewer"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import {
  getFileExtension,
  isMarkdownFile,
  isViewableFile,
} from "@/lib/workspace/sample-file-content"

interface FilePreviewSheetProps {
  file: ProjectFileNode | null
  onOpenChange: (open: boolean) => void
}

function formatRelativeTime(iso: string) {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return iso
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  })
}

function UnsupportedPreview({ file }: { file: ProjectFileNode }) {
  const extension = getFileExtension(file.name)

  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
      <p className="text-sm font-medium">Preview not available</p>
      <p className="max-w-sm text-sm text-muted-foreground">
        {extension
          ? `.${extension} files are not supported yet. Markdown previews are available today.`
          : "This file type is not supported yet."}
      </p>
    </div>
  )
}

export function FilePreviewSheet({ file, onOpenChange }: FilePreviewSheetProps) {
  const canPreview = file ? isViewableFile(file) : false

  return (
    <Sheet open={file !== null} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        size="wide"
        className="flex flex-col gap-0 overflow-hidden p-0"
      >
        {file && (
          <>
            <SheetHeader className="shrink-0 space-y-1 border-b border-border px-4 py-4 text-left">
              <SheetTitle className="truncate pr-8">{file.name}</SheetTitle>
              <SheetDescription>
                {file.size ? `${file.size} · ` : ""}
                Updated {formatRelativeTime(file.updatedAt)}
              </SheetDescription>
            </SheetHeader>

            <ScrollArea className="min-h-0 flex-1">
              <div className="p-6 pb-8">
                {canPreview && isMarkdownFile(file.name) && file.contentPath ? (
                  <MarkdownFileViewer contentPath={file.contentPath} />
                ) : (
                  <UnsupportedPreview file={file} />
                )}
              </div>
            </ScrollArea>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
