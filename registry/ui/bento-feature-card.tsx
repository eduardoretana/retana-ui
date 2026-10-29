"use client"

import type { ReactNode } from "react"
import { ArrowRight } from "lucide-react"

import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

export type BentoFeatureLayout = "media-first" | "copy-first"

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
      className={cn("min-h-40 flex-1 overflow-hidden rounded-lg bg-muted", classNames?.media)}
    >
      <div className="h-full opacity-90 transition-[transform,opacity] duration-200 ease-out will-change-transform group-hover/feature:scale-[1.02] group-hover/feature:opacity-100 motion-reduce:transition-none motion-reduce:group-hover/feature:scale-100 motion-reduce:will-change-auto">
        {illustration}
      </div>
    </div>
  ) : null

  const copy = (
    <div className="flex min-w-0 flex-col gap-2">
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
        <p className="text-sm text-muted-foreground">{loadingLabel}</p>
      </div>
    )
  } else if (status === "error") {
    body = <p role="alert" className="text-sm text-destructive">{errorLabel}</p>
  } else if (status === "empty") {
    body = <p className="text-sm text-muted-foreground">{emptyLabel}</p>
  } else {
    body = (
      <>
        {layout === "media-first" ? media : null}
        {copy}
        {layout === "copy-first" ? media : null}
      </>
    )
  }

  const stack = <div className="flex h-full min-h-0 flex-col gap-4 p-4">{body}</div>

  return (
    <article
      data-slot="bento-feature-card"
      data-state={status}
      data-layout={layout}
      aria-busy={status === "loading" ? true : undefined}
      className={cn(
        "group/feature h-full min-w-0 rounded-xl transition-transform duration-200 ease-out will-change-transform motion-reduce:transition-none motion-reduce:will-change-auto focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 focus-within:ring-offset-background",
        interactive && "hover:-translate-y-0.5 motion-reduce:hover:translate-none",
        className,
        classNames?.root,
      )}
    >
      <Card className="h-full gap-0 overflow-hidden py-0 shadow-none">
        {interactive ? (
          <a href={href} className="flex h-full min-h-0 flex-col rounded-xl outline-none">
            {stack}
          </a>
        ) : (
          stack
        )}
      </Card>
    </article>
  )
}
