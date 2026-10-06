"use client"

/** Finding or issue detail. Regions are slots so the host supplies the domain. */

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export type IssueDetailProps = {
  title: string
  meta?: React.ReactNode
  onPrevious?: () => void
  onNext?: () => void
  previousLabel?: string
  nextLabel?: string
  preview?: React.ReactNode
  explanation?: React.ReactNode
  references?: React.ReactNode
  recommendation?: React.ReactNode
  compare?: React.ReactNode
  footer?: React.ReactNode
  className?: string
}

export function IssueDetail({
  title,
  meta,
  onPrevious,
  onNext,
  previousLabel = "Previous",
  nextLabel = "Next",
  preview,
  explanation,
  references,
  recommendation,
  compare,
  footer,
  className,
}: IssueDetailProps) {
  return (
    <article data-slot="issue-detail" className={cn("flex min-w-0 flex-col gap-3", className)}>
      <header className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <h2 className="text-lg font-medium wrap-break-word">{title}</h2>
          {meta ? <div className="mt-2 flex flex-wrap items-center gap-1.5">{meta}</div> : null}
        </div>
        <div className="flex gap-1">
          <Button type="button" size="icon" variant="ghost" className="rounded-full" aria-label={previousLabel} onClick={onPrevious} disabled={!onPrevious}>
            <ChevronLeft />
          </Button>
          <Button type="button" size="icon" variant="ghost" className="rounded-full" aria-label={nextLabel} onClick={onNext} disabled={!onNext}>
            <ChevronRight />
          </Button>
        </div>
      </header>
      {preview}
      {explanation}
      {references}
      {recommendation}
      {compare}
      {footer}
    </article>
  )
}
