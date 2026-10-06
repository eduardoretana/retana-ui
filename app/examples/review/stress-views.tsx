"use client"

import { StressCase } from "@/app/examples/stress-case"
import { unbreakable } from "@/app/examples/arc/demo-data"
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
import { costa } from "@/app/examples/review/presets"

const long = unbreakable

export function StatusPillStress() {
  return (
    <>
      <StressCase label="Vacío"><StatusPill label="" /></StressCase>
      <StressCase label="Una palabra"><StatusPill label="Listo" /></StressCase>
      <StressCase label="Sin espacios" width={160}><StatusPill label={long} /></StressCase>
      <StressCase label="Emoji"><StatusPill label="Listo ✅" tone="accent" /></StressCase>
      <StressCase label="RTL"><div dir="rtl"><StatusPill label="جاهز" tone="warning" /></div></StressCase>
      <StressCase label="320px" width={320}><StatusPill label={long} solid tone="critical" /></StressCase>
    </>
  )
}

export function AccentCalloutStress() {
  return (
    <>
      <StressCase label="Vacío"><AccentCallout title="" /></StressCase>
      <StressCase label="Sin espacios" width={320}><AccentCallout title={long} body={long} /></StressCase>
      <StressCase label="RTL"><div dir="rtl"><AccentCallout title="عنوان" body="نص" /></div></StressCase>
    </>
  )
}

export function InsightCardStress() {
  return (
    <>
      <StressCase label="Sin viñetas"><InsightCard title="Nota" headline="" variant="bullets" bullets={[]} /></StressCase>
      <StressCase label="Muchas" width={320}><InsightCard title={long} headline="Hola" variant="bullets" bullets={Array.from({ length: 8 }, (_, index) => ({ id: String(index), text: index === 0 ? long : "Item" }))} /></StressCase>
      <StressCase label="RTL"><div dir="rtl"><InsightCard title="عنوان" headline="ملخص" variant="status" confidence={0.4} /></div></StressCase>
    </>
  )
}

export function WorkspaceSwitcherStress() {
  return (
    <>
      <StressCase label="Sin opciones" width={320}><WorkspaceSwitcher name={long} detail="Desk" /></StressCase>
      <StressCase label="RTL"><div dir="rtl"><WorkspaceSwitcher name="مكتب" detail="شمال" options={[{ id: "a", name: "مكتب", detail: "شمال" }]} /></div></StressCase>
    </>
  )
}

export function AssistantStatusCardStress() {
  return (
    <>
      <StressCase label="Apagado" width={320}><AssistantStatusCard name={long} detail={long} checked={false} attention="" /></StressCase>
      <StressCase label="RTL"><div dir="rtl"><AssistantStatusCard name="مساعد" detail="يعمل" attention="٢" /></div></StressCase>
    </>
  )
}

export function RecordCardStress() {
  return (
    <>
      <StressCase label="320px" width={320}><RecordCard title={long} subtitle="One" code="RC" progress={0} onOpen={() => undefined} openLabel="Open" /></StressCase>
      <StressCase label="Sin abrir"><RecordCard title="Solo" progress={100} /></StressCase>
      <StressCase label="RTL"><div dir="rtl"><RecordCard title="سجل" subtitle="مفتوح" progress={40} /></div></StressCase>
    </>
  )
}

export function ScoreCardStress() {
  return (
    <>
      <StressCase label="Cero" width={280}><ScoreCard title="Score" value={0} stats={[]} /></StressCase>
      <StressCase label="Título largo" width={240}><ScoreCard title={long} value={100} stats={[{ id: "a", label: long, value: 99, tone: "critical" }]} /></StressCase>
    </>
  )
}

export function CheckTilesStress() {
  return (
    <>
      <StressCase label="Cero"><CheckTiles items={[]} /></StressCase>
      <StressCase label="Uno"><CheckTiles items={[{ id: "a", value: "1", label: "Only" }]} /></StressCase>
      <StressCase label="Diez" width={320}><CheckTiles items={Array.from({ length: 10 }, (_, index) => ({ id: String(index), value: String(index), label: index === 3 ? long : "Tile", featured: index === 0 }))} /></StressCase>
    </>
  )
}

export function MemberListStress() {
  return (
    <>
      <StressCase label="Vacío"><MemberList members={[]} emptyLabel="Nobody" /></StressCase>
      <StressCase label="Nombre largo" width={280}><MemberList members={[{ id: "a", name: long, role: long, owner: true }]} /></StressCase>
      <StressCase label="RTL"><div dir="rtl"><MemberList title="ناس" members={[{ id: "a", name: "نور", role: "مالك", owner: true }]} /></div></StressCase>
    </>
  )
}

export function EventCalloutStress() {
  return (
    <>
      <StressCase label="Sin espacios" width={280}><EventCallout title={long} when={long} action="Open" /></StressCase>
      <StressCase label="RTL"><div dir="rtl"><EventCallout title="اجتماع" when="الخميس" action="فتح" /></div></StressCase>
    </>
  )
}

export function DocumentListStress() {
  return (
    <>
      <StressCase label="Vacío"><DocumentList groups={[]} emptyLabel="None" /></StressCase>
      <StressCase label="Nombre largo" width={320}><DocumentList groups={[{ id: "g", label: long, items: [{ id: "a", name: long, meta: long, score: null, missing: true }] }]} /></StressCase>
      <StressCase label="RTL"><div dir="rtl"><DocumentList mode="checklist" groups={[{ id: "g", label: "حزمة", items: [{ id: "a", name: "خطاب", checked: true }] }]} /></div></StressCase>
    </>
  )
}

export function IssueListStress() {
  return (
    <>
      <StressCase label="Cero"><IssueList items={[]} emptyLabel="None" /></StressCase>
      <StressCase label="Muchos" width={320}><IssueList items={Array.from({ length: 8 }, (_, index) => ({ id: String(index), title: index === 1 ? long : `Item ${index}`, severity: index === 0 ? "critical" as const : "pass" as const }))} value="0" /></StressCase>
      <StressCase label="RTL"><div dir="rtl"><IssueList items={[{ id: "a", title: "فجوة", severity: "minor" }]} value="a" /></div></StressCase>
    </>
  )
}

export function IssueDetailStress() {
  return (
    <>
      <StressCase label="Solo título"><IssueDetail title="One" /></StressCase>
      <StressCase label="Sin espacios" width={320}><IssueDetail title={long} explanation={<p>{long}</p>} /></StressCase>
      <StressCase label="RTL"><div dir="rtl"><IssueDetail title="تفاصيل" explanation={<p>نص</p>} /></div></StressCase>
    </>
  )
}

export function ComparePanelStress() {
  return (
    <>
      <StressCase label="Vacío"><ComparePanel title="Change" beforeLabel="Before" afterLabel="After" before={[]} after={[]} /></StressCase>
      <StressCase label="Sin espacios" width={320}><ComparePanel title={long} beforeLabel="A" afterLabel="B" before={[long]} after={["ok"]} highlightIndex={0} /></StressCase>
      <StressCase label="RTL"><div dir="rtl"><ComparePanel title="تغيير" beforeLabel="قبل" afterLabel="بعد" before={["فارغ"]} after={["ممتلئ"]} highlightIndex={0} /></div></StressCase>
    </>
  )
}

export function ActionFooterStress() {
  return (
    <>
      <StressCase label="Deshabilitado" width={320}><ActionFooter hint={long} secondary={{ label: long }} primary={{ label: "Apply" }} disabled /></StressCase>
      <StressCase label="RTL"><div dir="rtl"><ActionFooter hint="تلميح" secondary={{ label: "إرسال" }} primary={{ label: "تطبيق" }} /></div></StressCase>
    </>
  )
}

export function StatusBannerStress() {
  return (
    <>
      <StressCase label="Sin estadísticas"><StatusBanner title="Ready" /></StressCase>
      <StressCase label="Sin espacios" width={320}><StatusBanner title={long} body={long} stats={[{ label: long, value: "12" }]} /></StressCase>
      <StressCase label="RTL"><div dir="rtl"><StatusBanner title="جاهز" body="الحزمة" stats={[{ label: "صفحات", value: "٣" }]} /></div></StressCase>
    </>
  )
}

export function DestinationCardStress() {
  return (
    <>
      <StressCase label="Sin campos" width={280}><DestinationCard name={long} detail={long} /></StressCase>
      <StressCase label="RTL"><div dir="rtl"><DestinationCard name="لجنة" detail="مفتوح" fields={[{ label: "ملف", value: "١٢" }]} /></div></StressCase>
    </>
  )
}

export function NextStepsStress() {
  return (
    <>
      <StressCase label="Sin pasos"><NextSteps title="Next" /></StressCase>
      <StressCase label="Muchos" width={320}><NextSteps title={long} steps={Array.from({ length: 6 }, (_, index) => ({ id: String(index), title: index === 0 ? long : "Step", detail: "Soon" }))} actionLabel="Open" /></StressCase>
      <StressCase label="RTL"><div dir="rtl"><NextSteps title="التالي" steps={[{ id: "a", title: "إيصال" }]} /></div></StressCase>
    </>
  )
}

export function ReviewDeskStress() {
  return (
    <>
      <StressCase label="320px" width={320}>
        <ReviewDesk config={costa} className="min-h-0 h-auto" />
      </StressCase>
      <StressCase label="RTL"><div dir="rtl">
        <ReviewDesk config={{ ...costa, id: "costa-rtl", brand: "مكتب", userName: "نور", copy: { ...costa.copy, greeting: "مرحبا {name}", collectionTitle: "ملفات" } }} />
      </div></StressCase>
    </>
  )
}
