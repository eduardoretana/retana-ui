"use client"

import * as React from "react"
import { LayoutDashboard, Library, Settings } from "lucide-react"

import { ExampleFrame } from "@/app/examples/example-frame"
import {
  activity,
  actions,
  capacity,
  clients,
  commands,
  comparison,
  crumbs,
  discoveryColumns,
  exclusions,
  lines,
  metrics,
  NOW,
  NOW_MS,
  peaks,
  phases,
  pipelineConfig,
  pipelineFields,
  pipelineRecords,
  preflight,
  projectTypes,
  questions,
  receipt,
  sections,
  similarProjects,
  sowClauses,
  tabs,
  trend,
} from "@/app/examples/proposal/data"
import { ProposalBuilder } from "@/registry/blocks/proposal-builder"
import { ProposalDashboard } from "@/registry/blocks/proposal-dashboard"
import { ProposalShell } from "@/registry/blocks/proposal-shell"
import { ProposalActivity } from "@/registry/ui/proposal-activity"
import { ProposalAnalyze } from "@/registry/ui/proposal-analyze"
import { ProposalClarify } from "@/registry/ui/proposal-clarify"
import { ProposalDiscovery } from "@/registry/ui/proposal-discovery"
import { ProposalDocument } from "@/registry/ui/proposal-document"
import { ProposalEstimate } from "@/registry/ui/proposal-estimate"
import { ProposalOpportunity } from "@/registry/ui/proposal-opportunity"
import { ProposalRisks } from "@/registry/ui/proposal-risks"
import { ProposalScope } from "@/registry/ui/proposal-scope"
import { ProposalSend } from "@/registry/ui/proposal-send"
import { ProposalSimilar } from "@/registry/ui/proposal-similar"
import { ProposalSow } from "@/registry/ui/proposal-sow"
import { ProposalWorkspace } from "@/registry/ui/proposal-workspace"
import { toggleScopeTask, type PreflightItem, type ProposalSection, type ScopePhase } from "@/registry/lib/proposal"

const people = [
  { name: "Inés Soler" },
  { name: "Mateo Ruiz" },
  { name: "Luz Peña" },
]

export function shellProps(contained = false) {
  const sections = [
    {
      id: "workspace",
      label: "Espacio",
      icon: <LayoutDashboard />,
      nav: [{ id: "work", label: "Trabajo", items: [
        { id: "board", label: "Tablero", href: "#board" },
        { id: "pipeline", label: "Embudo", href: "#pipeline" },
      ] }],
    },
    {
      id: "library",
      label: "Archivo",
      icon: <Library />,
      nav: [{ id: "lib", label: "Biblioteca", items: [{ id: "past", label: "Proyectos pasados", href: "#library" }] }],
    },
    {
      id: "account",
      label: "Cuenta",
      icon: <Settings />,
      placement: "secondary" as const,
      nav: [{ id: "acc", items: [{ id: "profile", label: "Perfil", href: "#account" }] }],
    },
  ]
  return {
    sections,
    workspace: { name: "Estudio Bruma", subtitle: "Guadalajara" },
    user: { name: "Inés Soler", email: "ines@bruma.example" },
    people,
    peopleLabel: "Equipo en este espacio",
    periods: [
      { value: "quarter", label: "Este trimestre" },
      { value: "year", label: "Este año" },
    ],
    period: "quarter",
    periodLabel: "Periodo",
    searchLabel: "Buscar",
    commandBadge: "⌘K",
    bellLabel: "Avisos",
    unread: 2,
    commandItems: commands,
    commandTitle: "Comandos",
    commandPlaceholder: "Buscar comandos",
    commandEmpty: "Sin coincidencias",
    contained,
    defaultSection: "workspace",
    activeHref: "#board",
  }
}

const dashboardProps = {
  name: "Inés",
  now: NOW,
  locale: "es-MX",
  subtitle: "Cuatro piezas piden una decisión antes del viernes.",
  metrics,
  actions,
  actionsTitle: "Para atender",
  emptyActions: "Nada pendiente",
  trend,
  trendTitle: "Horas cotizadas y entregadas",
  trendSubtitle: "Últimos cinco meses",
  gaugeValue: 72,
  gaugeMax: 100,
  gaugeLabel: "Confianza del precio",
  gaugeLowLabel: "Demasiado bajo",
  gaugeTargetLabel: "Objetivo",
  activity,
  activityNow: NOW_MS,
  activityTitle: "Actividad reciente",
}

const discoveryProps = {
  columns: discoveryColumns,
  unknownsTitle: "Aún abierto",
  unknowns: [{ id: "u1", text: "Idioma del sitio", badge: "mencionado, no decidido" }, { id: "u2", text: "Si el pago entra ahora", badge: "mencionado, no decidido" }],
  quotesTitle: "Fragmentos",
  quotes: [{ id: "q1", speaker: "Elena Voss", text: "Si no salimos antes de las lluvias, perdemos la temporada.", at: 300 }],
  playLabel: "Reproducir",
  conflictTitle: "Dos fechas distintas",
  conflictBody: "A los 4 minutos dijeron agosto. Más tarde, la primera semana de julio.",
  clarifyLabel: "Aclarar",
  audioLabel: "Llamada del 2 de abril",
  peaks,
  duration: 18 * 60 + 42,
}

const documentBits = {
  variables: { client: "Casa Nube", studio: "Estudio Bruma", price: "$87,000", weeks: "9 semanas" },
  phases: [
    { id: "d", label: "Descubrimiento", hours: "12 h" },
    { id: "b", label: "Construcción", hours: "44 h" },
    { id: "l", label: "Salida", hours: "10 h" },
  ],
  contact: { name: "Elena Voss", role: "Hospitalidad", email: "elena@nube.example" },
  contactTitle: "Contacto",
  timeline: [
    { id: "kick", label: "Inicio" },
    { id: "build", label: "Construcción" },
    { id: "live", label: "Publicación" },
  ],
  timelineIndex: 0,
  timelineLabel: "Calendario",
  readyLabel: "Listo para enviar",
  notReadyLabel: "Aún no",
  preflightTitle: "Antes de enviar",
  reorderLabel: "Reordenar",
}

const risksProps = {
  resolvedTitle: "Idioma anotado",
  resolvedBody: "Quedó en una sola lengua hasta que Elena confirme lo contrario.",
  openTitle: "El plazo pedido es más corto que el histórico",
  openBody: "Casa Nube quiere publicar en seis semanas.",
  requestedWeeks: 6,
  historicalWeeks: 9,
  requestedLabel: "Pedido",
  historicalLabel: "Histórico",
  weeksSuffix: "sem",
  actions: [
    { id: "hold", label: "Sostener el histórico" },
    { id: "cut", label: "Recortar alcance" },
    { id: "staff", label: "Sumar una persona" },
  ],
  rows: [
    { id: "lang", asked: "Sitio bilingüe", proposed: "Español primero", accepted: true },
    { id: "pay", asked: "Cobro en el sitio", proposed: "Enlace de pago aparte", accepted: false },
    { id: "date", asked: "Seis semanas", proposed: "Nueve semanas", accepted: false },
  ],
  askedLabel: "Pidió el cliente",
  proposedLabel: "Proponemos",
  approveLabel: "Aprobar alcance",
  approvedLabel: "Alcance aprobado",
}

export function builderProps(contained = false) {
  return {
    contained,
    shell: shellProps(contained),
    dashboard: dashboardProps,
    clients,
    projectTypes,
    initialClient: "nube",
    initialType: "web",
    initialFile: { name: "casa-nube-02-abr.wav", duration: "18:42" },
    intake: {
      description: "La llamada se queda en este estudio.",
      clientLabel: "Cliente",
      typeLabel: "Tipo de proyecto",
      sourceLabel: "Fuente",
      sourceOptions: [
        { value: "recording" as const, label: "Grabación" },
        { value: "transcript" as const, label: "Transcripción" },
        { value: "notes" as const, label: "Notas" },
        { value: "manual" as const, label: "Manual" },
      ],
      dropLabel: "Suelta la grabación",
      dropHint: "Solo audio",
      callout: "El borrador es un punto de partida. Tú confirmas alcance y precio.",
      cancelLabel: "Cancelar",
      analyzeLabel: "Analizar",
      closeLabel: "Cerrar",
    },
    clarifyLabels: {
      hoursLabel: "Horas",
      previousLabel: "Antes",
      reasonsLabel: "Por qué cambió",
      emptyReasons: "Sin cambio todavía",
      priceLabel: "Rango de precio",
      timelineLabel: "Plazo",
      weeksSuffix: "sem",
    },
    scopeLabels: { effortLabel: "Esfuerzo", exclusionsTitle: "No incluye" },
    estimateLabels: {
      phaseLabel: "Fase",
      hoursLabel: "Horas",
      amountLabel: "Monto",
      historyLabel: "Promedio histórico",
      totalLabel: "Total",
      capacityLabel: "Próximas dos semanas",
      rangeLabel: "Precio",
      suggestedLabel: "Sugerido",
      useSuggestedLabel: "Usar recomendación",
      receiptLabel: "Desglose",
    },
    sendLabels: {
      title: "Enviar propuesta",
      recipientLabel: "Destino",
      projectLabel: "Proyecto",
      priceLabel: "Precio",
      weeksLabel: "Semanas",
      messageLabel: "Mensaje",
      linkLabel: "Enlace",
      copyLabel: "Copiar",
      copiedLabel: "Copiado",
      cancelLabel: "Cancelar",
      sendLabel: "Enviar",
      closeLabel: "Cerrar",
    },
    opportunityTitle: "Nueva oportunidad",
    analyzeLabel: "Leyendo la llamada",
    dealTitle: "Reservas para Casa Nube",
    crumbs,
    tabs,
    discovery: discoveryProps,
    questions,
    baseHours: 66,
    rate: 1400,
    currency: "MXN",
    phases,
    exclusions,
    originLabels: { adapted: "Adaptado", edited: "Editado", added: "Agregado por tu respuesta" },
    similar: {
      projects: similarProjects,
      comparison,
      revenueLabel: "Ingreso",
      weeksLabel: "Semanas",
      hoursLabel: "Horas",
      matchLabel: "Coincidencia",
      quotedLabel: "Cotizado",
      actualLabel: "Real",
    },
    lines,
    capacity,
    priceMin: 70000,
    priceMax: 120000,
    suggested: 87000,
    confidence: "Confianza media",
    receipt,
    risks: risksProps,
    document: documentBits,
    initialSections: sections,
    initialPreflight: preflight,
    sow: {
      title: "Orden de trabajo · Casa Nube",
      client: "Casa Nube",
      studio: "Estudio Bruma",
      partiesLabel: "Partes",
      clientLabel: "Cliente",
      studioLabel: "Estudio",
      clauses: sowClauses,
      acknowledgeLabel: "Leí el alcance y el plazo.",
    },
    activity: { title: "Actividad", events: activity, now: NOW_MS, locale: "es-MX" },
    recipients: [{ value: "elena", label: "Elena Voss · elena@nube.example" }],
    sendLink: "https://bruma.example/p/casa-nube",
    pipeline: { records: pipelineRecords, fields: pipelineFields, config: pipelineConfig },
    copy: {
      newOpportunity: "Nueva oportunidad",
      clarify: "Aclarar",
      apply: "Aplicar respuestas",
      continue: "Continuar",
      approve: "Aprobar alcance",
      send: "Enviar",
      summaryTitle: "Proyecto",
      summaryHours: "Horas",
      summaryPrice: "Precio sugerido",
      sentTitle: "Propuesta enviada",
      sentBody: "Elena recibe el enlace de solo lectura.",
      toastLabel: "Avisos",
      analyzeLabel: "Leyendo la llamada",
      pipelineTitle: "Embudo",
    },
  }
}

export function ProposalBuilderDemo({ contained = false }: { contained?: boolean }) {
  return <ProposalBuilder {...builderProps(contained)} />
}

export function ProposalShellDemo() {
  return (
    <ProposalShell {...shellProps(true)} primaryLabel="Nueva oportunidad" className="h-[32rem] overflow-hidden rounded-xl border border-border">
      <p className="text-sm text-muted-foreground">El tablero del estudio aparece aquí.</p>
    </ProposalShell>
  )
}

export function ProposalDashboardDemo() {
  return <ProposalDashboard {...dashboardProps} />
}

export function ProposalOpportunityDemo({ inline = false }: { inline?: boolean }) {
  const [open, setOpen] = React.useState(true)
  return (
    <ProposalOpportunity
      inline={inline}
      open={open}
      onOpenChange={setOpen}
      title="Nueva oportunidad"
      description="La llamada se queda en este estudio."
      clients={clients}
      client="nube"
      types={projectTypes}
      projectType="web"
      file={{ name: "casa-nube-02-abr.wav", duration: "18:42" }}
      sourceOptions={[
        { value: "recording", label: "Grabación" },
        { value: "transcript", label: "Transcripción" },
        { value: "notes", label: "Notas" },
        { value: "manual", label: "Manual" },
      ]}
      sourceLabel="Fuente"
      dropLabel="Suelta la grabación"
      dropHint="Solo audio"
      callout="El borrador es un punto de partida. Tú confirmas alcance y precio."
      cancelLabel="Cancelar"
      analyzeLabel="Analizar"
      clientLabel="Cliente"
      typeLabel="Tipo de proyecto"
    />
  )
}

export function ProposalAnalyzeDemo() {
  return <ProposalAnalyze label="Leyendo la llamada" />
}

export function ProposalWorkspaceDemo() {
  const [value, setValue] = React.useState("discovery")
  return (
    <ProposalWorkspace crumbs={crumbs} tabs={tabs} value={value} onValueChange={setValue} title="Reservas para Casa Nube">
      <p className="text-sm text-muted-foreground">Panel: {tabs.find((tab) => tab.id === value)?.label}</p>
    </ProposalWorkspace>
  )
}

export function ProposalDiscoveryDemo() {
  return <ProposalDiscovery {...discoveryProps} />
}

export function ProposalClarifyDemo() {
  const [answers, setAnswers] = React.useState<Record<string, string>>({ lang: "one", pay: "later", photos: "client" })
  return (
    <ProposalClarify
      questions={questions}
      answers={answers}
      onAnswer={(id, value) => setAnswers((current) => ({ ...current, [id]: value }))}
      baseHours={66}
      rate={1400}
      locale="es-MX"
      currency="MXN"
      hoursLabel="Horas"
      previousLabel="Antes"
      reasonsLabel="Por qué cambió"
      emptyReasons="Sin cambio todavía"
      priceLabel="Rango de precio"
      timelineLabel="Plazo"
      weeksSuffix="sem"
    />
  )
}

export function ProposalScopeDemo({ empty = false }: { empty?: boolean }) {
  const [scope, setScope] = React.useState<ScopePhase[]>(empty ? [] : phases.map((phase) => ({ ...phase, tasks: phase.tasks.map((task) => ({ ...task })) })))
  return (
    <ProposalScope
      phases={scope}
      exclusions={empty ? [] : exclusions}
      locale="es-MX"
      effortLabel="Esfuerzo"
      exclusionsTitle="No incluye"
      originLabels={{ adapted: "Adaptado", edited: "Editado", added: "Agregado por tu respuesta" }}
      onToggle={(id) => setScope((current) => toggleScopeTask(current, id))}
    />
  )
}

export function ProposalSimilarDemo() {
  const [value, setValue] = React.useState("posada")
  return (
    <ProposalSimilar
      projects={similarProjects}
      value={value}
      onValueChange={setValue}
      comparison={comparison}
      locale="es-MX"
      currency="MXN"
      revenueLabel="Ingreso"
      weeksLabel="Semanas"
      hoursLabel="Horas"
      matchLabel="Coincidencia"
      quotedLabel="Cotizado"
      actualLabel="Real"
    />
  )
}

export function ProposalEstimateDemo({ view = "all" as const }: { view?: "all" | "effort" | "price" }) {
  const [price, setPrice] = React.useState(87000)
  return (
    <ProposalEstimate
      view={view}
      lines={lines}
      capacity={capacity}
      priceMin={70000}
      priceMax={120000}
      price={price}
      onPriceChange={setPrice}
      suggested={87000}
      confidence="Confianza media"
      receipt={receipt}
      onUseSuggested={() => setPrice(87000)}
      locale="es-MX"
      currency="MXN"
      phaseLabel="Fase"
      hoursLabel="Horas"
      amountLabel="Monto"
      historyLabel="Promedio histórico"
      totalLabel="Total"
      capacityLabel="Próximas dos semanas"
      rangeLabel="Precio"
      suggestedLabel="Sugerido"
      useSuggestedLabel="Usar recomendación"
      receiptLabel="Desglose"
    />
  )
}

export function ProposalRisksDemo() {
  const [action, setAction] = React.useState<string>()
  const [approved, setApproved] = React.useState(false)
  return <ProposalRisks {...risksProps} selectedAction={action} onSelectAction={setAction} approved={approved} onApprove={() => setApproved(true)} />
}

export function ProposalDocumentDemo() {
  const [list, setList] = React.useState<ProposalSection[]>(sections.map((section) => ({ ...section })))
  const [checks, setChecks] = React.useState<PreflightItem[]>(preflight.map((item) => ({ ...item })))
  return (
    <ProposalDocument
      {...documentBits}
      sections={list}
      onSectionsChange={setList}
      preflight={checks}
      onPreflight={(id, done) => setChecks((current) => current.map((item) => (item.id === id ? { ...item, done } : item)))}
    />
  )
}

export function ProposalSowDemo() {
  const [ack, setAck] = React.useState(false)
  return (
    <ProposalSow
      title="Orden de trabajo · Casa Nube"
      client="Casa Nube"
      studio="Estudio Bruma"
      clauses={sowClauses}
      acknowledgeLabel="Leí el alcance y el plazo."
      acknowledged={ack}
      onAcknowledge={setAck}
    />
  )
}

export function ProposalActivityDemo() {
  return <ProposalActivity title="Actividad" events={activity} now={NOW_MS} locale="es-MX" />
}

export function ProposalSendDemo({ inline = false }: { inline?: boolean }) {
  const [open, setOpen] = React.useState(true)
  const [message, setMessage] = React.useState("Elena, aquí va el enlace de la propuesta de reservas.")
  return (
    <ProposalSend
      inline={inline}
      open={open}
      onOpenChange={setOpen}
      title="Enviar propuesta"
      recipients={[{ value: "elena", label: "Elena Voss · elena@nube.example" }]}
      recipient="elena"
      project="Reservas para Casa Nube"
      price="$87,000"
      weeks="9"
      message={message}
      onMessageChange={setMessage}
      link="https://bruma.example/p/casa-nube"
      recipientLabel="Destino"
      projectLabel="Proyecto"
      priceLabel="Precio"
      weeksLabel="Semanas"
      messageLabel="Mensaje"
      linkLabel="Enlace"
      copyLabel="Copiar"
      copiedLabel="Copiado"
      cancelLabel="Cancelar"
      sendLabel="Enviar"
    />
  )
}

export function ProposalPage({
  title,
  description,
  children,
  wide = true,
}: {
  title: string
  description: string
  children: React.ReactNode
  wide?: boolean
}) {
  return (
    <ExampleFrame title={title} description={description} wide={wide}>
      {children}
    </ExampleFrame>
  )
}

export function StressFrame({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <section className="grid gap-2">
      <h2 className="text-sm font-medium">{label}</h2>
      <div className="w-80 max-w-full overflow-auto rounded-xl border border-border p-2">{children}</div>
    </section>
  )
}
