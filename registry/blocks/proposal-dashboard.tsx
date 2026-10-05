"use client"

/** Clean-room proposal dashboard. Composes host metric, chart, gauge, and timeline pieces. */

import * as React from "react"
import { AlertTriangle, BadgeDollarSign, CircleHelp, Reply, type LucideIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { greeting, type DashboardFormat } from "@/registry/retana/lib/dashboard-format"
import type { ProposalActionTone } from "@/registry/retana/lib/proposal"
import { AnnotatedTrendChart, type AnnotatedTrendChartProps } from "@/registry/retana/ui/annotated-trend-chart"
import { MetricCard } from "@/registry/retana/ui/metric-card"
import { RadialGauge } from "@/registry/retana/ui/radial-gauge"
import { Sparkline } from "@/registry/retana/ui/sparkline"
import { Timeline, type TimelineEvent } from "@/registry/retana/ui/timeline"
import { WellCard } from "@/registry/retana/ui/well-card"

const TONE_ICON: Record<ProposalActionTone, LucideIcon> = {
  risk: AlertTriangle,
  price: BadgeDollarSign,
  "low-confidence": CircleHelp,
  "follow-up": Reply,
}

export type ProposalMetric = {
  id: string
  label: string
  value: number
  suffix?: string
  context: string
  change?: string
  sparkline?: number[]
  sparklineLabel?: string
}

export type ProposalActionItem = {
  id: string
  title: string
  description?: string
  tone: ProposalActionTone
  toneLabel: string
  value?: string
  actionLabel: string
}

export type ProposalDashboardProps = {
  name: string
  now?: Date
  locale?: string
  subtitle?: string
  metrics: readonly ProposalMetric[]
  actions: readonly ProposalActionItem[]
  actionsTitle?: string
  emptyActions?: string
  onAction?: (id: string) => void
  trend: AnnotatedTrendChartProps
  trendTitle: string
  trendSubtitle?: string
  gaugeValue: number
  gaugeMax?: number
  gaugeFormat?: DashboardFormat
  gaugeLabel: string
  gaugeLowLabel: string
  gaugeTargetLabel: string
  activity: readonly TimelineEvent[]
  activityNow: number
  activityTitle: string
  className?: string
}

export function ProposalDashboard({
  name,
  now = new Date(),
  locale = "en-US",
  subtitle,
  metrics,
  actions,
  actionsTitle = "Action items",
  emptyActions = "Nothing waiting",
  onAction,
  trend,
  trendTitle,
  trendSubtitle,
  gaugeValue,
  gaugeMax = 100,
  gaugeFormat = "number",
  gaugeLabel,
  gaugeLowLabel,
  gaugeTargetLabel,
  activity,
  activityNow,
  activityTitle,
  className,
}: ProposalDashboardProps) {
  return (
    <div data-slot="proposal-dashboard" className={cn("@container flex min-w-0 flex-col gap-4", className)}>
      <header className="min-w-0">
        <h1 className="text-2xl font-normal tracking-tight wrap-break-word sm:text-3xl">{greeting(now, locale, name)}</h1>
        {subtitle ? <p className="mt-1 text-sm text-muted-foreground wrap-break-word">{subtitle}</p> : null}
      </header>
      <div className="grid min-w-0 gap-3 @min-[40rem]:grid-cols-2 @min-[52rem]:grid-cols-4">
        {metrics.map((metric) => (
          <div key={metric.id} data-slot="proposal-metric" className="flex min-w-0 flex-col gap-2">
            <MetricCard
              label={metric.label}
              value={metric.value}
              suffix={metric.suffix}
              context={metric.context}
              change={metric.change}
            />
            {metric.sparkline ? (
              <Sparkline
                data={[...metric.sparkline]}
                label={metric.sparklineLabel ?? metric.label}
                height={36}
                classNames={{ caption: "sr-only", root: "gap-0" }}
              />
            ) : null}
          </div>
        ))}
      </div>
      <div className="grid min-w-0 gap-4 @min-[48rem]:grid-cols-12">
        <WellCard title={actionsTitle} count={actions.length} className="@min-[48rem]:col-span-7">
          {actions.length === 0 ? (
            <p className="text-sm text-muted-foreground">{emptyActions}</p>
          ) : (
            <ul className="flex flex-col" aria-label={actionsTitle}>
              {actions.map((item) => {
                const Icon = TONE_ICON[item.tone]
                return (
                  <li key={item.id}>
                    <div className="flex flex-wrap items-center gap-3 rounded-lg px-2 py-2 hover:bg-muted/70">
                      <span className="grid size-8 shrink-0 place-items-center rounded-full bg-muted text-muted-foreground">
                        <Icon className="size-4" />
                      </span>
                      <div className="min-w-0 flex-1 basis-40">
                        <p className="truncate text-sm font-medium">{item.title}</p>
                        {item.description ? (
                          <p className="truncate text-xs text-muted-foreground">{item.description}</p>
                        ) : null}
                      </div>
                      <Badge variant="outline" data-tone={item.tone} className="max-w-full">
                        <span className="truncate">{item.toneLabel}</span>
                      </Badge>
                      {item.value ? <span className="text-sm tabular-nums">{item.value}</span> : null}
                      <Button type="button" size="sm" variant="secondary" onClick={() => onAction?.(item.id)}>
                        {item.actionLabel}
                      </Button>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </WellCard>
        <WellCard title={trendTitle} subtitle={trendSubtitle} className="@min-[48rem]:col-span-5">
          <AnnotatedTrendChart {...trend} locale={trend.locale ?? locale} area />
        </WellCard>
        <WellCard title={gaugeLabel} className="@min-[48rem]:col-span-5">
          <RadialGauge value={gaugeValue} max={gaugeMax} label={gaugeLabel} format={gaugeFormat} locale={locale} />
          <div className="mt-1 flex justify-between gap-3 text-xs text-muted-foreground">
            <span>{gaugeLowLabel}</span>
            <span>{gaugeTargetLabel}</span>
          </div>
        </WellCard>
        <WellCard title={activityTitle} className="@min-[48rem]:col-span-7">
          <Timeline events={[...activity]} now={activityNow} label={activityTitle} locale={locale} maxHeight={280} />
        </WellCard>
      </div>
    </div>
  )
}
