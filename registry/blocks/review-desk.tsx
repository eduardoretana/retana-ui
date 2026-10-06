"use client"

/**
 * Configurable review desk. Nav, records, findings, and the final action
 * come from a ReviewDeskConfig. No domain words are hard-coded.
 * Clean-room: behavior only, host tokens only.
 */

import * as React from "react"
import {
  BarChart3,
  Bell,
  Calendar,
  ClipboardCheck,
  Clock,
  Download,
  Eye,
  FileText,
  Folder,
  House,
  Landmark,
  LayoutGrid,
  ListChecks,
  Mail,
  MapPin,
  MoreHorizontal,
  Plus,
  RefreshCw,
  Search,
  Send,
  Settings,
  ShieldCheck,
  Sparkles,
  TriangleAlert,
  Upload,
  Users,
  Zap,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import {
  fill,
  filterCount,
  initialDeskState,
  issueSeverity,
  recordMatches,
  requiredChecked,
  resolveCopy,
  scoreFor,
  type ReviewDeskConfig,
  type ReviewDeskCopy,
  type ReviewDeskState,
  type ReviewIcon,
  type ReviewRecord,
} from "@/registry/retana/lib/review-desk"
import { ActionFooter } from "@/registry/retana/ui/action-footer"
import { AssistantStatusCard } from "@/registry/retana/ui/assistant-status-card"
import { AttentionList } from "@/registry/retana/ui/attention-list"
import { BreakdownBar } from "@/registry/retana/ui/breakdown-bar"
import { CheckTiles } from "@/registry/retana/ui/check-tiles"
import { ChipGroup } from "@/registry/retana/ui/chip-group"
import { ComparePanel } from "@/registry/retana/ui/compare-panel"
import { DestinationCard } from "@/registry/retana/ui/destination-card"
import { DetectionOverlay } from "@/registry/retana/ui/detection-overlay"
import { DocumentList } from "@/registry/retana/ui/document-list"
import { EventCallout } from "@/registry/retana/ui/event-callout"
import { FilterToolbar } from "@/registry/retana/ui/filter-toolbar"
import { InsightCard } from "@/registry/retana/ui/insight-card"
import { IssueDetail } from "@/registry/retana/ui/issue-detail"
import { IssueList } from "@/registry/retana/ui/issue-list"
import { MagneticDropzone } from "@/registry/retana/ui/magnetic-dropzone"
import { MemberList } from "@/registry/retana/ui/member-list"
import { NextSteps } from "@/registry/retana/ui/next-steps"
import { PriorityBadge } from "@/registry/retana/ui/priority-badge"
import { ProposalWorkspace } from "@/registry/retana/ui/proposal-workspace"
import { RecordCard } from "@/registry/retana/ui/record-card"
import { RecordHeader } from "@/registry/retana/ui/record-header"
import { RecordTimeline } from "@/registry/retana/ui/record-timeline"
import { ReplyComposer } from "@/registry/retana/ui/reply-composer"
import { ScoreCard } from "@/registry/retana/ui/score-card"
import { SegmentedControl } from "@/registry/retana/ui/segmented-control"
import { SourceList } from "@/registry/retana/ui/source-list"
import { StatusBanner } from "@/registry/retana/ui/status-banner"
import { StatusPill } from "@/registry/retana/ui/status-pill"
import { StatStrip } from "@/registry/retana/ui/stat-strip"
import { Stepper } from "@/registry/retana/ui/stepper"
import { SuggestionCard } from "@/registry/retana/ui/suggestion-card"
import { ToolApproval } from "@/registry/retana/ui/tool-approval"
import { WorkspaceSwitcher } from "@/registry/retana/ui/workspace-switcher"

const ICONS: Record<ReviewIcon, LucideIcon> = {
  grid: LayoutGrid,
  folder: Folder,
  file: FileText,
  checks: ListChecks,
  clipboard: ClipboardCheck,
  bolt: Zap,
  alert: TriangleAlert,
  spark: Sparkles,
  chart: BarChart3,
  users: Users,
  settings: Settings,
  landmark: Landmark,
  home: House,
  shield: ShieldCheck,
  clock: Clock,
  calendar: Calendar,
  send: Send,
  eye: Eye,
  mail: Mail,
  download: Download,
  refresh: RefreshCw,
  upload: Upload,
  pin: MapPin,
}

function Glyph({ name, className }: { name?: ReviewIcon; className?: string }) {
  if (!name) return null
  const Icon = ICONS[name]
  return <Icon className={className} />
}

export type ReviewDeskProps = {
  config: ReviewDeskConfig
  className?: string
  onCreate?: () => void
}

export function ReviewDesk({ config, className, onCreate }: ReviewDeskProps) {
  const copy = resolveCopy(config.copy)
  const searchRef = React.useRef<HTMLInputElement>(null)
  const [query, setQuery] = React.useState("")
  const [workspaceId, setWorkspaceId] = React.useState(config.workspace.options[0]?.id ?? "")
  const [state, setState] = React.useState<ReviewDeskState>(() => initialDeskState(config))
  const [trackedId, setTrackedId] = React.useState(config.id)
  if (trackedId !== config.id) {
    setTrackedId(config.id)
    setState(initialDeskState(config))
    setQuery("")
    setWorkspaceId(config.workspace.options[0]?.id ?? "")
  }

  React.useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault()
        searchRef.current?.focus()
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [])

  const record = config.records.find((item) => item.id === state.recordId) ?? config.records[0]
  const resolved = state.issuePhase === "fixed"
  const score = scoreFor(config, resolved)
  const attention = config.records.filter((item) => item.attention).length
  const viewKey = `${state.view}:${state.panel}:${state.recordId}:${state.issuePhase}:${state.submission}`

  function go(view: ReviewDeskState["view"], recordId = state.recordId) {
    setState((current) => ({
      ...current,
      view,
      recordId,
      panel: view === "record" ? current.panel : "summary",
      issuePhase: current.issuePhase === "fixing" ? "open" : current.issuePhase,
      submission: current.submission === "confirming" ? "ready" : current.submission,
    }))
  }

  function openRecord(id: string, panel: ReviewDeskState["panel"] = "summary") {
    const issues = config.issues.filter((issue) => issue.recordId === id)
    setState((current) => ({
      ...current,
      view: "record",
      panel,
      recordId: id,
      issueId: issues.find((issue) => issue.id === config.scoreIssueId)?.id ?? issues[0]?.id ?? current.issueId,
    }))
  }

  const deskBody = (
    <>
      {state.view === "overview" ? (
        <Overview
          config={config}
          copy={copy}
          state={state}
          query={query}
          searchRef={searchRef}
          onQuery={setQuery}
          onCreate={onCreate}
          attention={attention}
          onOpen={openRecord}
          onPeriod={(periodId) => setState((current) => ({ ...current, periodId }))}
        />
      ) : null}
      {state.view === "collection" ? (
        <Collection
          config={config}
          copy={copy}
          state={state}
          query={query}
          searchRef={searchRef}
          onQuery={setQuery}
          onCreate={onCreate}
          onOpen={openRecord}
          onFilter={(filterId) => setState((current) => ({ ...current, filterId }))}
          onFacet={(id, value) => setState((current) => ({ ...current, facets: { ...current.facets, [id]: value } }))}
        />
      ) : null}
      {state.view === "record" && record ? (
        <RecordView
          config={config}
          copy={copy}
          state={state}
          record={record}
          score={score}
          resolved={resolved}
          onBack={() => (state.panel === "review" ? setState((current) => ({ ...current, panel: "documents" })) : go("collection"))}
          onPanel={(panel) => setState((current) => ({ ...current, panel }))}
          onIssue={(issueId) => setState((current) => ({ ...current, issueId, panel: "review" }))}
          onActivity={(activity) => setState((current) => ({ ...current, activity }))}
          onDocFilter={(docFilterId) => setState((current) => ({ ...current, docFilterId }))}
          onFix={() => setState((current) => ({ ...current, issuePhase: "fixing" }))}
          onUndo={() => setState((current) => ({ ...current, issuePhase: "open" }))}
          onNext={() => {
            const issues = config.issues.filter((issue) => issue.recordId === record.id)
            const index = issues.findIndex((issue) => issue.id === state.issueId)
            const next = issues[(index + 1) % Math.max(1, issues.length)]
            if (next) setState((current) => ({ ...current, issueId: next.id }))
          }}
          onSubmit={() => setState((current) => ({ ...current, submission: "confirming" }))}
          onOption={(id, checked) => setState((current) => ({ ...current, optionChecks: { ...current.optionChecks, [id]: checked } }))}
        />
      ) : null}
    </>
  )

  const shell = (
    <div data-slot="review-desk" className={cn("flex h-[min(920px,100%)] min-h-[680px] gap-3 overflow-hidden bg-muted p-3 text-foreground", className)}>
      <Sidebar
        config={config}
        copy={copy}
        state={state}
        attention={attention}
        workspaceId={workspaceId}
        onWorkspace={setWorkspaceId}
        onView={(view) => go(view)}
        onAssistant={(assistant) => setState((current) => ({ ...current, assistant }))}
      />
      <div key={viewKey} className="flex min-h-0 flex-1 flex-col gap-3 overflow-auto motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-2 motion-safe:duration-200">
        {deskBody}
      </div>
      <p className="sr-only" aria-live="polite">
        {score.value}
      </p>
      <FixDialog config={config} copy={copy} state={state} setState={setState} />
      <SubmitDialog config={config} copy={copy} state={state} setState={setState} />
    </div>
  )
  return shell
}

function Sidebar({
  config,
  copy,
  state,
  attention,
  workspaceId,
  onWorkspace,
  onView,
  onAssistant,
}: {
  config: ReviewDeskConfig
  copy: ReturnType<typeof resolveCopy>
  state: ReviewDeskState
  attention: number
  workspaceId: string
  onWorkspace: (id: string) => void
  onView: (view: ReviewDeskState["view"]) => void
  onAssistant: (checked: boolean) => void
}) {
  const items = config.nav.flatMap((group) => group.items)
  function onKey(event: React.KeyboardEvent<HTMLElement>) {
    if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) return
    const buttons = [...event.currentTarget.querySelectorAll<HTMLButtonElement>("button[data-nav]")]
    const index = buttons.indexOf(document.activeElement as HTMLButtonElement)
    if (index < 0) return
    event.preventDefault()
    const next =
      event.key === "Home" ? 0 : event.key === "End" ? buttons.length - 1 : event.key === "ArrowDown" ? Math.min(buttons.length - 1, index + 1) : Math.max(0, index - 1)
    buttons[next]?.focus()
  }
  return (
    <aside className="flex w-60 shrink-0 flex-col gap-3 overflow-auto rounded-2xl bg-card p-3">
      <div className="flex items-center gap-2 px-1">
        <span aria-hidden className="grid size-8 place-items-center rounded-lg bg-foreground text-xs font-semibold text-background">
          {config.brand.slice(0, 1)}
        </span>
        <span className="min-w-0 flex-1 truncate text-sm font-medium">{config.brand}</span>
      </div>
      <WorkspaceSwitcher
        name={config.workspace.name}
        detail={config.workspace.detail}
        label={config.workspace.name}
        options={config.workspace.options}
        value={workspaceId}
        onValueChange={onWorkspace}
      />
      <nav aria-label={copy.navigation} onKeyDown={onKey} className="flex flex-col gap-3">
        {config.nav.map((group) => (
          <div key={group.id}>
            {group.label ? <p className="px-3 pb-1 text-[10px] tracking-wide text-muted-foreground uppercase">{group.label}</p> : null}
            <ul className="flex flex-col gap-0.5">
              {group.items.map((item) => {
                const current = Boolean(item.view && state.view === item.view && items.find((entry) => entry.view === item.view)?.id === item.id)
                return (
                  <li key={item.id}>
                    <button
                      type="button"
                      data-nav=""
                      aria-current={current ? "page" : undefined}
                      disabled={!item.view}
                      onClick={() => item.view && onView(item.view)}
                      className={cn(
                        "flex w-full items-center gap-2 rounded-full px-3 py-1.5 text-sm hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-default disabled:hover:bg-transparent",
                        current && "bg-foreground text-background hover:bg-foreground",
                      )}
                    >
                      <Glyph name={item.icon} className="size-4 shrink-0" />
                      <span className="min-w-0 flex-1 truncate text-start">{item.label}</span>
                      {item.count != null ? (
                        <span
                          className={cn(
                            "rounded-full px-1.5 font-mono text-[10px] tabular-nums",
                            current ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
                          )}
                        >
                          {item.count}
                        </span>
                      ) : null}
                    </button>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </nav>
      <div className="mt-auto flex flex-col gap-2">
        <AssistantStatusCard
          name={config.assistantName}
          detail={config.assistantDetail}
          icon={<Sparkles className="size-3.5" />}
          checked={state.assistant}
          onCheckedChange={onAssistant}
          switchLabel={copy.assistantToggle}
          attention={fill(copy.attentionPill, { count: attention })}
          onAttention={() => onView("overview")}
        />
        <div className="flex items-center gap-2 rounded-xl bg-muted px-2 py-2">
          <span aria-hidden className="grid size-8 place-items-center rounded-full bg-card text-xs font-semibold">
            {config.userName.slice(0, 1)}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-medium">{config.userName}</span>
            <span className="block truncate text-xs text-muted-foreground">{config.userRole}</span>
          </span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button type="button" size="icon-sm" variant="ghost" className="rounded-full" aria-label={copy.userMenu}>
                <MoreHorizontal />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>{copy.userMenu}</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </aside>
  )
}

function SearchPill({
  copy,
  query,
  onQuery,
  inputRef,
}: {
  copy: ReturnType<typeof resolveCopy>
  query: string
  onQuery: (value: string) => void
  inputRef: React.RefObject<HTMLInputElement | null>
}) {
  return (
    <label className="flex h-9 min-w-0 flex-1 items-center gap-2 rounded-full bg-card px-3 sm:max-w-xs">
      <Search className="size-4 shrink-0 text-muted-foreground" aria-hidden />
      <input
        ref={inputRef}
        value={query}
        onChange={(event) => onQuery(event.target.value)}
        placeholder={copy.search}
        aria-label={copy.search}
        className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
      />
      <kbd className="hidden rounded-md bg-primary/15 px-1.5 font-mono text-[10px] sm:inline">{copy.searchShortcut}</kbd>
    </label>
  )
}

function HeaderActions({
  copy,
  query,
  onQuery,
  inputRef,
  onCreate,
  primary,
}: {
  copy: ReturnType<typeof resolveCopy>
  query: string
  onQuery: (value: string) => void
  inputRef: React.RefObject<HTMLInputElement | null>
  onCreate?: () => void
  primary?: React.ReactNode
}) {
  return (
    <div className="flex min-w-0 flex-1 flex-wrap items-center justify-end gap-2">
      <SearchPill copy={copy} query={query} onQuery={onQuery} inputRef={inputRef} />
      <Button type="button" size="icon" variant="ghost" className="relative rounded-full bg-card" aria-label={copy.notifications}>
        <Bell />
        <span aria-hidden className="absolute end-1.5 top-1.5 size-1.5 rounded-full bg-destructive" />
      </Button>
      {primary ?? (
        <Button type="button" className="rounded-full" onClick={onCreate}>
          <Plus data-icon="inline-start" />
          {copy.create}
        </Button>
      )}
    </div>
  )
}

function Overview({
  config,
  copy,
  state,
  query,
  searchRef,
  onQuery,
  onCreate,
  attention,
  onOpen,
  onPeriod,
}: {
  config: ReviewDeskConfig
  copy: ReturnType<typeof resolveCopy>
  state: ReviewDeskState
  query: string
  searchRef: React.RefObject<HTMLInputElement | null>
  onQuery: (value: string) => void
  onCreate?: () => void
  attention: number
  onOpen: (id: string) => void
  onPeriod: (id: string) => void
}) {
  const featured = config.records.find((item) => item.featured) ?? config.records[0]
  const home = config.insights.find((item) => item.place === "home")
  const flagged = config.records.filter((item) => item.attention && (!query || `${item.title} ${item.code}`.toLowerCase().includes(query.toLowerCase())))
  return (
    <div className="flex flex-col gap-3">
      <header className="flex flex-wrap items-center gap-3">
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <h1 className="text-2xl font-medium">{fill(copy.greeting, { name: config.userName.split(" ")[0] ?? config.userName })}</h1>
          <StatusPill tone="accent" label={fill(copy.attentionPill, { count: attention })} icon={<TriangleAlert className="size-3" />} />
        </div>
        <HeaderActions copy={copy} query={query} onQuery={onQuery} inputRef={searchRef} onCreate={onCreate} />
      </header>
      <div className="grid gap-3 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.4fr)]">
        {featured ? (
          <RecordCard
            variant="hero"
            code={featured.code}
            title={featured.title}
            subtitle={featured.subtitle}
            status={<StatusPill overlay label={statusLabel(config, featured.statusId)} tone={statusTone(config, featured.statusId)} />}
            progress={featured.progress}
            progressLabel={copy.progress}
            stats={featured.specs.slice(0, 3)}
            onOpen={() => onOpen(featured.id)}
            openLabel={featured.title}
          />
        ) : null}
        <section className="flex flex-col gap-3 rounded-2xl bg-card p-3">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-sm font-medium">{copy.pipeline}</h2>
            <SegmentedControl
              label={copy.pipeline}
              options={config.periods.map((period) => ({ value: period.id, label: period.label }))}
              value={state.periodId}
              onValueChange={onPeriod}
            />
          </div>
          <StatStrip
            variant="tiles"
            items={config.kpis.map((kpi) => ({ id: kpi.id, label: kpi.label, value: kpi.value, caption: kpi.detail, featured: kpi.featured }))}
          />
          <BreakdownBar
            variant="pipeline"
            total={config.pipeline.reduce((sum, item) => sum + item.value, 0)}
            format="number"
            label={copy.pipeline}
            heading={copy.pipeline}
            caption={config.pipelineMeta}
            action={{ label: copy.openPipeline, onSelect: () => onOpen(featured?.id ?? "") }}
            emphasis={Math.max(0, config.pipeline.findIndex((item) => item.emphasis))}
            segments={config.pipeline.map((item) => ({ id: item.id, label: item.label, value: item.value }))}
          />
        </section>
      </div>
      <div className="grid gap-3 xl:grid-cols-[minmax(0,1.6fr)_minmax(16rem,0.7fr)]">
        <section className="rounded-2xl bg-card p-3">
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="text-sm font-medium">{copy.ranked}</h2>
              <p className="text-xs text-muted-foreground">{fill(copy.showing, { count: flagged.length })} · {config.attentionUpdated}</p>
            </div>
            <StatusPill tone="accent" dot={false} icon={<Sparkles className="size-3" />} label={copy.ranked} />
          </div>
          <AttentionList
            layout="table"
            label={copy.ranked}
            items={flagged.map((item) => ({
              id: item.id,
              title: item.code,
              onSelect: () => onOpen(item.id),
              cells: {
                code: <span className="font-mono text-xs">{item.code}</span>,
                title: (
                  <span>
                    <span className="block text-sm">{item.title}</span>
                    <span className="block text-xs text-muted-foreground">{item.place}</span>
                  </span>
                ),
                stage: <StatusPill tone="neutral" dot={false} label={stageLabel(config, item.stageId)} />,
                blocker: item.blocker,
                risk: item.risk ? <PriorityBadge level={item.risk === "low" ? "low" : item.risk === "medium" ? "medium" : "high"} variant="pill" label={item.risk} /> : null,
                due: <span className="font-mono text-xs">{item.due}</span>,
              },
            }))}
            columns={[
              { id: "code", label: copy.codeColumn, mono: true },
              { id: "title", label: copy.details },
              { id: "stage", label: copy.pipeline },
              { id: "blocker", label: copy.issues },
              { id: "risk", label: copy.riskColumn },
              { id: "due", label: copy.dueColumn, mono: true },
            ]}
          />
          <div className="mt-2 flex items-center justify-between text-xs">
            <span className="text-muted-foreground">{fill(copy.showing, { count: flagged.length })}</span>
            <button type="button" className="font-medium" onClick={() => onOpen(featured?.id ?? "")}>
              {copy.openQueue}
            </button>
          </div>
        </section>
        <div className="flex flex-col gap-3">
          {home ? <InsightBlock insight={home} /> : null}
          <ScoreCard
            title={config.score.caption}
            value={scoreValue(config, false)}
            caption={config.score.caption}
            surface="accent"
            record={featured ? { title: featured.title, meta: `${config.score.open.passed + config.score.open.minor + config.score.open.critical}` } : undefined}
            stats={[
              { id: "passed", label: copy.passed, value: config.score.open.passed, tone: "accent" },
              { id: "minor", label: copy.issues, value: config.score.open.minor, tone: "warning" },
              { id: "critical", label: copy.blocks, value: config.score.open.critical, tone: "critical" },
            ]}
          />
        </div>
      </div>
    </div>
  )
}

function scoreValue(config: ReviewDeskConfig, resolved: boolean) {
  return (resolved ? config.score.resolved : config.score.open).value
}

function Collection({
  config,
  copy,
  state,
  query,
  searchRef,
  onQuery,
  onCreate,
  onOpen,
  onFilter,
  onFacet,
}: {
  config: ReviewDeskConfig
  copy: ReturnType<typeof resolveCopy>
  state: ReviewDeskState
  query: string
  searchRef: React.RefObject<HTMLInputElement | null>
  onQuery: (value: string) => void
  onCreate?: () => void
  onOpen: (id: string) => void
  onFilter: (id: string) => void
  onFacet: (id: string, value: string) => void
}) {
  const filter = config.filters.find((item) => item.id === state.filterId) ?? config.filters[0]
  const records = config.records.filter((record) => {
    if (!recordMatches(record, filter)) return false
    if (query && !`${record.title} ${record.place} ${record.code}`.toLowerCase().includes(query.toLowerCase())) return false
    return config.facets.every((facet) => {
      const selected = state.facets[facet.id]
      if (!selected || selected === facet.options[0]?.id) return true
      return record.facets?.[facet.id] === selected
    })
  })
  return (
    <div className="flex flex-col gap-3">
      <header className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-medium">{copy.collectionTitle}</h1>
          <span className="rounded-full bg-card px-2 py-1 font-mono text-xs">{fill(copy.collectionCount, { count: records.length })}</span>
        </div>
        <HeaderActions copy={copy} query={query} onQuery={onQuery} inputRef={searchRef} onCreate={onCreate} />
      </header>
      <FilterToolbar
        variant="pill"
        filters={[]}
        onRemove={() => undefined}
        emptyLabel=""
        label={copy.filter}
        leading={
          <ChipGroup
            appearance="count"
            multiple={false}
            label={copy.filter}
            options={config.filters.map((item) => ({ value: item.id, label: item.label, count: filterCount(config.records, item) }))}
            value={[state.filterId]}
            onValueChange={(next) => next[0] && onFilter(next[0])}
          />
        }
      >
        {config.facets.map((facet) => (
          <DropdownMenu key={facet.id}>
            <DropdownMenuTrigger asChild>
              <Button type="button" variant="outline" size="sm" className="rounded-full bg-card">
                <Glyph name={facet.icon} />
                {facet.options.find((option) => option.id === state.facets[facet.id])?.label ?? facet.label}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {facet.options.map((option) => (
                <DropdownMenuItem key={option.id} onSelect={() => onFacet(facet.id, option.id)}>
                  {option.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        ))}
      </FilterToolbar>
      {records.length === 0 ? (
        <p className="rounded-2xl bg-card px-4 py-10 text-center text-sm text-muted-foreground">{copy.emptyCollection}</p>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {records.map((item) => (
            <li key={item.id}>
              <RecordCard
                code={item.code}
                title={item.title}
                subtitle={item.subtitle}
                status={<StatusPill overlay label={statusLabel(config, item.statusId)} tone={statusTone(config, item.statusId)} />}
                stats={item.specs.slice(0, 2)}
                progress={item.progress}
                progressLabel={copy.progress}
                onOpen={() => onOpen(item.id)}
                openLabel={item.title}
                footer={
                  <>
                    <span className="truncate">{ownerName(item)}</span>
                    <span className="font-mono text-muted-foreground">{item.updated}</span>
                  </>
                }
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function Notes({ copy }: { copy: ReviewDeskCopy }) {
  const [saved, setSaved] = React.useState<{ id: string; mode: string; body: string }[]>([])
  return (
    <div className="flex flex-col gap-3">
      {saved.length > 0 ? (
        <ul className="flex flex-col gap-2" aria-label={copy.notesList}>
          {saved.map((note) => (
            <li key={note.id} className="rounded-xl bg-card px-3 py-2 text-sm">
              <span className="mb-1 block text-xs text-muted-foreground">{note.mode}</span>
              {note.body}
            </li>
          ))}
        </ul>
      ) : null}
      <ReplyComposer
        defaultMode="note"
        replyLabel={copy.noteReply}
        noteLabel={copy.noteInternal}
        placeholder={copy.noteReplyPlaceholder}
        notePlaceholder={copy.notePlaceholder}
        sendLabel={copy.noteSend}
        sendHint={copy.noteHint}
        onSubmit={(value, mode) => {
          const body = value.trim()
          if (!body) return
          setSaved((current) => [
            { id: `${current.length + 1}-${body.length}`, mode: mode === "note" ? copy.noteInternal : copy.noteReply, body },
            ...current,
          ])
        }}
      />
    </div>
  )
}

function RecordView(props: {
  config: ReviewDeskConfig
  copy: ReturnType<typeof resolveCopy>
  state: ReviewDeskState
  record: ReviewRecord
  score: ReturnType<typeof scoreFor>
  resolved: boolean
  onBack: () => void
  onPanel: (panel: ReviewDeskState["panel"]) => void
  onIssue: (id: string) => void
  onActivity: (id: "all" | "assistant" | "people") => void
  onDocFilter: (id: string) => void
  onFix: () => void
  onUndo: () => void
  onNext: () => void
  onSubmit: () => void
  onOption: (id: string, checked: boolean) => void
}) {
  const { config, copy, state, record, score, resolved, onBack, onPanel } = props
  const tab = state.panel === "review" ? "documents" : state.panel
  const activeTab = config.tabs.find((item) => item.panel === tab)?.id ?? config.tabs[0]?.id ?? ""
  const status =
    state.panel === "review"
      ? { label: resolved ? config.header.fixed : config.header.checked, tone: "accent" as const }
      : state.panel === "submission"
        ? state.submission === "filed"
          ? { label: config.header.filed, tone: "info" as const }
          : { label: config.header.ready, tone: "accent" as const }
        : { label: copy.onTrack, tone: "accent" as const }
  return (
    <div className="flex min-h-0 flex-col gap-3">
      <RecordHeader
        onBack={onBack}
        backLabel={copy.back}
        crumbs={[{ label: copy.openQueue, onSelect: onBack }, { label: record.code }, { label: record.title }]}
        title={record.title}
        status={status.label}
        statusTone={status.tone === "info" ? "info" : "accent"}
        primary={recordPrimary(props)}
        secondary={recordSecondary(props)}
      />
      <ProposalWorkspace
        variant="pill"
        tabs={config.tabs.map((item) => ({ id: item.id, label: item.label, count: item.count }))}
        value={activeTab}
        onValueChange={(id) => {
          const next = config.tabs.find((item) => item.id === id)
          if (!next) return
          onPanel(next.panel === "notes" ? "notes" : next.panel)
        }}
        leading={<span className="rounded-full bg-muted px-2 py-1 font-mono text-xs">{record.code}</span>}
        trailing={
          <span className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="hidden md:inline">{config.contextLine}</span>
            <StatusPill tone="accent" label={copy.onTrack} />
          </span>
        }
      >
        {state.panel === "summary" ? <Summary {...props} /> : null}
        {state.panel === "documents" ? <Documents {...props} /> : null}
        {state.panel === "review" ? <Review {...props} score={score} resolved={resolved} /> : null}
        {state.panel === "submission" ? <Package {...props} /> : null}
        {state.panel === "notes" ? <Notes copy={copy} /> : null}
      </ProposalWorkspace>
    </div>
  )
}

function recordPrimary(props: Parameters<typeof RecordView>[0]) {
  const { copy, state, onFix, onSubmit } = props
  if (state.panel === "review") {
    return (
      <Button type="button" className="rounded-full" onClick={onFix}>
        <Sparkles data-icon="inline-start" />
        {copy.fixAll}
      </Button>
    )
  }
  if (state.panel === "submission" && state.submission !== "filed") {
    return (
      <Button type="button" className="rounded-full" onClick={onSubmit}>
        <Send data-icon="inline-start" />
        {copy.submit}
      </Button>
    )
  }
  if (state.panel === "submission") {
    return (
      <Button type="button" className="rounded-full">
        {copy.tracker}
      </Button>
    )
  }
  if (state.panel === "documents") {
    return (
      <Button type="button" className="rounded-full" onClick={() => props.onPanel("submission")}>
        {copy.packageTitle}
      </Button>
    )
  }
  return (
    <Button type="button" className="rounded-full">
      {copy.actions}
    </Button>
  )
}

function recordSecondary(props: Parameters<typeof RecordView>[0]) {
  const { copy, state } = props
  if (state.panel === "review") return [{ id: "recheck", label: copy.recheck, onSelect: () => undefined }]
  if (state.panel === "documents") return [{ id: "upload", label: copy.browse, onSelect: () => undefined }]
  if (state.panel === "submission" && state.submission === "filed") return [{ id: "receipt", label: copy.download, onSelect: () => undefined }]
  if (state.panel === "submission") return [{ id: "preview", label: copy.preview, onSelect: () => undefined }]
  return [{ id: "package", label: copy.packageTitle, onSelect: () => props.onPanel("submission") }]
}

function Summary({ config, copy, state, record, onActivity }: Parameters<typeof RecordView>[0]) {
  const insight = config.insights.find((item) => item.place === "summary" && item.recordId === record.id) ?? config.insights.find((item) => item.place === "summary")
  const events = config.activities.filter((item) => item.recordId === record.id && (state.activity === "all" || item.source === state.activity))
  return (
    <div className="grid gap-3 xl:grid-cols-[minmax(0,2fr)_minmax(16rem,0.8fr)]">
      <div className="flex flex-col gap-3">
        <div className="grid gap-3 md:grid-cols-[minmax(0,0.7fr)_minmax(0,1.1fr)]">
          <RecordCard
            variant="media"
            code={record.code}
            title={record.title}
            chips={record.chips?.map((chip) => (
              <span key={chip.label} className="rounded-full bg-card/95 px-2 py-1 text-xs text-card-foreground">
                {chip.label}
              </span>
            ))}
          />
          <section className="rounded-2xl bg-card p-3">
            <div className="mb-3 flex items-start justify-between gap-2">
              <div>
                <h2 className="text-sm font-medium">{copy.progress}</h2>
                <p className="text-xs text-muted-foreground">{config.progressCaption}</p>
              </div>
              <p className="font-mono text-3xl tabular-nums">
                {record.progress}
                <span className="align-super text-sm">%</span>
              </p>
            </div>
            <Stepper
              marker="milestone"
              label={copy.progress}
              current={config.milestoneIndex}
              steps={config.milestones.map((step) => ({ id: step.id, label: step.label, meta: step.meta }))}
            />
          </section>
        </div>
        {insight ? <InsightBlock insight={insight} /> : null}
        <section className="rounded-2xl bg-card p-3">
          <div className="mb-2 flex items-center justify-between gap-2">
            <h2 className="text-sm font-medium">{copy.requirements}</h2>
            <span className="text-xs text-muted-foreground">{copy.allComplete}</span>
          </div>
          <CheckTiles items={config.tiles.filter((tile) => tile.recordId === record.id)} label={copy.requirements} />
        </section>
        <section className="rounded-2xl bg-card p-3">
          <RecordTimeline
            label={copy.activity}
            filters={[
              { id: "all", label: copy.activityAll },
              { id: "assistant", label: config.assistantName },
              { id: "people", label: copy.team },
            ]}
            filter={state.activity}
            onFilterChange={(id) => onActivity(id === "assistant" || id === "people" ? id : "all")}
            events={events.map((event) => ({
              id: event.id,
              title: event.title,
              description: event.detail,
              date: event.at,
              status: event.marker === "done" ? "done" : "default",
              chips: event.chips?.map((chip, index) => ({ id: `${event.id}-${index}`, label: chip.label, tone: chip.tone === "accent" ? "accent" as const : "neutral" as const })),
            }))}
          />
        </section>
      </div>
      <div className="flex flex-col gap-3">
        <section className="rounded-2xl bg-card p-3">
          <h2 className="mb-2 text-sm font-medium">{copy.details}</h2>
          <dl className="rounded-xl bg-muted px-3">
            {record.fields.map((field) => (
              <div key={field.label} className="flex items-baseline justify-between gap-3 border-t border-border py-2 text-sm first:border-t-0">
                <dt className="text-muted-foreground">{field.label}</dt>
                <dd className="text-end wrap-break-word">{field.value}</dd>
              </div>
            ))}
          </dl>
        </section>
        <section className="rounded-2xl bg-card p-3">
          <MemberList
            title={copy.team}
            addLabel={copy.addMember}
            onAdd={() => undefined}
            members={record.members.map((member) => ({ ...member, ownerLabel: copy.ownerSuffix }))}
            actions={[{ id: "view", label: copy.preview }]}
          />
        </section>
        {record.event ? <EventCallout title={record.event.title} when={record.event.when} action={record.event.action} /> : null}
      </div>
    </div>
  )
}

function Documents({ config, copy, record, state, onDocFilter, onIssue }: Parameters<typeof RecordView>[0]) {
  const filter = config.docFilters.find((item) => item.id === state.docFilterId)
  const docs = config.documents.filter((item) => item.recordId === record.id && (!filter?.groupId || item.groupId === filter.groupId))
  const insight = config.insights.find((item) => item.place === "documents")
  const checked = docs.filter((item) => item.score != null).length
  return (
    <div className="grid gap-3 xl:grid-cols-[minmax(0,1.6fr)_minmax(16rem,0.7fr)]">
      <section className="rounded-2xl bg-card p-3">
        <FilterToolbar
          variant="pill"
          filters={[]}
          onRemove={() => undefined}
          emptyLabel=""
          label={copy.documents}
          leading={
            <ChipGroup
              appearance="count"
              multiple={false}
              label={copy.documents}
              options={config.docFilters.map((item) => ({
                value: item.id,
                label: item.label,
                count: config.documents.filter((doc) => doc.recordId === record.id && (!item.groupId || doc.groupId === item.groupId)).length,
              }))}
              value={[state.docFilterId]}
              onValueChange={(next) => next[0] && onDocFilter(next[0])}
            />
          }
        />
        <div className="mt-3">
          <DocumentList
            mode="review"
            title={copy.documents}
            header={<StatusPill tone="accent" dot={false} label={fill(copy.checked, { done: checked, total: docs.length })} />}
            groups={config.groups
              .map((group) => ({
                id: group.id,
                label: group.label,
                icon: <Glyph name={group.icon} className="size-4" />,
                items: docs
                  .filter((doc) => doc.groupId === group.id)
                  .map((doc) => ({
                    id: doc.id,
                    name: doc.name,
                    meta: doc.meta,
                    missing: doc.score == null,
                    score: doc.score,
                    date: doc.date,
                    uncheckedLabel: copy.notChecked,
                    unsetLabel: copy.notSet,
                    status: (
                      <StatusPill
                        label={statusLabel(config, doc.statusId)}
                        tone={statusTone(config, doc.statusId)}
                      />
                    ),
                    onPreview: () => onIssue(config.issues.find((issue) => issue.documentId === doc.id)?.id ?? config.issues[0]?.id ?? ""),
                  })),
              }))
              .filter((group) => group.items.length)}
          />
        </div>
      </section>
      <div className="flex flex-col gap-3">
        <MagneticDropzone label={copy.dropTitle} hint={copy.dropHint} accept="application/pdf,image/*" />
        {insight ? <InsightBlock insight={insight} /> : null}
        <section className="rounded-2xl bg-card p-3">
          <h2 className="mb-2 text-sm font-medium">{copy.recent}</h2>
          <AttentionList
            layout="compact"
            label={copy.recent}
            items={docs
              .filter((doc) => doc.score != null)
              .map((doc) => ({
                id: doc.id,
                title: doc.name,
                description: doc.meta,
                tone: (doc.score ?? 1) >= 0.9 ? "positive" : "neutral",
                onSelect: () => onIssue(config.issues.find((issue) => issue.documentId === doc.id)?.id ?? config.scoreIssueId),
              }))}
          />
        </section>
      </div>
    </div>
  )
}

function Review({
  config,
  copy,
  state,
  record,
  score,
  resolved,
  onIssue,
  onFix,
  onUndo,
  onNext,
}: Parameters<typeof RecordView>[0]) {
  const issues = config.issues.filter((issue) => issue.recordId === record.id)
  const issue = issues.find((item) => item.id === state.issueId) ?? issues[0]
  const index = Math.max(0, issues.findIndex((item) => item.id === issue?.id))
  const fixed = Boolean(issue && issue.id === config.scoreIssueId && resolved)
  if (!issue) return <p className="text-sm text-muted-foreground">{copy.emptyIssues}</p>
  const severity = issueSeverity(issue, fixed ? "fixed" : "open", config.scoreIssueId)
  return (
    <div className="grid gap-3 xl:grid-cols-[minmax(16rem,0.7fr)_minmax(0,1.4fr)]">
      <div className="flex flex-col gap-3">
        <ScoreCard
          title={config.score.caption}
          chip={<span className="rounded-full bg-muted px-2 py-0.5 font-mono text-[10px]">{config.score.sheet}</span>}
          value={score.value}
          caption={config.score.caption}
          stats={[
            { id: "passed", label: copy.passed, value: score.passed, tone: "accent" },
            { id: "minor", label: copy.issues, value: score.minor, tone: "warning" },
            { id: "critical", label: copy.blocks, value: score.critical, tone: "critical" },
          ]}
        />
        <section className="rounded-2xl bg-card p-3">
          <IssueList
            label={copy.issues}
            value={issue.id}
            onValueChange={onIssue}
            items={issues.map((item) => {
              const itemFixed = item.id === config.scoreIssueId && resolved
              const level = issueSeverity(item, itemFixed ? "fixed" : "open", config.scoreIssueId)
              return {
                id: item.id,
                title: itemFixed ? item.resolved.title : item.title,
                description: itemFixed ? item.resolved.detail : item.detail,
                severity: level,
                badge: <StatusPill solid={level === "critical"} tone={level === "critical" ? "critical" : level === "minor" ? "warning" : "accent"} label={itemFixed ? item.resolved.badge : item.badge} />,
              }
            })}
          />
        </section>
      </div>
      <section className="rounded-2xl bg-card p-3">
        <IssueDetail
          title={fixed ? issue.resolved.title : issue.title}
          previousLabel={copy.back}
          nextLabel={copy.nextIssue}
          onPrevious={index > 0 ? () => onIssue(issues[index - 1].id) : undefined}
          onNext={index < issues.length - 1 ? () => onIssue(issues[index + 1].id) : undefined}
          meta={
            <>
              <StatusPill tone="neutral" dot={false} label={fill(copy.findingMeta, { index: index + 1, total: issues.length })} />
              <StatusPill solid={severity === "critical"} tone={severity === "critical" ? "critical" : severity === "minor" ? "warning" : "accent"} label={fixed ? issue.resolved.badge : issue.badge} />
              {issue.blocks && !fixed ? <StatusPill tone="critical" label={copy.blocks} /> : null}
              {fixed ? <StatusPill tone="warning" label={issue.resolved.waiting} /> : null}
            </>
          }
          preview={
            <DetectionOverlay
              naturalWidth={100}
              naturalHeight={72}
              caption={issue.caption}
              openLabel={copy.openViewer}
              onOpen={() => undefined}
              detections={[
                {
                  label: issue.region,
                  box: { x: 28, y: 16, width: 44, height: 28 },
                  tone: fixed ? "accent" : "critical",
                  dashed: !fixed,
                },
              ]}
            >
              <div className="aspect-[10/7] rounded-xl bg-muted p-4">
                <div className="h-8 rounded-md bg-card" />
                <div className="mt-3 h-16 rounded-md border border-dashed border-border" />
              </div>
            </DetectionOverlay>
          }
          explanation={
            <div className="rounded-xl bg-muted p-3">
              <h3 className="text-sm font-medium">{copy.whatWeSaw}</h3>
              <p className="mt-1 text-sm text-muted-foreground wrap-break-word">{issue.explanation}</p>
            </div>
          }
          references={
            <div className="rounded-xl bg-muted p-3">
              <h3 className="mb-2 text-sm font-medium">{copy.references}</h3>
              <SourceList
                variant="links"
                sources={issue.references.map((ref) => ({
                  id: ref.id,
                  title: ref.title,
                  detail: ref.detail,
                  icon: <Landmark className="size-4" />,
                }))}
              />
            </div>
          }
          recommendation={
            fixed ? (
              <div className="rounded-xl bg-primary/15 p-3">
                <p className="text-sm font-medium">{issue.resolved.callout}</p>
                <p className="text-xs text-muted-foreground">{issue.resolved.calloutBody}</p>
                <Button type="button" variant="outline" className="mt-2 rounded-full bg-card">
                  <Eye data-icon="inline-start" />
                  {copy.preview}
                </Button>
              </div>
            ) : (
              <SuggestionCard
                surface="accent"
                variant="action"
                title={issue.recommendation.title}
                suggestion={issue.recommendation.body}
                actionLabel={copy.fixOne}
                onAction={onFix}
                fields={issue.recommendation.fields.map((field, fieldIndex) => ({ id: String(fieldIndex), label: field.label }))}
              />
            )
          }
          compare={
            <ComparePanel
              title={copy.apply}
              location={issue.location}
              beforeLabel={copy.history}
              afterLabel={copy.ready}
              before={issue.before}
              after={issue.after}
              highlightIndex={issue.highlightRow}
            />
          }
          footer={
            <ActionFooter
              hint={fixed ? copy.fixedHint : fill(copy.openHint, { score: config.score.resolved.value })}
              secondary={
                fixed
                  ? { label: copy.undo, onSelect: onUndo }
                  : { label: copy.sendTo, onSelect: () => undefined, icon: <Mail data-icon="inline-start" /> }
              }
              primary={
                fixed
                  ? { label: copy.nextIssue, onSelect: onNext }
                  : { label: copy.fixOne, onSelect: onFix, icon: <Sparkles data-icon="inline-start" /> }
              }
            />
          }
        />
      </section>
    </div>
  )
}

function Package({ config, copy, state, record, onSubmit, onOption }: Parameters<typeof RecordView>[0]) {
  const filed = state.submission === "filed"
  const banner = filed ? config.submission.filed : config.submission.ready
  const insight = config.insights.find((item) => item.place === "submission")
  const docs = config.documents.filter((item) => item.recordId === record.id)
  return (
    <div className="flex flex-col gap-3">
      <StatusBanner stateKey={filed ? "filed" : "ready"} title={banner.title} body={banner.body} stats={banner.stats} />
      <div className="grid gap-3 xl:grid-cols-[minmax(0,1.4fr)_minmax(16rem,0.8fr)]">
        <section className="rounded-2xl bg-card p-3">
          <DocumentList
            mode="checklist"
            title={copy.packageTitle}
            header={<span className="rounded-full bg-muted px-2 py-1 font-mono text-xs">{fill(copy.packageMeta, { documents: docs.length, pages: docs.reduce((sum, doc) => sum + Number(doc.pages ?? 0), 0) })}</span>}
            groups={config.packageGroups
              .map((group) => ({
                id: group.id,
                label: group.label,
                icon: <Glyph name={group.icon} className="size-4" />,
                status: <StatusPill tone="accent" dot={false} label={copy.complete} />,
                items: docs
                  .filter((doc) => doc.groupId === group.id)
                  .map((doc) => ({
                    id: doc.id,
                    name: doc.name,
                    meta: [doc.pages ? `${doc.pages}` : null, doc.state].filter(Boolean).join(" · "),
                    checked: doc.score != null,
                    previewLabel: copy.preview,
                    onPreview: () => undefined,
                  })),
              }))
              .filter((group) => group.items.length)}
          />
          <p className="mt-2 text-xs text-muted-foreground">{copy.assembled}</p>
        </section>
        <div className="flex flex-col gap-3">
          {!filed && insight ? <InsightBlock insight={insight} /> : null}
          <DestinationCard
            title={copy.submit}
            name={config.submission.destination.name}
            detail={config.submission.destination.detail}
            icon={<Landmark className="size-4" />}
            status={<StatusPill tone="accent" label={filed ? copy.ready : config.submission.destination.status} />}
            fields={config.submission.fields}
          />
          {filed ? (
            <NextSteps
              title={config.submission.notice.title}
              body={config.submission.notice.body}
              steps={config.submission.next.steps.map((step) => ({
                id: step.id,
                title: step.title,
                detail: step.detail,
                icon: <Glyph name={step.icon} className="size-3.5" />,
              }))}
              actionLabel={config.submission.next.action}
            />
          ) : (
            <section className="rounded-2xl bg-card p-3">
              <h2 className="mb-2 text-sm font-medium">{copy.beforeSubmit}</h2>
              <div className="flex flex-col gap-2">
                {config.submission.options.map((option) => (
                  <label key={option.id} className="flex items-start gap-2 text-sm">
                    <Checkbox checked={state.optionChecks[option.id]} onCheckedChange={(value) => onOption(option.id, value === true)} />
                    <span>{option.label}</span>
                  </label>
                ))}
              </div>
              <Button type="button" className="mt-3 w-full rounded-full" onClick={onSubmit}>
                <Send data-icon="inline-start" />
                {copy.submit}
              </Button>
              <p className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="size-3.5" aria-hidden />
                {fill(copy.deadline, { until: config.submission.deadline })}
              </p>
            </section>
          )}
        </div>
      </div>
    </div>
  )
}

function InsightBlock({ insight }: { insight: ReviewDeskConfig["insights"][number] }) {
  return (
    <InsightCard
      variant={insight.variant}
      title={insight.title}
      time={insight.time}
      icon={<Sparkles className="size-3.5" />}
      headline={insight.headline}
      body={insight.body}
      bullets={insight.bullets}
      confidence={insight.confidence}
      stats={insight.stats}
      checks={insight.checks}
      actionLabel={insight.action}
    />
  )
}

function FixDialog({
  config,
  copy,
  state,
  setState,
}: {
  config: ReviewDeskConfig
  copy: ReturnType<typeof resolveCopy>
  state: ReviewDeskState
  setState: React.Dispatch<React.SetStateAction<ReviewDeskState>>
}) {
  const issue = config.issues.find((item) => item.id === state.issueId)
  return (
    <Dialog open={state.issuePhase === "fixing"} onOpenChange={(open) => !open && setState((current) => ({ ...current, issuePhase: current.issuePhase === "fixing" ? "open" : current.issuePhase }))}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{copy.applyTitle}</DialogTitle>
          <DialogDescription>{copy.applyBody}</DialogDescription>
        </DialogHeader>
        <ToolApproval
          toolName={issue?.location ?? copy.apply}
          title={copy.applyTitle}
          reason={copy.applyBody}
          changes={issue?.changes}
          versionLabel={config.versionLabel}
          choices={config.fixOptions.map((option) => ({
            ...option,
            checked: state.fixChecks[option.id] ?? option.checked,
            onCheckedChange: (checked) => setState((current) => ({ ...current, fixChecks: { ...current.fixChecks, [option.id]: checked } })),
          }))}
          hint={copy.history}
          approveLabel={copy.apply}
          denyLabel={copy.cancel}
          onApprove={() => {
            if (!requiredChecked(config.fixOptions, state.fixChecks)) return
            setState((current) => ({ ...current, issuePhase: "fixed" }))
          }}
          onDeny={() => setState((current) => ({ ...current, issuePhase: "open" }))}
        />
      </DialogContent>
    </Dialog>
  )
}

function SubmitDialog({
  config,
  copy,
  state,
  setState,
}: {
  config: ReviewDeskConfig
  copy: ReturnType<typeof resolveCopy>
  state: ReviewDeskState
  setState: React.Dispatch<React.SetStateAction<ReviewDeskState>>
}) {
  const record = config.records.find((item) => item.id === state.recordId)
  return (
    <Dialog
      open={state.submission === "confirming"}
      onOpenChange={(open) => !open && setState((current) => ({ ...current, submission: current.submission === "confirming" ? "ready" : current.submission }))}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{copy.submitTitle}</DialogTitle>
          <DialogDescription>{copy.submitBody}</DialogDescription>
        </DialogHeader>
        <ToolApproval
          toolName={config.submission.destination.name}
          title={copy.submitTitle}
          reason={copy.submitBody}
          summary={
            <div className="rounded-xl bg-muted p-3 text-sm">
              <div className="mb-2 flex items-center justify-between gap-2">
                <span className="font-medium">{config.submission.destination.name}</span>
                <StatusPill tone="accent" label={copy.ready} />
              </div>
              <dl className="flex flex-col gap-1">
                <div className="flex justify-between gap-2"><dt className="text-muted-foreground">{copy.details}</dt><dd>{record?.code}</dd></div>
                {config.submission.fields.map((field) => (
                  <div key={field.label} className="flex justify-between gap-2">
                    <dt className="text-muted-foreground">{field.label}</dt>
                    <dd className="text-end">{field.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          }
          choices={config.submission.confirm.map((option) => ({
            ...option,
            checked: Boolean(state.submitChecks[option.id]),
            onCheckedChange: (checked) => setState((current) => ({ ...current, submitChecks: { ...current.submitChecks, [option.id]: checked } })),
          }))}
          approveLabel={fill(copy.confirmPay, { fee: config.submission.fee })}
          denyLabel={copy.cancel}
          onApprove={() => {
            if (!requiredChecked(config.submission.confirm, state.submitChecks)) return
            setState((current) => ({ ...current, submission: "filed", panel: "submission", view: "record" }))
          }}
          onDeny={() => setState((current) => ({ ...current, submission: "ready" }))}
        />
      </DialogContent>
    </Dialog>
  )
}

function statusLabel(config: ReviewDeskConfig, id: string) {
  return config.statuses.find((item) => item.id === id)?.label ?? id
}

function statusTone(config: ReviewDeskConfig, id: string) {
  return config.statuses.find((item) => item.id === id)?.tone ?? "neutral"
}

function stageLabel(config: ReviewDeskConfig, id: string) {
  return config.stages.find((item) => item.id === id)?.label ?? id
}

function ownerName(record: ReviewRecord) {
  return record.members.find((member) => member.id === record.ownerId)?.name ?? record.members[0]?.name ?? ""
}
