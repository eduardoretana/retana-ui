import { act, render, screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, describe, expect, it, vi } from "vitest"

import Preview from "@/app/examples/agent-tree/preview"
import { bulletinNodes } from "@/app/examples/agent-tree/fixtures"
import { advanceAgentRun } from "@/app/examples/agent-tree/simulate"
import {
  AgentTree,
  agentInitials,
  buildAgentForest,
  edgePathsForChildren,
  formatAgentCost,
  formatAgentElapsed,
  orthogonalEdgePath,
  subtreeWidth,
  summarizeAgents,
  uniqueAgents,
  withRetrySibling,
  withoutAgent,
  type AgentNode,
} from "@/registry/ui/agent-tree"

function agent(partial: Partial<AgentNode> & Pick<AgentNode, "id">): AgentNode {
  return {
    parentId: null,
    role: partial.id,
    model: "bruma-mini",
    task: `Tarea ${partial.id}`,
    status: "done",
    costUsd: 0,
    elapsedMs: 0,
    ...partial,
  }
}

describe("agent-tree helpers", () => {
  it("builds a forest from an unordered parent list and drops duplicate ids", () => {
    const forest = buildAgentForest([
      agent({ id: "child", parentId: "root", role: "Hijo" }),
      agent({ id: "root", role: "Raíz" }),
      agent({ id: "child", parentId: "root", role: "Repetido" }),
      agent({ id: "orphan", parentId: "missing", role: "Suelto" }),
    ])
    expect(forest.map((node) => node.id)).toEqual(["root", "orphan"])
    expect(forest[0].children.map((node) => node.role)).toEqual(["Hijo"])
  })

  it("breaks a parent cycle instead of looping", () => {
    const forest = buildAgentForest([
      agent({ id: "a", parentId: "b", role: "Ana" }),
      agent({ id: "b", parentId: "a", role: "Beto" }),
    ])
    const ids = forest.flatMap((node) => [node.id, ...node.children.map((child) => child.id)])
    expect(ids.sort()).toEqual(["a", "b"])
    expect(forest).toHaveLength(1)
  })

  it("summarizes counts and cost", () => {
    const summary = summarizeAgents(uniqueAgents(bulletinNodes))
    expect(summary).toMatchObject({
      total: 7,
      running: 2,
      needsYou: 1,
      failed: 1,
      done: 2,
      stopped: 1,
    })
    expect(summary.costUsd).toBeCloseTo(0.179, 5)
  })

  it("draws a straight edge and a rounded elbow", () => {
    expect(orthogonalEdgePath(10, 0, 10, 40)).toBe("M 10 0 L 10 40")
    expect(orthogonalEdgePath(0, 0, 80, 40)).toContain("Q")
    const [left, right] = edgePathsForChildren([100, 100], 20, 40)
    expect(left).toContain("Q")
    expect(right).toContain("Q")
    expect(subtreeWidth({ id: "p", children: [{ id: "a", children: [] }, { id: "b", children: [] }] }, () => false, 100, 20)).toBe(220)
  })

  it("formats money and elapsed time", () => {
    expect(formatAgentCost(1.5, "en")).toBe("$1.50")
    expect(formatAgentCost(0.042, "es")).toMatch(/0\.042/)
    expect(formatAgentElapsed(90_000)).toBe("1m 30s")
    expect(formatAgentElapsed(1_500)).toBe("1s")
    expect(agentInitials("Mesa del faro")).toBe("MF")
  })

  it("retries without deleting the failed node", () => {
    const next = withRetrySibling(
      [agent({ id: "bad", parentId: "root", status: "failed", role: "Citas", task: "Verificar" })],
      "bad",
      "bad-2",
    )
    expect(next.find((node) => node.id === "bad")?.status).toBe("stopped")
    expect(next.find((node) => node.id === "bad-2")).toMatchObject({
      parentId: "root",
      role: "Citas",
      task: "Verificar",
      status: "running",
      costUsd: 0,
    })
  })

  it("dismiss keeps children by reparenting them", () => {
    const next = withoutAgent(
      [agent({ id: "p" }), agent({ id: "gone", parentId: "p" }), agent({ id: "kid", parentId: "gone" })],
      "gone",
    )
    expect(next.map((node) => node.id)).toEqual(["p", "kid"])
    expect(next.find((node) => node.id === "kid")?.parentId).toBe("p")
  })

  it("advances the live demo from props", () => {
    const rolls = [0.1, 0, 0.9, 0.1, 0, 0, 0, 0]
    let cursor = 0
    const random = () => rolls[Math.min(cursor++, rolls.length - 1)]
    const next = advanceAgentRun([agent({ id: "run", status: "running", costUsd: 1, elapsedMs: 1_000 })], random)
    const original = next.find((node) => node.id === "run")
    expect(original?.status).toBe("failed")
    expect(original?.elapsedMs).toBe(2_000)
    expect(original?.costUsd).toBeGreaterThan(1)
    expect(next.some((node) => node.id !== "run" && node.parentId === "run" && node.status === "running")).toBe(true)
  })
})

describe("AgentTree", () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it("renders the bulletin, colors the edge by the child, and updates when props change", async () => {
    const { rerender } = render(<AgentTree nodes={bulletinNodes} />)
    expect(screen.getByRole("tree", { name: "Árbol de agentes" })).toBeInTheDocument()
    expect(screen.getByRole("treeitem", { name: /Mesa del faro/ })).toHaveAttribute("aria-expanded", "true")
    expect(screen.getByRole("treeitem", { name: /Citas/ })).toHaveAttribute("aria-level", "3")
    expect(screen.getByRole("treeitem", { name: /Mareas/ })).toHaveAttribute("data-status", "needs-you")
    const failedEdge = document.querySelector("[data-edge-for='citas']")
    expect(failedEdge).toHaveClass("stroke-destructive")
    expect(failedEdge).toHaveAttribute("data-status", "failed")
    expect(document.querySelector("[data-summary='total']")).toHaveTextContent("7")

    rerender(<AgentTree nodes={bulletinNodes.map((node) => (node.id === "mareas" ? { ...node, status: "done" } : node))} />)
    expect(screen.getByRole("treeitem", { name: /Mareas/ })).toHaveAttribute("data-status", "done")
  })

  it("collapses a branch, reports the toggle, and moves focus with the keyboard", async () => {
    const user = userEvent.setup()
    const onToggle = vi.fn()
    render(<AgentTree nodes={bulletinNodes} onToggle={onToggle} />)
    await user.click(screen.getByRole("button", { name: /Ocultar hijos, 2 hijos, Redacción/ }))
    expect(onToggle).toHaveBeenCalledWith("redaccion", true)
    expect(screen.getByRole("treeitem", { name: /Redacción/ })).toHaveAttribute("aria-expanded", "false")
    await waitFor(() => {
      expect(screen.queryByRole("treeitem", { name: /Citas/ })).not.toBeInTheDocument()
    })

    screen.getByRole("treeitem", { name: /Mesa del faro/ }).focus()
    await user.keyboard("{ArrowDown}")
    expect(screen.getByRole("treeitem", { name: /Archivo/ })).toHaveFocus()
    await user.keyboard("{End}")
    expect(screen.getByRole("treeitem", { name: /Imprenta/ })).toHaveFocus()
  })

  it("opens the failed popover and calls retry and dismiss", async () => {
    const user = userEvent.setup()
    const onRetry = vi.fn()
    const onDismiss = vi.fn()
    const onAdd = vi.fn()
    render(<AgentTree nodes={bulletinNodes} onRetry={onRetry} onDismiss={onDismiss} onAddAgents={onAdd} />)
    await user.click(screen.getByRole("button", { name: "+ Agentes" }))
    expect(onAdd).toHaveBeenCalledOnce()
    await user.click(screen.getByRole("button", { name: "Falló: Citas" }))
    const dialog = await screen.findByText("La cita del práctico no coincide con el cuaderno de marzo.")
    expect(dialog).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: "Reintentar" }))
    expect(onRetry).toHaveBeenCalledWith("citas")
    await user.click(screen.getByRole("button", { name: "Falló: Citas" }))
    await user.click(screen.getByRole("button", { name: "Descartar" }))
    expect(onDismiss).toHaveBeenCalledWith("citas")
  })

  it("shows loading, empty, and error states", () => {
    const { rerender } = render(<AgentTree nodes={[]} loading />)
    expect(screen.getByRole("status")).toHaveTextContent("Cargando agentes…")
    expect(screen.queryByRole("tree")).not.toBeInTheDocument()

    rerender(<AgentTree nodes={[]} />)
    expect(screen.getByRole("status")).toHaveTextContent("Todavía no hay agentes")

    rerender(<AgentTree nodes={bulletinNodes} error="Se cortó la señal" />)
    expect(screen.getByRole("alert")).toHaveTextContent("Se cortó la señal")
    expect(screen.queryByRole("tree")).not.toBeInTheDocument()
  })

  it("uses English labels", () => {
    render(<AgentTree nodes={[agent({ id: "a", role: "Desk", status: "running" })]} locale="en" />)
    expect(screen.getByRole("button", { name: "+ Agents" })).toBeInTheDocument()
    expect(screen.getByRole("treeitem", { name: /Desk/ })).toHaveTextContent("Running")
  })

  it("renders extra content and ticks a running node from props", async () => {
    vi.useFakeTimers()
    const nodes = [agent({ id: "run", role: "Mesa", status: "running", elapsedMs: 1_000, costUsd: 1 })]
    render(
      <AgentTree
        nodes={nodes}
        tick
        tickIntervalMs={1_000}
        tickCostPerSecond={1}
        renderNodeExtra={(node) => <span>extra-{node.id}</span>}
      />,
    )
    expect(screen.getByText("extra-run")).toBeInTheDocument()
    expect(screen.getByRole("treeitem", { name: /Mesa/ })).toHaveTextContent("1s")
    await act(async () => {
      await vi.advanceTimersByTimeAsync(2_000)
    })
    expect(screen.getByRole("treeitem", { name: /Mesa/ })).toHaveTextContent("3s")
  })

  it("respects a controlled collapsed list", () => {
    render(<AgentTree nodes={bulletinNodes} collapsedIds={["mesa"]} />)
    expect(screen.getByRole("treeitem", { name: /Mesa del faro/ })).toHaveAttribute("aria-expanded", "false")
    expect(screen.queryByRole("treeitem", { name: /Archivo/ })).not.toBeInTheDocument()
  })

  it("renders the catalog preview", () => {
    const view = render(<Preview />)
    expect(within(view.container).getByRole("tree")).toBeInTheDocument()
    expect(screen.getByRole("treeitem", { name: /Citas/ })).toBeInTheDocument()
  })
})
