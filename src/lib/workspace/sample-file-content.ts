const sampleFileModules = import.meta.glob<string>(
  "../../data/sample-workspace/**/*.md",
  { query: "?raw", import: "default", eager: true },
)

function normalizeContentPath(contentPath: string) {
  return contentPath.replace(/^\/+/, "")
}

export function getSampleFileContent(contentPath: string): string | undefined {
  const normalized = normalizeContentPath(contentPath)
  for (const [modulePath, content] of Object.entries(sampleFileModules)) {
    if (modulePath.endsWith(`/${normalized}`) || modulePath.endsWith(normalized)) {
      return content
    }
  }
  return undefined
}

export function getFileExtension(name: string) {
  const dot = name.lastIndexOf(".")
  return dot >= 0 ? name.slice(dot + 1).toLowerCase() : ""
}

export function isMarkdownFile(name: string) {
  return getFileExtension(name) === "md"
}

export function isViewableFile(file: { kind: string; name: string; contentPath?: string }) {
  if (file.kind !== "file") return false
  if (isMarkdownFile(file.name)) return Boolean(file.contentPath)
  return false
}
