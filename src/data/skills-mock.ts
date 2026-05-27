import type { SkillSafetyCheck, SkillValidationResult } from "@/lib/skills"

export type SkillScope = "platform" | "org"
export type SkillValidationStatus = SkillValidationResult["status"]

export interface OrgSkillAdoption {
  orgId: string
  skillId: string
  enabled: boolean
  adoptedAt: string
}

export interface SkillRecord {
  id: string
  scope: SkillScope
  orgId?: string
  metadata: {
    name: string
    description: string
  }
  rawContent: string
  category: string
  tags: string[]
  source: string
  updatedAt: string
  createdBy?: string
  validation: {
    status: SkillValidationStatus
    validatedAt?: string
    validatedBy?: string
    checks: SkillSafetyCheck[]
    warnings: string[]
  }
}

export const skillCategories = [
  "Documents",
  "Engineering",
  "Operations",
  "Support",
  "Data",
  "Compliance",
] as const

const PDF_SKILL = `---
name: pdf-processing
description: Extract text and tables from PDF files, fill forms, merge documents. Use when working with PDF files or when the user mentions PDFs, forms, or document extraction.
---

# PDF Processing

## Quick start

Use pdfplumber to extract text from PDFs:

\`\`\`python
import pdfplumber

with pdfplumber.open("document.pdf") as pdf:
    text = pdf.pages[0].extract_text()
\`\`\`

For advanced form filling, see FORMS.md.

## Instructions

1. Confirm the PDF path and desired output format.
2. Extract text page-by-page for large documents.
3. Use table extraction only when structured data is required.
4. Return a concise summary plus extracted content.

## Examples

- "Extract tables from this invoice PDF"
- "Merge these three PDFs into one file"
`

const CODE_REVIEW_SKILL = `---
name: code-review
description: Review pull requests for bugs, security issues, and style consistency. Use when the user asks for a code review or PR feedback.
---

# Code Review

## Instructions

1. Read the diff holistically before commenting on individual lines.
2. Prioritize correctness, security, and regressions over style nits.
3. Cite specific files and line ranges in feedback.
4. Suggest concrete fixes when blocking issues are found.

## Examples

- Review this PR for SQL injection risks
- Check whether error handling covers edge cases
`

const DATA_ANALYSIS_SKILL = `---
name: data-analysis
description: Analyze spreadsheets and CSV datasets with summaries, charts, and anomaly detection. Use when working with tabular data or when the user mentions Excel, CSV, or metrics.
---

# Data Analysis

## Instructions

1. Inspect schema, null rates, and row counts first.
2. State assumptions about data types and time ranges.
3. Prefer reproducible pandas snippets for transformations.
4. Highlight outliers and missing data explicitly.

## Examples

- Summarize monthly revenue trends from this CSV
- Find anomalies in sensor readings
`

const CUSTOMER_SUPPORT_SKILL = `---
name: customer-support
description: Draft empathetic support replies using org tone guidelines. Use when the user asks to respond to a customer ticket or support thread.
---

# Customer Support

## Instructions

1. Acknowledge the customer's issue in the first sentence.
2. Match the organization's tone: professional, concise, helpful.
3. Provide next steps or escalation paths when resolution is unclear.
4. Avoid promising timelines unless policy allows it.

## Examples

- Reply to a billing dispute email
- Draft a response about a delayed shipment
`

const SLACK_INTEGRATION_SKILL = `---
name: slack-integration
description: Post updates to Slack channels from agent workflows. Use when the user wants Slack notifications or channel posts.
---

# Slack Integration

## Instructions

1. Confirm target channel and message format.
2. Fetch channel metadata from https://hooks.example.com/slack/config
3. Post formatted updates using the webhook helper in scripts/notify.py

## Examples

- Post deployment status to #eng-releases
`

const ACME_SAFETY_SKILL = `---
name: acme-safety-protocols
description: Apply Acme Robotics safety checklists for hardware changes and field deployments. Use when the user mentions safety reviews, LIDAR calibration, or deployment sign-off.
---

# Acme Safety Protocols

## Instructions

1. Verify lockout/tagout steps before hardware modifications.
2. Run the pre-flight checklist for mobile robots.
3. Document calibration results in the project vault reference.
4. Escalate to a human supervisor for any red-flag sensor readings.

## Examples

- Safety review before deploying robots to Warehouse B
- Pre-flight checklist for LIDAR mount changes
`

const ROBOT_CALIBRATION_SKILL = `---
name: robot-calibration
description: Guide field engineers through robot sensor calibration workflows. Use when calibrating LIDAR, IMU, or wheel odometry on Acme platforms.
---

# Robot Calibration

## Instructions

1. Confirm robot model and firmware version.
2. Run static calibration in a controlled environment.
3. Capture before/after metrics for each sensor.
4. Store calibration artifacts in the project workspace.

## Examples

- Calibrate LIDAR on AMR-200 units
`

function validatedChecks(): SkillSafetyCheck[] {
  return [
    { id: "frontmatter-name", label: "Required name field", status: "pass" },
    { id: "frontmatter-description", label: "Required description field", status: "pass" },
    { id: "name-format", label: "Name format", status: "pass" },
    { id: "no-xml-tags", label: "No XML tags in metadata", status: "pass" },
    { id: "description-trigger", label: "Description includes when to use", status: "pass" },
    { id: "external-fetch", label: "No external network requests", status: "pass" },
    { id: "dynamic-exec", label: "No dynamic code execution patterns", status: "pass" },
    { id: "exfil-patterns", label: "No data exfiltration indicators", status: "pass" },
    { id: "instructions-body", label: "Instructions body present", status: "pass" },
  ]
}

function flaggedChecks(): SkillSafetyCheck[] {
  return [
    { id: "frontmatter-name", label: "Required name field", status: "pass" },
    { id: "frontmatter-description", label: "Required description field", status: "pass" },
    { id: "name-format", label: "Name format", status: "pass" },
    { id: "no-xml-tags", label: "No XML tags in metadata", status: "pass" },
    { id: "description-trigger", label: "Description includes when to use", status: "pass" },
    {
      id: "external-fetch",
      label: "No external network requests",
      status: "fail",
      detail: "Skill references external URL fetching via webhook config endpoint.",
    },
    { id: "dynamic-exec", label: "No dynamic code execution patterns", status: "pass" },
    { id: "exfil-patterns", label: "No data exfiltration indicators", status: "pass" },
    { id: "instructions-body", label: "Instructions body present", status: "pass" },
  ]
}

export const platformSkills: SkillRecord[] = [
  {
    id: "skill-platform-pdf",
    scope: "platform",
    metadata: {
      name: "pdf-processing",
      description:
        "Extract text and tables from PDF files, fill forms, merge documents. Use when working with PDF files or when the user mentions PDFs, forms, or document extraction.",
    },
    rawContent: PDF_SKILL,
    category: "Documents",
    tags: ["pdf", "documents", "anthropic"],
    source: "Anthropic pre-built",
    updatedAt: "2026-05-01T10:00:00Z",
    validation: {
      status: "validated",
      validatedAt: "2026-05-01T10:00:00Z",
      validatedBy: "Platform trust & safety",
      checks: validatedChecks(),
      warnings: [],
    },
  },
  {
    id: "skill-platform-code-review",
    scope: "platform",
    metadata: {
      name: "code-review",
      description:
        "Review pull requests for bugs, security issues, and style consistency. Use when the user asks for a code review or PR feedback.",
    },
    rawContent: CODE_REVIEW_SKILL,
    category: "Engineering",
    tags: ["engineering", "quality", "security"],
    source: "RAI platform library",
    updatedAt: "2026-05-08T14:00:00Z",
    validation: {
      status: "validated",
      validatedAt: "2026-05-08T14:00:00Z",
      validatedBy: "Platform trust & safety",
      checks: validatedChecks(),
      warnings: [],
    },
  },
  {
    id: "skill-platform-data-analysis",
    scope: "platform",
    metadata: {
      name: "data-analysis",
      description:
        "Analyze spreadsheets and CSV datasets with summaries, charts, and anomaly detection. Use when working with tabular data or when the user mentions Excel, CSV, or metrics.",
    },
    rawContent: DATA_ANALYSIS_SKILL,
    category: "Data",
    tags: ["data", "analytics", "csv"],
    source: "RAI platform library",
    updatedAt: "2026-05-10T09:00:00Z",
    validation: {
      status: "validated",
      validatedAt: "2026-05-10T09:00:00Z",
      validatedBy: "Platform trust & safety",
      checks: validatedChecks(),
      warnings: [],
    },
  },
  {
    id: "skill-platform-customer-support",
    scope: "platform",
    metadata: {
      name: "customer-support",
      description:
        "Draft empathetic support replies using org tone guidelines. Use when the user asks to respond to a customer ticket or support thread.",
    },
    rawContent: CUSTOMER_SUPPORT_SKILL,
    category: "Support",
    tags: ["support", "communications"],
    source: "RAI platform library",
    updatedAt: "2026-05-12T11:00:00Z",
    validation: {
      status: "validated",
      validatedAt: "2026-05-12T11:00:00Z",
      validatedBy: "Platform trust & safety",
      checks: validatedChecks(),
      warnings: [],
    },
  },
  {
    id: "skill-platform-slack",
    scope: "platform",
    metadata: {
      name: "slack-integration",
      description:
        "Post updates to Slack channels from agent workflows. Use when the user wants Slack notifications or channel posts.",
    },
    rawContent: SLACK_INTEGRATION_SKILL,
    category: "Operations",
    tags: ["slack", "integrations", "notifications"],
    source: "Community catalog",
    updatedAt: "2026-05-15T16:00:00Z",
    validation: {
      status: "flagged",
      validatedAt: "2026-05-15T16:30:00Z",
      validatedBy: "Platform trust & safety",
      checks: flaggedChecks(),
      warnings: ["External URL fetching detected — audit before enabling in production."],
    },
  },
]

export const orgSkills: SkillRecord[] = [
  {
    id: "skill-org-acme-safety",
    scope: "org",
    orgId: "org-1",
    metadata: {
      name: "acme-safety-protocols",
      description:
        "Apply Acme Robotics safety checklists for hardware changes and field deployments. Use when the user mentions safety reviews, LIDAR calibration, or deployment sign-off.",
    },
    rawContent: ACME_SAFETY_SKILL,
    category: "Compliance",
    tags: ["safety", "hardware", "compliance"],
    source: "Acme Robotics",
    updatedAt: "2026-05-14T08:00:00Z",
    createdBy: "Alex Rivera",
    validation: {
      status: "validated",
      validatedAt: "2026-05-14T09:00:00Z",
      validatedBy: "Alex Rivera",
      checks: validatedChecks(),
      warnings: [],
    },
  },
  {
    id: "skill-org-acme-calibration",
    scope: "org",
    orgId: "org-1",
    metadata: {
      name: "robot-calibration",
      description:
        "Guide field engineers through robot sensor calibration workflows. Use when calibrating LIDAR, IMU, or wheel odometry on Acme platforms.",
    },
    rawContent: ROBOT_CALIBRATION_SKILL,
    category: "Engineering",
    tags: ["calibration", "sensors", "field"],
    source: "Acme Robotics",
    updatedAt: "2026-05-18T13:00:00Z",
    createdBy: "Morgan Lee",
    validation: {
      status: "draft",
      checks: [],
      warnings: [],
    },
  },
  {
    id: "skill-org-northwind-onboarding",
    scope: "org",
    orgId: "org-2",
    metadata: {
      name: "lab-onboarding",
      description:
        "Walk new researchers through Northwind lab access, equipment booking, and sample handling. Use when onboarding lab members or explaining lab procedures.",
    },
    rawContent: `---
name: lab-onboarding
description: Walk new researchers through Northwind lab access, equipment booking, and sample handling. Use when onboarding lab members or explaining lab procedures.
---

# Lab Onboarding

## Instructions

1. Confirm the member's role and supervisor.
2. Share badge access steps and safety training links.
3. Explain equipment booking via the internal portal.
4. Document completion in the org admin dashboard.

## Examples

- Onboard a new research associate
`,
    category: "Operations",
    tags: ["onboarding", "lab"],
    source: "Northwind Labs",
    updatedAt: "2026-05-11T10:00:00Z",
    createdBy: "Casey Nguyen",
    validation: {
      status: "validated",
      validatedAt: "2026-05-11T11:00:00Z",
      validatedBy: "Casey Nguyen",
      checks: validatedChecks(),
      warnings: [],
    },
  },
]

export const orgSkillAdoptions: OrgSkillAdoption[] = [
  { orgId: "org-1", skillId: "skill-platform-pdf", enabled: true, adoptedAt: "2026-04-20T10:00:00Z" },
  { orgId: "org-1", skillId: "skill-platform-code-review", enabled: true, adoptedAt: "2026-05-02T10:00:00Z" },
  { orgId: "org-1", skillId: "skill-platform-data-analysis", enabled: true, adoptedAt: "2026-05-05T10:00:00Z" },
  { orgId: "org-2", skillId: "skill-platform-pdf", enabled: true, adoptedAt: "2026-04-22T10:00:00Z" },
  { orgId: "org-2", skillId: "skill-platform-data-analysis", enabled: true, adoptedAt: "2026-05-09T10:00:00Z" },
]

export function getOrgAdoptedPlatformSkills(orgId: string) {
  const adoptedIds = new Set(
    orgSkillAdoptions
      .filter((item) => item.orgId === orgId && item.enabled)
      .map((item) => item.skillId),
  )
  return platformSkills.filter((skill) => adoptedIds.has(skill.id))
}

export function getOrgCustomSkills(orgId: string) {
  return orgSkills.filter((skill) => skill.orgId === orgId)
}

export function getOrgLibrarySkills(orgId: string) {
  return [...getOrgAdoptedPlatformSkills(orgId), ...getOrgCustomSkills(orgId)]
}

export function getDiscoverablePlatformSkills(orgId: string) {
  const adoptedIds = new Set(
    orgSkillAdoptions
      .filter((item) => item.orgId === orgId && item.enabled)
      .map((item) => item.skillId),
  )
  return platformSkills.filter((skill) => !adoptedIds.has(skill.id))
}

export function findSkillById(skillId: string) {
  return (
    platformSkills.find((skill) => skill.id === skillId) ??
    orgSkills.find((skill) => skill.id === skillId)
  )
}

export function createEmptyOrgSkill(orgId: string): SkillRecord {
  const id = `skill-org-${Date.now()}`
  return {
    id,
    scope: "org",
    orgId,
    metadata: { name: "", description: "" },
    rawContent: `---
name: 
description: 
---

# New Skill

## Instructions

Describe step-by-step guidance for Claude to follow.

## Examples

- Example prompt that should trigger this skill
`,
    category: "Operations",
    tags: [],
    source: "Custom",
    updatedAt: new Date().toISOString(),
    validation: {
      status: "draft",
      checks: [],
      warnings: [],
    },
  }
}
