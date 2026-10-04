"use client"

import * as React from "react"
import { Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { AnnotatedTrendChart } from "@/registry/ui/annotated-trend-chart"
import { AttentionList } from "@/registry/ui/attention-list"
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
import {
  deskAttention,
  deskCauses,
  deskChoices,
  deskCosts,
  deskFields,
  deskNow,
  deskStats,
  deskTimeline,
  deskTiers,
  deskTrend,
} from "@/app/examples/desk/data"

const frame = "rounded-xl bg-background p-3 text-foreground"

export function WellCardPreview() {
  return (
    <div className={frame}>
      <WellCard title="Open defects" subtitle="Sorted by age" count={18}>
        <p className="text-sm text-muted-foreground">18 still need a owner.</p>
      </WellCard>
    </div>
  )
}

export function WellCardDemo() {
  return (
    <WellCard title="Open defects" subtitle="Marea queue · oldest 6 days" count={18} footer={<a href="#all">All 18 open</a>}>
      <p className="text-sm">The inset card sits on the muted well.</p>
    </WellCard>
  )
}

export function StatStripPreview() {
  return (
    <div className={frame}>
      <StatStrip items={deskStats} variant="inline" locale="es-MX" />
    </div>
  )
}

export function StatStripDemo() {
  return (
    <div className="flex flex-col gap-6">
      <StatStrip items={deskStats} variant="inline" locale="es-MX" />
      <StatStrip
        variant="panel"
        locale="en-US"
        items={[
          { id: "before", label: "Before", value: 0.081, format: "percent" },
          { id: "after", label: "After", value: 0.062, format: "percent" },
          { id: "change", label: "Change", value: -1.9, format: "points", delta: { value: -1.9, format: "points", direction: "down", good: "down" } },
          { id: "save", label: "Estimated savings", value: 4280, format: "currency", currency: "USD" },
        ]}
      />
    </div>
  )
}

export function AttentionPreview() {
  return (
    <div className={frame}>
      <AttentionList items={deskAttention.slice(0, 2)} />
    </div>
  )
}

export function AttentionDemo() {
  return <AttentionList items={deskAttention} max={2} />
}

export function TrendPreview() {
  return (
    <div className={frame}>
      <AnnotatedTrendChart
        label="Reopen rate"
        series={deskTrend}
        yFormat="percent"
        locale="es-MX"
        target={{ y: 0.04, label: "Target 4%" }}
        bands={[{ from: "Mar 3", to: "Mar 31", label: "Last 30 days" }]}
        compare={false}
        height={160}
      />
    </div>
  )
}

export function TrendDemo() {
  const [compare, setCompare] = React.useState(false)
  return (
    <div className="flex flex-col gap-2">
      <Button type="button" variant="secondary" className="w-fit rounded-full" onClick={() => setCompare((value) => !value)}>
        {compare ? "Hide comparison" : "Compare queues"}
      </Button>
      <AnnotatedTrendChart
        label="Reopen rate"
        series={deskTrend}
        yFormat="percent"
        locale="es-MX"
        compare={compare}
        target={{ y: 0.04, label: "Target 4%" }}
        bands={[{ from: "Mar 3", to: "Mar 31", label: "Last 30 days" }]}
        markers={[{ x: "Feb 17", label: "Release 4.2" }]}
      />
    </div>
  )
}

export function RankedPreview() {
  return (
    <div className={frame}>
      <RankedBars items={deskCauses} locale="es-MX" />
    </div>
  )
}

export function RankedDemo() {
  return (
    <div className="flex flex-col gap-8">
      <RankedBars items={deskCauses} locale="es-MX" />
      <RankedBars items={deskCauses} layout="inline" locale="en-US" highlight="none" />
    </div>
  )
}

export function BreakdownPreview() {
  return (
    <div className={frame}>
      <BreakdownBar total={3570} segments={deskCosts} locale="es-MX" currency="USD" />
    </div>
  )
}

export function BreakdownDemo() {
  return <BreakdownBar total={3570} segments={deskCosts} locale="es-MX" currency="USD" label="Open cost" />
}

export function TimelinePreview() {
  return (
    <div className={frame}>
      <RecordTimeline events={deskTimeline} locale="es-MX" context="QA-184 · checkout · $640" rangeLabel="Mar 28 to Apr 7" />
    </div>
  )
}

export function TimelineDemo() {
  return <RecordTimeline events={deskTimeline} locale="es-MX" context="QA-184 · checkout · $640" rangeLabel="Mar 28 to Apr 7" collapseAfter={3} />
}

export function SuggestionPreview() {
  return (
    <div className={frame}>
      <SuggestionCard
        title="Suggested cause"
        suggestion="Stale cache after deploy"
        source="From shop notes and the release log"
        confidence="high"
        facts={[{ label: "Shops", value: "3" }]}
        evidence={{ text: "The cache key ignored the release id.", href: "#jobs", label: "View jobs" }}
      />
    </div>
  )
}

export function SuggestionDemo() {
  const [status, setStatus] = React.useState<"suggested" | "confirmed" | "dismissed">("suggested")
  return (
    <SuggestionCard
      title="Suggested cause"
      suggestion="Stale cache after deploy"
      status={status}
      source="From shop notes and the release log"
      confidence="high"
      confirmedBy="Inés"
      confirmedAt="Apr 8, 9:40"
      facts={[
        { label: "Shops", value: "3" },
        { label: "Release", value: "4.2" },
      ]}
      evidence={{ text: "The cache key ignored the release id.", href: "#jobs", label: "View jobs" }}
      onConfirm={() => setStatus("confirmed")}
      onChange={() => setStatus("suggested")}
      onDismiss={() => setStatus("dismissed")}
      onUndo={() => setStatus("suggested")}
      onAction={() => undefined}
    />
  )
}

export function DialogPreview() {
  return (
    <div className={`${frame} flex flex-col gap-2`}>
      <p className="text-sm font-medium">Confirm cause</p>
      <p className="text-xs text-muted-foreground">The suggested option starts selected inside the dialog.</p>
      <ul className="text-sm">
        {deskChoices.map((choice) => (
          <li key={choice.id} className="flex justify-between gap-2 border-b border-border py-1">
            <span>{choice.label}</span>
            {choice.suggested ? <span className="text-xs text-muted-foreground">Suggested</span> : null}
          </li>
        ))}
      </ul>
    </div>
  )
}

export function DialogDemo() {
  const [open, setOpen] = React.useState(false)
  const [result, setResult] = React.useState("Nothing confirmed yet.")
  return (
    <div className="flex flex-col gap-3">
      <Button type="button" className="w-fit rounded-full" onClick={() => setOpen(true)}>
        Confirm cause
      </Button>
      <p className="text-sm text-muted-foreground">{result}</p>
      <SuggestedChoiceDialog
        open={open}
        onOpenChange={setOpen}
        title="Confirm cause"
        subtitle="QA-184 · Checkout stays pending"
        hint="The desk assistant suggests a stale cache from the release log."
        options={deskChoices}
        fields={deskFields}
        confirmLabel="Confirm cause"
        onConfirm={(id) => {
          setResult(`Saved ${id}.`)
          setOpen(false)
        }}
      />
    </div>
  )
}

export function PriorityPreview() {
  return (
    <div className={`${frame} flex flex-wrap gap-2`}>
      <PriorityBadge level="low" />
      <PriorityBadge level="medium" />
      <PriorityBadge level="high" />
      <PriorityBadge level="critical" />
    </div>
  )
}

export function PriorityDemo() {
  return (
    <div className="flex flex-wrap gap-2">
      <PriorityBadge level="low" />
      <PriorityBadge level="medium" />
      <PriorityBadge level="high" />
      <PriorityBadge level="critical" label="Blocker" />
      <PriorityBadge level="high" variant="glyph" />
    </div>
  )
}

export function HeaderPreview() {
  return (
    <div className={frame}>
      <RecordHeader
        crumbs={[{ label: "Queue", href: "#queue" }, { label: "QA-184" }]}
        title="Checkout stays pending"
        meta={["Release 4.2", "Checkout", "6 days open"]}
        priority="critical"
        people={[{ name: "Inés Sol" }, { name: "Nora Paz" }]}
        primary={<Button className="rounded-full">Confirm</Button>}
      />
    </div>
  )
}

export function HeaderDemo() {
  return (
    <RecordHeader
      crumbs={[
        { label: "Queue", href: "#queue" },
        { label: "Checkout", href: "#checkout" },
        { label: "QA-184" },
      ]}
      title="Checkout stays pending after deploy"
      meta={["Release 4.2", "Checkout", "6 days open"]}
      priority="critical"
      statusDot="Needs you"
      people={[{ name: "Inés Sol" }, { name: "Nora Paz" }]}
      secondary={[{ id: "reassign", label: "Reassign", onSelect: () => undefined }]}
      menu={[{ id: "share", label: "Copy link", onSelect: () => undefined }]}
      primary={
        <Button className="rounded-full">
          <Plus data-icon="inline-start" />
          Confirm
        </Button>
      }
      aside={<StatStrip items={deskStats.slice(0, 1)} locale="es-MX" />}
    />
  )
}

export function GaugePreview() {
  return (
    <div className={`${frame} grid grid-cols-2 gap-2`}>
      <RadialGauge value={62} max={100} label="Budget used" formatter={(value) => `${value}%`} />
      <RadialGauge value={128} max={100} label="Spend" formatter={(value) => `$${value}`} overLabel="Over budget" />
    </div>
  )
}

export function GaugeDemo() {
  return (
    <div className="grid gap-6 sm:grid-cols-2">
      <RadialGauge value={62} max={100} label="Budget used" ticks={5} formatter={(value) => `${value}%`} />
      <RadialGauge value={128} max={100} label="Spend" ticks={5} formatter={(value) => `$${value}`} overLabel="Over budget" />
    </div>
  )
}

export function TierPreview() {
  return (
    <div className={frame}>
      <TierDistribution label="Severity" tiers={deskTiers} defaultValue="medium" locale="es-MX" />
    </div>
  )
}

export function TierDemo() {
  const [value, setValue] = React.useState("medium")
  return (
    <div className="flex flex-col gap-2">
      <TierDistribution label="Severity" tiers={deskTiers} value={value} onValueChange={setValue} locale="es-MX" />
      <p className="text-sm text-muted-foreground">Selected {value}</p>
    </div>
  )
}

export function TriagePreview() {
  return (
    <div className="h-full overflow-hidden bg-background p-2 text-foreground">
      <TriageDashboard
        name="Inés"
        now={deskNow}
        locale="es-MX"
        subtitle="18 open and 3 need you today"
        stats={deskStats}
        trend={{ label: "Reopen rate", series: deskTrend, yFormat: "percent", target: { y: 0.04, label: "Target 4%" }, bands: [{ from: "Mar 3", to: "Mar 31", label: "Last 30 days" }], height: 140 }}
        attention={deskAttention}
        causes={deskCauses}
        period={{ title: "Last 30 days", stats: deskStats, progressLabel: "Repeat visits", progress: 0.43 }}
      />
    </div>
  )
}

export function TriageDemo() {
  const [locale, setLocale] = React.useState("es-MX")
  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-2">
        <Button type="button" variant={locale === "es-MX" ? "default" : "secondary"} className="rounded-full" onClick={() => setLocale("es-MX")}>
          es-MX
        </Button>
        <Button type="button" variant={locale === "en-US" ? "default" : "secondary"} className="rounded-full" onClick={() => setLocale("en-US")}>
          en-US
        </Button>
      </div>
      <TriageDashboard
        name="Inés"
        now={deskNow}
        locale={locale}
        subtitle="18 open and 3 need you today"
        stats={deskStats}
        deltaLabel="+2.1 pts in 60 days"
        trendTitle="Reopen rate"
        trendSubtitle="Weekly, this queue"
        trend={{
          label: "Reopen rate",
          series: deskTrend,
          yFormat: "percent",
          target: { y: 0.04, label: "Target 4%" },
          bands: [{ from: "Mar 3", to: "Mar 31", label: "Last 30 days" }],
          markers: [{ x: "Feb 17", label: "4.2" }],
        }}
        attention={deskAttention}
        causes={deskCauses}
        causesHref="#causes"
        period={{
          title: "Last 30 days",
          stats: [
            { id: "opened", label: "Opened", value: 22 },
            { id: "closed", label: "Closed", value: 14 },
          ],
          progressLabel: "Repeat visits",
          progress: 0.43,
        }}
        primary={
          <Button className="rounded-full">
            <Plus data-icon="inline-start" />
            Log defect
          </Button>
        }
      />
    </div>
  )
}

export function CasePreview() {
  return (
    <div className="h-full overflow-hidden bg-background p-2 text-foreground">
      <CaseReview
        crumbs={[{ label: "Queue", href: "#queue" }, { label: "QA-184" }]}
        title="Checkout stays pending"
        meta={["Release 4.2", "Checkout"]}
        people={[{ name: "Inés Sol" }]}
        priority="critical"
        statusDot="Needs you"
        timeline={deskTimeline}
        notesCount={2}
        photosCount={1}
        suggestion={{
          title: "Suggested cause",
          suggestion: "Stale cache after deploy",
          source: "From shop notes and the release log",
          confidence: "high",
          facts: [{ label: "Shops", value: "3" }],
          evidence: { text: "The cache key ignored the release id.", href: "#jobs", label: "View jobs" },
        }}
        choices={deskChoices}
        fields={deskFields}
        dialogTitle="Confirm cause"
        dialogSubtitle="QA-184 · Checkout stays pending"
        dialogHint="The desk assistant suggests a stale cache from the release log."
        costTotal={3570}
        costSegments={deskCosts}
        locale="es-MX"
      />
    </div>
  )
}

export function CaseDemo() {
  return (
    <CaseReview
      crumbs={[{ label: "Queue", href: "#queue" }, { label: "Checkout", href: "#checkout" }, { label: "QA-184" }]}
      title="Checkout stays pending after deploy"
      meta={["Release 4.2", "Checkout", "6 days open"]}
      people={[{ name: "Inés Sol" }, { name: "Nora Paz" }]}
      priority="critical"
      statusDot="Needs you"
      timeline={deskTimeline}
      timelineContext="QA-184 · checkout · $640"
      notes="Nora asked the shop for a second trace."
      notesCount={2}
      photos="One screenshot of the pending spinner."
      photosCount={1}
      suggestion={{
        title: "Suggested cause",
        suggestion: "Stale cache after deploy",
        source: "From shop notes and the release log",
        confidence: "high",
        facts: [
          { label: "Shops", value: "3" },
          { label: "Release", value: "4.2" },
        ],
        evidence: { text: "The cache key ignored the release id.", href: "#jobs", label: "View jobs" },
      }}
      choices={deskChoices}
      fields={deskFields}
      dialogTitle="Confirm cause"
      dialogSubtitle="QA-184 · Checkout stays pending"
      dialogHint="The desk assistant suggests a stale cache from the release log."
      confirmLabel="Confirm cause"
      costTitle="Open cost"
      costTotal={3570}
      costSegments={deskCosts}
      locale="es-MX"
      onReassign={() => undefined}
      onCreateAction={() => undefined}
    />
  )
}
