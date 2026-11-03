import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { AgentFixTimeline, agentFixTimelineLabelsEs, type FixStep } from "@/registry/ui/agent-fix-timeline"

const steps: FixStep[] = [
  { id: "1", kind: "thought", label: "El recibo pierde el folio cuando el horno recarga", status: "done" },
  { id: "2", kind: "edit", label: "Edité horno.ts", status: "done", files: [{ path: "horno.ts" }, { path: "folio.spec.ts" }] },
  { id: "3", kind: "test", label: "12 pruebas de punta a punta pasaron", status: "done" },
  { id: "4", kind: "push", label: "Empujé b7e21aa al pull request 42", status: "done" },
  { id: "5", kind: "done", label: "El folio se conserva", status: "done" },
]

describe("AgentFixTimeline", () => {
  it("lists diagnosis, files, edit, tests, and push", () => {
    render(<AgentFixTimeline steps={steps} labels={agentFixTimelineLabelsEs} />)
    expect(screen.getByText("Diagnóstico")).toBeInTheDocument()
    expect(screen.getByText("Edición")).toBeInTheDocument()
    expect(screen.getByText("Pruebas")).toBeInTheDocument()
    expect(screen.getByText("Empuje")).toBeInTheDocument()
    expect(screen.getByText("Listo")).toBeInTheDocument()
    expect(screen.getByText("horno.ts")).toBeInTheDocument()
    expect(screen.getByText("folio.spec.ts")).toBeInTheDocument()
    expect(screen.getByText("El recibo pierde el folio cuando el horno recarga")).toBeInTheDocument()
  })

  it("announces an empty timeline", () => {
    render(<AgentFixTimeline steps={[]} labels={agentFixTimelineLabelsEs} />)
    expect(screen.getByRole("status")).toHaveTextContent(/sin pasos/i)
  })

  it("announces the active step", () => {
    render(
      <AgentFixTimeline
        steps={[{ id: "1", kind: "thought", label: "Revisando el folio", status: "active" }]}
        labels={agentFixTimelineLabelsEs}
      />,
    )
    expect(screen.getByRole("status")).toHaveTextContent(/Revisando el folio/)
  })

  it("shows a failed step with text", () => {
    render(
      <AgentFixTimeline
        steps={[{ id: "1", kind: "test", label: "La prueba del folio falló", status: "failed" }]}
        labels={agentFixTimelineLabelsEs}
      />,
    )
    expect(screen.getByText("Falló")).toBeInTheDocument()
    expect(screen.getByRole("listitem")).toHaveTextContent("La prueba del folio falló")
  })
})
