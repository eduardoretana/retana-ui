/**
 * Display text whose variable-font axis follows the scroll. Pure CSS:
 * @property registers a number, a view() timeline animates it, and font-variation-settings reads it.
 * The host loads the font. Any variable font works: wght on the host's sans, or ELSH on Geist Pixel (OFL-1.1).
 * An invisible copy at the widest value reserves the box, so the morph causes no layout shift.
 * No JavaScript and no client boundary. Without support, or with reduced motion, the text rests at `to`.
 * Idea: Midudev's scroll-driven animations demo. Reference: MDN. Implementation: Retana UI, clean-room.
 */

import type { CSSProperties, ReactNode } from "react"

import { cn } from "@/lib/utils"

export type VariableFontMorphLabels = {
  loading: string
  empty: string
}

export type VariableFontMorphProps = {
  text?: string
  as?: "h1" | "h2" | "h3" | "p"
  /** Four-letter axis tag of the host font. Default "wght". */
  axis?: string
  /** Axis value when the text enters. Default 100. */
  from?: number
  /** Axis value at the end of the range, and the resting value without motion. Default 900. */
  to?: number
  /** Range on the text's view timeline. Default "cover 10% cover 60%". */
  range?: string
  /**
   * Reserve the box with an invisible copy at the widest value. Default true.
   * Turn it off only for an axis that keeps glyph advances, such as ELSH.
   */
  reserve?: boolean
  loading?: boolean
  error?: ReactNode
  labels?: Partial<VariableFontMorphLabels>
  /** "off" rests the text at `to`. Default "auto". */
  motion?: "auto" | "off"
  className?: string
}

export const VARIABLE_FONT_MORPH_LABELS: VariableFontMorphLabels = {
  loading: "Loading",
  empty: "No text to show.",
}

/** Axis tags are four characters: letters, digits or spaces. Anything else falls back to wght. */
export function morphAxis(axis: string | undefined) {
  return axis && /^[A-Za-z0-9 ]{4}$/.test(axis) ? axis : "wght"
}

export const VARIABLE_FONT_MORPH_CSS = `
@property --retana-font-morph {
  syntax: "<number>";
  inherits: true;
  initial-value: 400;
}
[data-slot="variable-font-morph-text"] {
  --retana-font-morph: var(--retana-font-morph-to);
  font-variation-settings: var(--retana-font-morph-axis) var(--retana-font-morph);
}
@media (prefers-reduced-motion: no-preference) {
  @supports (animation-timeline: view()) {
    [data-slot="variable-font-morph"]:not([data-motion="off"]) [data-slot="variable-font-morph-text"] {
      animation: retana-font-morph linear both;
      animation-timeline: view();
      animation-range: var(--retana-font-morph-range, cover 10% cover 60%);
    }
  }
}
/* Animates a registered number. font-variation-settings repaints text each frame: one morph per viewport (UIS-WEB-RHYTHM-002). */
@keyframes retana-font-morph {
  from { --retana-font-morph: var(--retana-font-morph-from); }
  to { --retana-font-morph: var(--retana-font-morph-to); }
}
`

export function VariableFontMorph({
  text = "",
  as: Tag = "p",
  axis,
  from = 100,
  to = 900,
  range,
  reserve = true,
  loading = false,
  error,
  labels,
  motion = "auto",
  className,
}: VariableFontMorphProps) {
  const copy = { ...VARIABLE_FONT_MORPH_LABELS, ...labels }
  const shell = cn("text-5xl leading-none tracking-tight break-words sm:text-7xl", className)

  if (loading) {
    return (
      <div data-slot="variable-font-morph" data-state="loading" aria-busy="true" className="flex flex-col gap-3">
        <span className="sr-only" role="status">
          {copy.loading}
        </span>
        <div aria-hidden="true" className="h-14 w-3/4 rounded bg-muted" />
      </div>
    )
  }

  if (error) {
    return (
      <div data-slot="variable-font-morph" data-state="error" role="alert" className="rounded-xl border border-destructive/40 bg-destructive/5 p-5 text-sm text-foreground">
        {error}
      </div>
    )
  }

  if (!text.trim()) {
    return (
      <div data-slot="variable-font-morph" data-state="empty" className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
        {copy.empty}
      </div>
    )
  }

  const tag = morphAxis(axis)
  const widest = Math.max(from, to)
  const style = {
    "--retana-font-morph-axis": `"${tag}"`,
    "--retana-font-morph-from": String(from),
    "--retana-font-morph-to": String(to),
    ...(range ? { "--retana-font-morph-range": range } : {}),
  } as CSSProperties

  return (
    <>
      <style>{VARIABLE_FONT_MORPH_CSS}</style>
      <Tag data-slot="variable-font-morph" data-state="filled" data-motion={motion} data-axis={tag} className={cn("grid", shell)} style={style}>
        {reserve ? (
          <span aria-hidden="true" className="invisible col-start-1 row-start-1" style={{ fontVariationSettings: `"${tag}" ${widest}` }}>
            {text}
          </span>
        ) : null}
        <span data-slot="variable-font-morph-text" className="col-start-1 row-start-1">
          {text}
        </span>
      </Tag>
    </>
  )
}
