import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { applyWorkflowChange, type WorkflowGraph } from "@/registry/lib/workflow-builder"
import { WorkflowBuilder } from "@/registry/ui/workflow-builder"

const graph: WorkflowGraph = { nodes: [{ id: "n1", type: "note", position: { x: 12, y: 12 }, config: {} }], edges: [] }

describe("workflow family contract", () => {
  it("keeps applyWorkflowChange pure", () => {
    const next = applyWorkflowChange(graph, { type: "move-nodes", moves: [{ id: "n1", x: 20, y: 4 }] })
    expect(graph.nodes[0]?.position.x).toBe(12)
    expect(next.nodes[0]?.position).toEqual({ x: 20, y: 4 })
  })

  it("exposes a node as a button", () => {
    render(<WorkflowBuilder graph={graph} nodeTypes={[{ type: "note", category: "logic", title: "Nota", description: "Una nota.", ports: [], fields: [] }]} />)
    expect(screen.getByRole("button", { name: /Nota,/ })).toBeInTheDocument()
    expect(screen.getByRole("application", { name: "Lienzo del flujo" })).toBeInTheDocument()
  })
})
