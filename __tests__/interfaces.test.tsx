import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { AnalyticsOverview } from "@/registry/blocks/analytics"
import { AgentChat } from "@/registry/blocks/agent-chat"
import { AgentRun } from "@/registry/blocks/agent-run"
import { AppShell } from "@/registry/blocks/app-shell"
import { AssistantHome } from "@/registry/blocks/assistant-home"
import { CrmSheet } from "@/registry/blocks/crm"
import { EvalReview } from "@/registry/blocks/evals"
import { Integrations } from "@/registry/blocks/integrations"
import { Onboarding } from "@/registry/blocks/onboarding"
import { SettingsBilling } from "@/registry/blocks/settings-billing"

describe("interfaces", () => {
  it("moves through the workspace shell", async () => {
    const user = userEvent.setup()
    const onNavigate = vi.fn()
    render(<AppShell onNavigate={onNavigate} />)

    expect(screen.getByRole("progressbar", { name: "Primeros pasos" })).toHaveAttribute("aria-valuenow", "2")
    await user.click(screen.getByRole("checkbox", { name: "Conectar una herramienta" }))
    expect(screen.getByRole("progressbar", { name: "Primeros pasos" })).toHaveAttribute("aria-valuenow", "3")

    await user.click(screen.getByRole("button", { name: "Asistente" }))
    expect(onNavigate).toHaveBeenCalledWith("assistant")
    expect(screen.getByRole("button", { name: "Asistente" })).toHaveAttribute("aria-current", "page")

    await user.click(screen.getByRole("button", { name: "Ocultar barra" }))
    expect(screen.queryByRole("button", { name: "Asistente" })).not.toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: "Mostrar barra" }))
    expect(screen.getByRole("button", { name: "Asistente" })).toBeInTheDocument()

    const bar = screen.getByRole("progressbar", { name: "Primeros pasos" })
    expect(bar.firstElementChild?.className).toContain("motion-reduce:transition-none")
  })

  it("submits the assistant composer", async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(<AssistantHome shell={false} onSubmit={onSubmit} />)

    await user.click(screen.getByRole("button", { name: "Resumir la semana" }))
    expect(screen.getByRole("textbox", { name: "Mensaje para el asistente" })).toHaveValue(
      "Resume la semana del equipo Faro en cinco puntos.",
    )
    await user.click(screen.getByRole("button", { name: "Micrófono" }))
    expect(screen.getByRole("button", { name: "Micrófono, activo" })).toHaveAttribute("aria-pressed", "true")
    await user.selectOptions(screen.getByRole("combobox", { name: "Modelo" }), "costa")
    await user.click(screen.getByRole("button", { name: "Enviar" }))
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ modelId: "costa", listening: true, text: expect.stringContaining("Faro") }),
    )
    const calendar = screen.getByText("Calendario").closest("li")
    if (!calendar) throw new Error("missing calendar row")
    await user.click(within(calendar).getByRole("button", { name: "Conectar" }))
    expect(within(calendar).getByRole("button", { name: "Conectada" })).toHaveAttribute("aria-pressed", "true")
  })

  it("shows the orchestrator thread and the brief", () => {
    render(<AgentChat shell={false} />)
    expect(screen.getByRole("heading", { name: "Encargo de la linterna" })).toBeInTheDocument()
    expect(screen.getByText(/Orquestador/)).toBeInTheDocument()
    expect(screen.getByText("Trabajando")).toBeInTheDocument()
    const brief = screen.getByRole("complementary", { name: "Encargo" })
    expect(within(brief).getByText("Linterna de campo")).toBeInTheDocument()
    expect(within(brief).getByText("Pedir una muestra")).toBeInTheDocument()
    expect(within(brief).getByText("Tinta")).toBeInTheDocument()
  })

  it("accepts a draft and answers the pending question", async () => {
    const user = userEvent.setup()
    const onDecision = vi.fn()
    const onResolveInput = vi.fn()
    render(<AgentRun shell={false} onDecision={onDecision} onResolveInput={onResolveInput} />)

    expect(screen.getByText(/carpeta/)).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: "Aceptar" }))
    expect(onDecision).toHaveBeenCalledWith("accepted")
    expect(screen.getByRole("status")).toHaveTextContent("Borrador aceptado.")
    expect(screen.getByRole("button", { name: "Rechazar" })).toBeDisabled()

    await user.click(screen.getByRole("radio", { name: "Formal" }))
    await user.click(screen.getByRole("button", { name: "Continuar" }))
    expect(onResolveInput).toHaveBeenCalledWith("formal")
    expect(screen.getByText("$0.18")).toBeInTheDocument()
  })

  it("switches billing to yearly prices and keeps the other tabs", async () => {
    const user = userEvent.setup()
    const onIntervalChange = vi.fn()
    render(<SettingsBilling shell={false} onIntervalChange={onIntervalChange} />)

    expect(screen.getByRole("meter", { name: /640 créditos usados/ })).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: "Anual" }))
    expect(onIntervalChange).toHaveBeenCalledWith("yearly")
    expect(screen.getByRole("button", { name: "Anual" })).toHaveAttribute("aria-pressed", "true")
    expect(screen.getAllByText(/240/).length).toBeGreaterThan(0)

    await user.click(screen.getByRole("tab", { name: "Miembros" }))
    expect(screen.getByText("Inés Quesada")).toBeInTheDocument()
    await user.click(screen.getByRole("tab", { name: "API" }))
    expect(screen.getByText(/acme_ejemplo/)).toBeInTheDocument()
  })

  it("advances onboarding and connects a tool", async () => {
    const user = userEvent.setup()
    const onComplete = vi.fn()
    render(<Onboarding onComplete={onComplete} />)

    expect(screen.getByRole("heading", { name: "Nombra el espacio" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /Espacio/ })).toHaveAttribute("aria-current", "step")
    await user.click(screen.getByRole("button", { name: "Siguiente" }))
    expect(screen.getByRole("heading", { name: "Conecta lo que ya usas" })).toBeInTheDocument()
    const calendar = screen.getByText("Calendario").closest("li")
    if (!calendar) throw new Error("missing calendar row")
    await user.click(within(calendar).getByRole("button", { name: "Conectar" }))
    expect(within(calendar).getByRole("button", { name: "Conectada" })).toHaveAttribute("aria-pressed", "true")
    await user.click(screen.getByRole("button", { name: "Siguiente" }))
    await user.click(screen.getByRole("button", { name: "Siguiente" }))
    await user.click(screen.getByRole("button", { name: "Entrar" }))
    expect(onComplete).toHaveBeenCalledWith(
      expect.objectContaining({ workspace: "Acme", connectedToolIds: expect.arrayContaining(["mail", "calendar"]) }),
    )
  })

  it("filters integrations and records a request", async () => {
    const user = userEvent.setup()
    const onRequest = vi.fn()
    render(<Integrations shell={false} onRequest={onRequest} />)

    await user.type(screen.getByRole("textbox", { name: "Buscar integraciones" }), "Caja")
    expect(screen.getByRole("heading", { name: "Caja" })).toBeInTheDocument()
    expect(screen.queryByRole("heading", { name: "Buzón" })).not.toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: "Finanzas" }))
    await user.clear(screen.getByRole("textbox", { name: "Buscar integraciones" }))
    expect(screen.getByRole("heading", { name: "Vale" })).toBeInTheDocument()
    expect(screen.queryByRole("heading", { name: "Buzón" })).not.toBeInTheDocument()

    await user.type(screen.getByRole("textbox", { name: "Herramienta" }), "Bitácora")
    await user.type(screen.getByRole("textbox", { name: "Para qué la necesitas" }), "Notas de obra")
    await user.click(screen.getByRole("button", { name: "Pedir" }))
    expect(onRequest).toHaveBeenCalledWith({ name: "Bitácora", reason: "Notas de obra" })
    expect(screen.getByRole("status")).toHaveTextContent("Bitácora")
  })

  it("edits a sales cell and undoes it", async () => {
    const user = userEvent.setup()
    const onRowsChange = vi.fn()
    render(<CrmSheet shell={false} onRowsChange={onRowsChange} />)

    await user.click(screen.getByRole("checkbox", { name: "Seleccionar Taller Bruma" }))
    expect(screen.getByText(/1 seleccionadas/)).toBeInTheDocument()

    await user.selectOptions(screen.getByLabelText("Etapa de Taller Bruma"), "won")
    expect(onRowsChange).toHaveBeenCalled()
    expect(screen.getByRole("status")).toHaveTextContent("Cambio guardado")
    await user.click(screen.getByRole("button", { name: "Deshacer" }))
    expect(screen.getByLabelText("Etapa de Taller Bruma")).toHaveValue("proposal")

    await user.click(screen.getByRole("button", { name: "Taller Bruma" }))
    const field = screen.getByRole("textbox", { name: "Empresa Taller Bruma" })
    await user.clear(field)
    await user.type(field, "Taller Sur")
    await user.tab()
    expect(screen.getByRole("button", { name: "Taller Sur" })).toBeInTheDocument()
  })

  it("renders analytics meters and the product table", () => {
    render(<AnalyticsOverview shell={false} />)
    expect(screen.getByRole("heading", { name: "Ingresos por canal" })).toBeInTheDocument()
    expect(screen.getByRole("meter", { name: "Tienda" })).toHaveAttribute("aria-valuenow", "82000")
    expect(screen.getByRole("rowheader", { name: "Linterna de campo" })).toBeInTheDocument()
    expect(screen.getAllByText("Sube").length).toBeGreaterThan(0)
  })

  it("compares eval versions and the prompt", () => {
    render(<EvalReview shell={false} />)
    expect(screen.getByRole("meter", { name: "v3" })).toHaveAttribute("aria-valuenow", "86")
    expect(screen.getByRole("heading", { name: "Antes" })).toBeInTheDocument()
    expect(screen.getByRole("heading", { name: "Después" })).toBeInTheDocument()
    expect(screen.getByText("No inventes cifras.")).toBeInTheDocument()
    expect(screen.getByRole("rowheader", { name: "Tono" })).toBeInTheDocument()
    expect(screen.getByText("Falla")).toBeInTheDocument()
  })
})
