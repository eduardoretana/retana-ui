"use client"

/**
 * Clean-room proposal flow. Wires the shell, dashboard, intake, deal tabs, and send toast.
 * Every label and record is a prop. This file does not name a product or ship a theme.
 */

import * as React from "react"
import { cn } from "@/lib/utils"
import type { FieldDef, MultiRecord, ViewConfig } from "@/registry/retana/lib/multi-view"
import {
  formatMoney,
  toggleScopeTask,
  type ClarifyQuestion,
  type EstimateLine,
  type PreflightItem,
  type PriceLine,
  type ProposalSection,
  type ProposalTabId,
  type ScopePhase,
} from "@/registry/retana/lib/proposal"
import { ProposalActivity } from "@/registry/retana/ui/proposal-activity"
import { ProposalAnalyze } from "@/registry/retana/ui/proposal-analyze"
import { ProposalClarify, type ProposalClarifyProps } from "@/registry/retana/ui/proposal-clarify"
import { ProposalDiscovery, type ProposalDiscoveryProps } from "@/registry/retana/ui/proposal-discovery"
import { ProposalDocument, type ProposalDocumentProps } from "@/registry/retana/ui/proposal-document"
import { ProposalEstimate, type CapacityCell, type ProposalEstimateProps } from "@/registry/retana/ui/proposal-estimate"
import { ProposalOpportunity, type OpportunityChoice, type OpportunityFile, type ProposalOpportunityProps } from "@/registry/retana/ui/proposal-opportunity"
import { ProposalRisks, type ProposalRisksProps } from "@/registry/retana/ui/proposal-risks"
import { ProposalScope, type ProposalScopeProps } from "@/registry/retana/ui/proposal-scope"
import { ProposalSend, type ProposalSendProps, type SendRecipient } from "@/registry/retana/ui/proposal-send"
import { ProposalSimilar, type ProposalSimilarProps } from "@/registry/retana/ui/proposal-similar"
import { ProposalSow, type ProposalSowProps } from "@/registry/retana/ui/proposal-sow"
import { ProposalWorkspace, type ProposalCrumb, type ProposalWorkspaceTab } from "@/registry/retana/ui/proposal-workspace"
import { ToastStack, ToastStackProvider, useToastStack } from "@/registry/retana/ui/toast-stack"
import { ViewKanban } from "@/registry/retana/ui/view-kanban"
import { ProposalDashboard, type ProposalDashboardProps } from "@/registry/retana/blocks/proposal-dashboard"
import { ProposalShell, type ProposalShellProps } from "@/registry/retana/blocks/proposal-shell"

export type ProposalBuilderCopy = {
  newOpportunity: string
  clarify: string
  apply: string
  continue: string
  approve: string
  send: string
  summaryTitle: string
  summaryHours: string
  summaryPrice: string
  sentTitle: string
  sentBody: string
  toastLabel: string
  analyzeLabel: string
  pipelineTitle: string
}

const COPY: ProposalBuilderCopy = {
  newOpportunity: "New opportunity",
  clarify: "Clarify",
  apply: "Apply answers",
  continue: "Continue",
  approve: "Approve scope",
  send: "Send",
  summaryTitle: "Summary",
  summaryHours: "Hours",
  summaryPrice: "Suggested price",
  sentTitle: "Proposal sent",
  sentBody: "The link is on its way.",
  toastLabel: "Notifications",
  analyzeLabel: "Reading the call",
  pipelineTitle: "Pipeline",
}

const ORDER: ProposalTabId[] = ["summary", "discovery", "scope", "similar", "estimate", "price", "risks", "proposal", "sow", "activity"]

export type ProposalBuilderProps = {
  shell: Omit<ProposalShellProps, "children" | "primaryLabel" | "onPrimary" | "primaryDisabled" | "activeHref" | "onNavigate">
  boardHref?: string
  pipelineHref?: string
  dashboard: Omit<ProposalDashboardProps, "onAction">
  clients: readonly OpportunityChoice[]
  projectTypes: readonly OpportunityChoice[]
  initialClient?: string
  initialType?: string
  initialFile?: OpportunityFile | null
  intake?: Omit<ProposalOpportunityProps, "open" | "onOpenChange" | "onAnalyze" | "clients" | "types" | "client" | "onClientChange" | "projectType" | "onProjectTypeChange" | "file" | "onFile">
  clarifyLabels?: Omit<ProposalClarifyProps, "questions" | "answers" | "onAnswer" | "baseHours" | "rate" | "hoursPerWeek" | "locale" | "currency">
  scopeLabels?: Omit<ProposalScopeProps, "phases" | "onToggle" | "exclusions" | "originLabels" | "locale">
  estimateLabels?: Omit<ProposalEstimateProps, "view" | "lines" | "capacity" | "priceMin" | "priceMax" | "price" | "onPriceChange" | "suggested" | "confidence" | "receipt" | "onUseSuggested" | "locale" | "currency">
  sendLabels?: Omit<ProposalSendProps, "open" | "onOpenChange" | "onSend" | "recipients" | "recipient" | "onRecipientChange" | "project" | "price" | "weeks" | "message" | "onMessageChange" | "link">
  opportunityTitle?: string
  analyzeLabel?: string
  analyzeMs?: number
  dealTitle: string
  crumbs: readonly ProposalCrumb[]
  tabs: readonly ProposalWorkspaceTab[]
  discovery: Omit<ProposalDiscoveryProps, "onClarify" | "onSeek">
  questions: readonly ClarifyQuestion[]
  baseHours: number
  rate: number
  hoursPerWeek?: number
  currency?: string
  phases: readonly ScopePhase[]
  exclusions: readonly { id: string; label: string }[]
  originLabels?: ProposalScopeOriginLabels
  similar: Omit<ProposalSimilarProps, "value" | "onValueChange">
  lines: readonly EstimateLine[]
  capacity: readonly CapacityCell[]
  priceMin: number
  priceMax: number
  suggested: number
  confidence: string
  receipt: readonly PriceLine[]
  risks: Omit<ProposalRisksProps, "selectedAction" | "onSelectAction" | "onApprove" | "approved">
  document: Omit<ProposalDocumentProps, "sections" | "onSectionsChange" | "preflight" | "onPreflight">
  initialSections: readonly ProposalSection[]
  initialPreflight: readonly PreflightItem[]
  sow: Omit<ProposalSowProps, "acknowledged" | "onAcknowledge">
  activity: React.ComponentProps<typeof ProposalActivity>
  recipients: readonly SendRecipient[]
  sendLink: string
  pipeline: {
    records: readonly MultiRecord[]
    fields: readonly FieldDef[]
    config: ViewConfig
  }
  copy?: Partial<ProposalBuilderCopy>
  contained?: boolean
  className?: string
}

type ProposalScopeOriginLabels = React.ComponentProps<typeof ProposalScope>["originLabels"]

function nextTab(id: ProposalTabId): ProposalTabId {
  const index = ORDER.indexOf(id)
  return ORDER[Math.min(ORDER.length - 1, index + 1)] ?? id
}

export function ProposalBuilder(props: ProposalBuilderProps) {
  return (
    <ToastStackProvider>
      <ToastStack position="bottom-right" contained={props.contained} label={props.copy?.toastLabel ?? COPY.toastLabel} />
      <ProposalBuilderBody {...props} />
    </ToastStackProvider>
  )
}

function ProposalBuilderBody({
  shell,
  boardHref = "#board",
  pipelineHref = "#pipeline",
  dashboard,
  clients,
  projectTypes,
  initialClient,
  initialType,
  initialFile = null,
  intake,
  clarifyLabels,
  scopeLabels,
  estimateLabels,
  sendLabels,
  opportunityTitle,
  analyzeLabel,
  analyzeMs = 700,
  dealTitle,
  crumbs,
  tabs,
  discovery,
  questions,
  baseHours,
  rate,
  hoursPerWeek = 30,
  currency = "USD",
  phases,
  exclusions,
  originLabels,
  similar,
  lines,
  capacity,
  priceMin,
  priceMax,
  suggested,
  confidence,
  receipt,
  risks,
  document,
  initialSections,
  initialPreflight,
  sow,
  activity,
  recipients,
  sendLink,
  pipeline,
  copy,
  contained,
  className,
}: ProposalBuilderProps) {
  const text = { ...COPY, ...copy }
  const toast = useToastStack()
  const [screen, setScreen] = React.useState<"dashboard" | "pipeline" | "analyzing" | "deal">("dashboard")
  const [tab, setTab] = React.useState<ProposalTabId>("summary")
  const [clarify, setClarify] = React.useState(false)
  const [intakeOpen, setIntakeOpen] = React.useState(false)
  const [sendOpen, setSendOpen] = React.useState(false)
  const [client, setClient] = React.useState(initialClient)
  const [projectType, setProjectType] = React.useState(initialType)
  const [file, setFile] = React.useState<OpportunityFile | null>(initialFile)
  const [answers, setAnswers] = React.useState<Record<string, string>>({})
  const [scope, setScope] = React.useState<ScopePhase[]>(() => phases.map((phase) => ({ ...phase, tasks: phase.tasks.map((task) => ({ ...task })) })))
  const [similarId, setSimilarId] = React.useState(similar.projects[0]?.id)
  const [price, setPrice] = React.useState(suggested)
  const [riskAction, setRiskAction] = React.useState<string>()
  const [approved, setApproved] = React.useState(false)
  const [sections, setSections] = React.useState<ProposalSection[]>(() => initialSections.map((section) => ({ ...section })))
  const [preflight, setPreflight] = React.useState<PreflightItem[]>(() => initialPreflight.map((item) => ({ ...item })))
  const [ack, setAck] = React.useState(false)
  const [recipient, setRecipient] = React.useState(recipients[0]?.value)
  const [message, setMessage] = React.useState("")
  const [records, setRecords] = React.useState<MultiRecord[]>(() => pipeline.records.map((record) => ({ ...record })))

  React.useEffect(() => {
    if (screen !== "analyzing") return
    const timer = window.setTimeout(() => {
      setScreen("deal")
      setTab("discovery")
    }, analyzeMs)
    return () => window.clearTimeout(timer)
  }, [analyzeMs, screen])

  const primary = (() => {
    if (screen !== "deal") return { label: text.newOpportunity, disabled: screen === "analyzing", run: () => setIntakeOpen(true) }
    if (clarify) return { label: text.apply, disabled: false, run: () => { setClarify(false); setTab("scope") } }
    if (tab === "discovery") return { label: text.clarify, disabled: false, run: () => setClarify(true) }
    if (tab === "risks" && !approved) return { label: text.approve, disabled: false, run: () => setApproved(true) }
    if (tab === "proposal") return { label: text.send, disabled: false, run: () => setSendOpen(true) }
    return { label: text.continue, disabled: false, run: () => setTab(nextTab(tab)) }
  })()

  const hours = scope.reduce((sum, phase) => sum + phase.tasks.reduce((inner, task) => inner + (task.included ? task.hours : 0), 0), 0)

  return (
    <div data-slot="proposal-builder" className={cn("min-w-0", className)}>
      <ProposalShell
        {...shell}
        contained={contained ?? shell.contained}
        activeHref={screen === "pipeline" ? pipelineHref : boardHref}
        primaryLabel={primary.label}
        primaryDisabled={primary.disabled}
        onPrimary={primary.run}
        onNavigate={(href) => {
          if (href === pipelineHref) setScreen("pipeline")
          if (href === boardHref) setScreen("dashboard")
        }}
      >
        {screen === "dashboard" ? <ProposalDashboard {...dashboard} onAction={() => setIntakeOpen(true)} /> : null}
        {screen === "pipeline" ? (
          <section aria-label={text.pipelineTitle} className="min-w-0">
            <h1 className="mb-3 text-xl font-medium">{text.pipelineTitle}</h1>
            <ViewKanban
              records={records}
              fields={pipeline.fields}
              config={pipeline.config}
              locale={dashboard.locale}
              cardLayout="summary"
              onOpen={() => {
                setScreen("deal")
                setTab("summary")
              }}
              onMove={(id, patch) => {
                setRecords((current) => current.map((record) => (record.id === id ? { ...record, ...patch } : record)))
              }}
            />
          </section>
        ) : null}
        {screen === "analyzing" ? <ProposalAnalyze label={analyzeLabel ?? text.analyzeLabel} /> : null}
        {screen === "deal" ? (
          <ProposalWorkspace crumbs={crumbs} tabs={tabs} value={clarify ? "discovery" : tab} onValueChange={(id) => { setClarify(false); setTab(id as ProposalTabId) }} title={dealTitle}>
            {clarify ? (
              <ProposalClarify
                {...clarifyLabels}
                questions={questions}
                answers={answers}
                onAnswer={(id, value) => setAnswers((current) => ({ ...current, [id]: value }))}
                baseHours={baseHours}
                rate={rate}
                hoursPerWeek={hoursPerWeek}
                locale={dashboard.locale}
                currency={currency}
              />
            ) : null}
            {!clarify && tab === "summary" ? (
              <div className="grid gap-3 sm:grid-cols-3">
                <SummaryCard label={text.summaryTitle} value={dealTitle} />
                <SummaryCard label={text.summaryHours} value={String(hours)} />
                <SummaryCard label={text.summaryPrice} value={formatMoney(price, dashboard.locale, currency)} />
              </div>
            ) : null}
            {!clarify && tab === "discovery" ? <ProposalDiscovery {...discovery} onClarify={() => setClarify(true)} /> : null}
            {!clarify && tab === "scope" ? (
              <ProposalScope {...scopeLabels} phases={scope} exclusions={exclusions} originLabels={originLabels} locale={dashboard.locale} onToggle={(id) => setScope((current) => toggleScopeTask(current, id))} />
            ) : null}
            {!clarify && tab === "similar" ? <ProposalSimilar {...similar} value={similarId} onValueChange={setSimilarId} locale={dashboard.locale} currency={currency} /> : null}
            {!clarify && tab === "estimate" ? (
              <ProposalEstimate {...estimateLabels} view="effort" lines={lines} capacity={capacity} priceMin={priceMin} priceMax={priceMax} price={price} suggested={suggested} confidence={confidence} receipt={receipt} locale={dashboard.locale} currency={currency} onPriceChange={setPrice} onUseSuggested={() => setPrice(suggested)} />
            ) : null}
            {!clarify && tab === "price" ? (
              <ProposalEstimate {...estimateLabels} view="price" lines={lines} capacity={capacity} priceMin={priceMin} priceMax={priceMax} price={price} suggested={suggested} confidence={confidence} receipt={receipt} locale={dashboard.locale} currency={currency} onPriceChange={setPrice} onUseSuggested={() => setPrice(suggested)} />
            ) : null}
            {!clarify && tab === "risks" ? (
              <ProposalRisks {...risks} selectedAction={riskAction} onSelectAction={setRiskAction} approved={approved} onApprove={() => setApproved(true)} />
            ) : null}
            {!clarify && tab === "proposal" ? (
              <ProposalDocument
                {...document}
                sections={sections}
                onSectionsChange={setSections}
                preflight={preflight}
                onPreflight={(id, done) => setPreflight((current) => current.map((item) => (item.id === id ? { ...item, done } : item)))}
              />
            ) : null}
            {!clarify && tab === "sow" ? <ProposalSow {...sow} acknowledged={ack} onAcknowledge={setAck} /> : null}
            {!clarify && tab === "activity" ? <ProposalActivity {...activity} /> : null}
          </ProposalWorkspace>
        ) : null}
      </ProposalShell>
      <ProposalOpportunity
        {...intake}
        open={intakeOpen}
        onOpenChange={setIntakeOpen}
        title={opportunityTitle}
        clients={clients}
        client={client}
        onClientChange={setClient}
        types={projectTypes}
        projectType={projectType}
        onProjectTypeChange={setProjectType}
        file={file}
        onFile={setFile}
        onAnalyze={() => {
          setIntakeOpen(false)
          setScreen("analyzing")
        }}
      />
      <ProposalSend
        {...sendLabels}
        open={sendOpen}
        onOpenChange={setSendOpen}
        recipients={recipients}
        recipient={recipient}
        onRecipientChange={setRecipient}
        project={dealTitle}
        price={formatMoney(price, dashboard.locale, currency)}
        weeks={String(risks.historicalWeeks)}
        message={message}
        onMessageChange={setMessage}
        link={sendLink}
        onSend={() => {
          setSendOpen(false)
          toast.toast({ type: "success", title: text.sentTitle, description: text.sentBody })
        }}
      />
    </div>
  )
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-xl border border-border bg-card p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 truncate text-sm font-medium">{value}</p>
    </div>
  )
}
