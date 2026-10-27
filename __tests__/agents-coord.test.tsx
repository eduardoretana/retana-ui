import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { cursorsFrom, filled as cursorFilled, suggestionsFrom } from "@/app/examples/agent-cursors/fixtures"
import { filled as graphFilled, linksFrom, nodesFrom } from "@/app/examples/agent-graph/fixtures"
import { clashesFrom, filled as radarFilled } from "@/app/examples/conflict-radar/fixtures"
import { filled as treeFilled, forksFrom, taken } from "@/app/examples/decision-tree/fixtures"
import { cellsFrom, filled as fanFilled } from "@/app/examples/fan-out-grid/fixtures"
import { attemptsFrom, filled as attemptFilled, tied } from "@/app/examples/parallel-attempts/fixtures"
import { AgentCursors, cursorsPresent } from "@/registry/ui/agent-cursors"
import { AgentGraph, busiestLink, graphByPulse, graphTraffic } from "@/registry/ui/agent-graph"
import { ConflictRadar, openClashes } from "@/registry/ui/conflict-radar"
import { DecisionTree, openFork } from "@/registry/ui/decision-tree"
import { FanOutGrid, fanTally } from "@/registry/ui/fan-out-grid"
import { ParallelAttempts, leadingAttempt } from "@/registry/ui/parallel-attempts"

describe("agent graph", () => {
  it("counts the calls and opens Bruma", async () => {
    const user = userEvent.setup()
    const onOpen = vi.fn()
    const nodes = nodesFrom(graphFilled.nodes, "en")
    const links = linksFrom(graphFilled.links)
    expect(graphTraffic(links)).toBe(12)
    expect(graphByPulse(nodes, "waiting")).toBe(1)
    expect(busiestLink(links)?.id).toBe("foto")
    render(<AgentGraph nodes={nodes} links={links} onOpen={onOpen} />)
    expect(screen.getByText("Busiest link: Bruma to Horno, 4 calls")).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: "Open Bruma" }))
    expect(onOpen).toHaveBeenCalledWith("bruma")
  })
})

describe("agent cursors", () => {
  it("counts who is here and accepts the deposit wording", async () => {
    const user = userEvent.setup()
    const onAccept = vi.fn()
    const cursors = cursorsFrom(cursorFilled, "en")
    expect(cursorsPresent(cursors)).toBe(2)
    render(
      <AgentCursors
        paragraphs={[...cursorFilled.paragraphs]}
        cursors={cursors}
        suggestions={suggestionsFrom(cursorFilled, "en")}
        onAccept={onAccept}
      />,
    )
    await user.click(screen.getByRole("button", { name: "Accept Bruma's suggestion" }))
    expect(onAccept).toHaveBeenCalledWith("precio")
  })
})

describe("fan-out grid", () => {
  it("tallies the León samples and retries the lid", async () => {
    const user = userEvent.setup()
    const onRetry = vi.fn()
    const cells = cellsFrom(fanFilled.seeds, "en")
    expect(fanTally(cells)).toMatchObject({ done: 3, running: 1, retrying: 1, failed: 1, waiting: 2, total: 8 })
    render(<FanOutGrid job="Eight cobalt glaze samples" cells={cells} onRetry={onRetry} />)
    await user.click(screen.getByRole("button", { name: "Try “Pack lid” again" }))
    expect(onRetry).toHaveBeenCalledWith("tapa")
  })
})

describe("parallel attempts", () => {
  it("marks the short note and keeps it", async () => {
    const user = userEvent.setup()
    const onPick = vi.fn()
    const attempts = attemptsFrom(attemptFilled.seeds, "en")
    expect(leadingAttempt(attempts)).toBe("corta")
    expect(leadingAttempt(attemptsFrom(tied.seeds, "en"))).toBeNull()
    render(<ParallelAttempts task="The Celaya note" attempts={attempts} onPick={onPick} />)
    expect(screen.getByText("Ahead")).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: "Keep “Short note for Celaya”" }))
    expect(onPick).toHaveBeenCalledWith("corta")
  })
})

describe("conflict radar", () => {
  it("keeps Bruma's deposit and will not file while a clash is open", async () => {
    const user = userEvent.setup()
    const onKeep = vi.fn()
    const onFile = vi.fn()
    const clashes = clashesFrom(radarFilled.seeds, "en")
    expect(openClashes(clashes)).toBe(2)
    const view = render(<ConflictRadar agents={[...radarFilled.agents]} clashes={clashes} onKeep={onKeep} onFile={onFile} />)
    expect(screen.getByRole("button", { name: "File the order once every clash is settled" })).toBeDisabled()
    await user.click(screen.getAllByRole("button", { name: "Keep Bruma" })[0]!)
    expect(onKeep).toHaveBeenCalledWith("precio", "left")
    view.unmount()
    const settled = clashes.map((clash) => ({ ...clash, kept: "left" as const }))
    expect(openClashes(settled)).toBe(0)
    render(<ConflictRadar agents={[...radarFilled.agents]} clashes={settled} onFile={onFile} />)
    expect(screen.getByRole("button", { name: "File the order once every clash is settled" })).toBeEnabled()
  })
})

describe("decision tree", () => {
  it("opens the kiln fork and then the notice", async () => {
    const user = userEvent.setup()
    const onChoose = vi.fn()
    const forks = forksFrom(treeFilled.seeds, "en")
    expect(openFork(forks, [])?.id).toBe("horno")
    expect(openFork(forks, [{ forkId: "horno", optionId: "posponer" }])?.id).toBe("aviso")
    expect(openFork(forks, [{ forkId: "horno", custom: "Call on Thursday" }])).toBeNull()
    expect(openFork(forks, taken.path?.en ?? [])?.id).toBe("aviso")
    render(<DecisionTree forks={forks} onChoose={onChoose} />)
    await user.click(screen.getByRole("radio", { name: "Choose “Move the delivery to Monday 2 November”" }))
    expect(onChoose).toHaveBeenCalledWith("horno", "posponer")
  })
})
