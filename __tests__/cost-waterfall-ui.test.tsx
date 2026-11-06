import type { ComponentProps } from "react"
import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { examplePricing, filledRun, stepErrorRun } from "@/app/examples/cost-waterfall/example-data"
import { useCostRun } from "@/registry/hooks/use-cost-run"
import { createRun, type RunEvent } from "@/registry/lib/cost-waterfall"
import { CostWaterfall, costWaterfallLabelsEn } from "@/registry/ui/cost-waterfall"

function renderRun(extra?: Partial<ComponentProps<typeof CostWaterfall>>) {
  return render(<CostWaterfall run={filledRun("en")} pricing={examplePricing} labels={costWaterfallLabelsEn} money={{ locale: "en-US", currency: "USD" }} {...extra} />)
}

describe("CostWaterfall", () => {
  it("shows the total, the cache savings, and the top step", () => {
    renderRun()
    expect(screen.getByText("Total cost")).toBeInTheDocument()
    expect(screen.getByText(/Cache savings/)).toBeInTheDocument()
    expect(screen.getByText("TOP")).toBeInTheDocument()
    expect(screen.getAllByRole("button", { name: /Review the close/ }).length).toBeGreaterThan(0)
  })

  it("switches the measure to tokens", async () => {
    const user = userEvent.setup()
    renderRun()
    await user.click(screen.getByRole("button", { name: "Tokens" }))
    expect(screen.getByRole("treegrid").closest("[data-mode]")).toHaveAttribute("data-mode", "tokens")
  })

  it("opens input and output from the row and from the keyboard", async () => {
    const user = userEvent.setup()
    renderRun()
    const grid = screen.getByRole("treegrid")
    const plan = within(grid).getByRole("button", { name: /Plan the summary/ })
    await user.click(plan)
    expect(screen.getByText("Split the file into three points.")).toBeInTheDocument()
    plan.focus()
    await user.keyboard("{ArrowDown}")
    expect(within(grid).getByRole("button", { name: /Search the prior note/ })).toHaveFocus()
    await user.keyboard("{Enter}")
    expect(screen.getByText("query: example file")).toBeInTheDocument()
  })

  it("auto-expands a failed step and keeps the message", async () => {
    render(<CostWaterfall run={stepErrorRun("en")} pricing={examplePricing} labels={costWaterfallLabelsEn} defaultCollapsed={["root"]} />)
    expect(await screen.findByText("The example file rejected the write.")).toBeInTheDocument()
    expect(screen.getByRole("treegrid").querySelector("[data-status='error']")).toBeTruthy()
  })

  it("exports json and hides the waterfall", async () => {
    const user = userEvent.setup()
    const create = vi.fn(() => "blob:cost")
    vi.stubGlobal("URL", { ...URL, createObjectURL: create, revokeObjectURL: vi.fn() })
    renderRun()
    await user.click(screen.getByRole("button", { name: "Export JSON" }))
    expect(create).toHaveBeenCalled()
    await user.click(screen.getByRole("button", { name: "Hide waterfall" }))
    expect(screen.getByRole("button", { name: "Show waterfall" })).toBeInTheDocument()
    vi.unstubAllGlobals()
  })
})

function StreamProbe({ events }: { events: AsyncIterable<RunEvent> }) {
  const stream = useCostRun(createRun({ id: "s", title: "stream" }), events)
  return <p>{stream.run.steps.map((step) => step.status).join(",") || "empty"}</p>
}

describe("useCostRun", () => {
  it("applies an async stream", async () => {
    async function* events(): AsyncGenerator<RunEvent> {
      yield { type: "step.started", at: 1, stepId: "a", name: "A", kind: "llm" }
      yield { type: "step.completed", at: 2, stepId: "a" }
    }
    render(<StreamProbe events={events()} />)
    expect(await screen.findByText("success")).toBeInTheDocument()
  })
})
