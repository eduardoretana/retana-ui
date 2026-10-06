import { useState } from "react"
import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterAll, beforeAll, describe, expect, it } from "vitest"

import { ReviewDesk } from "@/registry/blocks/review-desk"
import { bruma, costa, lumen } from "@/app/examples/review/presets"
import { BreakdownBar } from "@/registry/ui/breakdown-bar"
import { ConfidenceBadge } from "@/registry/ui/confidence-badge"
import { IssueList } from "@/registry/ui/issue-list"
import { PriorityBadge } from "@/registry/ui/priority-badge"
import { RadialGauge } from "@/registry/ui/radial-gauge"
import { StatusPill } from "@/registry/ui/status-pill"
import { initialDeskState, requiredChecked, scoreFor } from "@/registry/lib/review-desk"

describe("review desk model", () => {
  it("swaps the score snapshot and gates required choices", () => {
    expect(scoreFor(costa, false).value).toBe(64)
    expect(scoreFor(costa, true).value).toBe(88)
    expect(requiredChecked(costa.fixOptions, { note: false, history: true })).toBe(false)
    expect(requiredChecked(costa.fixOptions, { note: true, history: true })).toBe(true)
    expect(initialDeskState(costa).recordId).toBe("harbor")
    expect(initialDeskState(costa).view).toBe("overview")
  })
})

describe("review pieces", () => {
  it("renders a status pill from its label", () => {
    render(<StatusPill label="In review" tone="warning" />)
    expect(screen.getByText("In review")).toBeInTheDocument()
  })

  it("moves the issue list with the arrow keys", async () => {
    const user = userEvent.setup()
    function Harness() {
      const [value, setValue] = useState("a")
      return <IssueList label="Findings" value={value} onValueChange={setValue} items={items} />
    }
    render(<Harness />)
    screen.getByRole("option", { name: /Alpha/ }).focus()
    await user.keyboard("{ArrowDown}")
    expect(screen.getByRole("option", { name: /Beta/ })).toHaveAttribute("aria-selected", "true")
  })

  it("keeps the priority pill free of the default glyph", () => {
    const { container } = render(<PriorityBadge level="high" variant="pill" />)
    const pill = container.querySelector("[data-variant=pill]")
    expect(pill).toHaveTextContent("High")
    expect(pill?.querySelector("svg")).toBeNull()
  })

  it("draws confidence as dots or segments", () => {
    const { rerender } = render(<ConfidenceBadge score={0.5} variant="dots" />)
    expect(screen.getByRole("meter")).toHaveAttribute("data-variant", "dots")
    rerender(<ConfidenceBadge score={0.92} variant="segments" />)
    expect(screen.getByRole("meter")).toHaveAttribute("data-variant", "segments")
  })

  it("omits the needle on the tick gauge", () => {
    const { container } = render(<RadialGauge value={40} max={100} label="Score" variant="ticks" />)
    expect(container.querySelector("[data-variant=ticks]")).toBeTruthy()
    expect(container.querySelector("[data-slot=radial-gauge-needle]")).toBeNull()
  })

  it("renders the pipeline breakdown", () => {
    const { container } = render(
      <BreakdownBar
        variant="pipeline"
        label="Pipeline"
        total={3}
        format="number"
        segments={[
          { id: "a", label: "Open", value: 2 },
          { id: "b", label: "Done", value: 1 },
        ]}
      />,
    )
    expect(container.querySelector("[data-variant=pipeline]")).toBeTruthy()
    expect(screen.getByText("Open")).toBeInTheDocument()
  })
})

const items = [
  { id: "a", title: "Alpha", severity: "critical" as const },
  { id: "b", title: "Beta", severity: "pass" as const },
]

describe("review desk presets", () => {
  const previous = window.matchMedia
  beforeAll(() => {
    window.matchMedia = (query: string) => ({
      matches: query.includes("prefers-reduced-motion"),
      media: query,
      onchange: null,
      addListener: () => undefined,
      removeListener: () => undefined,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
      dispatchEvent: () => false,
    })
  })
  afterAll(() => {
    window.matchMedia = previous
  })

  it("renders the solar and sales presets", () => {
    const solar = render(<ReviewDesk config={lumen} />)
    expect(screen.getByText("Taller Lumen")).toBeInTheDocument()
    expect(screen.getAllByText("Azotea Marea").length).toBeGreaterThan(0)
    solar.unmount()
    render(<ReviewDesk config={bruma} />)
    expect(screen.getByText("Estudio Bruma")).toBeInTheDocument()
    expect(screen.getAllByText("Hotel Níspero").length).toBeGreaterThan(0)
  })

  it("reviews a credit file through apply, undo, and approve", async () => {
    const user = userEvent.setup()
    render(<ReviewDesk config={costa} />)
    expect(screen.getByRole("switch", { name: "Assistant" })).toBeChecked()
    await user.click(screen.getByRole("switch", { name: "Assistant" }))
    expect(screen.getByRole("switch", { name: "Assistant" })).not.toBeChecked()

    await user.click(screen.getByRole("button", { name: /^Files/ }))
    expect(screen.getByRole("heading", { name: "Files" })).toBeInTheDocument()

    await user.click(screen.getAllByRole("button", { name: "Harbor line" })[0])
    await user.click(screen.getByRole("tab", { name: /^Documents/ }))
    await user.click(screen.getAllByRole("button", { name: "Income letter" })[0])
    expect(screen.getByRole("heading", { name: "Income gap" })).toBeInTheDocument()

    await user.click(screen.getAllByRole("button", { name: "Fix with assistant" })[0])
    const fix = await screen.findByRole("dialog")
    const apply = within(fix).getByRole("button", { name: "Apply change" })
    expect(apply).toBeDisabled()
    await user.click(within(fix).getByRole("checkbox", { name: "I reviewed the income note" }))
    expect(apply).toBeEnabled()
    await user.click(apply)

    expect(await screen.findByText("Change waiting")).toBeInTheDocument()
    expect(screen.getAllByText("88").length).toBeGreaterThan(0)
    await user.click(screen.getByRole("button", { name: "Undo change" }))
    expect(screen.getAllByText("Income gap").length).toBeGreaterThan(0)

    await user.click(screen.getByRole("tab", { name: "Credit file" }))
    await user.click(screen.getAllByRole("button", { name: "Approve file" })[0])
    const submit = await screen.findByRole("dialog")
    const approve = within(submit).getByRole("button", { name: "Approve" })
    expect(approve).toBeDisabled()
    await user.click(within(submit).getByRole("checkbox", { name: "I confirm this decision" }))
    expect(approve).toBeEnabled()
    await user.click(approve)
    expect(await screen.findByText("File approved")).toBeInTheDocument()
  })
})
