import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import type { NodeTypeDefinition, WorkflowGraph } from "@/registry/lib/workflow-builder"
import { WorkflowBuilder } from "@/registry/ui/workflow-builder"

const types: NodeTypeDefinition[] = [
  {
    type: "ai-agent",
    category: "tools",
    title: "Agente",
    description: "Clasifica la intención.",
    sideEffect: "read",
    ports: [
      { id: "in", direction: "in", kind: "main", role: "primary", label: "Entrada" },
      { id: "out", direction: "out", kind: "main", role: "primary", label: "Salida" },
    ],
    fields: [],
    outputSchema: { properties: { intent: { type: "string" } } },
  },
  {
    type: "crm.write",
    category: "action",
    title: "Escribir",
    description: "Guarda el mensaje.",
    sideEffect: "write",
    ports: [{ id: "in", direction: "in", kind: "main", role: "primary", label: "Entrada" }],
    fields: [{ kind: "text", key: "body", label: "Mensaje", expression: true }],
  },
]

const blocked: WorkflowGraph = {
  nodes: [
    { id: "clasificar", type: "ai-agent", position: { x: 40, y: 40 }, config: {} },
    { id: "escribir", type: "crm.write", position: { x: 300, y: 40 }, config: { body: '{{ $node["clasificar"].json.' } },
  ],
  edges: [{ id: "e", source: "clasificar", sourcePort: "out", target: "escribir", targetPort: "in" }],
}

describe("WorkflowBuilder", () => {
  it("bloquea publicar y ofrece las claves del nodo previo", () => {
    const onPublish = vi.fn()
    render(<WorkflowBuilder graph={blocked} nodeTypes={types} workspace="marca-a" selection={{ nodeIds: ["escribir"], edgeIds: [] }} onPublishRequest={onPublish} />)
    expect(screen.getByText(/Publicación bloqueada/)).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Publicar" })).toBeDisabled()
    expect(screen.getByRole("listbox", { name: "Sugerencias" })).toBeInTheDocument()
    expect(screen.getByRole("option", { name: /intent/ })).toBeInTheDocument()
    expect(onPublish).not.toHaveBeenCalled()
  })

  it("mueve el nodo con las flechas y deshace", async () => {
    const user = userEvent.setup()
    render(<WorkflowBuilder defaultGraph={{ nodes: [{ id: "clasificar", type: "ai-agent", position: { x: 10, y: 10 }, config: {} }], edges: [] }} nodeTypes={types} />)
    const body = screen.getByRole("button", { name: /Agente,/ })
    body.focus()
    await user.keyboard("{ArrowRight}")
    await user.keyboard("{Control>}z{/Control}")
    expect(screen.getByRole("status").textContent).toMatch(/Deshacer/)
  })
})
