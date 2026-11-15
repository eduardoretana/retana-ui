/**
 * Long page split into chapters, with a sticky index. Pure CSS:
 * - the total bar follows the scroller with animation-timeline scroll();
 * - each chapter exposes a named view-timeline, and timeline-scope lifts it to the index,
 *   so the chapter's bar fills while that chapter is read.
 * No JavaScript and no client boundary. Without support the bars are hidden and the index is a plain list of links.
 * Idea: Midudev's scroll-driven animations demo. Reference: MDN. Implementation: Retana UI, clean-room.
 */

import type { CSSProperties, ReactNode } from "react"

import { cn } from "@/lib/utils"

export type ScrollChapter = {
  /** Anchor id. It also names the chapter's timeline, so it must be unique on the page. */
  id: string
  title: string
  content: ReactNode
}

export type ScrollChaptersLabels = {
  nav: string
  loading: string
  empty: string
}

export type ScrollChaptersProps = {
  chapters?: readonly ScrollChapter[]
  /** Heading tag for chapter titles. Default h2. */
  headingAs?: "h2" | "h3"
  loading?: boolean
  error?: ReactNode
  labels?: Partial<ScrollChaptersLabels>
  /** "off" hides the bars and keeps the page still. Default "auto". */
  motion?: "auto" | "off"
  className?: string
  navClassName?: string
  chapterClassName?: string
}

export const SCROLL_CHAPTERS_LABELS: ScrollChaptersLabels = {
  nav: "Chapters",
  loading: "Loading",
  empty: "No chapters yet.",
}

/** Lowercase slug of a chapter id. Characters outside [a-z0-9-] become "-". */
export function chapterSlug(id: string) {
  return id.toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/^-+|-+$/g, "") || "x"
}

/** Dashed ident for a chapter's timeline. */
export function chapterTimelineName(id: string) {
  return `--retana-chapter-${chapterSlug(id)}`
}

export const SCROLL_CHAPTERS_CSS = `
[data-slot="scroll-chapters-track"] { display: none; }
@media (prefers-reduced-motion: no-preference) {
  @supports (animation-timeline: scroll()) and (timeline-scope: --a) {
    [data-slot="scroll-chapters"]:not([data-motion="off"]) {
      timeline-scope: var(--retana-chapters-scope);
    }
    [data-slot="scroll-chapters"]:not([data-motion="off"]) [data-slot="scroll-chapters-track"] { display: block; }
    [data-slot="scroll-chapters"]:not([data-motion="off"]) [data-slot="scroll-chapters-section"] {
      view-timeline-name: var(--retana-chapter-timeline);
    }
    [data-slot="scroll-chapters"]:not([data-motion="off"]) [data-slot="scroll-chapters-total"] {
      animation: retana-scroll-chapters-fill linear both;
      animation-timeline: scroll(nearest block);
    }
    [data-slot="scroll-chapters"]:not([data-motion="off"]) [data-slot="scroll-chapters-bar"] {
      animation: retana-scroll-chapters-fill linear both;
      animation-timeline: var(--retana-chapter-timeline);
      animation-range: contain 0% contain 100%;
    }
  }
}
@keyframes retana-scroll-chapters-fill {
  from { transform: scaleX(0); }
  to { transform: scaleX(1); }
}
`

export function ScrollChapters({
  chapters = [],
  headingAs: Heading = "h2",
  loading = false,
  error,
  labels,
  motion = "auto",
  className,
  navClassName,
  chapterClassName,
}: ScrollChaptersProps) {
  const text = { ...SCROLL_CHAPTERS_LABELS, ...labels }

  if (loading) {
    return (
      <div data-slot="scroll-chapters" data-state="loading" aria-busy="true" className={cn("flex flex-col gap-4", className)}>
        <span className="sr-only" role="status">
          {text.loading}
        </span>
        <div aria-hidden="true" className="flex gap-3 border-b pb-3">
          {[0, 1, 2].map((index) => (
            <div key={index} className="h-4 w-20 rounded bg-muted" />
          ))}
        </div>
        <div aria-hidden="true" className="flex flex-col gap-2">
          <div className="h-6 w-1/2 rounded bg-muted" />
          <div className="h-3 w-full rounded bg-muted" />
          <div className="h-3 w-5/6 rounded bg-muted" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div data-slot="scroll-chapters" data-state="error" role="alert" className={cn("rounded-xl border border-destructive/40 bg-destructive/5 p-5 text-sm text-foreground", className)}>
        {error}
      </div>
    )
  }

  if (chapters.length === 0) {
    return (
      <div data-slot="scroll-chapters" data-state="empty" className={cn("rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground", className)}>
        {text.empty}
      </div>
    )
  }

  const names = chapters.map((chapter) => chapterTimelineName(chapter.id))
  const rootStyle = { "--retana-chapters-scope": names.join(", ") } as CSSProperties

  return (
    <div data-slot="scroll-chapters" data-state="filled" data-motion={motion} className={cn("relative flex flex-col", className)} style={rootStyle}>
      <style>{SCROLL_CHAPTERS_CSS}</style>
      <nav aria-label={text.nav} className={cn("sticky top-0 z-10 border-b bg-background/95 backdrop-blur-sm", navClassName)}>
        <div data-slot="scroll-chapters-track" aria-hidden="true" className="h-0.5 w-full bg-muted">
          <div data-slot="scroll-chapters-total" className="h-full w-full origin-left bg-primary" />
        </div>
        <ol className="flex list-none gap-1 overflow-x-auto p-1">
          {chapters.map((chapter, index) => (
            <li key={chapter.id} className="min-w-0 shrink-0">
              <a
                href={`#${chapter.id}`}
                className="flex flex-col gap-1 rounded-md px-3 py-2 text-sm text-muted-foreground outline-none hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
                style={{ "--retana-chapter-timeline": names[index] } as CSSProperties}
              >
                <span className="max-w-48 truncate">{chapter.title}</span>
                <span data-slot="scroll-chapters-track" aria-hidden="true" className="h-0.5 w-full overflow-hidden rounded-full bg-muted">
                  <span data-slot="scroll-chapters-bar" className="block h-full w-full origin-left bg-foreground" />
                </span>
              </a>
            </li>
          ))}
        </ol>
      </nav>
      {chapters.map((chapter, index) => (
        <section
          key={chapter.id}
          id={chapter.id}
          data-slot="scroll-chapters-section"
          aria-labelledby={`retana-chapter-${chapterSlug(chapter.id)}-title`}
          className={cn("flex scroll-mt-16 flex-col gap-3 py-8", chapterClassName)}
          style={{ "--retana-chapter-timeline": names[index] } as CSSProperties}
        >
          <Heading id={`retana-chapter-${chapterSlug(chapter.id)}-title`} className="text-xl font-semibold text-balance break-words">
            {chapter.title}
          </Heading>
          <div className="text-sm leading-relaxed text-pretty break-words text-muted-foreground">{chapter.content}</div>
        </section>
      ))}
    </div>
  )
}
