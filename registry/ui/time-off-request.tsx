"use client"

/**
 * Absence request. Counts business days only and shows requested days against
 * the balance that is still free. The host owns submit and the holiday list.
 */

import * as React from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { balanceLeft, businessSpan, requestedUnits, type AbsencePortion, type Holiday } from "@/registry/retana/lib/time-off"

export type AbsenceKind = {
  id: string
  label: string
  portion: AbsencePortion
}

export type TimeOffDraft = {
  kindId: string
  start: string
  end: string
  note: string
  requested: number
  remaining: number
}

export type TimeOffRequestLabels = {
  title: string
  kind: string
  start: string
  end: string
  note: string
  notePlaceholder: string
  summary: string
  requested: string
  available: string
  pending: string
  remaining: string
  skipped: string
  weekend: string
  shortfall: string
  none: string
  submit: string
  empty: string
  loading: string
  vacation: string
  personal: string
  sick: string
  half: string
  amount: (value: number) => string
}

const requestLabels: TimeOffRequestLabels = {
  title: "Request time away",
  kind: "Type",
  start: "From",
  end: "To",
  note: "Notes",
  notePlaceholder: "Optional",
  summary: "Requested days vs available balance",
  requested: "Requested",
  available: "Available",
  pending: "Already pending",
  remaining: "Would remain",
  skipped: "Not counted",
  weekend: "Weekend",
  shortfall: "The balance does not cover this request.",
  none: "That range has no business day.",
  submit: "Send request",
  empty: "There is no balance to request against.",
  loading: "Loading the request",
  vacation: "Vacation",
  personal: "Personal",
  sick: "Sick",
  half: "Half day",
  amount: (value) => String(value),
}

export function defaultAbsenceKinds(labels: Pick<TimeOffRequestLabels, "vacation" | "personal" | "sick" | "half">): AbsenceKind[] {
  return [
    { id: "vacation", label: labels.vacation, portion: "day" },
    { id: "personal", label: labels.personal, portion: "day" },
    { id: "sick", label: labels.sick, portion: "day" },
    { id: "half", label: labels.half, portion: "half" },
  ]
}

export type TimeOffRequestProps = {
  available?: number | null
  pending?: number
  holidays?: readonly Holiday[]
  kinds?: readonly AbsenceKind[]
  defaultKindId?: string
  defaultStart?: string
  defaultEnd?: string
  defaultNote?: string
  loading?: boolean
  error?: string
  onSubmit?: (draft: TimeOffDraft) => void
  labels?: Partial<TimeOffRequestLabels>
  className?: string
}

export function TimeOffRequest({
  available = null,
  pending = 0,
  holidays = [],
  kinds,
  defaultKindId,
  defaultStart = "",
  defaultEnd = "",
  defaultNote = "",
  loading = false,
  error,
  onSubmit,
  labels: labelOverrides,
  className,
}: TimeOffRequestProps) {
  const labels = { ...requestLabels, ...labelOverrides }
  const options = kinds ?? defaultAbsenceKinds(labels)
  const [kindId, setKindId] = React.useState(defaultKindId || options[0]?.id || "vacation")
  const [start, setStart] = React.useState(defaultStart)
  const [end, setEnd] = React.useState(defaultEnd)
  const [note, setNote] = React.useState(defaultNote)
  const kind = options.find((item) => item.id === kindId) ?? options[0]
  const portion = kind?.portion ?? "day"
  const span = start ? businessSpan(start, portion === "half" ? start : end || start, holidays) : null
  const requested = start ? requestedUnits(start, end || start, holidays, portion) : 0
  const remaining = available == null ? null : balanceLeft(available, pending, requested)
  const blocked = requested <= 0 || (remaining != null && remaining < 0)

  function submit(event: React.FormEvent) {
    event.preventDefault()
    if (blocked || available == null || !kind) return
    onSubmit?.({
      kindId: kind.id,
      start,
      end: portion === "half" ? start : end || start,
      note,
      requested,
      remaining: remaining ?? 0,
    })
  }

  return (
    <section className={cn("rounded-xl border border-border bg-card p-3 text-sm text-card-foreground", className)} aria-busy={loading || undefined}>
      <h2 className="font-medium">{labels.title}</h2>
      {error ? <p role="alert" className="mt-2 text-destructive">{error}</p> : null}
      {loading ? (
        <div aria-label={labels.loading} className="mt-3 grid gap-2">
          <Skeleton className="h-8 w-full motion-reduce:animate-none" />
          <Skeleton className="h-16 w-full motion-reduce:animate-none" />
        </div>
      ) : available == null ? (
        <p className="mt-3 text-muted-foreground">{labels.empty}</p>
      ) : (
        <form className="mt-3 flex flex-col gap-3" onSubmit={submit}>
          <label className="grid gap-1">
            <span className="text-xs text-muted-foreground">{labels.kind}</span>
            <Select value={kindId} onValueChange={setKindId}>
              <SelectTrigger aria-label={labels.kind} className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {options.map((option) => (
                  <SelectItem key={option.id} value={option.id}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </label>
          <div className="grid gap-2 sm:grid-cols-2">
            <label className="grid gap-1">
              <span className="text-xs text-muted-foreground">{labels.start}</span>
              <Input type="date" value={start} aria-label={labels.start} onChange={(event) => setStart(event.target.value)} required />
            </label>
            {portion === "day" ? (
              <label className="grid gap-1">
                <span className="text-xs text-muted-foreground">{labels.end}</span>
                <Input type="date" value={end} min={start || undefined} aria-label={labels.end} onChange={(event) => setEnd(event.target.value)} required />
              </label>
            ) : null}
          </div>
          <label className="grid gap-1">
            <span className="text-xs text-muted-foreground">{labels.note}</span>
            <Textarea value={note} placeholder={labels.notePlaceholder} aria-label={labels.note} onChange={(event) => setNote(event.target.value)} />
          </label>
          <div className="rounded-lg border border-border bg-muted/40 p-3" role="region" aria-label={labels.summary}>
            <p className="text-xs font-medium">{labels.summary}</p>
            <dl className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
              <dt className="text-muted-foreground">{labels.requested}</dt>
              <dd className="text-end tabular-nums">{labels.amount(requested)}</dd>
              <dt className="text-muted-foreground">{labels.available}</dt>
              <dd className="text-end tabular-nums">{labels.amount(available)}</dd>
              <dt className="text-muted-foreground">{labels.pending}</dt>
              <dd className="text-end tabular-nums">{labels.amount(pending)}</dd>
              <dt className="text-muted-foreground">{labels.remaining}</dt>
              <dd className="text-end font-medium tabular-nums">{labels.amount(remaining ?? 0)}</dd>
            </dl>
            {span && span.skipped.length > 0 ? (
              <ul className="mt-2 text-xs text-muted-foreground">
                {span.skipped.map((day) => (
                  <li key={`${day.date}-${day.reason}`}>
                    {labels.skipped}: {day.date} · {day.name ?? labels.weekend}
                  </li>
                ))}
              </ul>
            ) : null}
            {requested <= 0 && start ? <p className="mt-2 text-xs">{labels.none}</p> : null}
            {remaining != null && remaining < 0 ? <p className="mt-2 text-xs text-destructive">{labels.shortfall}</p> : null}
          </div>
          <Button type="submit" disabled={blocked} className="h-auto whitespace-normal">
            {labels.submit}
          </Button>
        </form>
      )}
    </section>
  )
}
