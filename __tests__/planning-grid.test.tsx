import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it } from "vitest"

import { applyGrowth, outlookOf, spread, variance } from "@/registry/lib/planning-grid"
import { PlanningGrid } from "@/registry/ui/planning-grid"
import { lockedRows, periods as planPeriods, planRows } from "@/app/examples/planning-grid/fixtures"

describe("planning grid", () => {
  it("spreads a total around locks and adds actual to forecast", () => {
    expect(spread(100, [1, 1, 2], [40, null, null])).toEqual([40, 20, 40])
    const periods = [
      { id: "a", label: "A", kind: "actual" as const },
      { id: "f", label: "F", kind: "forecast" as const },
    ]
    expect(outlookOf({ a: 10, f: 4 }, periods)).toEqual({ actual: 10, forecast: 4, outlook: 14 })
    expect(variance(14, 12)).toBe(2)
    const locked = lockedRows()[0]
    const grown = locked ? applyGrowth(locked, planPeriods("en"), 0.5, { m7: 1, m8: 1, m9: 1, m10: 1, m11: 1, m12: 1 }) : null
    const ana = grown?.children?.find((child) => child.id === "ana")
    expect(ana?.values.m7).toBe(locked?.children?.find((child) => child.id === "ana")?.values.m7)
  })

  it("opens a group and shows the forecast cutoff", async () => {
    const user = userEvent.setup()
    render(<PlanningGrid rows={planRows()} periods={planPeriods("en")} />)
    expect(screen.getByText(/· Jul/)).toBeInTheDocument()
    expect(screen.getByText("Ana Solís")).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: "Close Norte" }))
    expect(screen.queryByText("Ana Solís")).not.toBeInTheDocument()
  })
})
