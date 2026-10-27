import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { changesFrom, filled as ledgerFilled, LEDGER_NOW } from "@/app/examples/agent-ledger/fixtures"
import { filled as boardFilled, tasksFrom } from "@/app/examples/delegate-board/fixtures"
import { AgentLedger, ledgerAgeMinutes, ledgerImpact } from "@/registry/ui/agent-ledger"
import { AgentQueue, queueBacklog } from "@/registry/ui/agent-queue"
import { AgentSteering } from "@/registry/ui/agent-steering"
import { AutonomyDial, actionAsksFirst } from "@/registry/ui/autonomy-dial"
import { DecisionInbox, openDecisionCount } from "@/registry/ui/decision-inbox"
import { DelegateBoard, agentLoad, firstFreeAssignments, formatClock } from "@/registry/ui/delegate-board"

describe("agent queue", () => {
  it("counts waiting jobs and retries a failed one", async () => {
    const user = userEvent.setup()
    const onRetry = vi.fn()
    const jobs = [
      { id: "a", title: "Foto", lane: "queued" as const },
      { id: "b", title: "Aviso", lane: "failed" as const },
    ]
    render(<AgentQueue jobs={jobs} onRetry={onRetry} />)
    expect(queueBacklog(jobs)).toBe(1)
    expect(screen.getByText("1 waiting")).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: "Try again" }))
    expect(onRetry).toHaveBeenCalledWith("b")
  })

  it("holds and releases the workers", async () => {
    const user = userEvent.setup()
    const onPause = vi.fn()
    const onResume = vi.fn()
    const { rerender } = render(<AgentQueue jobs={[]} workers={[{ id: "bruma", name: "Bruma", slots: 1 }]} paused={false} onPause={onPause} onResume={onResume} />)
    await user.click(screen.getByRole("button", { name: "Hold workers" }))
    expect(onPause).toHaveBeenCalledOnce()
    rerender(<AgentQueue jobs={[]} workers={[{ id: "bruma", name: "Bruma", slots: 1 }]} paused onPause={onPause} onResume={onResume} />)
    await user.click(screen.getByRole("button", { name: "Let workers continue" }))
    expect(onResume).toHaveBeenCalledOnce()
  })
})

describe("agent ledger", () => {
  it("reverts reversible dependents and leaves what cannot be undone", () => {
    const changes = changesFrom(ledgerFilled.changes, "es")
    expect(ledgerImpact(changes, "precio")).toEqual({ revert: ["precio", "factura"], stays: ["envio", "nota"] })
    expect(ledgerImpact(changes, "envio").revert).toEqual([])
    expect(ledgerAgeMinutes(LEDGER_NOW - 2 * 60_000, LEDGER_NOW)).toBe(2)
  })

  it("announces the chain and undoes it", async () => {
    const user = userEvent.setup()
    const onUndo = vi.fn()
    render(<AgentLedger changes={changesFrom(ledgerFilled.changes, "en")} now={LEDGER_NOW} onUndo={onUndo} />)
    const undo = screen.getByRole("button", { name: "Undo Cobalt glaze price" })
    expect(screen.getAllByText("Also reverts 1 later change").length).toBeGreaterThan(0)
    expect(screen.getAllByText("2 later changes stay").length).toBeGreaterThan(0)
    await user.click(undo)
    expect(onUndo).toHaveBeenCalledWith(["precio", "factura"])
  })
})

describe("agent steering", () => {
  it("queues on enter and applies on ctrl enter", async () => {
    const user = userEvent.setup()
    const onQueue = vi.fn()
    const onInterrupt = vi.fn()
    render(
      <AgentSteering
        title="Quote"
        steps={[{ id: "a", title: "Draft", status: "active" }]}
        onQueue={onQueue}
        onInterrupt={onInterrupt}
      />,
    )
    const field = screen.getByRole("textbox", { name: "Note for the agent" })
    await user.type(field, "Use cobalt")
    await user.keyboard("{Enter}")
    expect(onQueue).toHaveBeenCalledWith("Use cobalt")
    await user.type(field, "Send it")
    await user.keyboard("{Control>}{Enter}{/Control}")
    expect(onInterrupt).toHaveBeenCalledWith("Send it", undefined)
  })
})

describe("autonomy dial", () => {
  it("splits safe work from the rest and a lock always asks", async () => {
    const user = userEvent.setup()
    const onLevelChange = vi.fn()
    const onPinnedChange = vi.fn()
    const actions = [
      { id: "draft", label: "Save draft", risk: "safe" as const },
      { id: "pay", label: "Send deposit", risk: "destructive" as const },
    ]
    expect(actionAsksFirst(actions[0]!, 1, [])).toBe(false)
    expect(actionAsksFirst(actions[1]!, 1, [])).toBe(true)
    expect(actionAsksFirst(actions[1]!, 2, ["pay"])).toBe(true)
    render(<AutonomyDial actions={actions} level={1} pinned={[]} onLevelChange={onLevelChange} onPinnedChange={onPinnedChange} />)
    expect(screen.getByRole("radio", { name: "Ask unless it is safe" })).toBeChecked()
    expect(screen.getByRole("region", { name: "Runs on its own" })).toHaveTextContent("Save draft")
    expect(screen.getByRole("region", { name: "Stops to ask" })).toHaveTextContent("Send deposit")
    await user.click(screen.getByRole("radio", { name: "Act, except locks" }))
    expect(onLevelChange).toHaveBeenCalledWith(2)
    await user.click(screen.getByRole("button", { name: "Always ask before Send deposit" }))
    expect(onPinnedChange).toHaveBeenCalledWith(["pay"])
  })
})

describe("decision inbox", () => {
  it("answers an open call and folds it", async () => {
    const user = userEvent.setup()
    const onAnswer = vi.fn()
    const onDismiss = vi.fn()
    const items = [
      {
        id: "pay",
        title: "Send the deposit?",
        choices: [
          { id: "today", label: "Today" },
          { id: "friday", label: "Friday" },
        ],
      },
    ]
    expect(openDecisionCount(items)).toBe(1)
    const { rerender } = render(<DecisionInbox items={items} onAnswer={onAnswer} onDismiss={onDismiss} />)
    await user.click(screen.getByRole("button", { name: "Friday for “Send the deposit?”" }))
    expect(onAnswer).toHaveBeenCalledWith("pay", "friday")
    rerender(<DecisionInbox items={[{ ...items[0]!, answerId: "friday" }]} onAnswer={onAnswer} onDismiss={onDismiss} />)
    expect(screen.getAllByText("Answered: Friday").length).toBeGreaterThan(0)
    await user.click(screen.getByRole("button", { name: "Dismiss “Send the deposit?”" }))
    expect(onDismiss).toHaveBeenCalledWith("pay")
  })
})

describe("delegate board", () => {
  it("gives waiting work to whoever is free first", async () => {
    const user = userEvent.setup()
    const onPlace = vi.fn()
    const onAssign = vi.fn()
    const tasks = tasksFrom(boardFilled.tasks, "en")
    const assignments = firstFreeAssignments(tasks, boardFilled.agents)
    expect(assignments).toEqual([
      { taskId: "cotizacion", agentId: "bruma" },
      { taskId: "muestras", agentId: "caja" },
    ])
    expect(formatClock(11 * 60 + 40)).toBe("11:40")
    expect(agentLoad("horno", tasks, 90)).toBe(110)
    render(<DelegateBoard tasks={tasks} agents={boardFilled.agents} mode="auto" clockMinutes={11 * 60 + 40} onPlace={onPlace} onAssign={onAssign} />)
    await user.click(screen.getByRole("button", { name: "Hand waiting work to whoever is free" }))
    expect(onPlace).toHaveBeenCalledWith(assignments)
    await user.selectOptions(screen.getByRole("combobox", { name: "Hand off “Cobalt glaze quote”" }), "horno")
    expect(onAssign).toHaveBeenCalledWith("cotizacion", "horno")
  })
})
