"use client"

/**
 * Bento feature card.
 * The size presets take the layout idea, not the code, from shadcn/studio Bento Cards (Pro).
 * https://shadcnstudio.com/blocks/bento-grid/bento-cards
 * https://x.com/ShadcnStudio/status/2116508123242598435
 * No code, markup, assets, or copy from that source was copied. See NOTICE.
 * Internal layout follows the cell container (`@container-size/cell`), not the viewport.
 */

import type { ReactNode } from "react"
import { ArrowRight } from "lucide-react"

import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

export type BentoFeatureLayout = "media-first" | "copy-first"

/** Matches `BentoSize` on the grid. Kept local so this item does not import the grid. */
export type BentoFeatureSize = "sm" | "wide" | "tall" | "lg"

/**
 * Wide and short: illustration beside the copy.
 * Tall and narrow, or wide and tall: the illustration grows.
 * Under 10rem the decorative illustration hides. The copy stays.
 * These are container queries on `cell`, not viewport breakpoints.
 */
const ADAPTIVE_BODY =
  "[@container_cell_(min-width:24rem)_and_(max-height:17.99rem)]:flex-row [@container_cell_(min-width:24rem)_and_(max-height:17.99rem)]:items-stretch"

const ADAPTIVE_MEDIA = [
  "max-h-28 min-h-0 p-3 **:min-h-0",
  "[@container_cell_(min-width:24rem)_and_(max-height:17.99rem)]:p-0",
  "[@container_cell_(max-width:23.99rem)_and_(min-height:18rem)]:p-0",
  "[@container_cell_(min-width:24rem)_and_(min-height:18rem)]:p-0",
  "[@container_cell_(max-width:10rem)]:hidden",
  "[@container_cell_(min-width:24rem)_and_(max-height:17.99rem)]:h-full",
  "[@container_cell_(min-width:24rem)_and_(max-height:17.99rem)]:max-h-none",
  "[@container_cell_(min-width:24rem)_and_(max-height:17.99rem)]:min-h-0",
  "[@container_cell_(min-width:24rem)_and_(max-height:17.99rem)]:w-1/2",
  "[@container_cell_(min-width:24rem)_and_(max-height:17.99rem)]:flex-1",
  "[@container_cell_(max-width:23.99rem)_and_(min-height:18rem)]:h-full",
  "[@container_cell_(max-width:23.99rem)_and_(min-height:18rem)]:max-h-none",
  "[@container_cell_(max-width:23.99rem)_and_(min-height:18rem)]:min-h-0",
  "[@container_cell_(max-width:23.99rem)_and_(min-height:18rem)]:w-full",
  "[@container_cell_(max-width:23.99rem)_and_(min-height:18rem)]:flex-1",
  "[@container_cell_(min-width:24rem)_and_(min-height:18rem)]:max-h-none",
  "[@container_cell_(min-width:24rem)_and_(min-height:18rem)]:min-h-0",
  "[@container_cell_(min-width:24rem)_and_(min-height:18rem)]:w-full",
  "[@container_cell_(min-width:24rem)_and_(min-height:18rem)]:flex-1",
].join(" ")

export type BentoFeatureStatus = "ready" | "loading" | "empty" | "error"

export type BentoFeatureClassNames = {
  root?: string
  media?: string
  icon?: string
  title?: string
  description?: string
  cta?: string
}

export type BentoFeatureCardProps = {
  title?: string
  description?: string
  /** Decorative icon above the title. */
  icon?: ReactNode
  /** Illustration slot. Omitted when empty. */
  illustration?: ReactNode
  /** Visible label inside the single link. Not a second control. */
  cta?: string
  /** Makes the whole card one link. */
  href?: string
  /** `media-first` is the default: drawing, then copy. */
  layout?: BentoFeatureLayout
  /**
   * Turns on the cell-sized layout. Pass the same value the cell uses.
   * sm, wide, tall, and lg share one set of container queries; the cell's real size picks the arrangement.
   */
  size?: BentoFeatureSize
  status?: BentoFeatureStatus
  emptyLabel?: string
  loadingLabel?: string
  errorLabel?: string
  className?: string
  classNames?: BentoFeatureClassNames
}

/**
 * One feature in a bento cell.
 * The hover moves and fades. It does not animate layout.
 * A clickable card is a single link: the CTA is text inside that link.
 */
export function BentoFeatureCard({
  title,
  description,
  icon,
  illustration,
  cta,
  href,
  layout = "media-first",
  size,
  status = "ready",
  emptyLabel = "Nothing here",
  loadingLabel = "Loading",
  errorLabel = "Something went wrong",
  className,
  classNames,
}: BentoFeatureCardProps) {
  const interactive = status === "ready" && Boolean(href)

  const media = illustration ? (
    <div
      data-slot="bento-feature-media"
      aria-hidden="true"
      className={cn(
        "overflow-hidden rounded-lg bg-muted",
        size ? ADAPTIVE_MEDIA : "min-h-40 flex-1",
        classNames?.media,
      )}
    >
      <div className="flex h-full w-full items-center justify-center overflow-hidden opacity-90 transition-[transform,opacity] duration-200 ease-out group-hover/feature:scale-[1.02] group-hover/feature:opacity-100 group-hover/feature:will-change-transform motion-reduce:transition-none motion-reduce:group-hover/feature:scale-100 motion-reduce:group-hover/feature:will-change-auto">
        {illustration}
      </div>
    </div>
  ) : null

  const copy = (
    <div
      className={cn(
        "flex min-w-0 flex-col gap-2",
        size ? "max-w-[65ch] min-w-0" : "max-w-[17.5rem]",
        size && "min-h-0 overflow-y-auto",
      )}
    >
      {icon ? (
        <div
          data-slot="bento-feature-icon"
          aria-hidden="true"
          className={cn(
            "flex size-8 items-center justify-center rounded-lg bg-muted text-muted-foreground",
            classNames?.icon,
          )}
        >
          {icon}
        </div>
      ) : null}
      {title ? (
        <h3
          data-slot="bento-feature-title"
          className={cn("text-base font-semibold tracking-tight wrap-anywhere", classNames?.title)}
        >
          {title}
        </h3>
      ) : null}
      {description ? (
        <p
          data-slot="bento-feature-description"
          className={cn("text-sm text-pretty text-muted-foreground wrap-anywhere", classNames?.description)}
        >
          {description}
        </p>
      ) : null}
      {cta ? (
        <span
          data-slot="bento-feature-cta"
          className={cn("inline-flex w-fit items-center gap-1 text-sm font-medium text-primary", classNames?.cta)}
        >
          {cta}
          <ArrowRight className="size-4 rtl:-scale-x-100" aria-hidden="true" />
        </span>
      ) : null}
    </div>
  )

  let body: ReactNode
  if (status === "loading") {
    body = (
      <div className="flex flex-col gap-3">
        <Skeleton className="min-h-40 w-full motion-reduce:animate-none" />
        <Skeleton className="h-4 w-2/3 motion-reduce:animate-none" />
        <p className="max-w-[17.5rem] text-sm text-muted-foreground">{loadingLabel}</p>
      </div>
    )
  } else if (status === "error") {
    body = (
      <p role="alert" className="max-w-[17.5rem] text-sm font-medium text-destructive">
        {errorLabel}
      </p>
    )
  } else if (status === "empty") {
    body = <p className="max-w-[17.5rem] text-sm text-muted-foreground">{emptyLabel}</p>
  } else {
    body = (
      <>
        {layout === "media-first" ? media : null}
        {copy}
        {layout === "copy-first" ? media : null}
      </>
    )
  }

  const stack = (
    <div
      data-slot={size ? "bento-feature-body" : undefined}
      className={cn(
        "flex h-full min-h-0 w-full flex-1 flex-col gap-4 self-stretch p-4",
        size && "overflow-y-auto",
        size && ADAPTIVE_BODY,
      )}
    >
      {body}
    </div>
  )

  return (
    <article
      data-slot="bento-feature-card"
      data-state={status}
      data-layout={layout}
      data-size={size}
      aria-busy={status === "loading" ? true : undefined}
      className={cn(
        "group/feature flex h-full w-full min-w-0 flex-col self-stretch",
        interactive &&
          "transition-transform duration-200 ease-out hover:-translate-y-0.5 hover:will-change-transform motion-reduce:transition-none motion-reduce:hover:translate-none motion-reduce:hover:will-change-auto",
        className,
        classNames?.root,
      )}
    >
      <Card className="flex h-full w-full flex-1 flex-col gap-0 self-stretch overflow-hidden py-0 shadow-none focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 focus-within:ring-offset-background">
        {interactive ? (
          <a href={href} className="flex h-full min-h-0 w-full flex-1 flex-col self-stretch outline-none">
            {stack}
          </a>
        ) : (
          stack
        )}
      </Card>
    </article>
  )
}
