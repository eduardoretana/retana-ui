import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { filled as inboxFilled, INBOX_NOW, tasksFrom } from "@/app/examples/agent-inbox/fixtures"
import { blocksFrom, filled as lanesFilled, LANE_WINDOW } from "@/app/examples/agent-lanes/fixtures"
import { filled as planFilled, stepsFrom as planSteps } from "@/app/examples/agent-plan/fixtures"
import { filled as actualFilled, stepsFrom as actualSteps } from "@/app/examples/plan-vs-actual/fixtures"
import { filled as traceFilled, spansFrom } from "@/app/examples/trace-waterfall/fixtures"
import { AgentInbox, inboxAgeMinutes, inboxCount } from "@/registry/ui/agent-inbox"
import { AgentLanes, laneLoad } from "@/registry/ui/agent-lanes"
import { AgentPlan, planMinutes } from "@/registry/ui/agent-plan"
import { ApprovalCard, gateClock, gateExpired } from "@/registry/ui/approval-card"
import { PlanVsActual, planCourse } from "@/registry/ui/plan-vs-actual"
import { TraceWaterfall, traceTotals } from "@/registry/ui/trace-waterfall"

describe("agent inbox", () => {
  it("counts what is waiting and approves the deposit", async () => {
    const user = userEvent.setup()
    const onApprove = vi.fn()
    const tasks = tasksFrom(inboxFilled.seeds, "en")
    expect(inboxCount(tasks, "needs-you")).toBe(1)
    expect(inboxAgeMinutes(INBOX_NOW - 2 * 60_000, INBOX_NOW)).toBe(2)
    render(<AgentInbox tasks={tasks} now={INBOX_NOW} openIds={["anticipo"]} onApprove={onApprove} />)
    expect(screen.getByText("1 waiting on you")).toBeInTheDocument()
    expect(screen.getByText("Stopped before sending it")).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: "Approve “Deposit for Cerámica del Bajío”" }))
    expect(onApprove).toHaveBeenCalledWith("anticipo")
  })
})

describe("agent plan", () => {
  it("counts the minutes still ahead and moves a step up", async () => {
    const user = userEvent.setup()
    const onMove = vi.fn()
    const steps = planSteps(planFilled.seeds, "en")
    expect(planMinutes(steps)).toBe(6 + 20 + 15)
    const view = render(<AgentPlan steps={steps} onMove={onMove} onRemove={() => {}} />)
    await user.click(screen.getByRole("button", { name: "Move “Photo of kiln 2” up" }))
    expect(onMove).toHaveBeenCalledWith("foto", -1)
    view.unmount()
    render(<AgentPlan error="The plan could not be read." />)
    expect(screen.queryByRole("button", { name: "Add a step" })).not.toBeInTheDocument()
  })
})

describe("plan vs actual", () => {
  it("shifts the finish when the deposit runs long", () => {
    const steps = actualSteps(actualFilled.seeds, "es")
    expect(planCourse(steps)).toMatchObject({ plannedMin: 60, expectedMin: 63, slipMin: 3 })
    render(<PlanVsActual steps={actualSteps(actualFilled.seeds, "en")} />)
    expect(screen.getByText("3 min over")).toBeInTheDocument()
    expect(screen.getByText("Over the plan")).toBeInTheDocument()
  })
})

describe("trace waterfall", () => {
  it("marks the slowest leaf and folds its parent", async () => {
    const user = userEvent.setup()
    const spans = spansFrom(traceFilled.seeds, "en")
    expect(traceTotals(spans)).toMatchObject({ durationMs: 4800, costCents: 100, slowestId: "precio", errors: 0 })
    render(<TraceWaterfall spans={spans} />)
    expect(screen.getByText("Slowest step")).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: "Fold “Quote PED-1048”" }))
    expect(screen.queryByText("Price the cobalt glaze")).not.toBeInTheDocument()
  })
})

describe("agent lanes", () => {
  it("sees who is working and approves the deposit", async () => {
    const user = userEvent.setup()
    const onApprove = vi.fn()
    const blocks = blocksFrom(lanesFilled.seeds, "en")
    expect(laneLoad("horno", blocks, LANE_WINDOW.nowMin)).toBe("work")
    expect(laneLoad("caja", blocks, LANE_WINDOW.nowMin)).toBe("ask")
    expect(laneLoad("bruma", blocks, LANE_WINDOW.nowMin)).toBe("idle")
    render(<AgentLanes agents={[...lanesFilled.agents]} blocks={blocks} window={LANE_WINDOW} onApprove={onApprove} />)
    expect(screen.getByText("Then Horno")).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: "Approve “Deposit of $18,400.00 MXN”" }))
    expect(onApprove).toHaveBeenCalledWith("anticipo")
  })
})

describe("approval card", () => {
  it("pauses the clock and does not send when the clock runs out", async () => {
    const user = userEvent.setup()
    const onHold = vi.fn()
    const onDecline = vi.fn()
    expect(gateClock(4 * 60)).toBe("4:00")
    expect(gateExpired({ id: "anticipo", status: "open", secondsLeft: 0 })).toBe(true)
    const proposal = {
      id: "anticipo",
      title: "Send the deposit",
      preview: "SPEI transfer of $18,400.00 MXN",
      risk: "high" as const,
      secondsLeft: 240,
      status: "open" as const,
    }
    const { rerender } = render(<ApprovalCard proposal={proposal} onHold={onHold} onDecline={onDecline} onApprove={() => {}} />)
    expect(screen.getByText("4:00")).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: "Pause the clock" }))
    expect(onHold).toHaveBeenCalledWith("anticipo")
    rerender(<ApprovalCard proposal={{ ...proposal, secondsLeft: 0 }} onHold={onHold} onDecline={onDecline} onApprove={() => {}} />)
    expect(screen.getByText("Nothing was sent. It stays here until you approve it.")).toBeInTheDocument()
    expect(screen.queryByRole("button", { name: "Pause the clock" })).not.toBeInTheDocument()
    screen.getByRole("region", { name: "Before it goes out" }).focus()
    await user.keyboard("{Escape}")
    expect(onDecline).toHaveBeenCalledWith("anticipo")
  })
})
