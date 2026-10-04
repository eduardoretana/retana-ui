import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { AnnotatedTrendChart } from "@/registry/ui/annotated-trend-chart"
import { AttentionList } from "@/registry/ui/attention-list"
import { BreakdownBar } from "@/registry/ui/breakdown-bar"
import { CaseReview } from "@/registry/blocks/case-review"
import { PriorityBadge, priorityRank } from "@/registry/ui/priority-badge"
import { RadialGauge } from "@/registry/ui/radial-gauge"
import { RankedBars } from "@/registry/ui/ranked-bars"
import { RecordTimeline } from "@/registry/ui/record-timeline"
import { statAccessibleName, StatStrip } from "@/registry/ui/stat-strip"
import { SuggestedChoiceDialog } from "@/registry/ui/suggested-choice-dialog"
import { SuggestionCard } from "@/registry/ui/suggestion-card"
import { TierDistribution } from "@/registry/ui/tier-distribution"
import { WellCard } from "@/registry/ui/well-card"
import { greeting } from "@/registry/lib/dashboard-format"

describe("RadialGauge", () => {
  it("shows the real value and an over-budget state when value exceeds max", () => {
    render(<RadialGauge value={128} max={100} label="Spend" formatter={(value) => `$${value}`} overLabel="Over budget" />)
    const meter = screen.getByRole("meter", { name: "Spend" })
    expect(meter).toHaveAttribute("aria-valuenow", "128")
    expect(meter).toHaveAttribute("aria-valuemin", "0")
    expect(meter).toHaveAttribute("aria-valuemax", "100")
    expect(meter).toHaveAttribute("aria-valuetext", "$128, Over budget")
    expect(meter).toHaveAttribute("data-state", "over")
    expect(screen.getByText("$128")).toBeInTheDocument()
    expect(screen.getByText("Over budget")).toBeInTheDocument()
    expect(meter.querySelector("[data-slot=radial-gauge-needle]")).toHaveAttribute("data-clamped", "true")
  })

  it("keeps a value inside the range unclamped", () => {
    render(<RadialGauge value={40} max={100} label="Budget used" />)
    const meter = screen.getByRole("meter", { name: "Budget used" })
    expect(meter).toHaveAttribute("data-state", "ok")
    expect(meter.querySelector("[data-slot=radial-gauge-needle]")).toHaveAttribute("data-clamped", "false")
    expect(screen.queryByText("Over budget")).not.toBeInTheDocument()
  })
})

describe("TierDistribution", () => {
  const tiers = [
    { id: "low", label: "Low", value: 2, tone: "chart-1" as const },
    { id: "medium", label: "Medium", value: 5, tone: "chart-2" as const },
    { id: "high", label: "High", value: 1, tone: "chart-4" as const },
  ]

  it("moves the selection with arrow keys", async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(<TierDistribution label="Severity" tiers={tiers} defaultValue="low" onValueChange={onValueChange} />)
    const group = screen.getByRole("radiogroup", { name: "Severity" })
    expect(group).toBeInTheDocument()
    const low = screen.getByRole("radio", { name: /Low/ })
    expect(low).toHaveAttribute("aria-checked", "true")
    low.focus()
    await user.keyboard("{ArrowRight}")
    expect(onValueChange).toHaveBeenCalledWith("medium")
    expect(screen.getByRole("radio", { name: /Medium/ })).toHaveAttribute("aria-checked", "true")
    await user.keyboard("{ArrowLeft}")
    expect(screen.getByRole("radio", { name: /Low/ })).toHaveAttribute("aria-checked", "true")
  })
})

describe("SuggestedChoiceDialog", () => {
  it("preselects the suggested option", async () => {
    const user = userEvent.setup()
    const onConfirm = vi.fn()
    render(
      <SuggestedChoiceDialog
        open
        title="Confirm cause"
        options={[
          { id: "cache", label: "Stale cache", suggested: true },
          { id: "race", label: "Retry race" },
        ]}
        onConfirm={onConfirm}
        confirmLabel="Confirm cause"
      />,
    )
    const suggested = screen.getByRole("radio", { name: /Stale cache/ })
    expect(suggested).toBeChecked()
    expect(screen.getByText("Suggested")).toBeInTheDocument()
    suggested.focus()
    await user.keyboard("{ArrowDown}")
    expect(screen.getByRole("radio", { name: /Retry race/ })).toBeChecked()
    await user.click(screen.getByRole("button", { name: "Confirm cause" }))
    expect(onConfirm).toHaveBeenCalledWith("race", {})
  })
})

describe("RankedBars", () => {
  it("sorts by value descending by default", () => {
    render(
      <RankedBars
        items={[
          { id: "a", label: "Alpha", value: 2 },
          { id: "b", label: "Beta", value: 9 },
          { id: "c", label: "Gamma", value: 5 },
        ]}
      />,
    )
    const rows = screen.getAllByRole("listitem")
    expect(rows[0]).toHaveTextContent("Beta")
    expect(rows[1]).toHaveTextContent("Gamma")
    expect(rows[2]).toHaveTextContent("Alpha")
    expect(rows[0]).toHaveAttribute("data-rank", "1")
  })

  it("can keep the given order", () => {
    render(
      <RankedBars
        sort="none"
        items={[
          { id: "a", label: "Alpha", value: 2 },
          { id: "b", label: "Beta", value: 9 },
        ]}
      />,
    )
    const rows = screen.getAllByRole("listitem")
    expect(rows[0]).toHaveTextContent("Alpha")
  })
})

describe("dashboard pieces", () => {
  it("names a well card from its title", () => {
    render(<WellCard title="Open defects">Body</WellCard>)
    expect(screen.getByRole("region", { name: "Open defects" })).toBeInTheDocument()
  })

  it("describes a stat with direction and whether it is better", () => {
    const item = {
      id: "open",
      label: "Open defects",
      value: 18,
      delta: { value: 4, direction: "up" as const, good: "down" as const, label: "+4" },
      caption: "versus the previous 30 days",
    }
    expect(statAccessibleName(item, "en-US")).toContain("worse")
    render(<StatStrip items={[item]} />)
    expect(screen.getByText("+4")).toBeInTheDocument()
  })

  it("ranks priorities and keeps the critical label", () => {
    expect(priorityRank("critical")).toBeGreaterThan(priorityRank("low"))
    render(<PriorityBadge level="critical" />)
    expect(screen.getByText("Critical")).toBeInTheDocument()
  })

  it("offers an empty attention state", () => {
    render(<AttentionList items={[]} emptyLabel="You're all caught up" />)
    expect(screen.getByText("You're all caught up")).toBeInTheDocument()
  })

  it("steps a trend chart with the keyboard and exposes a data table", async () => {
    const user = userEvent.setup()
    render(
      <AnnotatedTrendChart
        label="Reopen rate"
        yFormat="percent"
        series={[
          {
            id: "queue",
            label: "This queue",
            points: [
              { x: "Week 1", y: 0.03 },
              { x: "Week 2", y: 0.05 },
            ],
          },
        ]}
        target={{ y: 0.04, label: "Target 4%" }}
      />,
    )
    const chart = screen.getByRole("img", { name: /Reopen rate/ })
    chart.focus()
    await user.keyboard("{ArrowRight}")
    expect(document.querySelector("[data-slot=annotated-trend-tooltip]")).toHaveTextContent("Week 1")
    expect(screen.getByRole("table", { name: /Reopen rate/ })).toBeInTheDocument()
  })

  it("dims the other breakdown segments on focus", async () => {
    const user = userEvent.setup()
    render(
      <BreakdownBar
        total={10}
        format="number"
        segments={[
          { id: "a", label: "Engineering", value: 7 },
          { id: "b", label: "Credits", value: 3 },
        ]}
      />,
    )
    await user.tab()
    const dimmed = document.querySelector("[data-segment=b]")
    expect(dimmed).toHaveAttribute("data-dim", "true")
  })

  it("orders a record timeline from oldest to newest", () => {
    render(
      <RecordTimeline
        events={[
          { id: "later", title: "Canary", date: "2026-04-02" },
          { id: "earlier", title: "Opened", date: "2026-03-01" },
        ]}
      />,
    )
    const items = screen.getAllByRole("listitem")
    expect(items[0]).toHaveTextContent("Opened")
    expect(items[1]).toHaveTextContent("Canary")
  })

  it("announces a confirmed suggestion", () => {
    render(<SuggestionCard title="Suggested cause" suggestion="Stale cache" status="confirmed" confirmedBy="Inés" />)
    expect(screen.getByText("Confirmed")).toBeInTheDocument()
    expect(screen.getByRole("article", { name: /Confirmed/ })).toBeInTheDocument()
  })

  it("greets in Spanish in the morning", () => {
    expect(greeting(new Date("2026-04-08T09:30:00"), "es-MX", "Inés")).toBe("Buenos días, Inés")
  })
})

describe("CaseReview", () => {
  it("confirms a suggestion and undoes it", async () => {
    const user = userEvent.setup()
    const onConfirm = vi.fn()
    const onUndo = vi.fn()
    render(
      <CaseReview
        title="Checkout stays pending"
        timeline={[]}
        suggestion={{ title: "Suggested cause", suggestion: "Stale cache" }}
        choices={[
          { id: "cache", label: "Stale cache", suggested: true },
          { id: "other", label: "Other" },
        ]}
        dialogTitle="Confirm cause"
        confirmLabel="Confirm cause"
        costTotal={10}
        costSegments={[{ id: "time", label: "Time", value: 10 }]}
        onConfirm={onConfirm}
        onUndo={onUndo}
      />,
    )
    await user.click(screen.getByRole("button", { name: "Confirm cause" }))
    const suggested = screen.getByRole("radio", { name: /Stale cache/ })
    expect(suggested).toBeChecked()
    suggested.focus()
    const confirmButtons = screen.getAllByRole("button", { name: "Confirm cause" })
    await user.click(confirmButtons[confirmButtons.length - 1])
    expect(onConfirm).toHaveBeenCalledWith("cache", {})
    expect(screen.getByRole("status")).toHaveTextContent("Choice saved")
    await user.click(screen.getByRole("button", { name: "Undo" }))
    expect(onUndo).toHaveBeenCalled()
    expect(document.querySelector("[data-slot=case-review]")).toHaveAttribute("data-phase", "suggested")
  })
})
