"use client"

// Adapted from LocalMode UI (MIT) — apps/ui/registry/localmode/conversation/tool/tool.tsx

import * as React from "react"
import { AlertCircle, Check, ChevronDown, CircleDashed, Loader2, Wrench } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { cn } from "@/lib/utils"
import { CopyButton } from "@/registry/retana/ui/copy-button"

export type ToolCallStatus = "pending" | "running" | "streaming" | "completed" | "error"

export type ToolCallData = {
  id: string
  name: string
  input?: Record<string, unknown>
  output?: unknown
  error?: string
  status: ToolCallStatus
  startedAt?: number | string | Date
  endedAt?: number | string | Date
}

export type ToolCallClassNames = {
  root?: string
  header?: string
  badge?: string
  content?: string
  section?: string
  pre?: string
}

export type ToolCallProps = {
  call: ToolCallData
  defaultOpen?: boolean
  open?: boolean
  onOpenChange?: (open: boolean) => void
  renderers?: Record<string, (call: ToolCallData) => React.ReactNode>
  renderJson?: (value: unknown) => React.ReactNode
  className?: string
  classNames?: ToolCallClassNames
}

const STATUS_LABEL: Record<ToolCallStatus, string> = {
  pending: "Pending",
  running: "Running",
  streaming: "Streaming",
  completed: "Completed",
  error: "Error",
}

function toMs(value?: number | string | Date) {
  if (value == null) return undefined
  if (typeof value === "number") return value
  const parsed = value instanceof Date ? value.getTime() : Date.parse(value)
  return Number.isFinite(parsed) ? parsed : undefined
}

function formatDuration(ms: number) {
  const seconds = Math.max(0, Math.round(ms / 1000))
  const minutes = Math.floor(seconds / 60)
  const rest = seconds % 60
  if (minutes <= 0) return `${seconds}s`
  return `${minutes}m ${rest}s`
}

export function prettyJson(value: unknown) {
  if (typeof value === "string") return value
  try {
    return JSON.stringify(value, null, 2)
  } catch {
    return String(value)
  }
}

function useElapsed(call: ToolCallData) {
  const started = toMs(call.startedAt)
  const ended = toMs(call.endedAt)
  const live = call.status === "running" || call.status === "streaming"
  const [now, setNow] = React.useState(() => Date.now())

  React.useEffect(() => {
    if (!live || started == null) return
    const timer = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(timer)
  }, [live, started])

  if (started == null) return undefined
  const end = live ? now : (ended ?? now)
  return formatDuration(end - started)
}

function StatusIcon({ status }: { status: ToolCallStatus }) {
  if (status === "pending") return <CircleDashed aria-hidden="true" className="size-3" />
  if (status === "running" || status === "streaming") {
    return <Loader2 aria-hidden="true" className="size-3 animate-spin motion-reduce:animate-none" />
  }
  if (status === "error") return <AlertCircle aria-hidden="true" className="size-3" />
  return <Check aria-hidden="true" className="size-3" />
}

function badgeClass(status: ToolCallStatus) {
  if (status === "pending") return "bg-muted text-muted-foreground"
  if (status === "running" || status === "streaming") return "bg-primary/10 text-primary"
  if (status === "error") return "bg-destructive/10 text-destructive"
  return "text-foreground"
}

function JsonSection({
  label,
  value,
  tone,
  classNames,
  renderJson,
}: {
  label: string
  value: unknown
  tone?: "error"
  classNames?: ToolCallClassNames
  renderJson?: (value: unknown) => React.ReactNode
}) {
  const text = prettyJson(value)
  return (
    <section className={cn("flex min-w-0 flex-col gap-1", classNames?.section)}>
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        <CopyButton value={text} iconOnly label={`Copy ${label}`} />
      </div>
      {renderJson ? (
        renderJson(value)
      ) : (
        <pre
          className={cn(
            "max-h-40 overflow-auto rounded-md border border-border bg-muted/40 p-2 font-mono text-xs text-foreground",
            tone === "error" && "border-destructive/40 text-destructive",
            classNames?.pre,
          )}
        >
          <code>{text}</code>
        </pre>
      )}
    </section>
  )
}

export function ToolCall({
  call,
  defaultOpen,
  open,
  onOpenChange,
  renderers,
  renderJson,
  className,
  classNames,
}: ToolCallProps) {
  const contentId = React.useId()
  const elapsed = useElapsed(call)
  const custom = renderers?.[call.name]?.(call)
  const [uncontrolled, setUncontrolled] = React.useState(defaultOpen ?? call.status === "error")
  const isOpen = open ?? uncontrolled
  const setOpen = (next: boolean) => {
    if (open === undefined) setUncontrolled(next)
    onOpenChange?.(next)
  }

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setOpen}
      className={cn("rounded-lg border border-border bg-card text-sm", className, classNames?.root)}
    >
      <CollapsibleTrigger
        id={`${contentId}-trigger`}
        aria-controls={contentId}
        className={cn(
          "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
          classNames?.header,
        )}
      >
        <Wrench aria-hidden="true" className="size-4 shrink-0 text-muted-foreground" />
        <span className="min-w-0 flex-1 truncate font-mono text-foreground">{call.name}</span>
        {elapsed ? <span className="shrink-0 font-mono text-xs text-muted-foreground tabular-nums">{elapsed}</span> : null}
        <Badge aria-live="polite" className={cn("shrink-0 gap-1", badgeClass(call.status), classNames?.badge)}>
          <StatusIcon status={call.status} />
          {STATUS_LABEL[call.status]}
        </Badge>
        <ChevronDown aria-hidden="true" className={cn("size-4 shrink-0 text-muted-foreground transition-transform motion-reduce:transition-none", isOpen && "rotate-180")} />
      </CollapsibleTrigger>
      <CollapsibleContent id={contentId} className={cn("flex flex-col gap-3 px-3 pb-3", classNames?.content)}>
        {custom ?? (
          <>
            {call.input ? <JsonSection label="Parameters" value={call.input} classNames={classNames} renderJson={renderJson} /> : null}
            {call.status === "error" ? (
              <JsonSection label="Error" value={call.error ?? "The tool failed."} tone="error" classNames={classNames} renderJson={renderJson} />
            ) : call.output !== undefined ? (
              <JsonSection label="Result" value={call.output} classNames={classNames} renderJson={renderJson} />
            ) : null}
          </>
        )}
      </CollapsibleContent>
    </Collapsible>
  )
}

export function ToolCallGroup({
  calls,
  summary,
  className,
  ...rest
}: {
  calls: ToolCallData[]
  summary?: string
} & Omit<ToolCallProps, "call">) {
  if (calls.length === 0) return null
  if (calls.length === 1) return <ToolCall call={calls[0]} className={className} {...rest} />
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <p className="text-xs text-muted-foreground">{summary ?? `${calls.length} tool calls`}</p>
      {calls.map((call) => (
        <ToolCall key={call.id} call={call} {...rest} />
      ))}
    </div>
  )
}
