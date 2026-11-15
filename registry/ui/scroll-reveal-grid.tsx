/**
 * Grid whose cards reveal as they enter the viewport. Pure CSS: animation-timeline view() + animation-range.
 * No JavaScript and no client boundary, so it renders in a Server Component.
 * Without support for scroll-driven animations, or with reduced motion, every card is visible and still.
 * Idea: Midudev's scroll-driven animations demo. Reference: MDN. Implementation: Retana UI, clean-room.
 */

import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

export type ScrollRevealGridItem = {
  id: string
  title: string
  description?: string
  /** Short line above the title, e.g. a step number or a category. */
  eyebrow?: string
}

export type ScrollRevealGridLabels = {
  loading: string
  empty: string
}

export type ScrollRevealGridProps = {
  items?: readonly ScrollRevealGridItem[]
  /** Custom card body. The card shell and the reveal stay the same. */
  renderItem?: (item: ScrollRevealGridItem, index: number) => ReactNode
  /** Columns from the sm breakpoint up. One column below it. Default 3. */
  columns?: 2 | 3
  /** Heading tag for each card title. Default h3, under the section's h2. */
  headingAs?: "h2" | "h3" | "h4"
  loading?: boolean
  /** Message shown instead of the cards. */
  error?: ReactNode
  labels?: Partial<ScrollRevealGridLabels>
  /** "off" keeps every card still. Use it for a reduced-motion toggle or a static preview. Default "auto". */
  motion?: "auto" | "off"
  className?: string
  itemClassName?: string
}

export const SCROLL_REVEAL_GRID_LABELS: ScrollRevealGridLabels = {
  loading: "Loading",
  empty: "Nothing to show yet.",
}

/** Even cards start a little later, so a row does not move as one block. */
export const SCROLL_REVEAL_GRID_RANGES = {
  odd: "entry 0% cover 40%",
  even: "entry 15% cover 45%",
} as const

export const SCROLL_REVEAL_GRID_CSS = `
@media (prefers-reduced-motion: no-preference) {
  @supports (animation-timeline: view()) {
    [data-slot="scroll-reveal-grid"]:not([data-motion="off"]) > [data-slot="scroll-reveal-grid-item"] {
      animation: retana-scroll-reveal linear both;
      animation-timeline: view();
      animation-range: ${SCROLL_REVEAL_GRID_RANGES.odd};
    }
    [data-slot="scroll-reveal-grid"]:not([data-motion="off"]) > [data-slot="scroll-reveal-grid-item"]:nth-child(even) {
      animation-range: ${SCROLL_REVEAL_GRID_RANGES.even};
    }
  }
}
@keyframes retana-scroll-reveal {
  from { opacity: 0; translate: 0 1.5rem; scale: 0.97; }
  to { opacity: 1; translate: 0 0; scale: 1; }
}
`

const columnClass = { 2: "sm:grid-cols-2", 3: "sm:grid-cols-2 lg:grid-cols-3" } as const

export function ScrollRevealGrid({
  items = [],
  renderItem,
  columns = 3,
  headingAs: Heading = "h3",
  loading = false,
  error,
  labels,
  motion = "auto",
  className,
  itemClassName,
}: ScrollRevealGridProps) {
  const text = { ...SCROLL_REVEAL_GRID_LABELS, ...labels }

  if (loading) {
    return (
      <div data-slot="scroll-reveal-grid" data-state="loading" aria-busy="true" className={cn("grid gap-4", columnClass[columns], className)}>
        <span className="sr-only" role="status">
          {text.loading}
        </span>
        {Array.from({ length: columns }, (_, index) => (
          <div key={index} aria-hidden="true" className={cn("flex min-h-32 flex-col gap-3 rounded-xl border bg-card p-5", itemClassName)}>
            <div className="h-3 w-16 rounded bg-muted" />
            <div className="h-5 w-3/4 rounded bg-muted" />
            <div className="h-3 w-full rounded bg-muted" />
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div data-slot="scroll-reveal-grid" data-state="error" role="alert" className={cn("rounded-xl border border-destructive/40 bg-destructive/5 p-5 text-sm text-foreground", className)}>
        {error}
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div data-slot="scroll-reveal-grid" data-state="empty" className={cn("rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground", className)}>
        {text.empty}
      </div>
    )
  }

  return (
    <>
      <style>{SCROLL_REVEAL_GRID_CSS}</style>
      <ul data-slot="scroll-reveal-grid" data-state="filled" data-motion={motion} className={cn("grid list-none gap-4 p-0", columnClass[columns], className)}>
        {items.map((item, index) => (
          <li
            key={item.id}
            data-slot="scroll-reveal-grid-item"
            className={cn("flex min-w-0 flex-col gap-2 rounded-xl border bg-card p-5 text-card-foreground", itemClassName)}
          >
            {renderItem ? (
              renderItem(item, index)
            ) : (
              <>
                {item.eyebrow ? <p className="text-xs font-medium text-muted-foreground">{item.eyebrow}</p> : null}
                <Heading className="text-base font-semibold text-balance break-words">{item.title}</Heading>
                {item.description ? <p className="text-sm text-pretty break-words text-muted-foreground">{item.description}</p> : null}
              </>
            )}
          </li>
        ))}
      </ul>
    </>
  )
}
