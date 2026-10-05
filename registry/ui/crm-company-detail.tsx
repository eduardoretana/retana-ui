"use client"

/**
 * Clean-room company detail. Behavior is inspired by an unlicensed reference.
 * No source, class names, copy, or assets were copied.
 * The panel is layered-panel. The meter is gauge. The trend is line-chart.
 */

import * as React from "react"

import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { crmInitials, type CrmCompany, type CrmStatusTone } from "@/registry/retana/lib/crm-companies"
import { Gauge, type GaugeThreshold } from "@/registry/retana/ui/gauge"
import { LayeredPanel } from "@/registry/retana/ui/layered-panel"
import { LineChart, type LineChartDatum } from "@/registry/retana/ui/line-chart"
import { MetricCard } from "@/registry/retana/ui/metric-card"

export type CrmCompanyDetailLabels = {
  close?: string
  score?: string
  scoreContext?: string
  health?: string
  healthDetail?: string
  healthLow?: string
  healthWatch?: string
  healthHigh?: string
  trend?: string
  trendEmpty?: string
  about?: string
  owner?: string
  industry?: string
  region?: string
  email?: string
  website?: string
  phone?: string
  notes?: string
  empty?: string
}

export type CrmCompanyDetailProps = {
  company?: CrmCompany | null
  open: boolean
  onOpenChange: (open: boolean) => void
  formatValue?: (value: number) => string
  labels?: CrmCompanyDetailLabels
  className?: string
}

const TONE_VARIANT: Record<CrmStatusTone, "default" | "secondary" | "outline" | "destructive"> = {
  emphasis: "default",
  neutral: "secondary",
  muted: "outline",
  danger: "destructive",
}

export function CrmCompanyDetail({
  company,
  open,
  onOpenChange,
  formatValue = (value) => new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 }).format(value),
  labels,
  className,
}: CrmCompanyDetailProps) {
  const copy = {
    close: labels?.close ?? "Close",
    score: labels?.score ?? "Score",
    scoreContext: labels?.scoreContext ?? "Out of 100",
    health: labels?.health ?? "Pipeline health",
    healthDetail: labels?.healthDetail ?? "Where this account sits on the book",
    healthLow: labels?.healthLow ?? "Low",
    healthWatch: labels?.healthWatch ?? "Watch",
    healthHigh: labels?.healthHigh ?? "Healthy",
    trend: labels?.trend ?? "Activity",
    trendEmpty: labels?.trendEmpty ?? "No activity in this range",
    about: labels?.about ?? "Details",
    owner: labels?.owner ?? "Owner",
    industry: labels?.industry ?? "Industry",
    region: labels?.region ?? "Region",
    email: labels?.email ?? "Email",
    website: labels?.website ?? "Website",
    phone: labels?.phone ?? "Phone",
    notes: labels?.notes ?? "Notes",
    empty: labels?.empty ?? "No company selected",
  }
  const health = company ? Math.max(0, Math.min(100, company.health ?? company.score)) : 0
  const thresholds: GaugeThreshold[] = [
    { from: 0, tone: "danger", label: copy.healthLow },
    { from: 40, tone: "warning", label: copy.healthWatch },
    { from: 70, tone: "success", label: copy.healthHigh },
  ]
  const trend: LineChartDatum[] = (company?.trend ?? []).map((point) => ({
    key: point.key,
    label: point.label,
    axisLabel: point.label,
    values: { activity: point.value },
  }))

  return (
    <LayeredPanel
      open={open}
      onOpenChange={onOpenChange}
      title={company?.name ?? copy.empty}
      description={company ? `${company.statusLabel}. ${copy.health}` : copy.empty}
      closeLabel={copy.close}
      className={className}
    >
      <LayeredPanel.Header>
        {company ? (
          <div className="flex min-w-0 items-center gap-3">
            <Avatar size="lg">
              {company.logoUrl ? <AvatarImage src={company.logoUrl} alt="" /> : null}
              <AvatarFallback>{crmInitials(company.name)}</AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="truncate text-lg font-semibold">{company.name}</p>
              <div className="mt-1 flex flex-wrap items-center gap-2">
                <Badge variant={TONE_VARIANT[company.statusTone ?? "neutral"]}>{company.statusLabel}</Badge>
                <span className="truncate text-sm text-muted-foreground">{formatValue(company.pipelineValue)}</span>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">{copy.empty}</p>
        )}
      </LayeredPanel.Header>
      <LayeredPanel.Peek>
        {company ? (
          <div data-slot="crm-company-detail" className="flex flex-col">
            <div className="flex flex-col gap-4 px-5 py-4">
              <MetricCard label={copy.score} value={company.score} context={copy.scoreContext} />
              <Gauge label={copy.health} value={health} min={0} max={100} detail={copy.healthDetail} thresholds={thresholds} />
              <div className={cn("min-w-0 rounded-xl border border-border p-3")}>
                <LineChart
                  label={copy.trend}
                  height={160}
                  data={trend}
                  series={[{ key: "activity", label: copy.trend }]}
                  emptyLabel={copy.trendEmpty}
                  legend={false}
                  categoryLabel={copy.trend}
                />
              </div>
            </div>
            <LayeredPanel.Section title={copy.about}>
              <LayeredPanel.Field label={copy.owner} value={company.owner} />
              {company.industry ? <LayeredPanel.Field label={copy.industry} value={company.industry} /> : null}
              {company.region ? <LayeredPanel.Field label={copy.region} value={company.region} /> : null}
              {company.email ? <LayeredPanel.Field label={copy.email} value={company.email} href={`mailto:${company.email}`} /> : null}
              {company.website ? <LayeredPanel.Field label={copy.website} value={company.website} href={company.website} /> : null}
              {company.phone ? <LayeredPanel.Field label={copy.phone} value={company.phone} href={`tel:${company.phone}`} /> : null}
              {company.notes ? <LayeredPanel.Field label={copy.notes} value={company.notes} /> : null}
            </LayeredPanel.Section>
          </div>
        ) : null}
      </LayeredPanel.Peek>
    </LayeredPanel>
  )
}
