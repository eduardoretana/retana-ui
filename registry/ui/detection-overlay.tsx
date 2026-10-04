"use client"

// Adapted from LocalMode UI (MIT) — apps/ui/registry/localmode/media-vision/bounding-box-overlay/bounding-box-overlay.tsx

import * as React from "react"

import { cn } from "@/lib/utils"

export type Detection = {
  label: string
  score?: number
  box: { x: number; y: number; width: number; height: number }
}

export type DetectionOverlayProps = {
  detections: Detection[]
  naturalWidth: number
  naturalHeight: number
  hideLabels?: boolean
  minScore?: number
  interactive?: boolean
  hiddenLabels?: string[]
  onHiddenLabelsChange?: (labels: string[]) => void
  children?: React.ReactNode
  className?: string
}

function chartFor(label: string, labels: string[]) {
  const index = Math.max(0, labels.indexOf(label))
  return `var(--chart-${(index % 5) + 1})`
}

export function DetectionLegend({
  detections,
  hidden = [],
  onToggle,
}: {
  detections: Detection[]
  hidden?: string[]
  onToggle?: (label: string) => void
}) {
  const counts = new Map<string, number>()
  for (const detection of detections) counts.set(detection.label, (counts.get(detection.label) ?? 0) + 1)
  const labels = [...counts.keys()]
  return (
    <ul className="flex flex-wrap gap-1.5">
      {labels.map((label) => (
        <li key={label}>
          <button
            type="button"
            aria-pressed={!hidden.includes(label)}
            className="inline-flex items-center gap-1 rounded-full border border-border px-2 py-0.5 text-xs focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            onClick={() => onToggle?.(label)}
          >
            <span aria-hidden="true" className="size-2 rounded-full" style={{ backgroundColor: chartFor(label, labels) }} />
            {label} {counts.get(label)}
          </button>
        </li>
      ))}
    </ul>
  )
}

export function DetectionOverlay({
  detections,
  naturalWidth,
  naturalHeight,
  hideLabels = false,
  minScore = 0,
  interactive = true,
  hiddenLabels = [],
  children,
  className,
}: DetectionOverlayProps) {
  const [focus, setFocus] = React.useState<number | null>(null)
  const labels = [...new Set(detections.map((item) => item.label))]
  const visible = detections
    .map((detection, index) => ({ detection, index }))
    .filter(({ detection }) => (detection.score ?? 1) >= minScore && !hiddenLabels.includes(detection.label))

  return (
    <div className={cn("relative", className)}>
      {children}
      <ul className="pointer-events-none absolute inset-0">
        {visible.map(({ detection, index }) => {
          const left = (detection.box.x / naturalWidth) * 100
          const top = (detection.box.y / naturalHeight) * 100
          const width = (detection.box.width / naturalWidth) * 100
          const height = (detection.box.height / naturalHeight) * 100
          const percent = detection.score != null ? `${Math.round(detection.score * 100)}%` : ""
          const dimmed = focus != null && focus !== index
          return (
            <li
              key={`${detection.label}-${index}`}
              className="absolute"
              style={{ left: `${left}%`, top: `${top}%`, width: `${width}%`, height: `${height}%`, opacity: dimmed ? 0.35 : 1 }}
            >
              <span
                tabIndex={interactive ? 0 : undefined}
                className="pointer-events-auto absolute inset-0 border-2 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                style={{ borderColor: chartFor(detection.label, labels) }}
                onMouseEnter={() => setFocus(index)}
                onMouseLeave={() => setFocus(null)}
                onFocus={() => setFocus(index)}
                onBlur={() => setFocus(null)}
              >
                <span className="sr-only">
                  {detection.label}
                  {percent ? `, ${percent} confidence` : ""}, top-left
                </span>
              </span>
              {hideLabels ? null : (
                <span
                  className="absolute left-0 max-w-full -translate-y-full truncate rounded-sm px-1 text-[10px] text-primary-foreground"
                  style={{ backgroundColor: chartFor(detection.label, labels), top: top < 8 ? "100%" : 0 }}
                >
                  {detection.label} {percent}
                </span>
              )}
            </li>
          )
        })}
      </ul>
    </div>
  )
}
