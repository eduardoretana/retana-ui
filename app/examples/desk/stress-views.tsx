"use client"

import { StressCase } from "@/app/examples/stress-case"
import { unbreakable } from "@/app/examples/arc/demo-data"
import { AttentionList } from "@/registry/ui/attention-list"
import { AnnotatedTrendChart } from "@/registry/ui/annotated-trend-chart"
import { BreakdownBar } from "@/registry/ui/breakdown-bar"
import { CaseReview } from "@/registry/blocks/case-review"
import { PriorityBadge } from "@/registry/ui/priority-badge"
import { RadialGauge } from "@/registry/ui/radial-gauge"
import { RankedBars } from "@/registry/ui/ranked-bars"
import { RecordHeader } from "@/registry/ui/record-header"
import { RecordTimeline } from "@/registry/ui/record-timeline"
import { StatStrip } from "@/registry/ui/stat-strip"
import { SuggestedChoiceDialog } from "@/registry/ui/suggested-choice-dialog"
import { SuggestionCard } from "@/registry/ui/suggestion-card"
import { TierDistribution } from "@/registry/ui/tier-distribution"
import { TriageDashboard } from "@/registry/blocks/triage-dashboard"
import { WellCard } from "@/registry/ui/well-card"
import { deskCauses, deskChoices, deskNow, deskStats, deskTimeline, deskTiers, deskTrend } from "@/app/examples/desk/data"
import { Button } from "@/components/ui/button"

const long = unbreakable

export function WellStress() {
  return (
    <>
      <StressCase label="320px" width={320}>
        <WellCard title={long} subtitle="Una frase corta y otra más larga para ver el salto de línea." count="99+" actions={<Button size="sm">Menu</Button>}>
          <p className="text-sm">Cuerpo</p>
        </WellCard>
      </StressCase>
      <StressCase label="Vacío">
        <WellCard title="Sin cuerpo" />
      </StressCase>
      <StressCase label="RTL" width={320}>
        <div dir="rtl">
          <WellCard title="عيوب مفتوحة" subtitle="الأقدم أولاً" count={3}>
            <p>نص</p>
          </WellCard>
        </div>
      </StressCase>
    </>
  )
}

export function StatStress() {
  return (
    <>
      <StressCase label="320px" width={320}>
        <StatStrip items={deskStats} variant="panel" locale="es-MX" />
      </StressCase>
      <StressCase label="Un valor">
        <StatStrip items={[{ id: "one", label: "Abiertos", value: 1 }]} />
      </StressCase>
      <StressCase label="Diez" width={320}>
        <StatStrip
          variant="panel"
          items={Array.from({ length: 10 }, (_, index) => ({ id: String(index), label: `N${index}`, value: index }))}
        />
      </StressCase>
    </>
  )
}

export function AttentionStress() {
  return (
    <>
      <StressCase label="Vacío" width={320}>
        <AttentionList items={[]} />
      </StressCase>
      <StressCase label="Cargando" width={320}>
        <AttentionList items={[]} loading />
      </StressCase>
      <StressCase label="Título largo" width={320}>
        <AttentionList items={[{ id: "long", title: long, description: "😀 وصف طويل", tone: "critical", chips: [{ type: "priority", level: "critical" }] }]} />
      </StressCase>
      <StressCase label="Diez" width={320}>
        <AttentionList items={Array.from({ length: 10 }, (_, index) => ({ id: String(index), title: `Defect ${index + 1}`, onSelect: () => undefined }))} />
      </StressCase>
    </>
  )
}

export function TrendStress() {
  return (
    <StressCase label="320px" width={320}>
      <AnnotatedTrendChart label="Reopen rate" series={deskTrend} yFormat="percent" compare height={180} />
    </StressCase>
  )
}

export function RankedStress() {
  return (
    <>
      <StressCase label="320px" width={320}>
        <RankedBars items={[{ id: "long", label: long, value: 3 }, ...deskCauses]} />
      </StressCase>
      <StressCase label="Vacío">
        <RankedBars items={[]} />
      </StressCase>
    </>
  )
}

export function BreakdownStress() {
  return (
    <StressCase label="320px" width={320}>
      <BreakdownBar total={999999} segments={[{ id: "a", label: long, value: 10 }, { id: "b", label: "B", value: 1 }]} format="number" />
    </StressCase>
  )
}

export function TimelineStress() {
  return (
    <>
      <StressCase label="Vacío" width={320}>
        <RecordTimeline events={[]} />
      </StressCase>
      <StressCase label="Uno" width={320}>
        <RecordTimeline events={deskTimeline.slice(0, 1)} />
      </StressCase>
      <StressCase label="Largo" width={320}>
        <RecordTimeline events={[{ id: "x", title: long, date: "2026-04-01", description: "😀" }]} />
      </StressCase>
    </>
  )
}

export function SuggestionStress() {
  return (
    <StressCase label="320px" width={320}>
      <SuggestionCard title="Suggested cause" suggestion={long} status="suggested" />
    </StressCase>
  )
}

export function DialogStress() {
  return (
    <StressCase label="Cerrado">
      <SuggestedChoiceDialog title="Confirm" options={deskChoices} />
    </StressCase>
  )
}

export function PriorityStress() {
  return (
    <StressCase label="320px" width={320}>
      <PriorityBadge level="critical" label={long} />
    </StressCase>
  )
}

export function HeaderStress() {
  return (
    <StressCase label="320px" width={320}>
      <RecordHeader title={long} crumbs={[{ label: "Queue", href: "#q" }, { label: "Area", href: "#a" }, { label: long }]} meta={[long]} people={[{ name: "😀" }]} priority="high" secondary={[{ id: "s", label: "Reassign", onSelect: () => undefined }]} menu={[{ id: "m", label: "Copy", onSelect: () => undefined }]} />
    </StressCase>
  )
}

export function GaugeStress() {
  const values = [0, 1, 50, 100, 240]
  return (
    <>
      <StressCase label="320px" width={320}>
        <RadialGauge value={240} max={100} label={long} overLabel="Over budget" />
      </StressCase>
      <StressCase label="Valores">
        <div className="grid grid-cols-2 gap-3">
          {values.map((value) => (
            <RadialGauge key={value} value={value} max={100} label={`Value ${value}`} />
          ))}
        </div>
      </StressCase>
    </>
  )
}

export function TierStress() {
  return (
    <>
      <StressCase label="320px" width={320}>
        <TierDistribution label="Severity" tiers={deskTiers} />
      </StressCase>
      <StressCase label="Dos">
        <TierDistribution label="Pair" tiers={deskTiers.slice(0, 2)} />
      </StressCase>
      <StressCase label="Vacío">
        <TierDistribution label="Empty" tiers={[]} />
      </StressCase>
      <StressCase label="RTL" width={320}>
        <div dir="rtl">
          <TierDistribution label="الشدة" tiers={[{ id: "a", label: "منخفض", value: 2 }, { id: "b", label: long, value: 8 }]} />
        </div>
      </StressCase>
    </>
  )
}

export function TriageStress() {
  return (
    <StressCase label="320px" width={320}>
      <TriageDashboard
        name={long}
        now={deskNow}
        locale="es-MX"
        subtitle="😀"
        stats={deskStats}
        trend={{ label: "Reopen rate", series: deskTrend, yFormat: "percent", height: 140 }}
        attention={[]}
        causes={deskCauses.slice(0, 1)}
        period={{ title: "Last 30 days", stats: deskStats.slice(0, 1), progressLabel: "Repeat visits", progress: 0 }}
      />
    </StressCase>
  )
}

export function CaseStress() {
  return (
    <StressCase label="320px" width={320}>
      <CaseReview
        title={long}
        timeline={[]}
        suggestion={{ title: "Suggested cause", suggestion: "Cache" }}
        choices={deskChoices.slice(0, 1)}
        dialogTitle="Confirm"
        costTotal={0}
        costSegments={[]}
      />
    </StressCase>
  )
}
