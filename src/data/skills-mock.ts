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

const ACME_STRATEGY_SKILL = `---
name: acme-strategy-writing
description: Draft and refine Acme Corp strategy documents using corporate tone and section templates. Use when writing strategy papers, executive summaries, or investment theme narratives.
---

# Acme Strategy Writing

## Instructions

1. Follow the Acme strategy paper outline: context, market outlook, priorities, investments, risks.
2. Use concise executive tone — avoid jargon unless defined.
3. Cite sources inline when using external market data.
4. Flag assumptions that need leadership validation.

## Examples

- Draft the 2027 market outlook section
- Refine executive summary to two pages
`

const ACME_SERVICENOW_SKILL = `---
name: acme-servicenow-triage
description: Analyze ServiceNow helpdesk exports for trends, SLA breaches, and recurring root causes. Use when reviewing IT ticket data or helpdesk performance reports.
---

# ServiceNow Helpdesk Triage

## Instructions

1. Normalize ticket categories before aggregating trends.
2. Report volume, mean time to resolve, and SLA breach rate by category.
3. Highlight week-over-week changes for top five categories.
4. Suggest likely root causes only when supported by ticket notes patterns.

## Examples

- Summarize password-reset ticket trends
- Identify recurring VPN connectivity incidents
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
  {
    id: "skill-platform-safety-preamble",
    scope: "platform",
    metadata: {
      name: "platform-safety-preamble",
      description:
        "Platform-wide safety instructions prepended to all agents. Use for every agent run to enforce baseline safety.",
    },
    rawContent: `---
name: platform-safety-preamble
description: Platform-wide safety instructions prepended to all agents.
---

# Platform Safety

Do not expose secrets, credentials, or PII. Refuse harmful requests.
`,
    category: "Compliance",
    tags: ["platform", "safety"],
    source: "RAI platform library",
    updatedAt: "2026-05-01T08:00:00Z",
    validation: {
      status: "validated",
      validatedAt: "2026-05-01T08:00:00Z",
      validatedBy: "Platform trust & safety",
      checks: validatedChecks(),
      warnings: [],
    },
  },
]

export const orgSkills: SkillRecord[] = [
  {
    id: "skill-org-acme-strategy",
    scope: "org",
    orgId: "org-1",
    metadata: {
      name: "acme-strategy-writing",
      description:
        "Draft and refine Acme Corp strategy documents using corporate tone and section templates. Use when writing strategy papers, executive summaries, or investment theme narratives.",
    },
    rawContent: ACME_STRATEGY_SKILL,
    category: "Documents",
    tags: ["strategy", "executive", "writing"],
    source: "Acme Corp",
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
    id: "skill-org-acme-servicenow",
    scope: "org",
    orgId: "org-1",
    metadata: {
      name: "acme-servicenow-triage",
      description:
        "Analyze ServiceNow helpdesk exports for trends, SLA breaches, and recurring root causes. Use when reviewing IT ticket data or helpdesk performance reports.",
    },
    rawContent: ACME_SERVICENOW_SKILL,
    category: "Operations",
    tags: ["servicenow", "helpdesk", "it-ops"],
    source: "Acme Corp",
    updatedAt: "2026-05-16T13:00:00Z",
    createdBy: "Chris Alvarez",
    validation: {
      status: "validated",
      validatedAt: "2026-05-16T14:00:00Z",
      validatedBy: "Chris Alvarez",
      checks: validatedChecks(),
      warnings: [],
    },
  },
  {
    id: "skill-org-acme-executive-tone",
    scope: "org",
    orgId: "org-1",
    metadata: {
      name: "executive-tone",
      description:
        "Concise, board-ready language for leadership deliverables. Use when drafting executive summaries or board materials.",
    },
    rawContent: `---
name: executive-tone
description: Concise, board-ready language for leadership deliverables.
---

# Executive Tone

Write in an executive tone: lead with conclusions, avoid jargon, keep sections under 200 words.
`,
    category: "Documents",
    tags: ["writing", "executive"],
    source: "Acme Corp",
    updatedAt: "2026-05-12T10:00:00Z",
    createdBy: "Alex Rivera",
    validation: {
      status: "validated",
      validatedAt: "2026-05-12T11:00:00Z",
      validatedBy: "Alex Rivera",
      checks: validatedChecks(),
      warnings: [],
    },
  },
  {
    id: "skill-org-acme-source-citation",
    scope: "org",
    orgId: "org-1",
    metadata: {
      name: "source-citation",
      description:
        "Require inline citations for factual claims. Use when producing research outputs or evidence-based reports.",
    },
    rawContent: `---
name: source-citation
description: Require inline citations for factual claims.
---

# Source Citation

Cite every factual claim with [source: document name]. Flag uncertainty explicitly.
`,
    category: "Compliance",
    tags: ["research", "compliance"],
    source: "Acme Corp",
    updatedAt: "2026-05-12T10:00:00Z",
    createdBy: "Alex Rivera",
    validation: {
      status: "validated",
      validatedAt: "2026-05-12T11:00:00Z",
      validatedBy: "Alex Rivera",
      checks: validatedChecks(),
      warnings: [],
    },
  },
  {
    id: "skill-org-acme-voc",
    scope: "org",
    orgId: "org-1",
    metadata: {
      name: "voice-of-customer-synthesis",
      description:
        "Build Voice of the Customer reports from multi-source feedback. Use when synthesizing customer signals into themes, sentiment, and a board-ready narrative. Always mask customer names and deal sizes.",
    },
    rawContent: `---
name: voice-of-customer-synthesis
description: Build Voice of the Customer reports from multi-source feedback (Salesforce, ServiceNow, call transcripts). Always mask customer names and deal sizes.
---

# Voice of the Customer Synthesis

## Instructions

1. Pull feedback from every connected source (Salesforce, ServiceNow, Gong) before synthesizing.
2. Mask customer names and exact deal sizes using the project vault. Use stable aliases (Customer A) and ARR bands ($250K–$500K) — never raw values.
3. De-duplicate signals that appear in more than one source for the same account and week.
4. Weight themes by signal count multiplied by the originating account's ARR band.
5. Score sentiment by segment and region; call out event-driven dips.
6. Lead with conclusions, support every claim with evidence counts and a masked quote, and end with owner-tagged recommendations.
7. Write the final report to the project's report/ folder.

## Examples

- "Synthesize this quarter's customer feedback into a VoC report"
- "Cluster these tickets and call transcripts into themes with sentiment"
`,
    category: "Documents",
    tags: ["voice-of-customer", "research", "writing", "masking"],
    source: "Acme Corp",
    updatedAt: "2026-05-18T10:00:00Z",
    createdBy: "Maya Thompson",
    validation: {
      status: "validated",
      validatedAt: "2026-05-18T11:00:00Z",
      validatedBy: "Maya Thompson",
      checks: validatedChecks(),
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
  { orgId: "org-1", skillId: "skill-platform-data-analysis", enabled: true, adoptedAt: "2026-05-05T10:00:00Z" },
  { orgId: "org-1", skillId: "skill-platform-customer-support", enabled: true, adoptedAt: "2026-05-08T10:00:00Z" },
  { orgId: "org-1", skillId: "skill-platform-safety-preamble", enabled: true, adoptedAt: "2026-05-01T10:00:00Z" },
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
