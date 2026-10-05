"use client"

/** Clean-room activity tab. The feed itself is the shared timeline. */

import { cn } from "@/lib/utils"
import { Timeline, type TimelineEvent } from "@/registry/retana/ui/timeline"
import { WellCard } from "@/registry/retana/ui/well-card"

export type ProposalActivityProps = {
  title: string
  events: readonly TimelineEvent[]
  now: number
  locale?: string
  className?: string
}

export function ProposalActivity({ title, events, now, locale = "en-US", className }: ProposalActivityProps) {
  return (
    <WellCard title={title} className={className}>
      <div data-slot="proposal-activity" className={cn("min-w-0")}>
        <Timeline events={[...events]} now={now} label={title} locale={locale} maxHeight={420} />
      </div>
    </WellCard>
  )
}
