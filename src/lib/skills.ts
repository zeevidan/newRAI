export interface SkillMetadata {
  name: string
  description: string
}

export interface SkillSection {
  title: string
  content: string
}

export interface SkillResourceRef {
  path: string
  type: "instruction" | "script" | "resource"
}

export interface ParsedSkill {
  metadata: SkillMetadata
  sections: SkillSection[]
  resources: SkillResourceRef[]
  bodyIntro: string
}

export interface SkillSafetyCheck {
  id: string
  label: string
  status: "pass" | "fail" | "warn"
  detail?: string
}

export interface SkillValidationResult {
  status: "validated" | "pending" | "flagged" | "draft"
  checks: SkillSafetyCheck[]
  warnings: string[]
}

const FRONTMATTER_RE = /^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/
const SECTION_RE = /^## (.+)$/gm

function parseFrontmatter(block: string): SkillMetadata {
  const metadata: SkillMetadata = { name: "", description: "" }
  for (const line of block.split("\n")) {
    const match = line.match(/^(\w+):\s*(.*)$/)
    if (!match) continue
    const [, key, value] = match
    if (key === "name") metadata.name = value.trim()
    if (key === "description") metadata.description = value.trim()
  }
  return metadata
}

function extractResourceRefs(content: string): SkillResourceRef[] {
  const refs = new Map<string, SkillResourceRef>()

  for (const match of content.matchAll(/\[([^\]]+)\]\(([^)]+\.(?:md|py|json|yaml|yml|txt|sh))\)/gi)) {
    const path = match[2].split("/").pop() ?? match[2]
    const type = path.endsWith(".py") || path.endsWith(".sh") ? "script" : "instruction"
    refs.set(path, { path, type })
  }

  for (const match of content.matchAll(/(?:see|refer to|in)\s+([A-Z_]+\.md)/gi)) {
    refs.set(match[1], { path: match[1], type: "instruction" })
  }

  for (const match of content.matchAll(/scripts\/([\w.-]+\.(?:py|sh))/gi)) {
    refs.set(`scripts/${match[1]}`, { path: `scripts/${match[1]}`, type: "script" })
  }

  return [...refs.values()]
}

export function parseSkillMarkdown(raw: string): ParsedSkill {
  const match = raw.match(FRONTMATTER_RE)
  if (!match) {
    return {
      metadata: { name: "", description: "" },
      sections: [{ title: "Content", content: raw.trim() }],
      resources: [],
      bodyIntro: "",
    }
  }

  const metadata = parseFrontmatter(match[1])
  const body = match[2]
  const sectionStarts: { index: number; title: string }[] = []

  let sectionMatch: RegExpExecArray | null
  const sectionRegex = new RegExp(SECTION_RE.source, "gm")
  while ((sectionMatch = sectionRegex.exec(body)) !== null) {
    sectionStarts.push({ index: sectionMatch.index, title: sectionMatch[1].trim() })
  }

  if (sectionStarts.length === 0) {
    return {
      metadata,
      sections: body.trim() ? [{ title: "Instructions", content: body.trim() }] : [],
      resources: extractResourceRefs(body),
      bodyIntro: "",
    }
  }

  const bodyIntro = body.slice(0, sectionStarts[0].index).trim()
  const sections: SkillSection[] = sectionStarts.map((start, i) => {
    const contentStart = start.index + body.slice(start.index).indexOf("\n") + 1
    const contentEnd =
      i + 1 < sectionStarts.length ? sectionStarts[i + 1].index : body.length
    return {
      title: start.title,
      content: body.slice(contentStart, contentEnd).trim(),
    }
  })

  return {
    metadata,
    sections,
    resources: extractResourceRefs(body),
    bodyIntro,
  }
}

export function composeSkillMarkdown(parsed: ParsedSkill): string {
  const { metadata, sections, bodyIntro } = parsed
  const lines = [
    "---",
    `name: ${metadata.name}`,
    `description: ${metadata.description}`,
    "---",
    "",
  ]

  if (metadata.name) {
    lines.push(`# ${metadata.name.split("-").map(capitalizeWord).join(" ")}`, "")
  }

  if (bodyIntro) {
    lines.push(bodyIntro, "")
  }

  for (const section of sections) {
    lines.push(`## ${section.title}`, "", section.content, "")
  }

  return lines.join("\n").trimEnd() + "\n"
}

function capitalizeWord(word: string) {
  return word.charAt(0).toUpperCase() + word.slice(1)
}

const RESERVED_NAMES = new Set(["anthropic", "claude"])
const XML_TAG_RE = /<[^>]+>/
const EXTERNAL_FETCH_RE =
  /\b(curl|wget|fetch\s*\(|requests\.(get|post)|httpx\.|urllib\.|axios\.|http:\/\/|https:\/\/)/i
const DYNAMIC_EXEC_RE = /\b(eval|exec|subprocess|os\.system|shell=True)\b/i
const EXFIL_RE = /\b(base64|exfil|webhook|pastebin|ngrok)\b/i

export function validateSkillContent(
  raw: string,
  metadata: SkillMetadata,
): SkillValidationResult {
  const checks: SkillSafetyCheck[] = []
  const warnings: string[] = []

  checks.push({
    id: "frontmatter-name",
    label: "Required name field",
    status: metadata.name.trim() ? "pass" : "fail",
    detail: metadata.name.trim() ? undefined : "SKILL.md must include a name in YAML frontmatter.",
  })

  checks.push({
    id: "frontmatter-description",
    label: "Required description field",
    status: metadata.description.trim() ? "pass" : "fail",
    detail: metadata.description.trim()
      ? undefined
      : "Description must explain what the skill does and when to use it.",
  })

  const nameValid =
    metadata.name.length > 0 &&
    metadata.name.length <= 64 &&
    /^[a-z0-9-]+$/.test(metadata.name) &&
    !RESERVED_NAMES.has(metadata.name)

  checks.push({
    id: "name-format",
    label: "Name format (lowercase, hyphens, max 64 chars)",
    status: nameValid ? "pass" : "fail",
    detail: nameValid
      ? undefined
      : "Use lowercase letters, numbers, and hyphens only. Avoid reserved words.",
  })

  const noXmlInMeta =
    !XML_TAG_RE.test(metadata.name) && !XML_TAG_RE.test(metadata.description)

  checks.push({
    id: "no-xml-tags",
    label: "No XML tags in metadata",
    status: noXmlInMeta ? "pass" : "fail",
    detail: noXmlInMeta ? undefined : "Metadata must not contain XML-like tags.",
  })

  const descriptionHasTrigger =
    metadata.description.length >= 20 &&
    /\b(use when|when the user|when working|when asked|for .+ tasks?)\b/i.test(
      metadata.description,
    )

  checks.push({
    id: "description-trigger",
    label: "Description includes when to use the skill",
    status: descriptionHasTrigger ? "pass" : "warn",
    detail: descriptionHasTrigger
      ? undefined
      : "Add trigger phrases so Claude knows when to load this skill.",
  })

  if (EXTERNAL_FETCH_RE.test(raw)) {
    checks.push({
      id: "external-fetch",
      label: "No external network requests",
      status: "fail",
      detail:
        "Skills with external URL fetching pose poisoning risk if remote content changes.",
    })
    warnings.push("Detected patterns that may fetch external content at runtime.")
  } else {
    checks.push({
      id: "external-fetch",
      label: "No external network requests",
      status: "pass",
    })
  }

  if (DYNAMIC_EXEC_RE.test(raw)) {
    checks.push({
      id: "dynamic-exec",
      label: "No dynamic code execution patterns",
      status: "warn",
      detail: "Review scripts for eval, exec, or shell invocation.",
    })
    warnings.push("Contains dynamic execution patterns — audit bundled scripts.")
  } else {
    checks.push({
      id: "dynamic-exec",
      label: "No dynamic code execution patterns",
      status: "pass",
    })
  }

  if (EXFIL_RE.test(raw)) {
    checks.push({
      id: "exfil-patterns",
      label: "No data exfiltration indicators",
      status: "fail",
      detail: "Suspicious encoding or exfiltration language detected.",
    })
    warnings.push("Possible data exfiltration patterns found.")
  } else {
    checks.push({
      id: "exfil-patterns",
      label: "No data exfiltration indicators",
      status: "pass",
    })
  }

  const hasInstructions = parseSkillMarkdown(raw).sections.some(
    (section) => section.content.trim().length > 0,
  )

  checks.push({
    id: "instructions-body",
    label: "Instructions body present",
    status: hasInstructions ? "pass" : "warn",
    detail: hasInstructions ? undefined : "Add step-by-step guidance under ## Instructions.",
  })

  const hasFail = checks.some((check) => check.status === "fail")
  const hasWarn = checks.some((check) => check.status === "warn")
  const allRequiredPass = checks
    .filter((check) => check.id.startsWith("frontmatter") || check.id === "name-format")
    .every((check) => check.status === "pass")

  let status: SkillValidationResult["status"] = "draft"
  if (hasFail) status = "flagged"
  else if (allRequiredPass && !hasWarn) status = "validated"
  else if (allRequiredPass) status = "pending"
  else status = "draft"

  return { status, checks, warnings }
}
