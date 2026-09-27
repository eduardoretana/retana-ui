"use client"

import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StatCard, TrendChart, type TrendPoint } from "@/registry/retana/ui/admin-charts"
import type { ChartTone } from "@/registry/retana/lib/chart-tone"

export type OverviewStat = {
  id: string
  label: string
  value: number
  previous?: number
  sparkline?: readonly number[]
  tone?: ChartTone
  caption?: string
}

export type OverviewCount = {
  label: string
  value: number
  href?: string
}

export type OverviewUpcoming = {
  id: string
  title: string
  meta: string
}

export type OverviewDashboardProps = {
  stats: readonly OverviewStat[]
  trend: readonly TrendPoint[]
  upcoming: readonly OverviewUpcoming[]
  counts: readonly OverviewCount[]
  onOpen?: (href: string) => void
  title?: string
  upcomingTitle?: string
  countsTitle?: string
  className?: string
}

export function OverviewDashboard({
  stats,
  trend,
  upcoming,
  counts,
  onOpen,
  title = "Overview",
  upcomingTitle = "Next calls",
  countsTitle = "On the site",
  className,
}: OverviewDashboardProps) {
  return (
    <div className={cn("flex flex-col gap-4", className)}>
      <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <StatCard
            key={stat.id}
            label={stat.label}
            value={stat.value}
            previous={stat.previous}
            sparkline={stat.sparkline}
            tone={stat.tone}
            caption={stat.caption}
          />
        ))}
      </div>
      <div className="grid gap-3 xl:grid-cols-[minmax(0,2fr)_minmax(16rem,1fr)]">
        <TrendChart points={trend} title="This week" />
        <Card>
          <CardHeader>
            <CardTitle>{upcomingTitle}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {upcoming.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nothing scheduled.</p>
            ) : (
              upcoming.map((item) => (
                <div key={item.id} className="flex flex-col">
                  <span className="text-sm font-medium">{item.title}</span>
                  <span className="text-xs text-muted-foreground">{item.meta}</span>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>{countsTitle}</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {counts.map((item) => (
              <li key={item.label}>
                {item.href && onOpen ? (
                  <button
                    type="button"
                    onClick={() => onOpen(item.href!)}
                    className="flex w-full items-center justify-between rounded-lg px-2 py-2 text-left hover:bg-muted"
                  >
                    <span className="text-sm">{item.label}</span>
                    <span className="text-sm font-medium tabular-nums">{item.value}</span>
                  </button>
                ) : (
                  <div className="flex items-center justify-between px-2 py-2">
                    <span className="text-sm">{item.label}</span>
                    <span className="text-sm font-medium tabular-nums">{item.value}</span>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
