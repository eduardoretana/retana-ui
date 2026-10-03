"use client"

/** Adapted from Arc UI (MIT). */

import { useEffect, useId, useLayoutEffect, useRef, useState } from "react"
import type { ReactNode } from "react"
import { MotionConfig, motion, useReducedMotion } from "motion/react"
import type { Variants } from "motion/react"
import { ArrowRight, ArrowUpRight, BarChart3, BookOpen, Check, ChevronsUpDown, Database, Gauge, ListTodo, MessageSquare, Minus, Receipt, Search, Settings, Sparkles, Split, Users } from "lucide-react"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { CopyButton } from "@/registry/retana/ui/copy-button"
import { Sparkline } from "@/registry/retana/ui/sparkline"
import { SegmentedControl } from "@/registry/retana/ui/segmented-control"
import { motionPresets } from "@/registry/retana/lib/motion"

import { dashboardInsight, dashboardKpis, dashboardMovers, dashboardRanges, dashboardSeries, editorialBrands } from "./hero-section-data"
import type { DashboardPoint, DashboardRange } from "./hero-section-data"

export type { DashboardMover, DashboardPoint, DashboardRange } from "./hero-section-data"

export type HeroSectionVariant = "dashboard" | "workflow" | "editorial"

export interface HeroAction {
  label: string
  href?: string
  onClick?: () => void
  /** Opens in a new tab and shows an outward arrow. */
  external?: boolean
  /** Shown in place of the label for a moment after a press. Buttons only. */
  doneLabel?: string
}

export interface HeroInstallCommand {
  /** Short label, such as npm or pnpm. The first command is shown. */
  label: string
  command: string
}

export interface HeroSectionProps {
  /**
   * `dashboard` is a headline over a mesh with a live revenue window, `workflow` sets the copy beside a graph that runs sample events,
   * and `editorial` is large type over a mesh.
   */
  variant?: HeroSectionVariant
  /** Plays the entrance once on mount. Defaults to true. */
  animateIn?: boolean
  /** The main call to action. Pass null to hide it. With `doneLabel` and no `href`, the button confirms in place. */
  primaryAction?: HeroAction | null
  /** The second call to action. Pass null to hide it. */
  secondaryAction?: HeroAction | null
  /** Replaces the designed headline. The variant visual stays. */
  title?: string
  description?: string
  announcement?: HeroAction | null
  /** Install commands; the first one is shown with a copy button. */
  install?: HeroInstallCommand[] | null
  /** Extra visual. In the workflow variant it replaces the graph when `plain` is set. */
  media?: ReactNode
  /** Small facts under the copy, such as the version and license. */
  meta?: string[]
  /** Skip the designed visual and render only the copy, install line, and optional media. */
  plain?: boolean
  /** Names along the editorial variant. */
  brands?: string[]
  className?: string
  classNames?: HeroSectionClassNames
}

export type HeroSectionClassNames = {
  root?: string
  title?: string
  description?: string
  actions?: string
  media?: string
  mesh?: string
}

const rise = {
  hidden: { opacity: 0, y: 12, filter: `blur(${motionPresets.blur.subtle}px)` },
  shown: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.64, ease: [...motionPresets.ease.enter] as [number, number, number, number] } },
} satisfies Variants
const group = { hidden: {}, shown: { transition: { staggerChildren: motionPresets.stagger.line, delayChildren: 0.04 } } }

const DASHBOARD_MESH = [
  { x: 0.1, y: 0.92, spread: 0.7 },
  { x: 0.92, y: 0.86, spread: 0.66 },
  { x: 0.14, y: 0.08, spread: 0.64 },
  { x: 0.86, y: 0.04, spread: 0.6 },
  { x: 0.5, y: 0.38, spread: 0.46 },
]
const EDITORIAL_MESH = [
  { x: 0.1, y: 0.88, spread: 0.72 },
  { x: 0.86, y: 0.12, spread: 0.66 },
  { x: 0.16, y: 0.14, spread: 0.56 },
  { x: 0.62, y: 0.62, spread: 0.5 },
  { x: 0.94, y: 0.92, spread: 0.48 },
  { x: 0.44, y: 0.3, spread: 0.34 },
]
const MESH_TONE = ["bg-primary/20", "bg-chart-2/25", "bg-chart-3/20", "bg-chart-4/20", "bg-accent/50", "bg-chart-1/40"]

const COPY = {
  dashboard: {
    title: "See every dollar of revenue move",
    description: "Connect billing, the CRM, and the warehouse, then read each change in revenue the moment it happens.",
    primary: { label: "Start free trial", doneLabel: "Trial started" } satisfies HeroAction,
    secondary: { label: "Book a demo", doneLabel: "Demo requested" } satisfies HeroAction,
    fine: "Free for 14 days. Connects in about four minutes.",
  },
  workflow: {
    title: "Every event, handled in milliseconds",
    description: "Turn webhooks into typed workflows with retries, branches, and a trace of every run.",
    primary: { label: "Start building", doneLabel: "Workspace created" } satisfies HeroAction,
    secondary: { label: "Read the docs", doneLabel: "Opening docs" } satisfies HeroAction,
    fine: "Free for 10,000 runs a month. No card needed.",
  },
  editorial: {
    title: "Your week, planned before Monday",
    description: "Read the tasks, meetings, and focus goals, then book time for the work that matters. When plans change, everything moves with them.",
    primary: { label: "Download for Mac", doneLabel: "Download started" } satisfies HeroAction,
    secondary: { label: "Try it on the web", doneLabel: "Opening the app" } satisfies HeroAction,
    fine: "Free for personal use. Teams from $8 a seat.",
  },
}

function HeroMesh({ points, className }: { points: { x: number; y: number; spread: number }[]; className?: string }) {
  const reduced = !!useReducedMotion()
  return (
    <div data-slot="hero-mesh" className={cn("pointer-events-none absolute inset-0 -z-10 overflow-hidden bg-muted/30", className)} aria-hidden="true">
      {points.map((point, index) => (
        <motion.div
          key={`${point.x}-${point.y}`}
          className={cn("absolute rounded-full blur-3xl", MESH_TONE[index % MESH_TONE.length])}
          style={{ width: `${point.spread * 70}%`, aspectRatio: "1", left: `${point.x * 100}%`, top: `${point.y * 100}%` }}
          animate={reduced ? undefined : { x: [0, 16, -12, 0], y: [0, -12, 8, 0] }}
          transition={reduced ? { duration: 0 } : { duration: 18 + index * 2, repeat: Infinity, ease: "linear" }}
        />
      ))}
    </div>
  )
}

function HeroActionButton({ action, kind }: { action: HeroAction; kind: "primary" | "secondary" }) {
  const [done, setDone] = useState(false)
  useEffect(() => {
    if (!done) return
    const timer = window.setTimeout(() => setDone(false), 2400)
    return () => window.clearTimeout(timer)
  }, [done])
  const icon = action.external ? <ArrowUpRight data-icon="inline-end" aria-hidden="true" /> : kind === "primary" ? <ArrowRight data-icon="inline-end" className="transition-transform group-hover/button:translate-x-0.5 motion-reduce:transition-none" aria-hidden="true" /> : null
  if (action.href) {
    return (
      <Button asChild variant={kind === "primary" ? "default" : "outline"} size="lg">
        <a href={action.href} onClick={action.onClick} {...(action.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
          {action.label}
          {icon}
        </a>
      </Button>
    )
  }
  return (
    <Button
      variant={kind === "primary" ? "default" : "outline"}
      size="lg"
      onClick={() => {
        action.onClick?.()
        if (action.doneLabel) setDone(true)
      }}
    >
      {done ? (
        <>
          <Check data-icon="inline-start" aria-hidden="true" />
          {action.doneLabel}
        </>
      ) : (
        <>
          {action.label}
          {icon}
        </>
      )}
    </Button>
  )
}

function Actions({ primary, secondary, className }: { primary: HeroAction | null; secondary: HeroAction | null; className?: string }) {
  if (!primary && !secondary) return null
  return (
    <div data-slot="hero-actions" className={cn("flex flex-wrap gap-3", className)}>
      {primary ? <HeroActionButton action={primary} kind="primary" /> : null}
      {secondary ? <HeroActionButton action={secondary} kind="secondary" /> : null}
    </div>
  )
}

function InstallLine({ command }: { command: string }) {
  return (
    <div data-slot="hero-install" className="flex h-9 w-full max-w-md items-center gap-2 rounded-lg border border-border bg-card pr-1 pl-3 font-mono text-sm">
      <span className="text-muted-foreground" aria-hidden="true">$</span>
      <code className="min-w-0 flex-1 truncate">{command}</code>
      <CopyButton value={command} label="Copy install command" iconOnly variant="plain" />
    </div>
  )
}

function AnnouncementLink({ action }: { action: HeroAction }) {
  const className = "inline-flex min-h-8 max-w-full items-center gap-1.5 rounded-full border border-border bg-card px-3 text-sm text-muted-foreground hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
  const inner = (
    <>
      {action.label}
      <ArrowRight className="size-3.5" aria-hidden="true" />
    </>
  )
  if (action.href) {
    return (
      <a className={className} href={action.href} onClick={action.onClick}>
        {inner}
      </a>
    )
  }
  return (
    <button type="button" className={className} onClick={action.onClick}>
      {inner}
    </button>
  )
}

const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 })

function RevenueChart({ points }: { points: DashboardPoint[] }) {
  const width = 640
  const height = 180
  const values = points.flatMap((point) => [point.now, point.before])
  const min = Math.min(...values)
  const max = Math.max(...values)
  const span = max - min || 1
  const x = (index: number) => (points.length > 1 ? (index / (points.length - 1)) * width : 0)
  const y = (value: number) => height - 16 - ((value - min) / span) * (height - 28)
  const line = (key: "now" | "before") => points.map((point, index) => `${index ? "L" : "M"}${x(index).toFixed(1)} ${y(point[key]).toFixed(1)}`).join(" ")
  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-44 w-full @min-[720px]/hero:h-52" role="img" aria-label="Net new revenue">
      <path d={`${line("now")} L${width} ${height} L0 ${height} Z`} className="fill-primary/15" />
      <path d={line("now")} fill="none" className="stroke-primary" strokeWidth="2.5" />
      <path d={line("before")} fill="none" className="stroke-muted-foreground" strokeWidth="2" strokeDasharray="5 5" />
    </svg>
  )
}

const NAV = [
  { label: "Overview", icon: Gauge, active: true },
  { label: "Revenue", icon: BarChart3 },
  { label: "Customers", icon: Users },
  { label: "Cohorts", icon: BookOpen },
  { label: "Forecasts", icon: Sparkles },
]

function DashboardWindow({ narrow }: { narrow: boolean }) {
  const [range, setRange] = useState<DashboardRange>("30d")
  const insight = dashboardInsight[range]
  return (
    <div data-slot="hero-dashboard" className="grid h-full grid-rows-[auto_minmax(0,1fr)] overflow-hidden rounded-xl border border-border bg-card text-left text-card-foreground shadow-sm" role="group" aria-label="Revenue dashboard, sample data">
      <div className="flex items-center gap-3 border-b border-border px-4 py-2 text-xs text-muted-foreground" aria-hidden="true">
        <span className="flex gap-1">
          <i className="size-2 rounded-full bg-muted-foreground/40" />
          <i className="size-2 rounded-full bg-muted-foreground/30" />
          <i className="size-2 rounded-full bg-muted-foreground/20" />
        </span>
        <span className="truncate">app.example/overview</span>
      </div>
      <div className={cn("grid min-h-0", !narrow && "grid-cols-[13rem_minmax(0,1fr)]")}>
        {!narrow ? (
          <aside className="flex flex-col gap-3 border-r border-border p-3 text-sm" aria-hidden="true">
            <div className="flex items-center gap-2 font-medium">
              <span className="grid size-7 place-items-center rounded-md bg-foreground text-background">A</span>
              <span className="min-w-0 flex-1 truncate">Acme Cloud</span>
              <ChevronsUpDown className="text-muted-foreground" />
            </div>
            <div className="flex items-center gap-2 rounded-lg bg-muted px-2 py-1.5 text-muted-foreground">
              <Search />
              Search
              <kbd className="ml-auto text-xs">⌘K</kbd>
            </div>
            <div className="grid gap-0.5">
              {NAV.map(({ label, icon: Icon, active }) => (
                <div key={label} className={cn("flex items-center gap-2 rounded-lg px-2 py-1.5", active && "bg-muted font-medium text-foreground")}>
                  <Icon />
                  {label}
                </div>
              ))}
            </div>
            <div className="mt-auto flex items-center gap-2">
              <Avatar size="sm">
                <AvatarFallback>CN</AvatarFallback>
              </Avatar>
              <span className="min-w-0">
                <strong className="block truncate text-xs">Chloe Nguyen</strong>
                <small className="text-muted-foreground">Data analyst</small>
              </span>
              <Settings className="ml-auto text-muted-foreground" />
            </div>
          </aside>
        ) : null}
        <div className="grid min-w-0 content-start gap-4 p-4">
          <header className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="m-0 text-base font-medium">Revenue overview</h2>
              <p className="m-0 text-xs text-muted-foreground">Synced 2 minutes ago</p>
            </div>
            <SegmentedControl label="Date range" options={dashboardRanges} value={range} onValueChange={(value) => setRange(value as DashboardRange)} />
          </header>
          <div className="grid gap-3 @min-[720px]/hero:grid-cols-4">
            {dashboardKpis.map((kpi) => {
              const now = kpi.byRange[range]
              return (
                <div key={kpi.id} className="min-w-0 rounded-lg border border-border p-2">
                  <Sparkline label={kpi.label} value={now.value} change={now.change} data={now.data} tone={kpi.tone} width={180} height={28} interactive={false} />
                </div>
              )
            })}
          </div>
          <div className={cn("grid gap-3", !narrow && "grid-cols-[minmax(0,1.4fr)_minmax(0,0.8fr)]")}>
            <div className="min-w-0 rounded-lg border border-border p-3">
              <p className="m-0 mb-2 flex gap-2 text-sm">
                <Sparkles className="mt-0.5 shrink-0 text-primary" aria-hidden="true" />
                <span>
                  <strong>{insight.lead}</strong> {insight.rest}
                </span>
              </p>
              <div className="mb-2 flex gap-3 text-xs text-muted-foreground" aria-hidden="true">
                <span className="inline-flex items-center gap-1.5"><i className="h-0.5 w-4 bg-primary" />This period</span>
                <span className="inline-flex items-center gap-1.5"><i className="h-0.5 w-4 border-t border-dashed border-muted-foreground" />Last period</span>
              </div>
              <RevenueChart points={dashboardSeries[range]} />
            </div>
            {!narrow ? (
              <div className="rounded-lg border border-border p-3">
                <div className="mb-2 flex items-baseline justify-between text-sm font-medium">
                  Biggest movers <span className="text-xs font-normal text-muted-foreground">MRR change</span>
                </div>
                <ul className="m-0 grid list-none gap-2 p-0">
                  {dashboardMovers.map((mover) => (
                    <li key={mover.name} className="flex items-center gap-2 text-sm">
                      <span className="grid size-7 shrink-0 place-items-center rounded-md bg-muted text-xs font-medium">{mover.name.slice(0, 1)}</span>
                      <span className="min-w-0">
                        <strong className="block truncate">{mover.name}</strong>
                        <small className="text-muted-foreground">{mover.change}</small>
                      </span>
                      <span className={cn("ml-auto shrink-0 tabular-nums", mover.amount < 0 ? "text-destructive" : "text-foreground")}>
                        {mover.amount < 0 ? "−" : "+"}
                        {money.format(Math.abs(mover.amount))}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  )
}

function DashboardHero(props: SharedProps) {
  const id = useId()
  const reduced = !!useReducedMotion()
  const stage = useRef<HTMLDivElement>(null)
  const [narrow, setNarrow] = useState(false)
  const copy = COPY.dashboard
  const title = props.title ?? copy.title
  const description = props.description ?? copy.description
  const primary = props.primaryAction === undefined ? copy.primary : props.primaryAction
  const secondary = props.secondaryAction === undefined ? copy.secondary : props.secondaryAction

  useLayoutEffect(() => {
    const node = stage.current
    if (!node) return
    const measure = () => setNarrow(node.clientWidth < 720)
    measure()
    if (typeof ResizeObserver === "undefined") return
    const observer = new ResizeObserver(measure)
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  return (
    <MotionConfig reducedMotion="user">
      <section data-slot="hero-section" data-variant="dashboard" className={shell(props)} aria-labelledby={id}>
        <HeroMesh points={DASHBOARD_MESH} className={props.classNames?.mesh} />
        <motion.div className="relative z-10 mx-auto grid max-w-3xl justify-items-center gap-5 px-4 pt-8 text-center" variants={group} initial={props.animateIn ? "hidden" : false} animate="shown">
          {props.announcement ? (
            <motion.div variants={rise}>
              <AnnouncementLink action={props.announcement} />
            </motion.div>
          ) : null}
          <motion.h1 id={id} variants={rise} className={cn("m-0 max-w-[14ch] font-heading text-3xl font-medium tracking-tight text-balance wrap-anywhere @min-[640px]/hero:text-5xl", props.classNames?.title)}>
            {title}
          </motion.h1>
          {description ? (
            <motion.p variants={rise} className={cn("m-0 max-w-xl text-pretty text-muted-foreground @min-[640px]/hero:text-lg", props.classNames?.description)}>
              {description}
            </motion.p>
          ) : null}
          <motion.div variants={rise} className={props.classNames?.actions}>
            <Actions primary={primary} secondary={secondary} className="justify-center" />
          </motion.div>
          {props.install?.[0] ? (
            <motion.div variants={rise} className="w-full">
              <InstallLine command={props.install[0].command} />
            </motion.div>
          ) : null}
          <motion.p variants={rise} className="m-0 text-sm text-muted-foreground">{copy.fine}</motion.p>
          {props.meta && props.meta.length > 0 ? <MetaList items={props.meta} /> : null}
        </motion.div>
        <motion.div
          ref={stage}
          data-slot="hero-media"
          className={cn("relative z-10 mx-auto mt-8 w-full max-w-6xl flex-1 px-4", props.classNames?.media)}
          initial={props.animateIn ? { opacity: 0, y: 40 } : false}
          animate={{ opacity: 1, y: 0 }}
          transition={reduced ? { duration: motionPresets.duration.standard } : { duration: 1, ease: [...motionPresets.ease.enter], delay: 0.28 }}
        >
          <div className={cn("origin-top", narrow ? "min-h-[28rem]" : "min-h-[36rem]")}>
            <DashboardWindow narrow={narrow} />
          </div>
        </motion.div>
      </section>
    </MotionConfig>
  )
}

type NodeId = "trigger" | "lookup" | "branch" | "slack" | "linear" | "warehouse"
type Status = "idle" | "running" | "done" | "skipped"
const EVENTS = [
  { customer: "Northwind Labs", amount: "$4,800", plan: "Enterprise, 212 seats", routed: true, issue: "ONB-482", total: 412, ms: { lookup: 118, branch: 2, slack: 164, linear: 231, warehouse: 58 } },
  { customer: "Tidepool", amount: "$240", plan: "Team, 9 seats", routed: false, issue: "", total: 171, ms: { lookup: 96, branch: 1, slack: 0, linear: 0, warehouse: 61 } },
  { customer: "Halcyon Health", amount: "$12,600", plan: "Enterprise, 540 seats", routed: true, issue: "ONB-483", total: 436, ms: { lookup: 131, branch: 2, slack: 149, linear: 244, warehouse: 66 } },
] as const
type RelayEvent = (typeof EVENTS)[number]
const PHASES = [900, 420, 380, 640, 380, 360, 440, 760, 2800]
const DONE = PHASES.length - 1
const STEPS: Record<NodeId, [number, number]> = { trigger: [1, 2], lookup: [3, 4], branch: [5, 6], slack: [7, 8], linear: [7, 8], warehouse: [7, 8] }
const ACTIONS = ["slack", "linear", "warehouse"] as const

function statusOf(id: NodeId, phase: number, event: RelayEvent): Status {
  const [start, end] = STEPS[id]
  if ((id === "slack" || id === "linear") && !event.routed && phase >= 6) return "skipped"
  return phase < start ? "idle" : phase < end ? "running" : "done"
}

type Box = { x: number; y: number; w: number; h: number }
const LAYOUTS = {
  wide: {
    width: 640,
    height: 524,
    summary: 480,
    nodes: {
      trigger: { x: 170, y: 0, w: 300, h: 60 },
      lookup: { x: 170, y: 112, w: 300, h: 60 },
      branch: { x: 170, y: 224, w: 300, h: 60 },
      slack: { x: 0, y: 356, w: 200, h: 84 },
      linear: { x: 220, y: 356, w: 200, h: 84 },
      warehouse: { x: 440, y: 356, w: 200, h: 84 },
    } as Record<NodeId, Box>,
  },
  narrow: {
    width: 344,
    height: 316,
    summary: 0,
    nodes: {
      trigger: { x: 0, y: 0, w: 344, h: 52 },
      lookup: { x: 0, y: 78, w: 344, h: 52 },
      branch: { x: 0, y: 156, w: 344, h: 52 },
      slack: { x: 0, y: 244, w: 108, h: 72 },
      linear: { x: 118, y: 244, w: 108, h: 72 },
      warehouse: { x: 236, y: 244, w: 108, h: 72 },
    } as Record<NodeId, Box>,
  },
}

const EDGES: { from: NodeId; to: NodeId; phase: number }[] = [
  { from: "trigger", to: "lookup", phase: 2 },
  { from: "lookup", to: "branch", phase: 4 },
  { from: "branch", to: "slack", phase: 6 },
  { from: "branch", to: "linear", phase: 6 },
  { from: "branch", to: "warehouse", phase: 6 },
]

function edgePath(layout: (typeof LAYOUTS)[keyof typeof LAYOUTS], from: NodeId, to: NodeId) {
  const a = layout.nodes[from]
  const b = layout.nodes[to]
  const x1 = a.x + a.w / 2
  const y1 = a.y + a.h
  const x2 = b.x + b.w / 2
  const y2 = b.y
  const mid = (y2 - y1) / 2
  return `M ${x1} ${y1} C ${x1} ${y1 + mid} ${x2} ${y2 - mid} ${x2} ${y2}`
}

function WorkflowHero(props: SharedProps) {
  const id = useId()
  const reduced = !!useReducedMotion()
  const root = useRef<HTMLElement>(null)
  const stage = useRef<HTMLDivElement>(null)
  const [mode, setMode] = useState<keyof typeof LAYOUTS>("wide")
  const [scale, setScale] = useState(1)
  const [run, setRun] = useState({ index: 0, count: 2418, phase: 0 })
  const [visible, setVisible] = useState(false)
  const copy = COPY.workflow
  const title = props.title ?? copy.title
  const description = props.description ?? copy.description
  const primary = props.primaryAction === undefined ? copy.primary : props.primaryAction
  const secondary = props.secondaryAction === undefined ? copy.secondary : props.secondaryAction

  useLayoutEffect(() => {
    const node = stage.current
    if (!node) return
    const measure = () => {
      const width = node.clientWidth
      const next = width < 520 ? "narrow" : "wide"
      setMode(next)
      setScale(Math.min(1, width > 0 ? width / LAYOUTS[next].width : 1))
    }
    measure()
    if (typeof ResizeObserver === "undefined") return
    const observer = new ResizeObserver(measure)
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const node = root.current
    if (!node || typeof IntersectionObserver === "undefined") {
      setVisible(true)
      return
    }
    let onScreen = false
    const sync = () => setVisible(onScreen && document.visibilityState === "visible")
    const io = new IntersectionObserver(([entry]) => {
      onScreen = entry.isIntersecting
      sync()
    })
    io.observe(node)
    document.addEventListener("visibilitychange", sync)
    return () => {
      io.disconnect()
      document.removeEventListener("visibilitychange", sync)
    }
  }, [])

  useEffect(() => {
    if (reduced || !visible) return
    const timer = window.setTimeout(
      () =>
        setRun((current) =>
          current.phase < DONE ? { ...current, phase: current.phase + 1 } : { index: (current.index + 1) % EVENTS.length, count: current.count + 1, phase: 0 },
        ),
      PHASES[run.phase],
    )
    return () => window.clearTimeout(timer)
  }, [run.phase, run.index, reduced, visible])

  const sendTest = () => setRun((current) => ({ index: (current.index + 1) % EVENTS.length, count: current.count + 1, phase: 1 }))
  const layout = LAYOUTS[mode]
  const event = EVENTS[run.index]
  const phase = reduced ? DONE : run.phase
  const status = (node: NodeId) => statusOf(node, phase, event)
  const narrow = mode === "narrow"

  return (
    <MotionConfig reducedMotion="user">
      <section ref={root} data-slot="hero-section" data-variant="workflow" className={cn(shell(props), "bg-[radial-gradient(circle,var(--border)_1px,transparent_1.5px)] [background-size:22px_22px]")} aria-labelledby={id}>
        <div className="mx-auto grid w-full max-w-7xl items-center gap-10 px-4 py-10 @min-[960px]/hero:grid-cols-[minmax(0,0.9fr)_minmax(0,1fr)] @min-[960px]/hero:px-8 @min-[960px]/hero:py-16">
          <motion.div className="grid justify-items-start gap-5" variants={group} initial={props.animateIn ? "hidden" : false} animate="shown">
            {props.announcement ? (
              <motion.div variants={rise}>
                <AnnouncementLink action={props.announcement} />
              </motion.div>
            ) : null}
            <motion.h1 id={id} variants={rise} className={cn("m-0 max-w-[12ch] font-heading text-3xl font-medium tracking-tight text-balance wrap-anywhere @min-[640px]/hero:text-5xl", props.classNames?.title)}>
              {title}
            </motion.h1>
            {description ? <motion.p variants={rise} className={cn("m-0 max-w-lg text-pretty text-muted-foreground @min-[640px]/hero:text-lg", props.classNames?.description)}>{description}</motion.p> : null}
            <motion.div variants={rise} className={props.classNames?.actions}>
              <Actions primary={primary} secondary={secondary} />
            </motion.div>
            {props.install?.[0] ? (
              <motion.div variants={rise} className="w-full">
                <InstallLine command={props.install[0].command} />
              </motion.div>
            ) : null}
            <motion.p variants={rise} className="m-0 text-sm text-muted-foreground">{copy.fine}</motion.p>
            {props.meta && props.meta.length > 0 ? <MetaList items={props.meta} /> : null}
          </motion.div>
          <motion.div data-slot="hero-media" className={cn("grid min-w-0 justify-items-center gap-4", props.classNames?.media)} initial={props.animateIn ? { opacity: 0, y: 24 } : false} animate={{ opacity: 1, y: 0 }} transition={{ duration: reduced ? motionPresets.duration.standard : 1, ease: [...motionPresets.ease.enter], delay: reduced ? 0 : 0.28 }}>
            {props.plain && props.media ? props.media : (
              <>
                <div className="flex w-full max-w-xl items-center justify-between gap-3">
                  <span className="inline-flex min-w-0 items-center gap-2 font-mono text-xs text-muted-foreground">
                    <i className={cn("size-1.5 shrink-0 rounded-full bg-muted-foreground", (visible || reduced) && "bg-primary")} aria-hidden="true" />
                    <span className="truncate">on-invoice-paid.ts</span>
                  </span>
                  <Button type="button" variant="outline" size="sm" onClick={sendTest}>
                    Send test event
                  </Button>
                </div>
                <div ref={stage} className="relative w-full max-w-xl" style={{ height: layout.height * scale }}>
                  <div className="absolute top-0 left-0 origin-top-left" role="group" aria-label={`Workflow, sample run for ${event.customer}`} style={{ width: layout.width, height: layout.height, transform: `scale(${scale})` }}>
                    <svg className="absolute inset-0" width={layout.width} height={layout.height} viewBox={`0 0 ${layout.width} ${layout.height}`} aria-hidden="true">
                      {EDGES.map((edge) => {
                        const d = edgePath(layout, edge.from, edge.to)
                        const skipped = status(edge.to) === "skipped"
                        const lit = phase >= edge.phase && !skipped
                        return (
                          <g key={`${edge.from}-${edge.to}`}>
                            <path d={d} className={cn("fill-none stroke-border", skipped && "opacity-40")} strokeWidth="1.5" />
                            <motion.path d={d} className="fill-none stroke-primary" strokeWidth="1.75" initial={false} animate={{ pathLength: lit ? 1 : 0, opacity: lit ? 1 : 0 }} transition={lit && !reduced ? { pathLength: { duration: PHASES[edge.phase] / 1000, ease: [...motionPresets.ease.inOut] }, opacity: { duration: 0.08 } } : { duration: 0 }} />
                          </g>
                        )
                      })}
                    </svg>
                    <FlowNode box={layout.nodes.trigger} status={status("trigger")} icon={<Receipt aria-hidden="true" />} title="Invoice paid" sub={`${event.customer}, ${event.amount}`} />
                    <FlowNode box={layout.nodes.lookup} status={status("lookup")} icon={<Search aria-hidden="true" />} title="Find the account" sub={status("lookup") === "done" ? event.plan : "Plan, seats, and owner"} meta={`${event.ms.lookup} ms`} />
                    <FlowNode box={layout.nodes.branch} status={status("branch")} icon={<Split aria-hidden="true" />} title="Amount over $1,000" sub={status("branch") === "done" ? (event.routed ? "Yes, alert the team" : "No, record only") : "Condition"} meta={`${event.ms.branch} ms`} />
                    {ACTIONS.map((action) => {
                      const state = status(action)
                      const copyFor = {
                        slack: { icon: <MessageSquare aria-hidden="true" />, title: narrow ? "Chat" : "Post to revenue", waiting: "Channel" },
                        linear: { icon: <ListTodo aria-hidden="true" />, title: narrow ? "Issue" : "Create an issue", waiting: "Onboarding" },
                        warehouse: { icon: <Database aria-hidden="true" />, title: narrow ? "Warehouse" : "Save to warehouse", waiting: "Postgres" },
                      }[action]
                      const sub = state === "skipped" ? "Skipped" : state === "done" ? (narrow ? `${event.ms[action]} ms` : action === "linear" ? `${event.issue} in ${event.ms.linear} ms` : action === "slack" ? `Sent in ${event.ms.slack} ms` : `Saved in ${event.ms.warehouse} ms`) : state === "running" ? "Running" : narrow ? "Waiting" : copyFor.waiting
                      return <FlowNode key={action} box={layout.nodes[action]} status={state} icon={copyFor.icon} title={copyFor.title} sub={sub} />
                    })}
                    {!narrow ? (
                      <div className="absolute flex items-center justify-between gap-3 text-sm" style={{ top: layout.summary, width: layout.width }}>
                        <span>
                          <code>invoice.paid</code> <span className="text-muted-foreground">Run {run.count.toLocaleString("en-US")}</span>
                        </span>
                        <span className="text-muted-foreground" aria-live="polite">
                          {phase === DONE ? <span className="inline-flex items-center gap-1 text-foreground"><Check className="size-3.5" aria-hidden="true" />Completed in {event.total} ms</span> : phase === 0 ? "Waiting for the next event" : "Running"}
                        </span>
                      </div>
                    ) : null}
                  </div>
                </div>
              </>
            )}
          </motion.div>
        </div>
      </section>
    </MotionConfig>
  )
}

function FlowNode({ box, status, icon, title, sub, meta }: { box: Box; status: Status; icon: ReactNode; title: string; sub: string; meta?: string }) {
  return (
    <div className="absolute flex items-center gap-2 overflow-hidden rounded-xl border border-border bg-card px-2.5 text-left shadow-sm" data-status={status} style={{ left: box.x, top: box.y, width: box.w, height: box.h }}>
      <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-muted text-foreground">{icon}</span>
      <span className="min-w-0">
        <strong className="block truncate text-sm">{title}</strong>
        <small className="block truncate text-muted-foreground">{sub}</small>
      </span>
      <span className="ml-auto shrink-0 text-muted-foreground">
        {status === "running" ? <span className="block size-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" role="img" aria-label="Running" /> : status === "done" ? <span className="inline-flex items-center gap-1 text-primary"><span className="text-xs tabular-nums">{meta}</span><Check className="size-3.5" role="img" aria-label="Done" /></span> : status === "skipped" ? <Minus className="size-3.5" role="img" aria-label="Skipped" /> : <span className="block size-2 rounded-full bg-border" role="img" aria-label="Waiting" />}
      </span>
    </div>
  )
}

function EditorialHero(props: SharedProps) {
  const id = useId()
  const copy = COPY.editorial
  const title = props.title ?? copy.title
  const description = props.description ?? copy.description
  const primary = props.primaryAction === undefined ? copy.primary : props.primaryAction
  const secondary = props.secondaryAction === undefined ? copy.secondary : props.secondaryAction
  const brands = props.brands ?? editorialBrands
  return (
    <MotionConfig reducedMotion="user">
      <section data-slot="hero-section" data-variant="editorial" className={shell(props)} aria-labelledby={id}>
        <HeroMesh points={EDITORIAL_MESH} className={props.classNames?.mesh} />
        <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-transparent to-background/40" aria-hidden="true" />
        <motion.div className="relative z-10 mx-auto grid min-h-[28rem] w-full max-w-6xl content-center gap-8 px-4 py-12 @min-[640px]/hero:px-8" variants={group} initial={props.animateIn ? "hidden" : false} animate="shown">
          {props.announcement ? (
            <motion.div variants={rise}>
              <AnnouncementLink action={props.announcement} />
            </motion.div>
          ) : null}
          <motion.h1 id={id} variants={rise} className={cn("m-0 max-w-[14ch] font-heading text-4xl font-medium tracking-tight text-balance wrap-anywhere @min-[640px]/hero:text-6xl @min-[960px]/hero:text-7xl", props.classNames?.title)}>
            {title}
          </motion.h1>
          <div className="grid items-end gap-6 @min-[800px]/hero:grid-cols-[minmax(0,1fr)_auto]">
            {description ? <motion.p variants={rise} className={cn("m-0 max-w-lg text-pretty text-muted-foreground @min-[640px]/hero:text-lg", props.classNames?.description)}>{description}</motion.p> : <span />}
            <motion.div variants={rise} className={cn("grid justify-items-start gap-3 @min-[800px]/hero:justify-items-end", props.classNames?.actions)}>
              <Actions primary={primary} secondary={secondary} />
              <p className="m-0 text-sm text-muted-foreground">{copy.fine}</p>
            </motion.div>
          </div>
          {props.install?.[0] ? (
            <motion.div variants={rise}>
              <InstallLine command={props.install[0].command} />
            </motion.div>
          ) : null}
          {props.meta && props.meta.length > 0 ? <MetaList items={props.meta} /> : null}
          {props.media ? <motion.div variants={rise} className={props.classNames?.media}>{props.media}</motion.div> : null}
          {brands.length > 0 ? (
            <motion.div variants={rise} className="grid gap-4 border-t border-border pt-6">
              <p className="m-0 text-sm text-muted-foreground">Teams planning with this</p>
              <ul className="m-0 flex list-none flex-wrap gap-x-6 gap-y-3 p-0" aria-label="Sample customers">
                {brands.map((brand) => (
                  <li key={brand} className="text-base font-medium wrap-anywhere">{brand}</li>
                ))}
              </ul>
            </motion.div>
          ) : null}
        </motion.div>
      </section>
    </MotionConfig>
  )
}

function PlainHero(props: SharedProps) {
  const id = useId()
  const copy = COPY[props.variant]
  const title = props.title ?? copy.title
  const description = props.description ?? copy.description
  const primary = props.primaryAction === undefined ? copy.primary : props.primaryAction
  const secondary = props.secondaryAction === undefined ? copy.secondary : props.secondaryAction
  const split = props.variant === "workflow"
  return (
    <MotionConfig reducedMotion="user">
      <section data-slot="hero-section" data-variant={props.variant} data-plain="" className={shell(props)} aria-labelledby={id}>
        {props.variant !== "workflow" ? <HeroMesh points={props.variant === "editorial" ? EDITORIAL_MESH : DASHBOARD_MESH} className={props.classNames?.mesh} /> : null}
        <div className={cn("relative z-10 mx-auto grid w-full max-w-6xl gap-10 px-4 py-12 @min-[640px]/hero:px-8", split && "items-center @min-[860px]/hero:grid-cols-2")}>
          <motion.div className={cn("grid gap-5", split ? "justify-items-start text-left" : "mx-auto max-w-2xl justify-items-center text-center")} variants={group} initial={props.animateIn ? "hidden" : false} animate="shown">
            {props.announcement ? <motion.div variants={rise}><AnnouncementLink action={props.announcement} /></motion.div> : null}
            <motion.h1 id={id} variants={rise} className={cn("m-0 font-heading text-4xl font-medium tracking-tight text-balance wrap-anywhere", props.classNames?.title)}>{title}</motion.h1>
            {description ? <motion.p variants={rise} className={cn("m-0 max-w-xl text-pretty text-muted-foreground", props.classNames?.description)}>{description}</motion.p> : null}
            <motion.div variants={rise} className={props.classNames?.actions}>
              <Actions primary={primary} secondary={secondary} className={split ? undefined : "justify-center"} />
            </motion.div>
            {props.install?.[0] ? <motion.div variants={rise} className="w-full"><InstallLine command={props.install[0].command} /></motion.div> : null}
            {props.meta && props.meta.length > 0 ? <MetaList items={props.meta} /> : null}
          </motion.div>
          {props.media ? <motion.div className={cn("min-w-0", props.classNames?.media)} variants={rise} initial={props.animateIn ? "hidden" : false} animate="shown">{props.media}</motion.div> : null}
        </div>
      </section>
    </MotionConfig>
  )
}

function MetaList({ items }: { items: string[] }) {
  return (
    <ul data-slot="hero-meta" className="m-0 flex list-none flex-wrap gap-x-5 gap-y-2 p-0 text-sm text-muted-foreground">
      {items.map((item) => (
        <li key={item} className="wrap-anywhere">{item}</li>
      ))}
    </ul>
  )
}

type SharedProps = {
  variant: HeroSectionVariant
  animateIn: boolean
  title?: string
  description?: string
  primaryAction?: HeroAction | null
  secondaryAction?: HeroAction | null
  announcement?: HeroAction | null
  install?: HeroInstallCommand[] | null
  media?: ReactNode
  meta?: string[]
  plain?: boolean
  brands?: string[]
  className?: string
  classNames?: HeroSectionClassNames
}

function shell(props: SharedProps) {
  return cn("@container/hero relative isolate flex min-h-[28rem] w-full min-w-0 flex-col overflow-hidden bg-background text-foreground", props.className, props.classNames?.root)
}

/**
 * A landing hero in three designs, chosen with `variant`: a revenue dashboard, a live workflow, or editorial type on a mesh.
 */
export function HeroSection({
  variant = "dashboard",
  animateIn = true,
  primaryAction,
  secondaryAction,
  title,
  description,
  announcement,
  install,
  media,
  meta,
  plain = false,
  brands,
  className,
  classNames,
}: HeroSectionProps) {
  const shared: SharedProps = { variant, animateIn, title, description, primaryAction, secondaryAction, announcement, install, media, meta, plain, brands, className, classNames }
  if (plain) return <PlainHero {...shared} />
  if (variant === "workflow") return <WorkflowHero {...shared} />
  if (variant === "editorial") return <EditorialHero {...shared} />
  return <DashboardHero {...shared} />
}
