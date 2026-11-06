"use client"

/**
 * Clean-room knowledge ingest. The layout was observed in a public post
 * with no code and no license. No source, sample payload, or asset was copied.
 * Ports belong to the host. This file does not fetch.
 */

import * as React from "react"
import { BookOpen, Database, GitBranch, LifeBuoy, Plus, StickyNote } from "lucide-react"
import { motion, useReducedMotion } from "motion/react"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import {
  connectedCount,
  indexingCount,
  totalChunks,
  type KnowledgeGlyph,
  type KnowledgePort,
  type KnowledgeSource,
  type KnowledgeSourceType,
  type PortReport,
  type SourceStatus,
} from "@/registry/retana/lib/knowledge-base"
import { AnimatedCounter } from "@/registry/retana/ui/animated-counter"
import { EmptyState } from "@/registry/retana/ui/empty-state"
import { StatusPill } from "@/registry/retana/ui/status-pill"
import { ToastStack, ToastStackProvider, useToastStack } from "@/registry/retana/ui/toast-stack"

export type KnowledgeBaseStatus = "ready" | "loading" | "error"

export type KnowledgeBaseLabels = {
  title: string
  chunks: string
  connect: string
  disconnect: string
  retry: string
  sync: string
  reset: string
  resetTitle: string
  resetBody: string
  resetConfirm: string
  cancel: string
  add: string
  name: string
  type: string
  emptyTitle: string
  emptyDescription: string
  loading: string
  errorTitle: string
  indexing: (count: number) => string
  ready: (sources: number, chunks: number) => string
  idle: string
  chunksLive: (chunks: number) => string
  connectedToast: (name: string, chunks: number) => string
  errorToast: (name: string) => string
  resetToast: string
  toasts: string
  status: Record<SourceStatus, string>
}

export type KnowledgeBaseProps = {
  title: string
  types: readonly KnowledgeSourceType[]
  sources: readonly KnowledgeSource[]
  onSourcesChange: (sources: KnowledgeSource[]) => void
  onConnect: KnowledgePort
  onSync: KnowledgePort
  onDisconnect: KnowledgePort
  onReset: (ctx: { signal: AbortSignal }) => Promise<void>
  status?: KnowledgeBaseStatus
  error?: string
  readOnly?: boolean
  labels?: Partial<KnowledgeBaseLabels>
  locale?: string
  className?: string
}

const glyphs: Record<KnowledgeGlyph, React.ComponentType<{ className?: string }>> = {
  docs: BookOpen,
  repo: GitBranch,
  help: LifeBuoy,
  notes: StickyNote,
  generic: Database,
}

const tones = {
  disconnected: "neutral",
  connecting: "info",
  syncing: "warning",
  connected: "positive",
  error: "critical",
  stale: "warning",
} as const satisfies Record<SourceStatus, "neutral" | "info" | "warning" | "positive" | "critical">

const defaultLabels: KnowledgeBaseLabels = {
  title: "Knowledge base",
  chunks: "chunks",
  connect: "Connect",
  disconnect: "Disconnect",
  retry: "Try again",
  sync: "Sync",
  reset: "Reset",
  resetTitle: "Reset the knowledge base?",
  resetBody: "Connected sources go back to disconnected and the chunk count returns to zero.",
  resetConfirm: "Reset knowledge base",
  cancel: "Cancel",
  add: "Connect source",
  name: "Source name",
  type: "Source type",
  emptyTitle: "No sources",
  emptyDescription: "Connect a document, a repository, or notes to start indexing.",
  loading: "Loading sources",
  errorTitle: "The knowledge base did not load",
  indexing: (count) => `Indexing ${count} ${count === 1 ? "source" : "sources"}`,
  ready: (sources, chunks) => `Ready. ${sources} sources, ${chunks} chunks.`,
  idle: "Nothing is connected yet.",
  chunksLive: (chunks) => `${chunks} chunks`,
  connectedToast: (name, chunks) => `${name} connected. ${chunks} chunks`,
  errorToast: (name) => `${name} did not connect`,
  resetToast: "The knowledge base was reset",
  toasts: "Notices",
  status: {
    disconnected: "Disconnected",
    connecting: "Connecting",
    syncing: "Syncing",
    connected: "Connected",
    error: "Error",
    stale: "Stale",
  },
}

function labelsFrom(partial?: Partial<KnowledgeBaseLabels>): KnowledgeBaseLabels {
  return {
    ...defaultLabels,
    ...partial,
    status: { ...defaultLabels.status, ...partial?.status },
  }
}

function useQuietMotion() {
  const fromConfig = useReducedMotion()
  const [fromMedia, setFromMedia] = React.useState(
    () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  )
  React.useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)")
    const update = () => setFromMedia(query.matches)
    update()
    query.addEventListener("change", update)
    return () => query.removeEventListener("change", update)
  }, [])
  return fromConfig === true || fromMedia
}

function cleared(source: KnowledgeSource): KnowledgeSource {
  return {
    id: source.id,
    typeId: source.typeId,
    name: source.name,
    detail: source.detail,
    status: "disconnected",
    chunks: 0,
  }
}

function withPatch(source: KnowledgeSource, partial: Partial<KnowledgeSource>): KnowledgeSource {
  const next: KnowledgeSource = { ...source }
  if (partial.status) next.status = partial.status
  if (partial.chunks != null) next.chunks = partial.chunks
  if (partial.progress != null) next.progress = partial.progress
  if (partial.error) next.error = partial.error
  else if ("error" in partial) delete next.error
  return next
}

function Illustration({ sources, reduced }: { sources: readonly KnowledgeSource[]; reduced: boolean }) {
  const shown = sources.slice(0, 6)
  return (
    <svg
      viewBox="0 0 360 140"
      className="h-auto w-full text-muted-foreground"
      role="presentation"
      aria-hidden="true"
      data-motion={reduced ? "off" : "on"}
    >
      <g className="fill-muted stroke-border" strokeWidth="1.5">
        <rect x="150" y="78" width="60" height="16" rx="4" />
        <rect x="142" y="60" width="76" height="16" rx="4" className="fill-card" />
        <rect x="134" y="42" width="92" height="16" rx="4" />
      </g>
      {shown.map((source, index) => {
        const live = source.status === "connected" || source.status === "syncing" || source.status === "stale"
        const x = 36 + (index % 3) * 144
        const y = index < 3 ? 28 : 108
        const tone = source.status === "error" ? "text-destructive" : live ? "text-foreground" : "text-muted-foreground"
        return (
          <g key={source.id}>
            {live ? (
              <path
                d={`M ${x + 10} ${y} C ${(x + 180) / 2} ${y}, ${(x + 180) / 2} 50, 180 50`}
                fill="none"
                strokeWidth="1.5"
                className="stroke-current text-primary"
              />
            ) : null}
            {reduced ? (
              <circle cx={x} cy={y} r="8" className={cn("fill-current", tone, live ? "opacity-100" : "opacity-40")} />
            ) : (
              <motion.circle
                cx={x}
                cy={y}
                r="8"
                className={cn("fill-current", tone)}
                initial={{ opacity: 0.35 }}
                animate={{ opacity: live ? 1 : 0.4 }}
                transition={{ duration: 0.24 }}
              />
            )}
          </g>
        )
      })}
    </svg>
  )
}

function KnowledgeBaseBody({
  title,
  types,
  sources,
  onSourcesChange,
  onConnect,
  onSync,
  onDisconnect,
  onReset,
  status = "ready",
  error,
  readOnly = false,
  labels: labelOverride,
  locale = "en-US",
  className,
}: KnowledgeBaseProps) {
  const labels = labelsFrom(labelOverride)
  const notices = useToastStack()
  const reduced = useQuietMotion()
  const sourcesRef = React.useRef(sources)
  const jobs = React.useRef(new Map<string, AbortController>())
  const seq = React.useRef(sources.length)
  const [typeId, setTypeId] = React.useState(types[0]?.id ?? "")
  const [draftName, setDraftName] = React.useState("")
  const [confirmReset, setConfirmReset] = React.useState(false)
  const headingId = React.useId()

  React.useEffect(() => {
    sourcesRef.current = sources
  }, [sources])

  function replace(next: KnowledgeSource[]) {
    sourcesRef.current = next
    onSourcesChange(next)
  }

  function patch(id: string, partial: Partial<KnowledgeSource>) {
    replace(sourcesRef.current.map((source) => (source.id === id ? withPatch(source, partial) : source)))
  }

  async function run(id: string, mode: "connect" | "sync" | "disconnect") {
    jobs.current.get(id)?.abort()
    const controller = new AbortController()
    jobs.current.set(id, controller)
    const previous = sourcesRef.current.map((source) => ({ ...source }))
    const report = (update: PortReport) => {
      if (controller.signal.aborted) return
      patch(id, {
        status: "syncing",
        ...(update.progress != null ? { progress: update.progress } : {}),
        ...(update.chunks != null ? { chunks: update.chunks } : {}),
      })
    }
    const ctx = { signal: controller.signal, report }
    try {
      if (mode === "disconnect") {
        await onDisconnect(id, ctx)
        if (controller.signal.aborted) return
        const current = sourcesRef.current.find((source) => source.id === id)
        if (current) patch(id, { status: "disconnected", chunks: 0, progress: 0, error: "" })
        return
      }
      if (mode === "connect") {
        patch(id, { status: "connecting", error: "" })
        await onConnect(id, ctx)
      }
      if (controller.signal.aborted) {
        replace(previous)
        return
      }
      patch(id, { status: "syncing", progress: 0 })
      await onSync(id, ctx)
      if (controller.signal.aborted) {
        replace(previous)
        return
      }
      const current = sourcesRef.current.find((source) => source.id === id)
      patch(id, { status: "connected", progress: 100, error: "" })
      notices.toast({
        type: "success",
        title: labels.connectedToast(current?.name ?? id, current?.chunks ?? 0),
      })
    } catch (cause) {
      if (controller.signal.aborted) {
        replace(previous)
        return
      }
      const message = cause instanceof Error && cause.message ? cause.message : labels.errorToast(id)
      const current = sourcesRef.current.find((source) => source.id === id)
      patch(id, { status: "error", error: message })
      notices.toast({ type: "error", title: labels.errorToast(current?.name ?? id), description: message })
    } finally {
      if (jobs.current.get(id) === controller) jobs.current.delete(id)
    }
  }

  function addSource() {
    const name = draftName.trim()
    const type = types.find((item) => item.id === typeId)
    if (!name || !type || readOnly) return
    seq.current += 1
    const source: KnowledgeSource = {
      id: `fuente-${seq.current}`,
      typeId: type.id,
      name,
      detail: type.hint ?? type.label,
      status: "disconnected",
      chunks: 0,
    }
    replace([...sourcesRef.current, source])
    setDraftName("")
    void run(source.id, "connect")
  }

  async function reset() {
    for (const controller of jobs.current.values()) controller.abort()
    const controller = new AbortController()
    const previous = sourcesRef.current.map((source) => ({ ...source }))
    try {
      await onReset({ signal: controller.signal })
      if (controller.signal.aborted) return
      replace(previous.map(cleared))
      notices.toast({ type: "success", title: labels.resetToast })
    } catch (cause) {
      replace(previous)
      const message = cause instanceof Error && cause.message ? cause.message : labels.errorTitle
      notices.toast({ type: "error", title: labels.errorTitle, description: message })
    } finally {
      setConfirmReset(false)
    }
  }

  const chunks = totalChunks(sources)
  const indexing = indexingCount(sources)
  const linked = connectedCount(sources)
  const summary = indexing > 0 ? labels.indexing(indexing) : linked > 0 ? labels.ready(linked, chunks) : labels.idle

  return (
    <section
      className={cn(
        "relative flex min-w-0 flex-col gap-4 rounded-xl border border-border bg-card p-4 text-card-foreground shadow-sm",
        className,
      )}
      aria-busy={status === "loading"}
    >
      <header className="flex flex-wrap items-center justify-between gap-3">
        <h2 id={headingId} className="text-base font-medium text-balance">
          {title}
        </h2>
        <p className="text-sm text-muted-foreground tabular-nums">
          <span className="sr-only" aria-live="polite">
            {labels.chunksLive(chunks)}
          </span>
          <span aria-hidden="true">
            <AnimatedCounter value={chunks} locale={locale} className="text-sm font-medium" />
          </span>
          <span className="ms-1">{labels.chunks}</span>
        </p>
      </header>

      {status === "loading" ? (
        <div className="flex flex-col gap-3" aria-label={labels.loading}>
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      ) : null}

      {status === "error" ? (
        <Alert variant="destructive">
          <AlertTitle>{labels.errorTitle}</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      {status === "ready" ? (
        <>
          <Illustration sources={sources} reduced={reduced} />
          <p className="text-center text-sm font-medium text-balance">{summary}</p>
          {sources.length === 0 ? <EmptyState title={labels.emptyTitle} description={labels.emptyDescription} /> : null}
          {readOnly ? null : (
            <div className="flex flex-col gap-2 sm:flex-row">
              <Select value={typeId} onValueChange={setTypeId}>
                <SelectTrigger aria-label={labels.type} className="w-full sm:w-44">
                  <SelectValue placeholder={labels.type}>{types.find((item) => item.id === typeId)?.label}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {types.map((type) => (
                      <SelectItem key={type.id} value={type.id}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              <Input
                aria-label={labels.name}
                value={draftName}
                onChange={(event) => setDraftName(event.target.value)}
                placeholder={labels.name}
                className="min-w-0 flex-1"
              />
              <Button type="button" disabled={draftName.trim() === "" || typeId === ""} onClick={addSource}>
                <Plus data-icon="inline-start" />
                {labels.add}
              </Button>
            </div>
          )}
          <ul aria-labelledby={headingId} className="flex flex-col gap-2">
            {sources.map((source) => {
              const type = types.find((item) => item.id === source.typeId)
              const Glyph = glyphs[type?.glyph ?? "generic"]
              return (
                <li
                  key={source.id}
                  className="flex min-w-0 flex-col gap-2 rounded-lg border border-border px-3 py-2 sm:flex-row sm:items-center"
                >
                  <Glyph className="size-4 shrink-0 text-muted-foreground" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium" title={source.name}>
                      {source.name}
                    </p>
                    <p className="truncate text-xs text-muted-foreground" title={source.detail}>
                      {source.detail}
                    </p>
                    {source.status === "syncing" ? (
                      <Progress value={source.progress ?? 0} aria-label={labels.status.syncing} />
                    ) : null}
                    {source.error ? <p className="text-xs text-destructive">{source.error}</p> : null}
                  </div>
                  <span className="text-xs text-muted-foreground tabular-nums">{source.chunks}</span>
                  <StatusPill label={labels.status[source.status]} tone={tones[source.status]} />
                  {readOnly ? null : (
                    <div className="flex flex-wrap gap-2">
                      {source.status === "disconnected" ? (
                        <Button type="button" size="sm" variant="outline" onClick={() => void run(source.id, "connect")}>
                          {labels.connect}
                        </Button>
                      ) : null}
                      {source.status === "error" ? (
                        <Button type="button" size="sm" variant="outline" onClick={() => void run(source.id, "connect")}>
                          {labels.retry}
                        </Button>
                      ) : null}
                      {source.status === "stale" || source.status === "connected" ? (
                        <Button type="button" size="sm" variant="outline" onClick={() => void run(source.id, "sync")}>
                          {labels.sync}
                        </Button>
                      ) : null}
                      {source.status !== "disconnected" && source.status !== "connecting" ? (
                        <Button type="button" size="sm" variant="ghost" onClick={() => void run(source.id, "disconnect")}>
                          {labels.disconnect}
                        </Button>
                      ) : null}
                    </div>
                  )}
                </li>
              )
            })}
          </ul>
          <footer className="flex items-center justify-between gap-3 text-xs text-muted-foreground">
            <span className="tabular-nums">
              {sources.length} · {chunks} {labels.chunks}
            </span>
            {readOnly ? null : (
              <Button type="button" variant="outline" onClick={() => setConfirmReset(true)}>
                {labels.reset}
              </Button>
            )}
          </footer>
        </>
      ) : null}

      <AlertDialog open={confirmReset} onOpenChange={setConfirmReset}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{labels.resetTitle}</AlertDialogTitle>
            <AlertDialogDescription>{labels.resetBody}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{labels.cancel}</AlertDialogCancel>
            <AlertDialogAction onClick={() => void reset()}>{labels.resetConfirm}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  )
}

export function KnowledgeBase(props: KnowledgeBaseProps) {
  const labels = labelsFrom(props.labels)
  return (
    <ToastStackProvider>
      <KnowledgeBaseBody {...props} />
      <ToastStack contained label={labels.toasts} />
    </ToastStackProvider>
  )
}
