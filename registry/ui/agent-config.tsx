"use client"

/**
 * Agent configuration console. Clean-room layout of a public screen idea.
 * No reference source, sample data, icons, or assets are copied.
 * Navigation, model picking, and usage are slots. The host fills them.
 */

import * as React from "react"
import {
  AlertTriangle,
  ChartColumn,
  Check,
  Copy,
  FileText,
  History,
  Loader2,
  MessagesSquare,
  Minus,
  NotebookPen,
  Plus,
  UserRound,
  Waypoints,
} from "lucide-react"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty"
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { Sparkline } from "@/registry/retana/ui/sparkline"
import {
  agentConfigLabels,
  bandCopy,
  bandImpact,
  bandsAreValid,
  binSeries,
  clampThresholds,
  decisionCopy,
  defaultRunTest,
  diffVersions,
  exampleAmountPer1k,
  formatCount,
  formatExampleMoney,
  formatStamp,
  issueCopy,
  latestPublished,
  levelCopy,
  listedDraft,
  partitionBands,
  toDraft,
  TOUCH_HOLD_MS,
  TOUCH_SLOP_PX,
  validateBands,
  type AgentConfigLabels,
  type AgentIconName,
  type AgentVersion,
  type AgentWorkspace,
  type BandIssueCode,
  type ConfidenceBands,
  type ConfiguredAgent,
  type ExampleModel,
  type FallbackKind,
  type Guardrail,
  type GuardrailType,
  type ModelBinding,
  type RunTest,
  type TestCase,
  type TestPromptResult,
  type UsageCostSlot,
  type VersionChange,
} from "@/registry/retana/lib/agent-config"

export type ModelSlotProps = {
  id: string
  value: string
  models: readonly ExampleModel[]
  disabled: boolean
  onValueChange: (modelId: string) => void
  label: string
}

export type AgentConfigSlots = {
  /** Host navigation. The demo passes the existing sidebar menu. */
  navigation?: React.ReactNode
  /** Host renders cost-waterfall here. Receives example spend, not a ledger. */
  usageCost?: (slot: UsageCostSlot) => React.ReactNode
  /** Subset a later model-router can replace. Ids match `ModelRoute.id`. */
  modelSelect?: (props: ModelSlotProps) => React.ReactNode
  fallbackSelect?: (props: ModelSlotProps) => React.ReactNode
}

export type AgentConfigClassNames = {
  root?: string
  nav?: string
  header?: string
  kpis?: string
  list?: string
  detail?: string
  bands?: string
}

export type AgentConfigProps = {
  workspace: AgentWorkspace
  agents: readonly ConfiguredAgent[]
  versions: readonly AgentVersion[]
  models: readonly ExampleModel[]
  guardrailTypes: readonly GuardrailType[]
  testCases?: readonly TestCase[]
  selectedId?: string
  defaultSelectedId?: string
  onSelectedIdChange?: (id: string) => void
  draft?: AgentVersion | null
  onDraftChange?: (draft: AgentVersion) => void
  runTest?: RunTest
  onSaveDraft?: (draft: AgentVersion) => Promise<void> | void
  onPublishRequest?: (draft: AgentVersion) => Promise<void> | void
  onRollbackRequest?: (version: AgentVersion) => Promise<void> | void
  onCreateRequest?: () => void
  onUsageCost?: (slot: UsageCostSlot) => void
  slots?: AgentConfigSlots
  locale?: "es" | "en"
  labels?: Partial<AgentConfigLabels>
  loading?: boolean
  error?: string
  readOnly?: boolean
  /** Harness flag so a scene can show the busy chrome without a click. */
  busy?: "save" | "publish" | "rollback" | "test"
  className?: string
  classNames?: AgentConfigClassNames
}

const ICONS: Record<AgentIconName, typeof UserRound> = {
  leads: UserRound,
  documents: FileText,
  followup: MessagesSquare,
  notes: NotebookPen,
  route: Waypoints,
  duplicates: Copy,
}

const LEVEL_ICON = { high: Check, mid: Minus, low: AlertTriangle } as const

function modelName(models: readonly ExampleModel[], id: string) {
  return models.find((model) => model.id === id)?.name ?? id
}

function clip(text: string) {
  const flat = text.replace(/\s+/g, " ").trim()
  return flat.length > 84 ? `${flat.slice(0, 81)}…` : flat
}

function changeLine(change: VersionChange, models: readonly ExampleModel[], labels: AgentConfigLabels) {
  if (change.kind === "instructions") return `${labels.instructions}: ${clip(change.before)} → ${clip(change.after)}`
  if (change.kind === "primary") return `${labels.primaryModel}: ${modelName(models, change.beforeId)} → ${modelName(models, change.afterId)}`
  if (change.kind === "fallback") return `${labels.fallbackModel}: ${modelName(models, change.beforeId)} → ${modelName(models, change.afterId)}`
  if (change.kind === "fallbackCondition") return `${labels.fallbackWhen}: ${change.before} → ${change.after}`
  if (change.kind === "bands") return `${labels.reject} / ${labels.review} / ${labels.auto}: ${change.before} → ${change.after}`
  return `${change.label}: ${change.before} → ${change.after}`
}

function seedFor(agentId: string, versions: readonly AgentVersion[], draftProp: AgentVersion | null | undefined) {
  if (draftProp && draftProp.agentId === agentId) return draftProp
  return listedDraft(versions, agentId) ?? toDraftOrNull(latestPublished(versions, agentId))
}

function toDraftOrNull(version: AgentVersion | null) {
  return version ? toDraft(version) : null
}

function DefaultModelSelect({ id, value, models, disabled, onValueChange, label }: ModelSlotProps) {
  return (
    <Field>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <Select value={value} onValueChange={onValueChange} disabled={disabled}>
        <SelectTrigger id={id} className="min-h-11 w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {models.map((model) => (
              <SelectItem key={model.id} value={model.id}>
                {model.name}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </Field>
  )
}

function valueText(which: "reject" | "auto", rejectBelow: number, autoAbove: number, labels: AgentConfigLabels) {
  return which === "reject"
    ? `${labels.rejectBelow} ${rejectBelow}. ${labels.review} ${rejectBelow}–${autoAbove}.`
    : `${labels.autoAbove} ${autoAbove}. ${labels.review} ${rejectBelow}–${autoAbove}.`
}

function BandEditor({
  bands,
  distribution,
  labels,
  locale,
  readOnly,
  className,
  onChange,
}: {
  bands: ConfidenceBands
  distribution: readonly number[]
  labels: AgentConfigLabels
  locale: "es" | "en"
  readOnly: boolean
  className?: string
  onChange: (bands: ConfidenceBands) => void
}) {
  const track = React.useRef<HTMLDivElement>(null)
  const rejectRef = React.useRef<HTMLButtonElement>(null)
  const autoRef = React.useRef<HTMLButtonElement>(null)
  const bandsRef = React.useRef(bands)
  const onChangeRef = React.useRef(onChange)
  const labelsRef = React.useRef(labels)
  const widthRef = React.useRef(0)
  const preview = React.useRef(bands)
  const drag = React.useRef<{
    which: "reject" | "auto"
    pointerId: number
    pointerType: string
    startX: number
    startY: number
    holding: boolean
    node: HTMLButtonElement
  } | null>(null)
  const timer = React.useRef<number | null>(null)
  const [width, setWidth] = React.useState(0)
  const [holding, setHolding] = React.useState<"reject" | "auto" | null>(null)

  React.useEffect(() => {
    bandsRef.current = bands
    onChangeRef.current = onChange
    labelsRef.current = labels
  }, [bands, labels, onChange])

  const place = React.useCallback((value: number, node: HTMLButtonElement | null) => {
    if (!node) return
    const usable = Math.max(0, widthRef.current - 44)
    node.style.transform = `translate3d(${(value / 100) * usable}px, -50%, 0)`
  }, [])

  React.useLayoutEffect(() => {
    const node = track.current
    if (!node) return
    const measure = () => {
      widthRef.current = node.getBoundingClientRect().width
      setWidth(widthRef.current)
    }
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  React.useLayoutEffect(() => {
    if (drag.current?.holding) return
    place(bands.reject.max, rejectRef.current)
    place(bands.auto.min, autoRef.current)
  }, [bands, place, width])

  React.useEffect(() => {
    function valueFromClient(clientX: number) {
      const rect = track.current?.getBoundingClientRect()
      if (!rect || rect.width <= 44) return 0
      const ratio = (clientX - rect.left - 22) / (rect.width - 44)
      return Math.round(Math.min(1, Math.max(0, ratio)) * 100)
    }
    function paint(which: "reject" | "auto", value: number) {
      const current = bandsRef.current
      const next = clampThresholds(which === "reject" ? value : current.reject.max, which === "auto" ? value : current.auto.min)
      preview.current = partitionBands(next.rejectBelow, next.autoAbove)
      place(next.rejectBelow, rejectRef.current)
      place(next.autoAbove, autoRef.current)
      const node = which === "reject" ? rejectRef.current : autoRef.current
      const shown = which === "reject" ? next.rejectBelow : next.autoAbove
      const copy = labelsRef.current
      node?.setAttribute("aria-valuenow", String(shown))
      node?.setAttribute("aria-valuetext", valueText(which, next.rejectBelow, next.autoAbove, copy))
    }
    function end(event: PointerEvent) {
      const current = drag.current
      if (!current || event.pointerId !== current.pointerId) return
      if (timer.current != null) window.clearTimeout(timer.current)
      timer.current = null
      const wasHolding = current.holding
      drag.current = null
      setHolding(null)
      if (wasHolding) onChangeRef.current(preview.current)
      else current.node.focus()
    }
    function move(event: PointerEvent) {
      const current = drag.current
      if (!current || event.pointerId !== current.pointerId) return
      const dx = event.clientX - current.startX
      const dy = event.clientY - current.startY
      if (current.pointerType === "touch" && !current.holding) {
        const vertical = Math.abs(dy) > Math.abs(dx) && Math.abs(dy) > TOUCH_SLOP_PX
        if (vertical || Math.hypot(dx, dy) > TOUCH_SLOP_PX) {
          if (timer.current != null) window.clearTimeout(timer.current)
          timer.current = null
          drag.current = null
        }
        return
      }
      if (current.holding) paint(current.which, valueFromClient(event.clientX))
    }
    window.addEventListener("pointermove", move)
    window.addEventListener("pointerup", end)
    window.addEventListener("pointercancel", end)
    return () => {
      window.removeEventListener("pointermove", move)
      window.removeEventListener("pointerup", end)
      window.removeEventListener("pointercancel", end)
    }
  }, [place])

  function pointerDown(which: "reject" | "auto", event: React.PointerEvent<HTMLButtonElement>) {
    if (readOnly || event.button !== 0) return
    if (event.pointerType !== "touch") event.preventDefault()
    const node = event.currentTarget
    preview.current = bandsRef.current
    drag.current = {
      which,
      pointerId: event.pointerId,
      pointerType: event.pointerType,
      startX: event.clientX,
      startY: event.clientY,
      holding: event.pointerType !== "touch",
      node,
    }
    if (event.pointerType === "touch") {
      timer.current = window.setTimeout(() => {
        if (!drag.current || drag.current.pointerId !== event.pointerId) return
        drag.current.holding = true
        setHolding(which)
        node.setPointerCapture?.(event.pointerId)
      }, TOUCH_HOLD_MS)
      return
    }
    setHolding(which)
    node.setPointerCapture?.(event.pointerId)
  }

  function nudge(which: "reject" | "auto", delta: number) {
    const next = clampThresholds(
      which === "reject" ? bands.reject.max + delta : bands.reject.max,
      which === "auto" ? bands.auto.min + delta : bands.auto.min,
    )
    onChange(partitionBands(next.rejectBelow, next.autoAbove))
  }

  function onKey(which: "reject" | "auto", event: React.KeyboardEvent) {
    const step = event.shiftKey ? 5 : 1
    const table: Record<string, number> = {
      ArrowLeft: -step,
      ArrowDown: -step,
      ArrowRight: step,
      ArrowUp: step,
      PageDown: -10,
      PageUp: 10,
    }
    if (event.key === "Home") {
      event.preventDefault()
      nudge(which, -100)
      return
    }
    if (event.key === "End") {
      event.preventDefault()
      nudge(which, 100)
      return
    }
    const delta = table[event.key]
    if (delta === undefined) return
    event.preventDefault()
    nudge(which, delta)
  }

  function typeThreshold(which: "reject" | "auto", raw: string) {
    if (raw.trim() === "") return
    const value = Number(raw)
    if (!Number.isFinite(value)) return
    onChange(partitionBands(which === "reject" ? value : bands.reject.max, which === "auto" ? value : bands.auto.min))
  }

  const issues = validateBands(bands)
  const invalid = issues.length > 0
  const impact = bandImpact(distribution, bands)
  const codes = [...new Set(issues.map((issue) => issue.code))]
  const hintId = React.useId()
  const errorId = React.useId()
  const describedBy = invalid ? `${hintId} ${errorId}` : hintId
  const series = binSeries(distribution, 24)
  const peak = Math.max(1, ...series)

  return (
    <div data-slot="agent-config-bands" className={cn("flex flex-col gap-3", className)}>
      <div className="flex flex-wrap items-end gap-2">
        {(["reject", "review", "auto"] as const).map((band) => (
          <p key={band} className="min-w-0 text-sm">
            <span className={cn("me-1 inline-block size-2 rounded-full align-middle", band === "reject" ? "bg-destructive" : band === "review" ? "bg-muted-foreground" : "bg-primary")} />
            <span className="font-medium">{bandCopy(band, labels)}</span>
            <span className="ms-1 text-muted-foreground tabular-nums">{formatCount(impact[band], locale)}</span>
          </p>
        ))}
        {impact.unassigned > 0 ? (
          <p className="text-sm text-muted-foreground">
            {labels.unassigned}
            <span className="ms-1 tabular-nums">{formatCount(impact.unassigned, locale)}</span>
          </p>
        ) : null}
      </div>
      <div
        ref={track}
        data-gesture={holding ? "holding" : "idle"}
        className={cn("relative h-11 touch-pan-y", holding && "touch-none")}
      >
        <div className="pointer-events-none absolute inset-x-0 top-1 bottom-1 flex items-end" aria-hidden="true">
          {series.map((count, index) => (
            <span key={index} className="flex h-full min-w-0 flex-1 items-end">
              <span className="h-full w-full origin-bottom bg-foreground/25" style={{ transform: `scaleY(${Math.max(0.12, count / peak)})` }} />
            </span>
          ))}
        </div>
        <div className="pointer-events-none absolute inset-x-0 top-1/2 flex h-2 -translate-y-1/2 overflow-hidden rounded-full" aria-hidden="true">
          <span className="bg-destructive/25" style={{ width: `${Math.min(100, Math.max(0, bands.reject.max))}%` }} />
          <span className="bg-muted-foreground/25" style={{ width: `${Math.min(100, Math.max(0, bands.review.max - bands.review.min))}%` }} />
          <span className="bg-primary/25" style={{ width: `${Math.min(100, Math.max(0, bands.auto.max - bands.auto.min))}%` }} />
        </div>
        <Handle
          buttonRef={rejectRef}
          label={labels.rejectHandle}
          value={bands.reject.max}
          text={valueText("reject", bands.reject.max, bands.auto.min, labels)}
          describedBy={describedBy}
          invalid={invalid}
          readOnly={readOnly}
          quiet={holding !== "reject"}
          onPointerDown={(event) => pointerDown("reject", event)}
          onKeyDown={(event) => onKey("reject", event)}
        />
        <Handle
          buttonRef={autoRef}
          label={labels.autoHandle}
          value={bands.auto.min}
          text={valueText("auto", bands.reject.max, bands.auto.min, labels)}
          describedBy={describedBy}
          invalid={invalid}
          readOnly={readOnly}
          quiet={holding !== "auto"}
          onPointerDown={(event) => pointerDown("auto", event)}
          onKeyDown={(event) => onKey("auto", event)}
        />
      </div>
      <p id={hintId} className="text-sm text-pretty text-muted-foreground">{labels.bandHint}</p>
      <div className="grid gap-3 @min-[520px]/config:grid-cols-2">
        <ThresholdField idSuffix="reject" label={labels.rejectBelow} value={bands.reject.max} invalid={invalid} readOnly={readOnly} describedBy={describedBy} onChange={(raw) => typeThreshold("reject", raw)} />
        <ThresholdField idSuffix="auto" label={labels.autoAbove} value={bands.auto.min} invalid={invalid} readOnly={readOnly} describedBy={describedBy} onChange={(raw) => typeThreshold("auto", raw)} />
      </div>
      <p className="text-sm text-muted-foreground tabular-nums" aria-live="polite">
        {impact.total === 0
          ? labels.noDistribution
          : `${labels.impactLabel}: ${formatCount(impact.reject, locale)} ${labels.reject}, ${formatCount(impact.review, locale)} ${labels.review}, ${formatCount(impact.auto, locale)} ${labels.auto}`}
      </p>
      {invalid ? (
        <Alert variant="destructive" id={errorId}>
          <AlertTriangle />
          <AlertTitle>{labels.invalidBands}</AlertTitle>
          <AlertDescription>
            <ul className="flex list-disc flex-col gap-1 ps-4">
              {codes.map((code) => (
                <li key={code}>{issueCopy(code as BandIssueCode, labels)}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      ) : null}
    </div>
  )
}

function Handle({
  buttonRef,
  label,
  value,
  text,
  describedBy,
  invalid,
  readOnly,
  quiet,
  onPointerDown,
  onKeyDown,
}: {
  buttonRef: React.RefObject<HTMLButtonElement | null>
  label: string
  value: number
  text: string
  describedBy: string
  invalid: boolean
  readOnly: boolean
  quiet: boolean
  onPointerDown: (event: React.PointerEvent<HTMLButtonElement>) => void
  onKeyDown: (event: React.KeyboardEvent<HTMLButtonElement>) => void
}) {
  return (
    <button
      ref={buttonRef}
      type="button"
      role="slider"
      aria-label={label}
      aria-orientation="horizontal"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={value}
      aria-valuetext={text}
      aria-describedby={describedBy}
      aria-invalid={invalid ? true : false}
      disabled={readOnly}
      onPointerDown={onPointerDown}
      onKeyDown={onKeyDown}
      className={cn(
        "absolute top-1/2 size-11 rounded-full border border-ring bg-background shadow-sm focus-visible:ring-3 focus-visible:ring-ring focus-visible:outline-none disabled:opacity-50",
        quiet ? "transition-[transform] duration-150 motion-reduce:transition-none" : "transition-none",
      )}
    />
  )
}

function ThresholdField({
  idSuffix,
  label,
  value,
  invalid,
  readOnly,
  describedBy,
  onChange,
}: {
  idSuffix: string
  label: string
  value: number
  invalid: boolean
  readOnly: boolean
  describedBy: string
  onChange: (raw: string) => void
}) {
  const id = React.useId()
  return (
    <Field data-invalid={invalid ? true : false} data-disabled={readOnly ? true : false}>
      <FieldLabel htmlFor={`${id}-${idSuffix}`}>{label}</FieldLabel>
      <Input
        id={`${id}-${idSuffix}`}
        type="number"
        inputMode="numeric"
        min={0}
        max={100}
        step={1}
        value={Number.isFinite(value) ? value : ""}
        disabled={readOnly}
        aria-invalid={invalid ? true : false}
        aria-describedby={describedBy}
        className="min-h-11 tabular-nums"
        onChange={(event) => onChange(event.target.value)}
      />
      {invalid ? <FieldError>{label}</FieldError> : null}
    </Field>
  )
}

export function AgentConfig({
  workspace,
  agents,
  versions,
  models,
  guardrailTypes,
  testCases = [],
  selectedId: selectedIdProp,
  defaultSelectedId,
  onSelectedIdChange,
  draft: draftProp,
  onDraftChange,
  runTest,
  onSaveDraft,
  onPublishRequest,
  onRollbackRequest,
  onCreateRequest,
  onUsageCost,
  slots,
  locale = "en",
  labels: labelOverride,
  loading = false,
  error,
  readOnly = false,
  busy: busyProp,
  className,
  classNames,
}: AgentConfigProps) {
  const labels = agentConfigLabels(locale, labelOverride)
  const listId = React.useId()
  const navTitleId = React.useId()
  const [internalId, setInternalId] = React.useState(defaultSelectedId ?? agents[0]?.id ?? "")
  const selectedId = selectedIdProp ?? internalId
  const resolvedId = agents.some((agent) => agent.id === selectedId) ? selectedId : (agents[0]?.id ?? "")
  const agent = agents.find((item) => item.id === resolvedId) ?? null
  const liveFromList = latestPublished(versions, resolvedId)
  const seed = seedFor(resolvedId, versions, draftProp)
  const seedKey = `${resolvedId}:${seed?.id ?? ""}:${seed?.at ?? ""}`
  const [seen, setSeen] = React.useState(seedKey)
  const [draft, setDraft] = React.useState<AgentVersion | null>(seed)
  const [dirty, setDirty] = React.useState(seed != null && liveFromList != null && diffVersions(liveFromList, seed).length > 0)
  const [publishedNow, setPublishedNow] = React.useState<AgentVersion | null>(null)
  const [pane, setPane] = React.useState<"list" | "detail">("list")
  const [navOpen, setNavOpen] = React.useState(false)
  const [panel, setPanel] = React.useState<"history" | "test" | null>(null)
  const [tab, setTab] = React.useState("model")
  const [failure, setFailure] = React.useState<string | null>(null)
  const [localBusy, setLocalBusy] = React.useState<NonNullable<AgentConfigProps["busy"]> | null>(null)
  const [prompt, setPrompt] = React.useState(testCases[0]?.prompt ?? "")
  const [caseId, setCaseId] = React.useState(testCases[0]?.id ?? "")
  const [result, setResult] = React.useState<TestPromptResult | null>(null)
  const busy = localBusy ?? busyProp ?? null
  const live = publishedNow ?? liveFromList

  if (seen !== seedKey) {
    setSeen(seedKey)
    setDraft(seed)
    setDirty(seed != null && liveFromList != null && diffVersions(liveFromList, seed).length > 0)
    setPublishedNow(null)
    setFailure(null)
    setResult(null)
    setPrompt(testCases[0]?.prompt ?? "")
    setCaseId(testCases[0]?.id ?? "")
  }

  function selectAgent(id: string) {
    if (selectedIdProp === undefined) setInternalId(id)
    onSelectedIdChange?.(id)
    setPane("detail")
  }

  function commitDraft(next: AgentVersion) {
    setDraft(next)
    setDirty(true)
    onDraftChange?.(next)
  }

  function patch(recipe: (current: AgentVersion) => AgentVersion) {
    if (!draft || readOnly) return
    commitDraft(recipe(draft))
  }

  async function save() {
    if (!draft || readOnly || localBusy) return
    const snapshot = draft
    setLocalBusy("save")
    setFailure(null)
    try {
      await onSaveDraft?.(draft)
      setDirty(false)
    } catch {
      setDraft(snapshot)
      setDirty(true)
      onDraftChange?.(snapshot)
      setFailure(labels.saveFailed)
    } finally {
      setLocalBusy(null)
    }
  }

  async function publish() {
    if (!draft || readOnly || localBusy || !bandsAreValid(draft.bands)) return
    const snapshot = draft
    setDraft({ ...draft, state: "published" })
    setLocalBusy("publish")
    setFailure(null)
    try {
      await onPublishRequest?.(snapshot)
      const published: AgentVersion = { ...snapshot, state: "published" }
      setPublishedNow(published)
      setDraft(toDraft(published))
      setDirty(false)
    } catch {
      setDraft(snapshot)
      setDirty(true)
      onDraftChange?.(snapshot)
      setFailure(labels.publishFailed)
    } finally {
      setLocalBusy(null)
    }
  }

  async function rollback(version: AgentVersion) {
    if (readOnly || localBusy) return
    const previous = publishedNow
    setPublishedNow(version)
    setLocalBusy("rollback")
    setFailure(null)
    try {
      await onRollbackRequest?.(version)
      const restored = toDraft(version)
      setDraft(restored)
      setDirty(false)
      onDraftChange?.(restored)
    } catch {
      setPublishedNow(previous)
      setFailure(labels.rollbackFailed)
    } finally {
      setLocalBusy(null)
    }
  }

  async function runCase() {
    if (!draft || localBusy) return
    const active = testCases.find((item) => item.id === caseId) ?? testCases[0]
    if (!active) return
    setLocalBusy("test")
    setFailure(null)
    try {
      const execute = runTest ?? defaultRunTest(guardrailTypes)
      setResult(await execute({ agentId: draft.agentId, version: draft, prompt, context: active.context }))
    } catch {
      setResult(null)
      setFailure(labels.testFailed)
    } finally {
      setLocalBusy(null)
    }
  }

  function onListKey(event: React.KeyboardEvent) {
    if (agents.length === 0) return
    const index = Math.max(0, agents.findIndex((item) => item.id === resolvedId))
    const last = agents.length - 1
    const next =
      event.key === "ArrowDown" ? Math.min(last, index + 1)
      : event.key === "ArrowUp" ? Math.max(0, index - 1)
      : event.key === "Home" ? 0
      : event.key === "End" ? last
      : null
    if (next == null) return
    event.preventDefault()
    const id = agents[next]?.id
    if (id) selectAgent(id)
  }

  React.useEffect(() => {
    if (!navOpen) return
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setNavOpen(false)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [navOpen])

  const changes = live && draft ? diffVersions(live, draft) : []
  const valid = draft ? bandsAreValid(draft.bands) : false
  const history = versions
    .filter((version) => version.agentId === resolvedId && version.state === "published")
    .slice()
    .sort((left, right) => right.number - left.number)
  const activeCase = testCases.find((item) => item.id === caseId) ?? testCases[0] ?? null

  return (
    <div
      data-slot="agent-config"
      data-pane={pane}
      data-dirty={dirty ? "true" : "false"}
      data-busy={busy ?? "idle"}
      data-readonly={readOnly ? "true" : "false"}
      data-valid={valid ? "true" : "false"}
      className={cn("@container/config relative flex min-h-[32rem] min-w-0 flex-col bg-background text-foreground @min-[960px]/config:flex-row", className, classNames?.root)}
    >
      {slots?.navigation ? (
        <aside
          aria-labelledby={navTitleId}
          data-slot="agent-config-nav"
          className={cn(
            "min-h-0 bg-sidebar text-sidebar-foreground",
            navOpen
              ? "absolute inset-y-0 start-0 z-20 flex w-64 flex-col border-e shadow-md @min-[960px]/config:static @min-[960px]/config:z-auto @min-[960px]/config:w-56 @min-[960px]/config:shadow-none"
              : "hidden @min-[960px]/config:flex @min-[960px]/config:w-56 @min-[960px]/config:flex-col @min-[960px]/config:border-e",
            classNames?.nav,
          )}
        >
          <div className="flex items-center justify-between gap-2 px-3 py-2">
            <p id={navTitleId} className="text-sm font-medium">{labels.menuTitle}</p>
            <Button type="button" variant="ghost" className="min-h-11 @min-[960px]/config:hidden" onClick={() => setNavOpen(false)}>
              {labels.closeNav}
            </Button>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto">{slots.navigation}</div>
        </aside>
      ) : null}
      <div className="flex min-w-0 flex-1 flex-col gap-4 p-3 @min-[720px]/config:p-4">
        <header data-slot="agent-config-header" className={cn("flex flex-wrap items-start gap-3", classNames?.header)}>
          {slots?.navigation ? (
            <Button type="button" variant="outline" className="min-h-11 @min-[960px]/config:hidden" aria-expanded={navOpen} onClick={() => setNavOpen(true)}>
              {labels.openMenu}
            </Button>
          ) : null}
          <div className="min-w-0 flex-1">
            <h1 className="text-balance text-xl font-semibold tracking-tight">{workspace.title}</h1>
            <p className="text-sm text-pretty text-muted-foreground">{workspace.summary}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {slots?.usageCost ? slots.usageCost(workspace.usage) : (
              <Button type="button" variant="outline" className="min-h-11" onClick={() => onUsageCost?.(workspace.usage)}>
                <ChartColumn data-icon="inline-start" />
                {labels.usageCost}
              </Button>
            )}
            <Button type="button" className="min-h-11" disabled={readOnly} onClick={() => onCreateRequest?.()}>
              <Plus data-icon="inline-start" />
              {labels.newAgent}
            </Button>
          </div>
        </header>
        {loading ? (
          <div aria-busy="true" aria-label={labels.loading} className="grid gap-3">
            <div className="grid gap-3 @min-[720px]/config:grid-cols-2 @min-[1100px]/config:grid-cols-4">
              {workspace.kpis.map((kpi) => <Skeleton key={kpi.id} className="h-28" />)}
            </div>
            <Skeleton className="h-64" />
          </div>
        ) : error ? (
          <Alert variant="destructive">
            <AlertTriangle />
            <AlertTitle>{labels.agents}</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : agents.length === 0 ? (
          <Empty className="border">
            <EmptyHeader>
              <EmptyTitle>{labels.emptyTitle}</EmptyTitle>
              <EmptyDescription>{labels.emptyBody}</EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button type="button" className="min-h-11" disabled={readOnly} onClick={() => onCreateRequest?.()}>
                <Plus data-icon="inline-start" />
                {labels.newAgent}
              </Button>
            </EmptyContent>
          </Empty>
        ) : (
          <>
            <div data-slot="agent-config-kpis" className={cn("grid gap-3 @min-[720px]/config:grid-cols-2 @min-[1100px]/config:grid-cols-4", classNames?.kpis)}>
              {workspace.kpis.map((kpi) => (
                <Card key={kpi.id} size="sm" className="min-w-0 p-3">
                  <Sparkline data={[...kpi.series]} label={kpi.label} value={kpi.value} change={kpi.delta} tone={kpi.tone} interactive={false} height={40} area />
                </Card>
              ))}
            </div>
            <div className="grid min-w-0 gap-3 @min-[800px]/config:grid-cols-[16rem_minmax(0,1fr)]">
              <section aria-label={labels.agents} className={cn("min-w-0", pane === "detail" && "hidden @min-[800px]/config:block", classNames?.list)}>
                <Card size="sm" className="gap-2 p-2">
                  <div className="flex items-center justify-between gap-2 px-2 pt-1">
                    <h2 className="text-sm font-medium">{labels.agents}</h2>
                    <span className="text-sm text-muted-foreground tabular-nums">{agents.length}</span>
                  </div>
                  <p className="px-2 text-xs text-muted-foreground">{labels.listHelp}</p>
                  <ScrollArea className="h-80">
                    <div
                      role="listbox"
                      id={listId}
                      aria-label={labels.agents}
                      aria-activedescendant={agent ? `${listId}-${agent.id}` : undefined}
                      tabIndex={0}
                      onKeyDown={onListKey}
                      className="flex flex-col gap-1 p-1 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                    >
                      {agents.map((item) => {
                        const Icon = ICONS[item.icon]
                        const Level = LEVEL_ICON[item.accuracyLevel]
                        const selected = item.id === resolvedId
                        const primary = latestPublished(versions, item.id)?.binding.primaryId ?? versions.find((version) => version.agentId === item.id)?.binding.primaryId ?? ""
                        return (
                          <div
                            key={item.id}
                            id={`${listId}-${item.id}`}
                            role="option"
                            aria-selected={selected}
                            title={item.name}
                            onClick={() => selectAgent(item.id)}
                            className={cn("flex min-h-11 cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5", selected ? "bg-accent text-accent-foreground" : "hover:bg-muted")}
                          >
                            <Icon aria-hidden="true" className="size-4 shrink-0" />
                            <span className="min-w-0 flex-1">
                              <span className="block truncate text-sm font-medium">{item.name}</span>
                              <span className="block truncate text-xs text-muted-foreground">
                                {modelName(models, primary)} · {item.workflowCount} {labels.workflows}
                              </span>
                            </span>
                            <Badge variant="outline" className="shrink-0">
                              <Level aria-hidden="true" />
                              <span className="tabular-nums">{item.accuracy}%</span>
                              <span>{levelCopy(item.accuracyLevel, labels)}</span>
                            </Badge>
                          </div>
                        )
                      })}
                    </div>
                  </ScrollArea>
                </Card>
              </section>
              <section aria-label={agent?.name ?? labels.agents} className={cn("min-w-0", pane === "list" && "hidden @min-[800px]/config:block", classNames?.detail)}>
                {agent && draft ? (
                  <Card size="sm" className="gap-3 p-3">
                    <div className="flex flex-wrap items-start gap-2">
                      <Button type="button" variant="ghost" className="min-h-11 @min-[800px]/config:hidden" onClick={() => setPane("list")}>
                        {labels.backToList}
                      </Button>
                      <div className="min-w-0 flex-1">
                        <h2 className="truncate text-base font-medium" title={agent.name}>{agent.name}</h2>
                        <p className="text-sm text-pretty text-muted-foreground">{agent.summary}</p>
                      </div>
                      <Badge variant="outline">{labels.live} v{live?.number ?? draft.number}</Badge>
                      {dirty ? <Badge variant="secondary">{labels.draft}</Badge> : null}
                      {readOnly ? <Badge variant="outline">{labels.readOnly}</Badge> : null}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button type="button" variant="outline" className="min-h-11" aria-pressed={panel === "history"} onClick={() => setPanel(panel === "history" ? null : "history")}>
                        <History data-icon="inline-start" />
                        {panel === "history" ? labels.hideHistory : labels.history}
                      </Button>
                      <Button type="button" variant="outline" className="min-h-11" aria-pressed={panel === "test"} onClick={() => setPanel(panel === "test" ? null : "test")}>
                        {panel === "test" ? labels.hideTest : labels.testPrompt}
                      </Button>
                      <Button type="button" variant="outline" className="min-h-11" disabled={readOnly || localBusy !== null || !dirty} onClick={() => void save()}>
                        {busy === "save" ? <Loader2 className="animate-spin" data-icon="inline-start" /> : null}
                        {busy === "save" ? labels.saving : labels.saveDraft}
                      </Button>
                      <Button type="button" className="min-h-11" disabled={readOnly || localBusy !== null || !valid || !dirty} aria-busy={busy === "publish"} onClick={() => void publish()}>
                        {busy === "publish" ? <Loader2 className="animate-spin" data-icon="inline-start" /> : null}
                        {busy === "publish" ? labels.publishing : labels.publish}
                      </Button>
                    </div>
                    {failure ? (
                      <Alert variant="destructive">
                        <AlertTriangle />
                        <AlertTitle>{labels.version}</AlertTitle>
                        <AlertDescription>{failure}</AlertDescription>
                      </Alert>
                    ) : null}
                    {panel === "history" ? (
                      <HistoryList history={history} liveId={live?.id ?? ""} labels={labels} locale={locale} readOnly={readOnly} busy={busy === "rollback"} onRestore={(version) => void rollback(version)} />
                    ) : null}
                    {panel === "test" && activeCase ? (
                      <TestPanel
                        cases={testCases}
                        caseId={activeCase.id}
                        prompt={prompt}
                        result={result}
                        labels={labels}
                        locale={locale}
                        busy={busy === "test"}
                        onCase={(id) => {
                          const next = testCases.find((item) => item.id === id)
                          setCaseId(id)
                          if (next) setPrompt(next.prompt)
                          setResult(null)
                        }}
                        onPrompt={setPrompt}
                        onRun={() => void runCase()}
                      />
                    ) : null}
                    <Tabs value={tab} onValueChange={setTab}>
                      <TabsList className="w-full">
                        <TabsTrigger value="model">{labels.model}</TabsTrigger>
                        <TabsTrigger value="instructions">{labels.instructions}</TabsTrigger>
                        <TabsTrigger value="guardrails">{labels.guardrails}</TabsTrigger>
                        <TabsTrigger value="evaluation">{labels.evaluation}</TabsTrigger>
                      </TabsList>
                      <TabsContent value="model" className="flex flex-col gap-4 pt-2">
                        <DiffList changes={changes} models={models} labels={labels} />
                        <BindingFields
                          binding={draft.binding}
                          models={models}
                          labels={labels}
                          locale={locale}
                          readOnly={readOnly}
                          {...(slots ? { slots } : {})}
                          onChange={(binding) => patch((current) => ({ ...current, binding }))}
                        />
                        <Separator />
                        <BandEditor
                          bands={draft.bands}
                          distribution={draft.evaluation.distribution}
                          labels={labels}
                          locale={locale}
                          readOnly={readOnly}
                          {...(classNames?.bands ? { className: classNames.bands } : {})}
                          onChange={(next) => patch((current) => ({ ...current, bands: next }))}
                        />
                      </TabsContent>
                      <TabsContent value="instructions" className="pt-2">
                        <Field>
                          <FieldLabel htmlFor={`${listId}-instructions`}>{labels.instructions}</FieldLabel>
                          <Textarea
                            id={`${listId}-instructions`}
                            value={draft.instructions}
                            disabled={readOnly}
                            className="min-h-32"
                            onChange={(event) => patch((current) => ({ ...current, instructions: event.target.value }))}
                          />
                          <FieldDescription>{labels.instructionsHint}</FieldDescription>
                        </Field>
                      </TabsContent>
                      <TabsContent value="guardrails" className="pt-2">
                        <GuardrailList
                          rules={draft.guardrails}
                          types={guardrailTypes}
                          labels={labels}
                          readOnly={readOnly}
                          onToggle={(rule, enabled) => patch((current) => ({
                            ...current,
                            guardrails: current.guardrails.map((item) => (item.id === rule.id ? { ...item, enabled } : item)),
                          }))}
                          onParam={(rule, key, value) => patch((current) => ({
                            ...current,
                            guardrails: current.guardrails.map((item) => (
                              item.id === rule.id ? { ...item, params: { ...item.params, [key]: value } } : item
                            )),
                          }))}
                        />
                      </TabsContent>
                      <TabsContent value="evaluation" className="flex flex-col gap-3 pt-2">
                        <p className="text-sm text-muted-foreground">{labels.period}</p>
                        <p className="text-2xl font-medium tabular-nums">
                          {agent.accuracy}%
                          <span className="ms-2 text-sm font-normal text-muted-foreground">{levelCopy(agent.accuracyLevel, labels)} · {labels.accuracyCaption}</span>
                        </p>
                        <Distribution distribution={draft.evaluation.distribution} bands={draft.bands} />
                        <p className="text-sm text-muted-foreground tabular-nums">
                          {bandImpact(draft.evaluation.distribution, draft.bands).total === 0
                            ? labels.noDistribution
                            : formatCount(bandImpact(draft.evaluation.distribution, draft.bands).total, locale)}
                        </p>
                      </TabsContent>
                    </Tabs>
                  </Card>
                ) : null}
              </section>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function Distribution({ distribution, bands }: { distribution: readonly number[]; bands: ConfidenceBands }) {
  const series = binSeries(distribution, 32)
  const peak = Math.max(1, ...series)
  return (
    <div className="flex h-16 items-end gap-px" aria-hidden="true">
      {series.map((count, index) => {
        const score = Math.round((index / Math.max(1, series.length - 1)) * 100)
        const band = score < bands.reject.max ? "reject" : score <= bands.review.max ? "review" : "auto"
        return (
          <span key={index} className="flex h-full min-w-0 flex-1 items-end">
            <span
              className={cn("h-full w-full origin-bottom", band === "reject" ? "bg-destructive/70" : band === "review" ? "bg-muted-foreground/70" : "bg-primary/70")}
              style={{ transform: `scaleY(${Math.max(0.08, count / peak)})` }}
            />
          </span>
        )
      })}
    </div>
  )
}

function DiffList({ changes, models, labels }: { changes: readonly VersionChange[]; models: readonly ExampleModel[]; labels: AgentConfigLabels }) {
  return (
    <div data-slot="agent-config-diff" className="flex flex-col gap-1 rounded-lg bg-muted/60 p-3">
      <h3 className="text-sm font-medium">{labels.diffTitle}</h3>
      {changes.length === 0 ? <p className="text-sm text-muted-foreground">{labels.noDiff}</p> : (
        <ul className="flex flex-col gap-1 text-sm">
          {changes.map((change, index) => (
            <li key={`${change.kind}-${index}`} className="text-pretty">{changeLine(change, models, labels)}</li>
          ))}
        </ul>
      )}
    </div>
  )
}

function BindingFields({
  binding,
  models,
  labels,
  locale,
  readOnly,
  slots,
  onChange,
}: {
  binding: ModelBinding
  models: readonly ExampleModel[]
  labels: AgentConfigLabels
  locale: "es" | "en"
  readOnly: boolean
  slots?: AgentConfigSlots
  onChange: (binding: ModelBinding) => void
}) {
  const primary = models.find((model) => model.id === binding.primaryId)
  const fallback = models.find((model) => model.id === binding.fallbackId)
  const primaryField = React.useId()
  const fallbackField = React.useId()
  const kind = binding.fallback.kind
  const afterMs = binding.fallback.kind === "timeout" ? binding.fallback.afterMs : 8000
  const Picker = slots?.modelSelect ?? DefaultModelSelect
  const FallbackPicker = slots?.fallbackSelect ?? DefaultModelSelect
  return (
    <FieldGroup>
      <div className="grid gap-3 @min-[640px]/config:grid-cols-2">
        <div className="flex flex-col gap-1">
          <Picker id={primaryField} value={binding.primaryId} models={models} disabled={readOnly} label={labels.primaryModel} onValueChange={(primaryId) => onChange({ ...binding, primaryId })} />
          {primary ? <PriceLine model={primary} labels={labels} locale={locale} /> : null}
        </div>
        <div className="flex flex-col gap-1">
          <FallbackPicker id={fallbackField} value={binding.fallbackId} models={models} disabled={readOnly} label={labels.fallbackModel} onValueChange={(fallbackId) => onChange({ ...binding, fallbackId })} />
          {fallback ? <PriceLine model={fallback} labels={labels} locale={locale} /> : null}
        </div>
      </div>
      <div className="grid gap-3 @min-[640px]/config:grid-cols-2">
        <Field>
          <FieldLabel htmlFor={`${fallbackField}-when`}>{labels.fallbackWhen}</FieldLabel>
          <Select
            value={kind}
            disabled={readOnly}
            onValueChange={(value) => {
              const next = value as FallbackKind
              onChange({
                ...binding,
                fallback: next === "timeout" ? { kind: "timeout", afterMs } : next === "error" ? { kind: "error" } : { kind: "unavailable" },
              })
            }}
          >
            <SelectTrigger id={`${fallbackField}-when`} className="min-h-11 w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="timeout">{labels.timeout}</SelectItem>
                <SelectItem value="error">{labels.errorCondition}</SelectItem>
                <SelectItem value="unavailable">{labels.unavailable}</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </Field>
        {kind === "timeout" ? (
          <Field>
            <FieldLabel htmlFor={`${fallbackField}-ms`}>{labels.afterMs}</FieldLabel>
            <Input
              id={`${fallbackField}-ms`}
              type="number"
              min={1}
              className="min-h-11 tabular-nums"
              disabled={readOnly}
              value={afterMs}
              onChange={(event) => {
                const value = Number(event.target.value)
                if (!Number.isFinite(value)) return
                onChange({ ...binding, fallback: { kind: "timeout", afterMs: value } })
              }}
            />
          </Field>
        ) : null}
      </div>
    </FieldGroup>
  )
}

function PriceLine({ model, labels, locale }: { model: ExampleModel; labels: AgentConfigLabels; locale: "es" | "en" }) {
  const seconds = new Intl.NumberFormat(locale === "es" ? "es-MX" : "en-US", { maximumFractionDigits: 1 }).format(model.p95Ms / 1000)
  const per1k = exampleAmountPer1k(model)
  return (
    <p className="text-xs text-pretty text-muted-foreground tabular-nums">
      {labels.examplePrice}: {formatExampleMoney(model.inputPerMillion, locale, model.currency)}. {labels.exampleLatency}: {seconds} s. {formatExampleMoney(per1k, locale, model.currency)} / 1K.
    </p>
  )
}

function GuardrailList({
  rules,
  types,
  labels,
  readOnly,
  onToggle,
  onParam,
}: {
  rules: readonly Guardrail[]
  types: readonly GuardrailType[]
  labels: AgentConfigLabels
  readOnly: boolean
  onToggle: (rule: Guardrail, enabled: boolean) => void
  onParam: (rule: Guardrail, key: string, value: number) => void
}) {
  return (
    <ul className="flex flex-col gap-3">
      {rules.map((rule) => {
        const known = types.some((type) => type.type === rule.type && type.action === rule.action)
        const threshold = rule.params.threshold
        const switchId = `guard-${rule.id}`
        return (
          <li key={rule.id} className="flex flex-col gap-2 border-b border-border pb-3 last:border-b-0">
            <div className="flex min-h-11 items-start gap-3">
              <div className="min-w-0 flex-1">
                <label htmlFor={switchId} className="text-sm font-medium">{rule.label}</label>
                <p className="text-sm text-pretty text-muted-foreground">{rule.detail}</p>
                {!known ? <p className="text-sm text-destructive">{labels.guardrailProblem}</p> : null}
              </div>
              <Switch id={switchId} checked={rule.enabled} disabled={readOnly || !known} onCheckedChange={(checked) => onToggle(rule, checked)} />
            </div>
            {typeof threshold === "number" ? (
              <Field data-disabled={readOnly ? true : false} className="max-w-xs">
                <FieldLabel htmlFor={`${switchId}-threshold`}>{labels.threshold}</FieldLabel>
                <Input
                  id={`${switchId}-threshold`}
                  type="number"
                  min={0}
                  className="min-h-11 tabular-nums"
                  disabled={readOnly}
                  value={threshold}
                  onChange={(event) => {
                    const value = Number(event.target.value)
                    if (!Number.isFinite(value)) return
                    onParam(rule, "threshold", value)
                  }}
                />
              </Field>
            ) : null}
          </li>
        )
      })}
    </ul>
  )
}

function HistoryList({
  history,
  liveId,
  labels,
  locale,
  readOnly,
  busy,
  onRestore,
}: {
  history: readonly AgentVersion[]
  liveId: string
  labels: AgentConfigLabels
  locale: "es" | "en"
  readOnly: boolean
  busy: boolean
  onRestore: (version: AgentVersion) => void
}) {
  return (
    <div className="flex flex-col gap-2 rounded-lg border p-3">
      <h3 className="text-sm font-medium">{labels.history}</h3>
      {history.length === 0 ? <p className="text-sm text-muted-foreground">{labels.historyEmpty}</p> : null}
      <ul className="flex flex-col gap-2">
        {history.map((version) => {
          const current = version.id === liveId
          return (
            <li key={version.id} className="flex flex-wrap items-center gap-2">
              <span className="min-w-0 flex-1 text-sm">
                <span className="font-medium tabular-nums">v{version.number}</span>
                <span className="text-muted-foreground"> · {version.author} · {formatStamp(version.at, locale)}</span>
                {current ? <Badge variant="outline" className="ms-2">{labels.live}</Badge> : null}
              </span>
              {current ? null : (
                <Button type="button" variant="outline" className="min-h-11" disabled={readOnly || busy} onClick={() => onRestore(version)}>
                  {busy ? labels.rollingBack : labels.rollback}
                </Button>
              )}
            </li>
          )
        })}
      </ul>
    </div>
  )
}

function TestPanel({
  cases,
  caseId,
  prompt,
  result,
  labels,
  locale,
  busy,
  onCase,
  onPrompt,
  onRun,
}: {
  cases: readonly TestCase[]
  caseId: string
  prompt: string
  result: TestPromptResult | null
  labels: AgentConfigLabels
  locale: "es" | "en"
  busy: boolean
  onCase: (id: string) => void
  onPrompt: (value: string) => void
  onRun: () => void
}) {
  const promptId = React.useId()
  const caseField = React.useId()
  return (
    <div data-slot="agent-config-test" className="flex flex-col gap-3 rounded-lg border p-3">
      <h3 className="text-sm font-medium">{labels.testPrompt}</h3>
      {cases.length > 0 ? (
        <Field>
          <FieldLabel htmlFor={caseField}>{labels.caseLabel}</FieldLabel>
          <Select value={caseId} onValueChange={onCase}>
            <SelectTrigger id={caseField} className="min-h-11 w-full"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {cases.map((item) => <SelectItem key={item.id} value={item.id}>{item.label}</SelectItem>)}
              </SelectGroup>
            </SelectContent>
          </Select>
        </Field>
      ) : null}
      <Field>
        <FieldLabel htmlFor={promptId}>{labels.testPrompt}</FieldLabel>
        <Textarea id={promptId} value={prompt} className="min-h-20" onChange={(event) => onPrompt(event.target.value)} />
      </Field>
      <Button type="button" className="min-h-11 w-fit" disabled={busy || prompt.trim() === ""} onClick={onRun}>
        {busy ? <Loader2 className="animate-spin" data-icon="inline-start" /> : null}
        {busy ? labels.runningTest : labels.runTest}
      </Button>
      {result ? (
        <div className="flex flex-col gap-1 text-sm" aria-live="polite">
          <p><span className="text-muted-foreground">{labels.testDecision}: </span>{decisionCopy(result.decision, labels)}</p>
          <p className="tabular-nums"><span className="text-muted-foreground">{labels.testConfidence}: </span>{formatCount(result.confidence, locale)}</p>
          <p><span className="text-muted-foreground">{labels.testBand}: </span>{bandCopy(result.band, labels)}</p>
          <p className="font-medium">{labels.testGuardrails}</p>
          {result.hits.length === 0 ? <p className="text-muted-foreground">{labels.testNone}</p> : (
            <ul className="flex list-disc flex-col gap-1 ps-4">
              {result.hits.map((hit) => (
                <li key={`${hit.id}-${hit.denied ? "denied" : "hit"}`}>
                  {hit.reasonKey}
                  {hit.denied ? ` — ${labels.allowDenied}` : ` — ${hit.action}`}
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : null}
    </div>
  )
}

export type { AgentConfigLabels }
