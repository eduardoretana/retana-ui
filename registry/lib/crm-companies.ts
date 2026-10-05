/**
 * Clean-room sales CRM model. Behavior is inspired by an unlicensed reference.
 * No source, class names, copy, sample rows, or assets were copied.
 */

export type CrmStatusTone = "neutral" | "emphasis" | "muted" | "danger"

export type CrmCompany = {
  id: string
  name: string
  logoUrl?: string
  status: string
  statusLabel: string
  statusTone?: CrmStatusTone
  owner: string
  ownerId?: string
  pipelineValue: number
  /** 0–100. */
  score: number
  /** Oldest to newest. The table draws this as a sparkline. */
  activity: readonly number[]
  activityLabel: string
  industry?: string
  region?: string
  email?: string
  website?: string
  phone?: string
  notes?: string
  /** Oldest to newest. The detail panel draws this as a trend. */
  trend?: readonly { key: string; label: string; value: number }[]
  /** 0–100 health for the meter. Falls back to score. */
  health?: number
}

export type CrmNotice = {
  id: string
  title: string
  description?: string
  time: string
  dateTime?: string
  read?: boolean
  companyId?: string
}

export type CrmSortKey = "name" | "status" | "owner" | "pipeline" | "score" | "activity"

export type CrmSort = {
  key: CrmSortKey
  direction: "asc" | "desc"
}

export type CrmFacetSelection = Record<string, readonly string[]>

export type CrmCompanyQuery = {
  search?: string
  /** Status id, or the all-segment id. */
  segment?: string
  allSegment?: string
  facets?: CrmFacetSelection
}

export type CrmCsvLabels = {
  name: string
  status: string
  owner: string
  pipeline: string
  score: string
  activity: string
}

export type CrmCompanyDraft = {
  name: string
  status: string
  ownerId: string
  email: string
  website: string
  industry: string
  region: string
  pipelineValue: string
  notes: string
  logo?: { type: string; size: number } | null
}

export type CrmDraftIssue =
  | "name-required"
  | "status-required"
  | "owner-required"
  | "email-invalid"
  | "website-invalid"
  | "pipeline-invalid"
  | "logo-type"
  | "logo-size"

export const CRM_LOGO_TYPES = ["image/png", "image/jpeg", "image/webp", "image/gif"] as const
export const CRM_LOGO_MAX_BYTES = 2_000_000

export const EMPTY_COMPANY_DRAFT: CrmCompanyDraft = {
  name: "",
  status: "",
  ownerId: "",
  email: "",
  website: "",
  industry: "",
  region: "",
  pipelineValue: "",
  notes: "",
  logo: null,
}

export function crmInitials(name: string) {
  const parts = name.split(/\s+/).filter(Boolean).slice(0, 2)
  const letters = parts.map((part) => [...part][0] ?? "").join("")
  return letters.toLocaleUpperCase() || "?"
}

export function companyFacetValue(company: CrmCompany, facetId: string) {
  if (facetId === "owner") return company.ownerId ?? company.owner
  if (facetId === "industry") return company.industry ?? ""
  if (facetId === "region") return company.region ?? ""
  if (facetId === "status") return company.status
  return ""
}

export function companySearchText(company: CrmCompany) {
  return [company.name, company.owner, company.statusLabel, company.industry, company.region, company.email]
    .filter(Boolean)
    .join(" ")
    .toLocaleLowerCase()
}

export function facetSelectionCount(selection: CrmFacetSelection) {
  return Object.values(selection).reduce((sum, values) => sum + values.length, 0)
}

export function toggleFacetValue(selection: CrmFacetSelection, facetId: string, value: string): CrmFacetSelection {
  const current = selection[facetId] ?? []
  const next = current.includes(value) ? current.filter((item) => item !== value) : [...current, value]
  return { ...selection, [facetId]: next }
}

export function filterCompanies(rows: readonly CrmCompany[], query: CrmCompanyQuery = {}) {
  const search = query.search?.trim().toLocaleLowerCase() ?? ""
  const allSegment = query.allSegment ?? "all"
  const segment = query.segment && query.segment !== allSegment ? query.segment : ""
  const facets = Object.entries(query.facets ?? {}).filter(([, values]) => values.length > 0)

  return rows.filter((company) => {
    if (segment && company.status !== segment) return false
    if (search && !companySearchText(company).includes(search)) return false
    return facets.every(([facetId, values]) => values.includes(companyFacetValue(company, facetId)))
  })
}

function sortValue(company: CrmCompany, key: CrmSortKey) {
  switch (key) {
    case "name":
      return company.name
    case "status":
      return company.statusLabel
    case "owner":
      return company.owner
    case "pipeline":
      return company.pipelineValue
    case "score":
      return company.score
    case "activity":
      return company.activity.at(-1) ?? 0
    default: {
      const unreachable: never = key
      return unreachable
    }
  }
}

export function sortCompanies(rows: readonly CrmCompany[], sort: CrmSort) {
  const direction = sort.direction === "asc" ? 1 : -1
  return [...rows].sort((a, b) => {
    const left = sortValue(a, sort.key)
    const right = sortValue(b, sort.key)
    const compared =
      typeof left === "number" && typeof right === "number"
        ? left - right
        : String(left).localeCompare(String(right), undefined, { numeric: true, sensitivity: "base" })
    if (compared !== 0) return compared * direction
    return a.id.localeCompare(b.id)
  })
}

export function paginate<T>(rows: readonly T[], page: number, pageSize: number) {
  const size = Math.max(1, Math.floor(pageSize) || 1)
  const total = rows.length
  const pages = Math.max(1, Math.ceil(total / size))
  const index = Math.min(Math.max(0, Math.floor(page) || 0), pages - 1)
  const start = index * size
  return {
    page: index,
    pages,
    start,
    end: Math.min(total, start + size),
    total,
    rows: rows.slice(start, start + size),
  }
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const WEBSITE = /^https?:\/\/\S+$/i

export function companyDraftIssues(draft: CrmCompanyDraft): CrmDraftIssue[] {
  const issues: CrmDraftIssue[] = []
  if (!draft.name.trim()) issues.push("name-required")
  if (!draft.status) issues.push("status-required")
  if (!draft.ownerId) issues.push("owner-required")
  if (draft.email.trim() && !EMAIL.test(draft.email.trim())) issues.push("email-invalid")
  if (draft.website.trim() && !WEBSITE.test(draft.website.trim())) issues.push("website-invalid")
  const pipeline = Number(draft.pipelineValue)
  if (draft.pipelineValue.trim() === "" || !Number.isFinite(pipeline) || pipeline < 0) issues.push("pipeline-invalid")
  if (draft.logo && draft.logo.size > 0) {
    if (!CRM_LOGO_TYPES.includes(draft.logo.type as (typeof CRM_LOGO_TYPES)[number])) issues.push("logo-type")
    if (draft.logo.size > CRM_LOGO_MAX_BYTES) issues.push("logo-size")
  }
  return issues
}

export function companyFromDraft(
  draft: CrmCompanyDraft & { logoUrl?: string },
  context: {
    id: string
    ownerName: string
    statusLabel: string
    statusTone?: CrmStatusTone
    activityLabel: string
  },
): CrmCompany {
  const pipelineValue = Number(draft.pipelineValue)
  return {
    id: context.id,
    name: draft.name.trim(),
    logoUrl: draft.logoUrl,
    status: draft.status,
    statusLabel: context.statusLabel,
    statusTone: context.statusTone,
    owner: context.ownerName,
    ownerId: draft.ownerId,
    pipelineValue: Number.isFinite(pipelineValue) ? pipelineValue : 0,
    score: 50,
    health: 50,
    activity: [2, 2, 3, 3],
    activityLabel: context.activityLabel,
    industry: draft.industry.trim() || undefined,
    region: draft.region.trim() || undefined,
    email: draft.email.trim() || undefined,
    website: draft.website.trim() || undefined,
    notes: draft.notes.trim() || undefined,
    trend: [{ key: "now", label: context.activityLabel, value: 1 }],
  }
}
