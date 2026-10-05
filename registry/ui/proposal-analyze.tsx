"use client"

/** Clean-room analyze state. Skeletons stand in until a draft is ready. */

import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { TextShimmer } from "@/registry/retana/ui/text-shimmer"

export type ProposalAnalyzeProps = {
  label?: string
  className?: string
}

export function ProposalAnalyze({ label = "Reading the call", className }: ProposalAnalyzeProps) {
  return (
    <div data-slot="proposal-analyze" role="status" aria-live="polite" className={cn("grid min-w-0 gap-4", className)}>
      <TextShimmer as="p" className="text-sm text-muted-foreground">
        {label}
      </TextShimmer>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <Skeleton key={index} className="h-24 rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-40 rounded-xl" />
      <div className="grid gap-2">
        <Skeleton className="h-10 rounded-lg" />
        <Skeleton className="h-10 rounded-lg" />
        <Skeleton className="h-10 rounded-lg" />
      </div>
    </div>
  )
}
