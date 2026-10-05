import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { ProposalDashboard } from "@/registry/blocks/proposal-dashboard"
import { ProposalShell } from "@/registry/blocks/proposal-shell"
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
import { ProposalWorkspace } from "@/registry/ui/proposal-workspace"
import {
  clarificationImpact,
  clampPrice,
  estimateTotals,
  moveSection,
  preflightReady,
  priceTotal,
  scopeHours,
  toggleScopeTask,
  type ProposalSection,
  type ScopePhase,
} from "@/registry/lib/proposal"
import { questions, lines, receipt, sections } from "@/app/examples/proposal/data"

const phase: ScopePhase[] = [
  { id: "a", title: "A", tasks: [{ id: "t1", title: "One", hours: 4, included: true }, { id: "t2", title: "Two", hours: 6, included: false }] },
]

describe("proposal math", () => {
  it("sums included hours and toggles a task", () => {
    expect(scopeHours(phase)).toBe(4)
    expect(scopeHours(toggleScopeTask(phase, "t2"))).toBe(10)
  })

  it("applies answer effects to hours, price, and weeks", () => {
    const impact = clarificationImpact({
      baseHours: 66,
      questions,
      answers: { lang: "two", pay: "later", photos: "studio" },
      rate: 100,
      hoursPerWeek: 30,
    })
    expect(impact.delta).toBe(12)
    expect(impact.next).toBe(78)
    expect(impact.previous).toBe(66)
    expect(impact.reasons.map((reason) => reason.id)).toEqual(["lang-hours", "pay-less", "photo"])
    expect(impact.priceLow).toBe(Math.round(78 * 100 * 0.92))
    expect(impact.weeksLow).toBe(2.6)
  })

  it("totals an estimate, a receipt, and a clamped price", () => {
    const totals = estimateTotals(lines)
    expect(totals.hours).toBe(66)
    expect(totals.amount).toBe(66 * 1400)
    expect(priceTotal(receipt)).toBe(87000)
    expect(clampPrice(10, 70, 120)).toBe(70)
    expect(preflightReady([{ id: "a", label: "A", done: false }])).toBe(false)
  })

  it("moves a section one step and ignores the ends", () => {
    const next = moveSection(sections, "approach", -1)
    expect(next.map((section) => section.id)).toEqual(["approach", "open", "investment"])
    expect(moveSection(sections, "open", -1).map((section) => section.id)).toEqual(sections.map((section) => section.id))
  })
})

describe("proposal panels", () => {
  it("renders the shell groups, unread dot, and command menu", async () => {
    const user = userEvent.setup()
    render(
      <ProposalShell
        contained
        sections={[{ id: "workspace", label: "Workspace", icon: <span>W</span>, nav: [{ id: "g", label: "Work", items: [{ id: "home", label: "Board", href: "#board" }] }] }, { id: "library", label: "Library", icon: <span>L</span>, nav: [{ id: "g2", items: [{ id: "lib", label: "Past work", href: "#library" }] }] }, { id: "account", label: "Account", icon: <span>A</span>, placement: "secondary", nav: [{ id: "g3", items: [{ id: "me", label: "Profile", href: "#account" }] }] }]}
        activeHref="#board"
        user={{ name: "Inés Soler", email: "ines@bruma.example" }}
        periods={[{ value: "q", label: "This quarter" }]}
        period="q"
        primaryLabel="New opportunity"
        unread={2}
        commandItems={[{ id: "new", label: "Start a draft", group: "Work" }]}
        people={[{ name: "Inés Soler" }]}
      >
        <p>Inside</p>
      </ProposalShell>,
    )
    expect(screen.getByRole("link", { name: "Board" })).toHaveAttribute("aria-current", "page")
    expect(screen.getAllByText("Inés Soler").length).toBeGreaterThan(0)
    expect(screen.getByLabelText("Notifications, 2")).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: /Search/ }))
    expect(screen.getByText("Start a draft")).toBeInTheDocument()
  })

  it("shows four metrics and an action", async () => {
    const user = userEvent.setup()
    const onAction = vi.fn()
    render(
      <ProposalDashboard
        name="Inés"
        now={new Date("2026-04-02T18:30:00Z")}
        locale="es-MX"
        metrics={[{ id: "a", label: "Embudo", value: 240, suffix: " mil", context: "USD", change: "+8%" }, { id: "b", label: "Fuera", value: 6, context: "Abiertas" }, { id: "c", label: "Cierre", value: 42, suffix: "%", context: "Trimestre", sparkline: [1, 2, 3], sparklineLabel: "Cierre" }, { id: "d", label: "Días", value: 9, context: "Mediana", sparkline: [4, 3], sparklineLabel: "Días" }]}
        actions={[{ id: "risk", title: "Plazo corto", description: "Seis contra nueve", tone: "risk", toneLabel: "Riesgo", value: "6 sem", actionLabel: "Revisar" }]}
        trend={{ label: "Horas", series: [{ id: "q", label: "Cotizadas", points: [{ x: "Ene", y: 1 }, { x: "Feb", y: 2 }] }] }}
        trendTitle="Horas"
        gaugeValue={72}
        gaugeLabel="Confianza del precio"
        gaugeLowLabel="Demasiado bajo"
        gaugeTargetLabel="Objetivo"
        activity={[{ id: "e", at: "2026-04-02T12:00:00Z", actor: "Inés", title: "anotó el plazo" }]}
        activityNow={Date.parse("2026-04-02T18:30:00Z")}
        activityTitle="Actividad"
        onAction={onAction}
      />,
    )
    expect(screen.getByText("Embudo")).toBeInTheDocument()
    expect(screen.getByText("Demasiado bajo")).toBeInTheDocument()
    expect(screen.getByText("Objetivo")).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: "Revisar" }))
    expect(onAction).toHaveBeenCalledWith("risk")
  })

  it("asks to analyze only after a client, a type, and a recording", async () => {
    const user = userEvent.setup()
    const onAnalyze = vi.fn()
    render(
      <ProposalOpportunity
        inline
        open
        onOpenChange={() => {}}
        clients={[{ value: "nube", label: "Casa Nube" }]}
        client="nube"
        types={[{ value: "web", label: "Sitio" }]}
        projectType="web"
        file={{ name: "casa-nube.wav", duration: "18:42" }}
        analyzeLabel="Analizar"
        onAnalyze={onAnalyze}
      />,
    )
    expect(screen.getByText("18:42")).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: "Analizar" }))
    expect(onAnalyze).toHaveBeenCalled()
  })

  it("mounts the opportunity dialog when it is open", () => {
    render(
      <ProposalOpportunity
        open
        onOpenChange={() => {}}
        title="Nueva oportunidad"
        clients={[{ value: "nube", label: "Casa Nube" }]}
        client="nube"
        types={[{ value: "web", label: "Sitio" }]}
        projectType="web"
        file={{ name: "casa-nube.wav", duration: "18:42" }}
        analyzeLabel="Analizar"
      />,
    )
    expect(screen.getByRole("dialog", { name: "Nueva oportunidad" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Analizar" })).toBeEnabled()
  })

  it("crossfades by changing the selected workspace tab", async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(
      <ProposalWorkspace crumbs={[{ id: "a", label: "Studio" }, { id: "b", label: "Casa Nube" }]} tabs={[{ id: "summary", label: "Resumen" }, { id: "discovery", label: "Descubrimiento" }]} value="summary" onValueChange={onValueChange} title="Casa Nube">
        <p>Panel</p>
      </ProposalWorkspace>,
    )
    expect(screen.getByRole("tab", { name: "Resumen" })).toHaveAttribute("data-state", "active")
    await user.click(screen.getByRole("tab", { name: "Descubrimiento" }))
    expect(onValueChange).toHaveBeenCalledWith("discovery")
  })

  it("rewrites hours when a clarify answer changes", async () => {
    const user = userEvent.setup()
    const onAnswer = vi.fn()
    render(
      <ProposalClarify questions={questions.slice(0, 1)} answers={{ lang: "one" }} onAnswer={onAnswer} baseHours={66} rate={1400} locale="es-MX" currency="MXN" />,
    )
    expect(screen.getAllByText("66").length).toBeGreaterThan(0)
    await user.click(screen.getByRole("button", { name: "Dos" }))
    expect(onAnswer).toHaveBeenCalledWith("lang", "two")
  })

  it("toggles a scope row and selects a similar project", async () => {
    const user = userEvent.setup()
    const onToggle = vi.fn()
    const onValueChange = vi.fn()
    render(
      <>
        <ProposalScope phases={phase} exclusions={[{ id: "x", label: "Ads" }]} onToggle={onToggle} effortLabel="Effort" />
        <ProposalSimilar
          projects={[{ id: "p", name: "Posada", client: "Posada", revenue: 10, weeks: 2, hours: 3, match: 0.5, phases: [{ id: "a", label: "Build", quoted: 4, actual: 5 }] }]}
          comparison={[{ id: "c", title: "Common", items: ["Calendar"] }, { id: "e", title: "Extra", items: ["Waitlist"] }, { id: "o", title: "Out", items: ["Native app"] }]}
          value="p"
          onValueChange={onValueChange}
        />
      </>,
    )
    await user.click(screen.getByRole("checkbox", { name: "One" }))
    expect(onToggle).toHaveBeenCalledWith("t1")
    expect(screen.getByText("Ads")).toBeInTheDocument()
    await user.click(screen.getByRole("radio", { name: /Posada/ }))
    expect(onValueChange).toHaveBeenCalledWith("p")
  })

  it("shows the estimate total and applies the recommendation", async () => {
    const user = userEvent.setup()
    const onUse = vi.fn()
    render(
      <ProposalEstimate lines={lines.slice(0, 1)} capacity={[{ id: "d", label: "L", load: 0.5 }]} priceMin={1000} priceMax={5000} price={2000} suggested={4000} confidence="Media" receipt={receipt} onUseSuggested={onUse} locale="en-US" currency="USD" />,
    )
    expect(screen.getAllByText("$16,800").length).toBeGreaterThan(0)
    await user.click(screen.getByRole("button", { name: "Use recommendation" }))
    expect(onUse).toHaveBeenCalled()
  })

  it("morphs the chosen risk action into a pressed button", async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    render(
      <ProposalRisks
        resolvedTitle="Noted"
        resolvedBody="Language is parked."
        openTitle="Short timeline"
        openBody="Six weeks was asked."
        requestedWeeks={6}
        historicalWeeks={9}
        actions={[{ id: "hold", label: "Hold" }, { id: "cut", label: "Cut" }]}
        rows={[{ id: "r", asked: "Six weeks", proposed: "Nine weeks", accepted: false }]}
        onSelectAction={onSelect}
        selectedAction="hold"
      />,
    )
    expect(screen.getByRole("button", { name: "Hold" })).toHaveAttribute("aria-pressed", "true")
    await user.click(screen.getByRole("button", { name: "Cut" }))
    expect(onSelect).toHaveBeenCalledWith("cut")
  })

  it("reorders a proposal section from the keyboard", async () => {
    const user = userEvent.setup()
    const onSectionsChange = vi.fn()
    const list: ProposalSection[] = sections.map((section) => ({ ...section }))
    render(
      <ProposalDocument
        sections={list}
        onSectionsChange={onSectionsChange}
        variables={{ client: "Casa Nube" }}
        phases={[{ id: "a", label: "Build", hours: "10 h" }]}
        preflight={[{ id: "p", label: "Price checked", done: true }]}
        onPreflight={() => {}}
        contact={{ name: "Elena Voss", role: "Host", email: "elena@nube.example" }}
        timeline={[{ id: "s", label: "Start" }]}
        readyLabel="Ready to send"
      />,
    )
    expect(screen.getByText("Ready to send")).toBeInTheDocument()
    expect(screen.getByText("Casa Nube")).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: "Reorder Enfoque" }))
    await user.keyboard("{ArrowUp}")
    expect(onSectionsChange).toHaveBeenCalled()
    const next = onSectionsChange.mock.calls.at(-1)?.[0] as ProposalSection[]
    expect(next[0]?.id).toBe("approach")
  })

  it("sends from the dialog and shows the analyze status", async () => {
    const user = userEvent.setup()
    const onSend = vi.fn()
    render(
      <>
        <ProposalAnalyze label="Reading the call" />
        <ProposalSend inline open onOpenChange={() => {}} recipients={[{ value: "elena", label: "Elena" }]} recipient="elena" project="Casa Nube" price="$1" weeks="9" link="https://bruma.example/p/casa-nube" onSend={onSend} />
        <ProposalDiscovery columns={[{ id: "g", title: "Goals", items: [{ id: "n", text: "Fill weekdays", at: 42 }] }]} unknowns={[]} quotes={[]} peaks={[0.2, 0.8, 0.4]} duration={18 * 60 + 42} />
      </>,
    )
    expect(screen.getByText("Reading the call")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "0:42" })).toBeInTheDocument()
    expect(screen.getByRole("slider", { name: "Seek" })).toHaveAttribute("aria-valuemax", "1122")
    await user.click(screen.getByRole("button", { name: "Send" }))
    expect(onSend).toHaveBeenCalled()
  })
})
