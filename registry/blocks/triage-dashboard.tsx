"use client"

/** Independent implementation of a common dashboard pattern. */

import * as React from "react"
import { motion, useReducedMotion } from "motion/react"

import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"
import { greeting, staggerDelay } from "@/registry/retana/lib/dashboard-format"
import { RailSidebar, type RailSidebarProps } from "@/registry/retana/blocks/rail-sidebar"
import { AnnotatedTrendChart, type AnnotatedTrendChartProps } from "@/registry/retana/ui/annotated-trend-chart"
import { AttentionList, type AttentionItem } from "@/registry/retana/ui/attention-list"
import { RankedBars, type RankedBarItem } from "@/registry/retana/ui/ranked-bars"
import { StatStrip, type StatStripItem } from "@/registry/retana/ui/stat-strip"
import { WellCard } from "@/registry/retana/ui/well-card"

export type TriagePeriod = {
  title: string
  subtitle?: string
  stats: readonly StatStripItem[]
  progressLabel: string
  progress: number
}

export type TriageDashboardProps = {
  name: string
  now?: Date
  locale?: string
  subtitle?: string
  stats: readonly StatStripItem[]
  trend: AnnotatedTrendChartProps
  trendTitle?: string
  trendSubtitle?: string
  deltaLabel?: string
  attention: readonly AttentionItem[]
  attentionTitle?: string
  attentionSubtitle?: string
  causes: readonly RankedBarItem[]
  causesTitle?: string
  causesHref?: string
  causesLinkLabel?: string
  period: TriagePeriod
  primary?: React.ReactNode
  compare?: boolean
  defaultCompare?: boolean
  onCompareChange?: (value: boolean) => void
  compareLabel?: string
  shell?: false | Pick<RailSidebarProps, "sections" | "workspace" | "user" | "defaultValue" | "activeHref">
  className?: string
}

export function TriageDashboard({
  name,
  now = new Date(),
  locale = "en-US",
  subtitle,
  stats,
  trend,
  trendTitle = "Trend",
  trendSubtitle,
  deltaLabel,
  attention,
  attentionTitle = "Needs you",
  attentionSubtitle = "Sorted by impact",
  causes,
  causesTitle = "Top causes",
  causesHref,
  causesLinkLabel = "All causes",
  period,
  primary,
  compare,
  defaultCompare = false,
  onCompareChange,
  compareLabel = "Compare",
  shell = false,
  className,
}: TriageDashboardProps) {
  const reduced = !!useReducedMotion()
  const [internalCompare, setInternalCompare] = React.useState(defaultCompare)
  const showCompare = compare ?? internalCompare
  const hello = greeting(now, locale, name)
  const body = (
    <div data-slot="triage-dashboard" className={cn("@container flex min-w-0 flex-col gap-4", className)}>
      <motion.header
        className="flex flex-col gap-4"
        initial={reduced ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: reduced ? 0 : 0.2 }}
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-3xl font-normal tracking-tight break-words">{hello}</h1>
            {subtitle ? <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p> : null}
          </div>
          {primary}
        </div>
        <StatStrip items={stats} variant="inline" locale={locale} />
      </motion.header>
      <div className="grid gap-4 @min-[48rem]:grid-cols-12">
        <Fade index={1} reduced={reduced} className="@min-[48rem]:col-span-7">
          <WellCard
            title={trendTitle}
            subtitle={trendSubtitle}
            actions={
              <span className="inline-flex items-center gap-2 text-xs text-muted-foreground">
                {deltaLabel ? <span className="rounded-full bg-destructive/10 px-2 py-1 text-destructive">{deltaLabel}</span> : null}
                <span>{compareLabel}</span>
                <Switch
                  checked={showCompare}
                  onCheckedChange={(next) => {
                    if (compare === undefined) setInternalCompare(next)
                    onCompareChange?.(next)
                  }}
                  aria-label={compareLabel}
                />
              </span>
            }
          >
            <AnnotatedTrendChart {...trend} compare={showCompare} locale={trend.locale ?? locale} />
          </WellCard>
        </Fade>
        <Fade index={2} reduced={reduced} className="@min-[48rem]:col-span-5">
          <WellCard title={attentionTitle} subtitle={attentionSubtitle} count={attention.length}>
            <AttentionList items={attention} label={attentionTitle} />
          </WellCard>
        </Fade>
        <Fade index={3} reduced={reduced} className="@min-[48rem]:col-span-7">
          <WellCard
            title={causesTitle}
            actions={
              causesHref ? (
                <Button variant="secondary" size="sm" className="rounded-full" asChild>
                  <a href={causesHref}>{causesLinkLabel}</a>
                </Button>
              ) : null
            }
          >
            <RankedBars items={causes} locale={locale} />
          </WellCard>
        </Fade>
        <Fade index={4} reduced={reduced} className="@min-[48rem]:col-span-5">
          <WellCard title={period.title} subtitle={period.subtitle}>
            <StatStrip items={period.stats} variant="panel" locale={locale} />
            <div className="mt-4">
              <div className="mb-1 flex justify-between gap-2 text-xs text-muted-foreground">
                <span>{period.progressLabel}</span>
                <span className="tabular-nums">{Math.round(period.progress * 100)}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-muted" role="meter" aria-label={period.progressLabel} aria-valuenow={Math.round(period.progress * 100)} aria-valuemin={0} aria-valuemax={100}>
                <div className="h-full rounded-full bg-primary" style={{ width: `${Math.min(100, Math.max(0, period.progress * 100))}%` }} />
              </div>
            </div>
          </WellCard>
        </Fade>
      </div>
    </div>
  )
  if (!shell) return body
  return (
    <RailSidebar sections={shell.sections} workspace={shell.workspace} user={shell.user} defaultValue={shell.defaultValue} activeHref={shell.activeHref}>
      <div className="min-w-0 p-4">{body}</div>
    </RailSidebar>
  )
}

function Fade({ index, reduced, className, children }: { index: number; reduced: boolean; className?: string; children: React.ReactNode }) {
  return (
    <motion.div className={className} initial={reduced ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: reduced ? 0 : 0.2, delay: staggerDelay(index, reduced) }}>
      {children}
    </motion.div>
  )
}
