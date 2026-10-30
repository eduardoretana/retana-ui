import fs from "node:fs"
import path from "node:path"

import { fireEvent, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { ChartCard, ChartKpi, ChartLegend } from "@/registry/ui/chart-card"

import { ComboChart } from "@/registry/ui/combo-chart"
import { CoupledLines } from "@/registry/ui/coupled-lines"
import { DotMeter } from "@/registry/ui/dot-meter"
import { FlowSankey } from "@/registry/ui/flow-sankey"
import { HexHeatmap } from "@/registry/ui/hex-heatmap"
import { IsoBars } from "@/registry/ui/iso-bars"
import { PolarArea } from "@/registry/ui/polar-area"
import { RangeLanes } from "@/registry/ui/range-lanes"
import { RangePlan } from "@/registry/ui/range-plan"
import { ScrubArea } from "@/registry/ui/scrub-area"
import { SegmentGauge } from "@/registry/ui/segment-gauge"
import { StackedColumns } from "@/registry/ui/stacked-columns"

const series = [
  { id: "sun", label: "Sun", value: 10 },
  { id: "shade", label: "Shade", value: 30 },
]
const cells = [
  { id: "a", q: 0, r: 0, seriesId: "sun", weight: 1 },
  { id: "b", q: 1, r: 0, seriesId: "shade", weight: 0.4 },
]

describe("chart family states", () => {
  it("names a chart and offers empty, loading, and error", () => {
    const { rerender } = render(<HexHeatmap title="Sun map" series={[]} cells={[]} />)
    expect(screen.getByRole("heading", { name: "Sun map" })).toBeInTheDocument()
    expect(screen.getByRole("status")).toHaveTextContent("Nothing to show yet")
    rerender(<HexHeatmap title="Sun map" status="loading" series={series} cells={cells} />)
    expect(screen.getByRole("status")).toHaveTextContent("Loading")
    rerender(<HexHeatmap title="Sun map" status="error" series={series} cells={cells} onRetry={() => undefined} labels={{ retry: "Try again" }} />)
    expect(screen.getByRole("alert")).toHaveTextContent("Could not load this chart")
    expect(screen.getByRole("button", { name: "Try again" })).toBeInTheDocument()
  })

  it("highlights a series from the legend and keeps a data table", async () => {
    const user = userEvent.setup()
    const onActiveChange = vi.fn()
    const { container } = render(<HexHeatmap title="Sun map" series={series} cells={cells} onActiveChange={onActiveChange} locale="es-MX" />)
    expect(container.querySelector("table")).toHaveTextContent("Sun")
    const legend = container.querySelectorAll<HTMLButtonElement>("[data-slot='chart-legend-item']")
    expect(legend).toHaveLength(2)
    legend[1]?.focus()
    await user.keyboard("{ArrowLeft}")
    expect(onActiveChange).toHaveBeenCalled()
    expect(container.querySelector("style")?.textContent).toContain("prefers-reduced-motion: reduce")
  })

  it("updates the plan readout from the slider", () => {
    const onValueChange = vi.fn()
    render(<RangePlan title="Hours" min={0} max={40} defaultValue={10} suffix="h" onValueChange={onValueChange} locale="en-US" />)
    const slider = screen.getByRole("slider", { name: "Choose an amount" })
    slider.focus()
    expect(slider).toHaveFocus()
    fireEvent.change(slider, { target: { value: "14" } })
    expect(onValueChange).toHaveBeenCalledWith(14)
    expect(screen.getAllByText("14 h").length).toBeGreaterThan(0)
  })

  it("renders the other ten patterns with an accessible name", () => {
    const { rerender } = render(
      <FlowSankey
        title="Water"
        nodes={[
          { id: "a", label: "A", column: 0 },
          { id: "b", label: "B", column: 1 },
        ]}
        links={[{ id: "l", source: "a", target: "b", value: 4 }]}
      />,
    )
    expect(screen.getByRole("heading", { name: "Water" })).toBeInTheDocument()
    rerender(<IsoBars title="Harvest" periods={[{ id: "m", label: "Month", points: [{ key: "jan", label: "January", value: 3 }] }]} />)
    expect(screen.getByRole("heading", { name: "Harvest" })).toBeInTheDocument()
    rerender(<SegmentGauge title="Occupancy" segments={[{ id: "beds", label: "Beds", value: 4 }]} limit={10} />)
    expect(screen.getByRole("slider", { name: "Occupancy" })).toBeInTheDocument()
    rerender(
      <StackedColumns
        title="Types"
        series={[{ id: "leaf", label: "Leaf" }]}
        periods={[{ id: "week", label: "Week", points: [{ key: "mon", label: "Monday", values: { leaf: 2 } }] }]}
      />,
    )
    expect(screen.getByRole("heading", { name: "Types" })).toBeInTheDocument()
    rerender(<DotMeter title="Beds" value={2} limit={4} cells={4} />)
    expect(screen.getAllByRole("option").length).toBe(4)
    rerender(
      <ComboChart
        title="Visits"
        points={[{ key: "mon", label: "Monday", bar: 2, line: 1, parts: [{ id: "leaf", label: "Leaf", value: 2 }] }]}
        units={[
          { id: "kg", label: "kg", suffix: "kg" },
          { id: "lb", label: "lb", suffix: "lb", scale: 2 },
        ]}
      />,
    )
    expect(screen.getByRole("heading", { name: "Visits" })).toBeInTheDocument()
    rerender(
      <CoupledLines
        title="Moisture"
        categories={[{ key: "mon", label: "Monday" }]}
        series={[{ id: "north", label: "North", points: [{ key: "mon", value: 3 }] }]}
      />,
    )
    expect(screen.getByRole("heading", { name: "Moisture" })).toBeInTheDocument()
    rerender(<RangeLanes title="Season" lanes={[{ id: "tomato", label: "Tomato", start: 2, end: 6 }]} />)
    expect(screen.getByRole("option", { name: /Tomato/ })).toBeInTheDocument()
    rerender(
      <PolarArea
        title="Rose"
        series={[{ id: "north", label: "North", value: 4, wedges: [{ id: "mon", label: "Monday", value: 4 }] }]}
      />,
    )
    expect(screen.getByRole("heading", { name: "Rose" })).toBeInTheDocument()
    rerender(<ScrubArea title="Running" periods={[{ id: "y", label: "2026", points: [{ key: "jan", label: "January", value: 8 }] }]} />)
    expect(screen.getByRole("slider", { name: "Move through the series" })).toHaveAttribute("aria-valuetext", "January: 8")
  })

  it("splits the kpi and keeps one card surface", () => {
    const { container, rerender } = render(<ChartKpi label="Saldo" figure={{ value: 1234.5, locale: "es-MX", hierarchy: true, announce: true }} />)
    expect(container.querySelector("[data-slot=chart-kpi-integer]")).toHaveTextContent("1,234")
    expect(container.querySelector("[data-slot=chart-kpi-fraction]")).toHaveTextContent(".5")
    expect(screen.getByText("1,234.5")).toBeInTheDocument()
    rerender(<ChartKpi label="Balance" figure={{ value: 1234.5, locale: "en-US" }} />)
    expect(screen.getByText("1,234.5")).toBeInTheDocument()
    rerender(
      <ChartCard title="Cosecha" description="Kilos de la semana" summary="Resumen" status="empty">
        <span>plot</span>
      </ChartCard>,
    )
    const root = container.querySelector("[data-slot=chart-card]")
    expect(root?.className).not.toContain("shadow-sm")
    expect(root?.className).not.toContain("rounded-2xl")
    expect(container.querySelector("[data-slot=chart-state]")?.className).toContain("bg-muted")
    expect(container.querySelector("[data-slot=chart-state]")?.className).not.toContain("border-dashed")
    expect(container.querySelector("[data-slot=chart-card-title]")?.parentElement?.className).toContain("max-w-[17.5rem]")
  })

  it("uses scale and a quiet delta instead of layout animation", () => {
    const { container, rerender } = render(
      <ComboChart title="Visits" points={[{ key: "mon", label: "Monday", bar: 2.5, line: 1 }]} locale="en-US" />,
    )
    expect(container.querySelector("[data-slot=combo-bar]")).toHaveAttribute("data-origin", "baseline")
    expect(container.innerHTML).not.toContain("clip-path")
    rerender(<RangePlan title="Hours" min={0} max={40} defaultValue={10} suffix="h" locale="en-US" />)
    expect(container.querySelector("[data-slot=range-plan-fill]")?.getAttribute("style")).toContain("scaleX")
    rerender(<ScrubArea title="Running" periods={[{ id: "y", label: "2026", points: [{ key: "jan", label: "January", value: 8 }] }]} />)
    expect(container.querySelector("[data-slot=scrub-area-shape]")).toBeTruthy()
    expect(container.querySelector("[data-slot=chart-kpi][data-emphasis=quiet]")).toBeTruthy()
    expect(container.innerHTML).not.toContain("clipPath")
    rerender(
      <SegmentGauge title="Occupancy" segments={[{ id: "beds", label: "Beds", value: 4 }, { id: "paths", label: "Paths", value: 2 }]} limit={10} />,
    )
    expect(container.querySelector("[data-slot=gauge-used]")?.getAttribute("style")).toContain("scaleX")
    expect(container.querySelector("[data-slot=gauge-segment]")?.getAttribute("style")).not.toContain("width")
    rerender(<ChartLegend label="Series" items={[{ id: "a", label: "Sun", tone: 0 }]} />)
    expect(container.querySelector("[data-slot=chart-legend-item]")?.className).toContain("rounded-md")
    expect(container.querySelector("[data-slot=chart-legend-item]")?.className).not.toContain("rounded-full")
  })
})

describe("chart motion sources", () => {
  const root = path.resolve(__dirname, "../registry/ui")
  const files = [
    "chart-card.tsx",
    "combo-chart.tsx",
    "stacked-columns.tsx",
    "iso-bars.tsx",
    "range-plan.tsx",
    "segment-gauge.tsx",
    "scrub-area.tsx",
    "range-lanes.tsx",
    "coupled-lines.tsx",
    "dot-meter.tsx",
    "flow-sankey.tsx",
    "hex-heatmap.tsx",
    "polar-area.tsx",
  ]

  it("keeps continuity on transform and opacity", () => {
    for (const file of files) {
      const source = fs.readFileSync(path.join(root, file), "utf8")
      expect(source, file).not.toContain("transition-all")
      expect(source, file).not.toContain("clipPath")
      expect(source, file).not.toMatch(/animate=\{\{[^}]*\bheight\b/)
      expect(source, file).not.toMatch(/animate=\{\{[^}]*\bwidth\b/)
    }
    const stacked = fs.readFileSync(path.join(root, "stacked-columns.tsx"), "utf8")
    expect(stacked).not.toContain("${currentId}-${point.key}")
    const iso = fs.readFileSync(path.join(root, "iso-bars.tsx"), "utf8")
    expect(iso).not.toContain("${currentId}-${point.key}")
    expect(fs.readFileSync(path.join(root, "hex-heatmap.tsx"), "utf8")).toContain("max-w-sm")
  })
})
