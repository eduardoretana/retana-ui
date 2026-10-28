"use client"

/**
 * Agenda, a request table, and approve or decline. The host owns the rows.
 * approval-card stays the countdown gate; this block does not run a clock.
 */

import * as React from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { Agenda } from "@/registry/retana/blocks/agenda"
import { agendaLabelsEn, type AgendaCategory, type AgendaEvent, type AgendaHoliday } from "@/registry/retana/lib/agenda"

export type TimeOffStatus = "pending" | "approved" | "declined"

export type TimeOffRow = {
  id: string
  who: string
  kind: string
  range: string
  days: string
  status: TimeOffStatus
  note?: string
}

export type TimeOffBlockLabels = {
  title: string
  requests: string
  empty: string
  loading: string
  approve: string
  decline: string
  pending: string
  approved: string
  declined: string
  who: string
  kind: string
  range: string
  days: string
  status: string
}

const blockLabels: TimeOffBlockLabels = {
  title: "Time away",
  requests: "Requests",
  empty: "No requests.",
  loading: "Loading requests",
  approve: "Approve",
  decline: "Decline",
  pending: "Pending",
  approved: "Approved",
  declined: "Declined",
  who: "Who",
  kind: "Type",
  range: "Dates",
  days: "Days",
  status: "Status",
}

export type TimeOffBlockProps<TMeta extends Record<string, unknown> = Record<string, unknown>> = {
  requests?: readonly TimeOffRow[]
  events?: readonly AgendaEvent<TMeta>[]
  categories?: readonly AgendaCategory[]
  holidays?: readonly AgendaHoliday[]
  anchor?: string
  now?: Date | string
  selectedId?: string | null
  onSelect?: (id: string) => void
  onApprove?: (id: string) => void
  onDecline?: (id: string) => void
  onEditEvent?: (event: AgendaEvent<TMeta>) => void
  onDuplicateEvent?: (event: AgendaEvent<TMeta>) => void
  onDeleteEvent?: (id: string) => void
  loading?: boolean
  error?: string
  locale?: string
  labels?: Partial<TimeOffBlockLabels>
  className?: string
}

export function TimeOffBlock<TMeta extends Record<string, unknown> = Record<string, unknown>>({
  requests = [],
  events = [],
  categories = [],
  holidays = [],
  anchor,
  now,
  selectedId,
  onSelect,
  onApprove,
  onDecline,
  onEditEvent,
  onDuplicateEvent,
  onDeleteEvent,
  loading = false,
  error,
  locale = "es-MX",
  labels: labelOverrides,
  className,
}: TimeOffBlockProps<TMeta>) {
  const labels = { ...blockLabels, ...labelOverrides }
  const [innerId, setInnerId] = React.useState<string | null>(requests.find((row) => row.status === "pending")?.id ?? null)
  const activeId = selectedId === undefined ? innerId : selectedId
  const active = requests.find((row) => row.id === activeId) ?? null

  function choose(id: string) {
    if (selectedId === undefined) setInnerId(id)
    onSelect?.(id)
  }

  const statusLabel = {
    pending: labels.pending,
    approved: labels.approved,
    declined: labels.declined,
  }

  return (
    <section className={cn("flex flex-col gap-4 text-sm", className)} aria-busy={loading || undefined}>
      <h2 className="text-base font-medium">{labels.title}</h2>
      {error ? <p role="alert" className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-destructive">{error}</p> : null}
      <div className="h-[28rem] overflow-hidden rounded-xl border border-border">
        <Agenda
          events={events}
          categories={categories}
          holidays={holidays}
          anchor={anchor}
          now={now}
          locale={locale}
          labels={locale.startsWith("en") ? agendaLabelsEn : undefined}
          onEdit={onEditEvent}
          onDuplicate={onDuplicateEvent}
          onDelete={onDeleteEvent}
          className="h-full"
        />
      </div>
      <div className="rounded-xl border border-border">
        <div className="flex items-center justify-between gap-2 px-3 py-2">
          <h3 className="font-medium">{labels.requests}</h3>
          {active && active.status === "pending" ? (
            <div className="flex flex-wrap gap-2">
              <Button type="button" size="sm" onClick={() => onApprove?.(active.id)}>
                {labels.approve}
              </Button>
              <Button type="button" size="sm" variant="outline" onClick={() => onDecline?.(active.id)}>
                {labels.decline}
              </Button>
            </div>
          ) : null}
        </div>
        {loading ? (
          <div aria-label={labels.loading} className="grid gap-2 p-3">
            <Skeleton className="h-8 w-full motion-reduce:animate-none" />
            <Skeleton className="h-8 w-full motion-reduce:animate-none" />
          </div>
        ) : requests.length === 0 ? (
          <p className="px-3 pb-3 text-muted-foreground">{labels.empty}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[32rem] border-collapse text-start text-xs">
              <thead className="text-muted-foreground">
                <tr>
                  <th className="px-3 py-1 text-start font-medium">{labels.who}</th>
                  <th className="px-3 py-1 text-start font-medium">{labels.kind}</th>
                  <th className="px-3 py-1 text-start font-medium">{labels.range}</th>
                  <th className="px-3 py-1 text-end font-medium">{labels.days}</th>
                  <th className="px-3 py-1 text-start font-medium">{labels.status}</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((row) => (
                  <tr key={row.id} className="border-t border-border">
                    <td className="px-3 py-2">
                      <button type="button" className="text-start font-medium underline-offset-2 hover:underline" aria-current={row.id === activeId ? "true" : undefined} onClick={() => choose(row.id)}>
                        {row.who}
                      </button>
                    </td>
                    <td className="px-3 py-2">{row.kind}</td>
                    <td className="px-3 py-2">{row.range}</td>
                    <td className="px-3 py-2 text-end tabular-nums">{row.days}</td>
                    <td className="px-3 py-2">
                      <Badge variant={row.status === "declined" ? "destructive" : "secondary"}>{statusLabel[row.status]}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  )
}
