"use client"

/** Balance, pending requests, and use by year. The host owns the numbers. */

import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

export type TimeOffYear = {
  year: number
  granted: number
  used: number
}

export type TimeOffStatsLabels = {
  title: string
  available: string
  pending: string
  left: string
  year: string
  granted: string
  used: string
  empty: string
  loading: string
  amount: (value: number) => string
}

const statsLabels: TimeOffStatsLabels = {
  title: "Balance",
  available: "Available",
  pending: "Pending",
  left: "Left this year",
  year: "Year",
  granted: "Granted",
  used: "Used",
  empty: "No balance to show.",
  loading: "Loading the balance",
  amount: (value) => String(value),
}

export type TimeOffStatsProps = {
  available?: number | null
  pending?: number
  years?: readonly TimeOffYear[]
  loading?: boolean
  error?: string
  labels?: Partial<TimeOffStatsLabels>
  className?: string
}

export function TimeOffStats({
  available = null,
  pending = 0,
  years = [],
  loading = false,
  error,
  labels: labelOverrides,
  className,
}: TimeOffStatsProps) {
  const labels = { ...statsLabels, ...labelOverrides }
  const left = available == null ? null : available - pending

  return (
    <section className={cn("flex flex-col gap-3 rounded-xl border border-border bg-card p-3 text-sm text-card-foreground", className)} aria-busy={loading || undefined}>
      <h2 className="font-medium">{labels.title}</h2>
      {error ? <p role="alert" className="text-destructive">{error}</p> : null}
      {loading ? (
        <div aria-label={labels.loading} className="grid gap-2">
          <Skeleton className="h-14 w-full motion-reduce:animate-none" />
          <Skeleton className="h-8 w-full motion-reduce:animate-none" />
        </div>
      ) : available == null && years.length === 0 ? (
        <p className="text-muted-foreground">{labels.empty}</p>
      ) : (
        <>
          <dl className="grid grid-cols-3 gap-2">
            <Stat label={labels.available} value={labels.amount(available ?? 0)} />
            <Stat label={labels.pending} value={labels.amount(pending)} />
            <Stat label={labels.left} value={labels.amount(left ?? 0)} />
          </dl>
          {years.length > 0 ? (
            <table className="w-full text-xs">
              <thead className="text-muted-foreground">
                <tr>
                  <th className="py-1 text-start font-medium">{labels.year}</th>
                  <th className="py-1 text-end font-medium">{labels.granted}</th>
                  <th className="py-1 text-end font-medium">{labels.used}</th>
                </tr>
              </thead>
              <tbody>
                {years.map((year) => {
                  const width = year.granted <= 0 ? 0 : Math.min(100, Math.round((year.used / year.granted) * 100))
                  return (
                    <tr key={year.year} className="border-t border-border">
                      <td className="py-1.5">
                        <div className="font-medium tabular-nums">{year.year}</div>
                        <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-muted">
                          <div className="h-full rounded-full bg-primary" style={{ width: `${width}%` }} />
                        </div>
                      </td>
                      <td className="py-1.5 text-end tabular-nums">{labels.amount(year.granted)}</td>
                      <td className="py-1.5 text-end tabular-nums">{labels.amount(year.used)}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          ) : null}
        </>
      )}
    </section>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-muted/60 px-2 py-2">
      <dt className="text-[11px] text-muted-foreground">{label}</dt>
      <dd className="text-lg font-medium tabular-nums">{value}</dd>
    </div>
  )
}
