"use client"

import * as React from "react"
import { Landmark, Sparkles } from "lucide-react"

import { AccentCallout } from "@/registry/retana/ui/accent-callout"
import { ActionFooter } from "@/registry/retana/ui/action-footer"
import { AssistantStatusCard } from "@/registry/retana/ui/assistant-status-card"
import { CheckTiles } from "@/registry/retana/ui/check-tiles"
import { ComparePanel } from "@/registry/retana/ui/compare-panel"
import { DestinationCard } from "@/registry/retana/ui/destination-card"
import { DocumentList } from "@/registry/retana/ui/document-list"
import { EventCallout } from "@/registry/retana/ui/event-callout"
import { InsightCard } from "@/registry/retana/ui/insight-card"
import { IssueDetail } from "@/registry/retana/ui/issue-detail"
import { IssueList } from "@/registry/retana/ui/issue-list"
import { MemberList } from "@/registry/retana/ui/member-list"
import { NextSteps } from "@/registry/retana/ui/next-steps"
import { RecordCard } from "@/registry/retana/ui/record-card"
import { ReviewDesk } from "@/registry/retana/blocks/review-desk"
import { ScoreCard } from "@/registry/retana/ui/score-card"
import { StatusBanner } from "@/registry/retana/ui/status-banner"
import { StatusPill } from "@/registry/retana/ui/status-pill"
import { WorkspaceSwitcher } from "@/registry/retana/ui/workspace-switcher"
import { reviewPresets } from "@/app/examples/review/presets"

const wrap = "review-preview flex flex-col gap-4"

export function StatusPillDemo() {
  return (
    <div className={wrap}>
      <StatusPill label="In review" tone="warning" />
      <StatusPill label="Ready" tone="accent" />
      <StatusPill label="Blocks" tone="critical" solid />
      <StatusPill label="On the cover" tone="neutral" overlay />
    </div>
  )
}

export function AccentCalloutDemo() {
  return (
    <div className={wrap}>
      <AccentCallout title="One step left" body="The package can go out after this check." surface="soft" />
      <AccentCallout title="Ready" body="Nothing else is blocking the action." surface="accent" />
    </div>
  )
}

export function InsightCardDemo() {
  return (
    <div className={wrap}>
      <InsightCard
        title="Assistant"
        time="Now"
        icon={<Sparkles className="size-3.5" />}
        headline="Two items need a person"
        variant="bullets"
        bullets={[
          { id: "a", tone: "critical", text: "A required field is empty" },
          { id: "b", tone: "accent", text: "The rest already passes" },
        ]}
      />
    </div>
  )
}

export function WorkspaceSwitcherDemo() {
  const [value, setValue] = React.useState("north")
  return (
    <div className={wrap}>
      <WorkspaceSwitcher
        name="North desk"
        detail="Main"
        label="Workspace"
        value={value}
        onValueChange={setValue}
        options={[
          { id: "north", name: "North desk", detail: "Main" },
          { id: "south", name: "South desk", detail: "Overflow" },
        ]}
      />
    </div>
  )
}

export function AssistantStatusCardDemo() {
  const [on, setOn] = React.useState(true)
  return (
    <div className={`${wrap} max-w-sm`}>
      <AssistantStatusCard name="Assistant" detail="Watching the queue" checked={on} onCheckedChange={setOn} attention="2 need attention" switchLabel="Assistant" />
    </div>
  )
}

export function RecordCardDemo() {
  return (
    <div className={`${wrap} max-w-sm`}>
      <RecordCard variant="tile" code="RC-100" title="North record" subtitle="Open" progress={72} stats={[{ label: "Stage", value: "Review" }]} onOpen={() => undefined} openLabel="North record" />
    </div>
  )
}

export function ScoreCardDemo() {
  return (
    <div className={`${wrap} max-w-sm`}>
      <ScoreCard title="Score" value={72} caption="Open items" stats={[{ id: "p", label: "Passed", value: 4, tone: "accent" }, { id: "c", label: "Blocks", value: 1, tone: "critical" }]} />
    </div>
  )
}

export function CheckTilesDemo() {
  return (
    <div className={wrap}>
      <CheckTiles label="Checks" items={[{ id: "a", value: "4", label: "Passed", featured: true }, { id: "b", value: "1", label: "Open" }, { id: "c", value: "0", label: "Blocked" }]} />
    </div>
  )
}

export function MemberListDemo() {
  return (
    <div className={`${wrap} max-w-sm`}>
      <MemberList title="People" addLabel="Add person" members={[{ id: "a", name: "Nia Costa", role: "Owner", owner: true, ownerLabel: "owner" }, { id: "b", name: "Mateo Rivas", role: "Analyst" }]} actions={[{ id: "view", label: "View" }]} />
    </div>
  )
}

export function EventCalloutDemo() {
  return (
    <div className={`${wrap} max-w-sm`}>
      <EventCallout title="Committee" when="Thu 15:00" action="Open calendar" />
    </div>
  )
}

export function DocumentListDemo() {
  return (
    <div className={wrap}>
      <DocumentList
        title="Documents"
        groups={[{
          id: "g",
          label: "Packet",
          items: [
            { id: "a", name: "Letter", meta: "Rev A", score: 0.91, date: "Today", status: <StatusPill label="Ready" tone="accent" /> },
            { id: "b", name: "Missing page", meta: "Needed", score: null, missing: true },
          ],
        }]}
      />
    </div>
  )
}

export function IssueListDemo() {
  const [value, setValue] = React.useState("gap")
  return (
    <div className={`${wrap} max-w-md`}>
      <IssueList
        label="Findings"
        value={value}
        onValueChange={setValue}
        items={[
          { id: "gap", title: "Missing field", description: "Blocks the action", severity: "critical" },
          { id: "ok", title: "Name matches", description: "No action", severity: "pass" },
        ]}
      />
    </div>
  )
}

export function IssueDetailDemo() {
  return (
    <div className={wrap}>
      <IssueDetail title="Missing field" meta={<StatusPill label="1 of 2" tone="neutral" dot={false} />} explanation={<p className="text-sm">The check saw an empty required field.</p>} />
    </div>
  )
}

export function ComparePanelDemo() {
  return (
    <div className={wrap}>
      <ComparePanel title="Change" location="Field" beforeLabel="Before" afterLabel="After" before={["Value: empty"]} after={["Value: filled"]} highlightIndex={0} />
    </div>
  )
}

export function ActionFooterDemo() {
  return (
    <div className={wrap}>
      <ActionFooter hint="Applying this raises the score." secondary={{ label: "Send" }} primary={{ label: "Apply" }} />
    </div>
  )
}

export function StatusBannerDemo() {
  const [filed, setFiled] = React.useState(false)
  return (
    <div className={wrap}>
      <StatusBanner stateKey={filed ? "filed" : "ready"} title={filed ? "Filed" : "Ready"} body="The package follows the destination order." stats={[{ label: "Pages", value: "12" }]} />
      <button type="button" className="text-sm underline" onClick={() => setFiled((value) => !value)}>Toggle</button>
    </div>
  )
}

export function DestinationCardDemo() {
  return (
    <div className={`${wrap} max-w-sm`}>
      <DestinationCard title="Send to" name="Review desk" detail="Open until 18:00" icon={<Landmark className="size-4" />} status={<StatusPill label="Connected" tone="accent" />} fields={[{ label: "File", value: "RC-100" }]} />
    </div>
  )
}

export function NextStepsDemo() {
  return (
    <div className={`${wrap} max-w-sm`}>
      <NextSteps title="What happens next" body="The desk keeps a copy." steps={[{ id: "a", title: "Receipt", detail: "Stays in history" }]} actionLabel="Open tracker" />
    </div>
  )
}

export function ReviewDeskDemo() {
  const [id, setId] = React.useState<(typeof reviewPresets)[number]["id"]>("lumen")
  const preset = reviewPresets.find((item) => item.id === id) ?? reviewPresets[0]
  return (
    <div className="review-preview flex flex-col gap-6">
      <div className="flex flex-wrap gap-2" role="group" aria-label="Presets">
        {reviewPresets.map((item) => (
          <button
            key={item.id}
            type="button"
            aria-pressed={item.id === preset.id}
            className="rounded-full bg-card px-3 py-1.5 text-sm aria-pressed:bg-foreground aria-pressed:text-background"
            onClick={() => setId(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>
      <ReviewDesk config={preset.config} />
      <PresetRecipe />
    </div>
  )
}

export function PresetRecipe() {
  return (
    <section className="flex flex-col gap-3 rounded-2xl bg-card p-4 text-sm">
      <h2 className="text-base font-medium">Tu propio preset</h2>
      <p className="text-muted-foreground">
        El bloque no conoce el dominio. Armas un objeto tipado y, si quieres, pisas el texto. Los tres botones de arriba son el mismo componente con otra config.
      </p>
      <ol className="list-decimal space-y-1 ps-5 text-muted-foreground">
        <li>Define estados, etapas, pestañas y la acción final (presentar, cerrar, aprobar).</li>
        <li>Pasa registros, documentos y hallazgos. El id en scoreIssueId cambia el puntaje al aplicar.</li>
        <li>Override de copy para otro idioma. Las llaves {`{name}`}, {`{count}`}, {`{score}`} se reemplazan solas.</li>
      </ol>
      <pre className="overflow-auto rounded-xl bg-muted p-3 font-mono text-xs">{recipe}</pre>
    </section>
  )
}

const recipe = `const mine = defineReviewDesk({
  id: "mine",
  brand: "Desk",
  // nav, tabs, statuses, stages, records, issues…
  scoreIssueId: "gap",
  copy: { submit: "Approve", collectionTitle: "Files" },
})

<ReviewDesk config={mine} />`

export const StatusPillPreview = StatusPillDemo
export const AccentCalloutPreview = AccentCalloutDemo
export const InsightCardPreview = InsightCardDemo
export const WorkspaceSwitcherPreview = WorkspaceSwitcherDemo
export const AssistantStatusCardPreview = AssistantStatusCardDemo
export const RecordCardPreview = RecordCardDemo
export const ScoreCardPreview = ScoreCardDemo
export const CheckTilesPreview = CheckTilesDemo
export const MemberListPreview = MemberListDemo
export const EventCalloutPreview = EventCalloutDemo
export const DocumentListPreview = DocumentListDemo
export const IssueListPreview = IssueListDemo
export const IssueDetailPreview = IssueDetailDemo
export const ComparePanelPreview = ComparePanelDemo
export const ActionFooterPreview = ActionFooterDemo
export const StatusBannerPreview = StatusBannerDemo
export const DestinationCardPreview = DestinationCardDemo
export const NextStepsPreview = NextStepsDemo
export const ReviewDeskPreview = ReviewDeskDemo
