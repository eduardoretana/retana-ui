import type { ComponentProps } from "react"
import { fireEvent, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { AgentConfig } from "@/registry/ui/agent-config"
import { TOUCH_HOLD_MS } from "@/registry/lib/agent-config"

import { draftDirty, filled, guardrailTypes, invalidBands, models, testCasesFor } from "@/app/examples/agent-config/fixtures"

function renderConsole(extra: Partial<ComponentProps<typeof AgentConfig>> = {}) {
  const pack = filled.es
  return render(
    <AgentConfig
      locale="es"
      workspace={pack.workspace}
      agents={pack.agents}
      versions={pack.versions}
      models={models}
      guardrailTypes={guardrailTypes}
      testCases={testCasesFor("es")}
      {...extra}
    />,
  )
}

describe("agent config screen", () => {
  it("moves the reject threshold with the keyboard and keeps a valid partition", async () => {
    const user = userEvent.setup()
    renderConsole()
    const handle = screen.getByRole("slider", { name: "Umbral de rechazo" })
    handle.focus()
    await user.keyboard("{ArrowLeft}")
    expect(handle).toHaveAttribute("aria-valuenow", "69")
    expect(screen.getByRole("slider", { name: "Umbral automático" })).toHaveAttribute("aria-valuenow", "92")
  })

  it("blocks publish when the numeric thresholds overlap", async () => {
    const user = userEvent.setup()
    const onPublishRequest = vi.fn()
    renderConsole({ ...propsFrom(invalidBands.es), onPublishRequest })
    expect(screen.getByText(/no cubren de 0 a 100/)).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Publicar versión" })).toBeDisabled()
    await user.click(screen.getByRole("button", { name: "Publicar versión" }))
    expect(onPublishRequest).not.toHaveBeenCalled()
  })

  it("rolls the draft back when publish fails", async () => {
    const user = userEvent.setup()
    const onPublishRequest = vi.fn().mockRejectedValue(new Error("no"))
    renderConsole({ ...propsFrom(draftDirty.es), onPublishRequest })
    expect(screen.getByText(/Borrador contra la versión en vivo/)).toBeInTheDocument()
    expect(screen.getByText(/Ejemplo Norte → Ejemplo Cumbre/)).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: "Publicar versión" }))
    expect(await screen.findByRole("alert")).toHaveTextContent("No se publicó")
    expect(screen.getByText(/Ejemplo Norte → Ejemplo Cumbre/)).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Publicar versión" })).toBeEnabled()
  })

  it("shows the guardrail that fired for the sample payment", async () => {
    const user = userEvent.setup()
    renderConsole()
    await user.click(screen.getByRole("button", { name: "Probar indicación" }))
    await user.click(screen.getByRole("button", { name: "Correr prueba" }))
    expect(await screen.findByText(/approval_payment/)).toBeInTheDocument()
    expect(screen.getByText(/tiene que aprobar/)).toBeInTheDocument()
  })

  it("moves between agents with the arrow keys and returns from the detail at 390", async () => {
    const user = userEvent.setup()
    render(
      <div className="w-[390px]">
        <AgentConfig
          locale="es"
          workspace={filled.es.workspace}
          agents={filled.es.agents}
          versions={filled.es.versions}
          models={models}
          guardrailTypes={guardrailTypes}
        />
      </div>,
    )
    const list = screen.getByRole("listbox", { name: "Agentes" })
    list.focus()
    await user.keyboard("{ArrowDown}")
    expect(screen.getByRole("option", { name: /Extractor de documentos/ })).toHaveAttribute("aria-selected", "true")
  })

  it("drags a touch handle only after a long press", () => {
    vi.useFakeTimers()
    renderConsole()
    const handle = screen.getByRole("slider", { name: "Umbral de rechazo" })
    const track = handle.parentElement as HTMLDivElement
    track.getBoundingClientRect = () =>
      ({ left: 0, top: 0, width: 244, height: 44, right: 244, bottom: 44, x: 0, y: 0, toJSON() { return {} } }) as DOMRect
    fireEvent.pointerDown(handle, { pointerId: 1, pointerType: "touch", clientX: 22, clientY: 10, button: 0 })
    fireEvent.pointerUp(window, { pointerId: 1, pointerType: "touch", clientX: 22, clientY: 10 })
    expect(handle).toHaveAttribute("aria-valuenow", "70")

    fireEvent.pointerDown(handle, { pointerId: 2, pointerType: "touch", clientX: 160, clientY: 10, button: 0 })
    fireEvent.pointerMove(window, { pointerId: 2, pointerType: "touch", clientX: 160, clientY: 40 })
    fireEvent.pointerUp(window, { pointerId: 2, pointerType: "touch", clientX: 160, clientY: 40 })
    expect(handle).toHaveAttribute("aria-valuenow", "70")

    fireEvent.pointerDown(handle, { pointerId: 3, pointerType: "touch", clientX: 160, clientY: 10, button: 0 })
    vi.advanceTimersByTime(TOUCH_HOLD_MS)
    fireEvent.pointerMove(window, { pointerId: 3, pointerType: "touch", clientX: 80, clientY: 12 })
    fireEvent.pointerUp(window, { pointerId: 3, pointerType: "touch", clientX: 80, clientY: 12 })
    expect(Number(handle.getAttribute("aria-valuenow"))).toBeLessThan(70)
    vi.useRealTimers()
  })
})

function propsFrom(fixture: (typeof draftDirty)["es"]) {
  return {
    workspace: fixture.workspace,
    agents: fixture.agents,
    versions: fixture.versions,
    draft: fixture.draft,
    readOnly: fixture.readOnly,
    busy: fixture.busy,
  }
}
