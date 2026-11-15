/**
 * Hero whose title splits apart while the hero leaves the viewport. Pure CSS:
 * the section names a view-timeline (--retana-hero) and the title halves animate on its exit range.
 * The hero never animates in: the title, often the LCP element, paints at full opacity on load.
 * No JavaScript and no client boundary. Without support, or with reduced motion, the hero stays still.
 * Idea: Midudev's scroll-driven animations demo. Reference: MDN. Implementation: Retana UI, clean-room.
 */

import type { CSSProperties, ReactNode } from "react"

import { cn } from "@/lib/utils"

export type HeroViewTimelineLabels = {
  loading: string
  empty: string
}

export type HeroViewTimelineProps = {
  /** Headline. Split into two halves at the middle word; each half leaves to its side. */
  title?: string
  eyebrow?: ReactNode
  lead?: ReactNode
  /** Buttons or links. The host passes its own primitives. */
  actions?: ReactNode
  /** Heading tag. Default h1: a hero usually owns the page's only h1. */
  headingAs?: "h1" | "h2"
  loading?: boolean
  /** Message shown in place of the actions, e.g. when the offer could not load. */
  error?: ReactNode
  labels?: Partial<HeroViewTimelineLabels>
  /** Exit range on the hero's view timeline. Default "exit 0% exit 70%". */
  range?: string
  /** "off" keeps the hero still. Default "auto". */
  motion?: "auto" | "off"
  className?: string
  titleClassName?: string
}

export const HERO_VIEW_TIMELINE_LABELS: HeroViewTimelineLabels = {
  loading: "Loading",
  empty: "Add a headline.",
}

/** Splits at the middle word. One word stays whole on the left. */
export function splitHeadline(title: string): [string, string] {
  const words = title.trim().split(/\s+/).filter(Boolean)
  if (words.length < 2) return [words.join(" "), ""]
  const middle = Math.ceil(words.length / 2)
  return [words.slice(0, middle).join(" "), words.slice(middle).join(" ")]
}

export const HERO_VIEW_TIMELINE_CSS = `
@media (prefers-reduced-motion: no-preference) {
  @supports (animation-timeline: view()) {
    [data-slot="hero-view-timeline"]:not([data-motion="off"]) {
      view-timeline: --retana-hero block;
    }
    [data-slot="hero-view-timeline"]:not([data-motion="off"]) [data-slot="hero-view-timeline-start"] {
      animation: retana-hero-split-start linear both;
      animation-timeline: --retana-hero;
      animation-range: var(--retana-hero-range, exit 0% exit 70%);
    }
    [data-slot="hero-view-timeline"]:not([data-motion="off"]) [data-slot="hero-view-timeline-end"] {
      animation: retana-hero-split-end linear both;
      animation-timeline: --retana-hero;
      animation-range: var(--retana-hero-range, exit 0% exit 70%);
    }
    [data-slot="hero-view-timeline"]:not([data-motion="off"]) [data-slot="hero-view-timeline-lead"] {
      animation: retana-hero-fade linear both;
      animation-timeline: --retana-hero;
      animation-range: var(--retana-hero-range, exit 0% exit 70%);
    }
  }
}
@keyframes retana-hero-split-start {
  to { opacity: 0.15; translate: -40% 0; }
}
@keyframes retana-hero-split-end {
  to { opacity: 0.15; translate: 40% 0; }
}
@keyframes retana-hero-fade {
  to { opacity: 0; translate: 0 -1rem; }
}
`

export function HeroViewTimeline({
  title = "",
  eyebrow,
  lead,
  actions,
  headingAs: Heading = "h1",
  loading = false,
  error,
  labels,
  range,
  motion = "auto",
  className,
  titleClassName,
}: HeroViewTimelineProps) {
  const text = { ...HERO_VIEW_TIMELINE_LABELS, ...labels }
  const shell = cn("relative flex min-h-[70svh] flex-col items-center justify-center gap-6 overflow-hidden px-4 py-16 text-center", className)

  if (loading) {
    return (
      <section data-slot="hero-view-timeline" data-state="loading" aria-busy="true" className={shell}>
        <span className="sr-only" role="status">
          {text.loading}
        </span>
        <div aria-hidden="true" className="flex w-full max-w-xl flex-col items-center gap-3">
          <div className="h-3 w-24 rounded bg-muted" />
          <div className="h-10 w-full rounded bg-muted" />
          <div className="h-10 w-2/3 rounded bg-muted" />
          <div className="h-4 w-3/4 rounded bg-muted" />
        </div>
      </section>
    )
  }

  if (!title.trim()) {
    return (
      <section data-slot="hero-view-timeline" data-state="empty" className={shell}>
        <p className="rounded-xl border border-dashed px-6 py-4 text-sm text-muted-foreground">{text.empty}</p>
      </section>
    )
  }

  const [start, end] = splitHeadline(title)
  const style = range ? ({ "--retana-hero-range": range } as CSSProperties) : undefined

  return (
    <section data-slot="hero-view-timeline" data-state={error ? "error" : "filled"} data-motion={motion} className={shell} style={style}>
      <style>{HERO_VIEW_TIMELINE_CSS}</style>
      {eyebrow ? <div className="text-xs font-medium tracking-[0.14em] text-muted-foreground uppercase">{eyebrow}</div> : null}
      <Heading className={cn("flex max-w-4xl flex-col text-4xl leading-[1.05] font-semibold tracking-tight text-balance break-words sm:text-6xl", titleClassName)}>
        <span data-slot="hero-view-timeline-start" className="block">
          {start}
        </span>
        {end ? (
          <>
            {" "}
            <span data-slot="hero-view-timeline-end" className="block">
              {end}
            </span>
          </>
        ) : null}
      </Heading>
      {lead ? (
        <div data-slot="hero-view-timeline-lead" className="max-w-xl text-base text-pretty text-muted-foreground sm:text-lg">
          {lead}
        </div>
      ) : null}
      {error ? (
        <div role="alert" className="rounded-lg border border-destructive/40 bg-destructive/5 px-4 py-3 text-sm text-foreground">
          {error}
        </div>
      ) : actions ? (
        <div className="flex flex-wrap items-center justify-center gap-3">{actions}</div>
      ) : null}
    </section>
  )
}
