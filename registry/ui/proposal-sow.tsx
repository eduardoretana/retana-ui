"use client"

/** Clean-room statement of work. Parties, clauses, and an acknowledgement. */

import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"

export type SowClause = {
  id: string
  title: string
  body: string
}

export type ProposalSowProps = {
  title: string
  client: string
  studio: string
  partiesLabel?: string
  clientLabel?: string
  studioLabel?: string
  clauses: readonly SowClause[]
  acknowledgeLabel: string
  acknowledged?: boolean
  onAcknowledge?: (value: boolean) => void
  className?: string
}

export function ProposalSow({
  title,
  client,
  studio,
  partiesLabel = "Parties",
  clientLabel = "Client",
  studioLabel = "Studio",
  clauses,
  acknowledgeLabel,
  acknowledged = false,
  onAcknowledge,
  className,
}: ProposalSowProps) {
  return (
    <article data-slot="proposal-sow" className={cn("min-w-0 rounded-xl border border-border bg-card p-4 sm:p-6", className)}>
      <h2 className="text-lg font-medium wrap-break-word">{title}</h2>
      <section className="mt-4" aria-label={partiesLabel}>
        <h3 className="text-sm font-medium">{partiesLabel}</h3>
        <dl className="mt-2 grid gap-2 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-muted-foreground">{clientLabel}</dt>
            <dd>{client}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">{studioLabel}</dt>
            <dd>{studio}</dd>
          </div>
        </dl>
      </section>
      <ol className="mt-4 flex flex-col gap-4">
        {clauses.map((clause, index) => (
          <li key={clause.id}>
            <h3 className="text-sm font-medium">
              {index + 1}. {clause.title}
            </h3>
            <p className="mt-1 text-sm leading-6 text-muted-foreground wrap-break-word">{clause.body}</p>
          </li>
        ))}
      </ol>
      <label className="mt-4 flex items-start gap-2 text-sm">
        <Checkbox
          className="mt-0.5"
          checked={acknowledged}
          onCheckedChange={(checked) => onAcknowledge?.(checked === true)}
        />
        <span>{acknowledgeLabel}</span>
      </label>
    </article>
  )
}
