"use client"

// Adapted from LocalMode UI (MIT) — apps/ui/registry/localmode/local-first/model-downloader/model-downloader.tsx

import * as React from "react"
import { Check, Download, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { formatBytes } from "@/registry/retana/hooks/use-device-capabilities"

export type DownloadState = "idle" | "downloading" | "paused" | "cached" | "ready" | "error"

export type DownloadMeta = { label: string; value: string }

export type DownloadProgressProps = {
  title: string
  description?: string
  state?: DownloadState
  loaded?: number
  total?: number
  meta?: DownloadMeta[]
  error?: string
  variant?: "card" | "inline" | "panel"
  onDownload?: () => void
  onCancel?: () => void
  onRetry?: () => void
  tips?: React.ReactNode
  locale?: string
  className?: string
  classNames?: { root?: string; bar?: string; meta?: string }
}

function etaLabel(samples: { at: number; loaded: number }[], loaded: number, total: number) {
  if (samples.length < 2 || total <= loaded) return undefined
  const first = samples[0]
  const last = samples[samples.length - 1]
  const seconds = (last.at - first.at) / 1000
  const delta = last.loaded - first.loaded
  if (seconds <= 0 || delta <= 0) return undefined
  const speed = delta / seconds
  const left = (total - loaded) / speed
  if (!Number.isFinite(left)) return undefined
  return { speed, left }
}

export function DownloadProgress({
  title,
  description,
  state = "idle",
  loaded = 0,
  total = 0,
  meta = [],
  error,
  variant = "card",
  onDownload,
  onCancel,
  onRetry,
  tips,
  locale = "en",
  className,
  classNames,
}: DownloadProgressProps) {
  const [samples, setSamples] = React.useState<{ at: number; loaded: number }[]>([])

  React.useEffect(() => {
    const timer = window.setTimeout(() => {
      if (state !== "downloading") {
        setSamples([])
        return
      }
      setSamples((current) => [...current, { at: Date.now(), loaded }].slice(-8))
    }, 0)
    return () => window.clearTimeout(timer)
  }, [loaded, state])

  const ratio = total > 0 ? Math.min(1, loaded / total) : 0
  const percent = Math.round(ratio * 100)
  const pace = etaLabel(samples, loaded, total)
  const valueText =
    state === "cached"
      ? "Loaded from cache"
      : state === "ready"
        ? "Ready"
        : state === "error"
          ? error ?? "Download failed"
          : `${percent}%, ${formatBytes(loaded, locale)} of ${formatBytes(total, locale)}${pace ? `, about ${Math.max(1, Math.round(pace.left))} s left` : ""}`

  const body = (
    <div className={cn("flex min-w-0 flex-col gap-3", classNames?.root)}>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate font-medium text-foreground">{title}</p>
          {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
        </div>
        {state === "idle" && onDownload ? (
          <Button type="button" size="sm" onClick={onDownload}>
            <Download data-icon="inline-start" />
            Download
          </Button>
        ) : null}
        {state === "downloading" && onCancel ? (
          <Button type="button" size="sm" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        ) : null}
        {state === "error" && onRetry ? (
          <Button type="button" size="sm" onClick={onRetry}>
            Retry
          </Button>
        ) : null}
      </div>
      {meta.length > 0 ? (
        <ul className={cn("flex flex-wrap gap-1.5", classNames?.meta)}>
          {meta.map((item) => (
            <li key={item.label} className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
              {item.label}: {item.value}
            </li>
          ))}
        </ul>
      ) : null}
      {state === "cached" || state === "ready" ? (
        <p className="flex items-center gap-1.5 text-sm text-foreground" aria-live="polite">
          <Check aria-hidden="true" className="size-4" />
          {state === "cached" ? "Loaded from cache" : "Ready"}
        </p>
      ) : null}
      {state === "downloading" || state === "paused" ? (
        <div className="flex flex-col gap-1">
          <div
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={percent}
            aria-valuetext={valueText}
            className={cn("h-2 overflow-hidden rounded-full bg-muted", classNames?.bar)}
          >
            <div className="h-full rounded-full bg-primary" style={{ width: `${percent}%` }} />
          </div>
          <p className="text-xs text-muted-foreground tabular-nums">
            {formatBytes(loaded, locale)} / {formatBytes(total, locale)} · {percent}%
            {pace ? ` · ${formatBytes(pace.speed, locale)}/s` : ""}
            {state === "paused" ? " · Paused" : ""}
          </p>
        </div>
      ) : null}
      {state === "error" ? <p className="text-sm text-destructive">{error ?? "Download failed."}</p> : null}
      {state === "idle" && total > 0 ? <p className="text-xs text-muted-foreground">{formatBytes(total, locale)}</p> : null}
      {variant === "panel" && tips ? <div className="text-sm text-muted-foreground">{tips}</div> : null}
      <span className="sr-only" aria-live="polite">
        {state === "ready" || state === "cached" || state === "error" ? valueText : ""}
      </span>
    </div>
  )

  if (variant === "inline") return <div className={className}>{body}</div>
  if (variant === "panel") {
    return (
      <div className={cn("flex min-h-64 flex-col items-center justify-center gap-4 px-6 py-10 text-center", className)}>
        <Loader2 aria-hidden="true" className="size-6 animate-spin text-muted-foreground motion-reduce:animate-none" />
        <div className="w-full max-w-md text-left">{body}</div>
      </div>
    )
  }
  return <div className={cn("rounded-xl border border-border bg-card p-4", className)}>{body}</div>
}
