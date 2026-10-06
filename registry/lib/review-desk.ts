/**
 * Domain-agnostic model for a review desk.
 * Labels, statuses, records, and the final action all come from config.
 * Clean-room: no product names, sample copy, or assets from any reference.
 */

import type { StatusTone } from "@/registry/retana/lib/status-tone"

export type { StatusTone }

export type ReviewIcon =
  | "grid"
  | "folder"
  | "file"
  | "checks"
  | "clipboard"
  | "bolt"
  | "alert"
  | "spark"
  | "chart"
  | "users"
  | "settings"
  | "landmark"
  | "home"
  | "shield"
  | "clock"
  | "calendar"
  | "send"
  | "eye"
  | "mail"
  | "download"
  | "refresh"
  | "upload"
  | "pin"

export type IssueSeverity = "pass" | "minor" | "critical" | "fixed"

export type ScoreSnapshot = {
  value: number
  passed: number
  minor: number
  critical: number
}

export type ReviewPerson = {
  id: string
  name: string
  role: string
  owner?: boolean
}

export type ReviewRecord = {
  id: string
  code: string
  title: string
  subtitle: string
  place: string
  statusId: string
  stageId: string
  progress: number
  specs: { label: string; value: string }[]
  chips?: { label: string }[]
  ownerId: string
  updated: string
  due?: string
  blocker?: string
  featured?: boolean
  fields: { label: string; value: string }[]
  members: ReviewPerson[]
  event?: { title: string; when: string; action: string }
  attention?: boolean
  risk?: "high" | "medium" | "low"
  /** Facet values keyed by facet id. */
  facets?: Record<string, string>
}

export type ReviewDocument = {
  id: string
  recordId: string
  groupId: string
  name: string
  meta: string
  statusId: string
  score: number | null
  date: string | null
  pages?: string
  state?: string
}

export type ReviewActivity = {
  id: string
  recordId: string
  title: string
  detail: string
  at: string
  source: "assistant" | "people" | "system"
  marker: "current" | "done"
  chips?: { label: string; tone?: StatusTone }[]
}

export type ReviewCheckTile = {
  id: string
  recordId: string
  value: string
  label: string
  detail?: string
  featured?: boolean
}

export type ReviewChange = {
  id: string
  kind: "add" | "edit"
  title: string
  detail: string
}

export type ReviewIssue = {
  id: string
  recordId: string
  documentId?: string
  title: string
  detail: string
  severity: IssueSeverity
  badge: string
  blocks: boolean
  explanation: string
  references: { id: string; title: string; detail: string }[]
  recommendation: { title: string; body: string; fields: { label: string }[] }
  before: string[]
  after: string[]
  highlightRow: number
  region: string
  caption: string
  location: string
  resolved: {
    title: string
    detail: string
    badge: string
    waiting: string
    callout: string
    calloutBody: string
  }
  changes: ReviewChange[]
}

export type ReviewInsight = {
  /** Omit for the home view. */
  recordId?: string
  place: "home" | "summary" | "documents" | "submission"
  variant: "bullets" | "status" | "stats" | "checklist"
  title: string
  time?: string
  headline: string
  body?: string
  bullets?: { id: string; tone: StatusTone; text: string }[]
  confidence?: number
  stats?: { label: string; value: string; tone?: StatusTone }[]
  checks?: { id: string; label: string }[]
  action?: string
}

export type ReviewFilter = {
  id: string
  label: string
  match: "all" | "status" | "stage" | "attention" | "progress"
  value?: string
  minProgress?: number
}

export type ReviewDeskCopy = {
  navigation: string
  greeting: string
  attentionPill: string
  search: string
  searchShortcut: string
  create: string
  collectionCount: string
  back: string
  more: string
  ranked: string
  showing: string
  openQueue: string
  collectionTitle: string
  codeColumn: string
  dueColumn: string
  riskColumn: string
  activityAll: string
  pipeline: string
  openPipeline: string
  progress: string
  emptyCollection: string
  requirements: string
  allComplete: string
  openRequirements: string
  activity: string
  details: string
  team: string
  addMember: string
  ownerSuffix: string
  documents: string
  checked: string
  dropTitle: string
  dropHint: string
  browse: string
  recent: string
  issues: string
  findingMeta: string
  blocks: string
  whatWeSaw: string
  references: string
  openViewer: string
  sendTo: string
  apply: string
  undo: string
  nextIssue: string
  recheck: string
  fixAll: string
  fixOne: string
  preview: string
  submit: string
  download: string
  tracker: string
  packageTitle: string
  packageMeta: string
  assembled: string
  finalCheck: string
  passed: string
  beforeSubmit: string
  deadline: string
  cancel: string
  history: string
  close: string
  assistantToggle: string
  notifications: string
  filter: string
  anyStatus: string
  notChecked: string
  notSet: string
  onTrack: string
  confidence: string
  openHint: string
  fixedHint: string
  applyTitle: string
  applyBody: string
  submitTitle: string
  submitBody: string
  confirmPay: string
  collapse: string
  actions: string
  userMenu: string
  emptyIssues: string
  emptyDocuments: string
  noteReply: string
  noteInternal: string
  noteReplyPlaceholder: string
  notePlaceholder: string
  noteSend: string
  noteHint: string
  notesList: string
  complete: string
  connected: string
  ready: string
}

export const reviewDeskCopy: ReviewDeskCopy = {
  navigation: "Sections",
  greeting: "Hello, {name}",
  attentionPill: "{count} need attention",
  search: "Search records",
  searchShortcut: "⌘K",
  create: "New record",
  collectionCount: "{count} open",
  back: "Back",
  more: "More",
  ranked: "Ranked for you",
  showing: "Showing {count}",
  openQueue: "Open queue",
  collectionTitle: "Records",
  codeColumn: "ID",
  dueColumn: "Due",
  riskColumn: "Risk",
  activityAll: "All",
  pipeline: "Pipeline",
  openPipeline: "Open",
  progress: "Progress",
  emptyCollection: "Nothing matches",
  requirements: "Requirements",
  allComplete: "All complete",
  openRequirements: "Open requirements",
  activity: "Activity",
  details: "Details",
  team: "People",
  addMember: "Add person",
  ownerSuffix: "owner",
  documents: "Documents",
  checked: "Checked {done} of {total}",
  dropTitle: "Drop files to check them",
  dropHint: "PDF or images, up to 25 MB",
  browse: "Browse files",
  recent: "Recent checks",
  issues: "Findings",
  findingMeta: "{index} of {total}",
  blocks: "Blocks submission",
  whatWeSaw: "What the check saw",
  references: "Requirements cited",
  openViewer: "Open in viewer",
  sendTo: "Send to owner",
  apply: "Apply change",
  undo: "Undo change",
  nextIssue: "Next finding",
  recheck: "Re-run check",
  fixAll: "Fix open items",
  fixOne: "Fix with assistant",
  preview: "Preview package",
  submit: "Submit package",
  download: "Download receipt",
  tracker: "Open tracker",
  packageTitle: "Package",
  packageMeta: "{documents} documents · {pages} pages",
  assembled: "Assembled in the order the destination expects",
  finalCheck: "Final check",
  passed: "Passed",
  beforeSubmit: "Before you submit",
  deadline: "Accepts filings until {until}",
  cancel: "Cancel",
  history: "The previous version stays in history",
  close: "Close",
  assistantToggle: "Assistant",
  notifications: "Notifications",
  filter: "Filter",
  anyStatus: "Any status",
  notChecked: "Not checked",
  notSet: "Not set",
  onTrack: "On track",
  confidence: "Confidence",
  openHint: "Fixing this raises the score to {score}",
  fixedHint: "Waiting on a person to approve the change",
  applyTitle: "Let the assistant edit this?",
  applyBody: "You approve the change before it is saved.",
  submitTitle: "Submit this package?",
  submitBody: "This files the package and cannot be undone from here.",
  confirmPay: "Submit",
  collapse: "Collapse sidebar",
  actions: "Actions",
  userMenu: "Account",
  emptyIssues: "No findings",
  emptyDocuments: "No documents",
  noteReply: "Reply",
  noteInternal: "Note",
  noteReplyPlaceholder: "Write a reply",
  notePlaceholder: "Write an internal note",
  noteSend: "Save",
  noteHint: "Ctrl+Enter",
  notesList: "Saved notes",
  complete: "Complete",
  connected: "Connected",
  ready: "Ready",
}

export type ReviewDeskConfig = {
  id: string
  brand: string
  userName: string
  userRole: string
  workspace: {
    name: string
    detail: string
    options: { id: string; name: string; detail: string }[]
  }
  assistantName: string
  assistantDetail: string
  tabs: { id: string; label: string; count?: number; panel: "summary" | "documents" | "submission" | "notes" }[]
  nav: {
    id: string
    label?: string
    items: {
      id: string
      label: string
      icon: ReviewIcon
      count?: number
      view?: "overview" | "collection" | "record"
    }[]
  }[]
  copy?: Partial<ReviewDeskCopy>
  statuses: { id: string; label: string; tone: StatusTone }[]
  stages: { id: string; label: string; meta?: string }[]
  periods: { id: string; label: string }[]
  defaultPeriod: string
  kpis: { id: string; label: string; value: string; detail: string; featured?: boolean }[]
  pipeline: { id: string; label: string; value: number; emphasis?: boolean }[]
  pipelineMeta: string
  records: ReviewRecord[]
  filters: ReviewFilter[]
  facets: { id: string; label: string; icon?: ReviewIcon; options: { id: string; label: string }[] }[]
  groups: { id: string; label: string; icon?: ReviewIcon }[]
  documents: ReviewDocument[]
  docFilters: { id: string; label: string; groupId?: string }[]
  activities: ReviewActivity[]
  tiles: ReviewCheckTile[]
  issues: ReviewIssue[]
  /** The finding whose resolution swaps the score snapshot. */
  scoreIssueId: string
  insights: ReviewInsight[]
  score: { open: ScoreSnapshot; resolved: ScoreSnapshot; caption: string; sheet: string }
  milestones: { id: string; label: string; meta: string }[]
  /** Index of the current milestone. */
  milestoneIndex: number
  packageGroups: { id: string; label: string; icon?: ReviewIcon }[]
  submission: {
    destination: { name: string; detail: string; status: string }
    fields: { label: string; value: string }[]
    options: { id: string; label: string; checked: boolean }[]
    confirm: { id: string; label: string; required?: boolean }[]
    ready: { title: string; body: string; stats: { label: string; value: string }[] }
    filed: { title: string; body: string; stats: { label: string; value: string }[] }
    next: {
      title: string
      body: string
      steps: { id: string; title: string; detail: string; icon?: ReviewIcon }[]
      action: string
    }
    notice: { title: string; body: string }
    deadline: string
    fee: string
  }
  fixOptions: { id: string; label: string; checked: boolean; required?: boolean }[]
  versionLabel: string
  header: { checked: string; fixed: string; ready: string; filed: string }
  contextLine: string
  attentionUpdated: string
  progressCaption: string
}

export type DeskView = "overview" | "collection" | "record"
export type RecordPanel = "summary" | "documents" | "review" | "submission" | "notes"
export type SubmissionPhase = "ready" | "confirming" | "filed"
export type IssuePhase = "open" | "fixing" | "fixed"

export type ReviewDeskState = {
  view: DeskView
  panel: RecordPanel
  recordId: string
  issueId: string
  issuePhase: IssuePhase
  submission: SubmissionPhase
  filterId: string
  docFilterId: string
  periodId: string
  activity: "all" | "assistant" | "people"
  assistant: boolean
  facets: Record<string, string>
  fixChecks: Record<string, boolean>
  submitChecks: Record<string, boolean>
  optionChecks: Record<string, boolean>
}

export function fill(template: string, vars: Record<string, string | number>) {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => String(vars[key] ?? ""))
}

export function resolveCopy(partial?: Partial<ReviewDeskCopy>): ReviewDeskCopy {
  return { ...reviewDeskCopy, ...partial }
}

export function defineReviewDesk(config: ReviewDeskConfig): ReviewDeskConfig {
  return config
}

export function recordMatches(record: ReviewRecord, filter: ReviewFilter | undefined) {
  if (!filter || filter.match === "all") return true
  if (filter.match === "attention") return Boolean(record.attention)
  if (filter.match === "status") return record.statusId === filter.value
  if (filter.match === "stage") return record.stageId === filter.value
  if (filter.match === "progress") return record.progress >= (filter.minProgress ?? 0)
  return true
}

export function filterCount(records: readonly ReviewRecord[], filter: ReviewFilter) {
  return records.filter((record) => recordMatches(record, filter)).length
}

export function scoreFromIssues(issues: readonly { severity: IssueSeverity }[]): ScoreSnapshot {
  const passed = issues.filter((issue) => issue.severity === "pass" || issue.severity === "fixed").length
  const minor = issues.filter((issue) => issue.severity === "minor").length
  const critical = issues.filter((issue) => issue.severity === "critical").length
  const total = Math.max(1, issues.length)
  return { value: Math.round((passed / total) * 100), passed, minor, critical }
}

export function scoreFor(config: ReviewDeskConfig, resolved: boolean): ScoreSnapshot {
  return resolved ? config.score.resolved : config.score.open
}

export function requiredChecked(options: readonly { id: string; required?: boolean }[], checks: Record<string, boolean>) {
  return options.every((option) => !option.required || checks[option.id])
}

export function initialDeskState(config: ReviewDeskConfig): ReviewDeskState {
  const featured = config.records.find((record) => record.featured) ?? config.records[0]
  const recordId = featured?.id ?? ""
  const issues = config.issues.filter((issue) => issue.recordId === recordId)
  const issueId = issues.find((issue) => issue.id === config.scoreIssueId)?.id ?? issues[0]?.id ?? ""
  const fixChecks: Record<string, boolean> = {}
  for (const option of config.fixOptions) fixChecks[option.id] = option.checked
  const submitChecks: Record<string, boolean> = {}
  for (const option of config.submission.confirm) submitChecks[option.id] = false
  const optionChecks: Record<string, boolean> = {}
  for (const option of config.submission.options) optionChecks[option.id] = option.checked
  const facets: Record<string, string> = {}
  for (const facet of config.facets) facets[facet.id] = facet.options[0]?.id ?? ""
  return {
    view: "overview",
    panel: "summary",
    recordId,
    issueId,
    issuePhase: "open",
    submission: "ready",
    filterId: config.filters[0]?.id ?? "all",
    docFilterId: config.docFilters[0]?.id ?? "all",
    periodId: config.defaultPeriod,
    activity: "all",
    assistant: true,
    facets,
    fixChecks,
    submitChecks,
    optionChecks,
  }
}

export function issueSeverity(issue: ReviewIssue, phase: IssuePhase, scoreIssueId: string): IssueSeverity {
  if (issue.id === scoreIssueId && phase === "fixed") return "fixed"
  return issue.severity
}
