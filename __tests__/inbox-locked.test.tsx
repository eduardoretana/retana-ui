import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { scenes } from "@/app/examples/inbox-crm/scenes"

describe("InboxCrm locked window", () => {
  it("keeps only the template action enabled and hides suggestion chips", async () => {
    const user = userEvent.setup()
    const onUseTemplate = vi.fn()
    const scene = scenes.find((item) => item.id === "locked")
    expect(scene).toBeDefined()
    const Render = scene!.render
    render(<Render locale="es" log={onUseTemplate} />)

    expect(document.querySelector("[data-slot=suggested-replies]")).not.toBeInTheDocument()
    expect(screen.queryByRole("button", { name: "Enviar simulación" })).not.toBeInTheDocument()
    expect(screen.queryByRole("button", { name: "Agendar llamada" })).not.toBeInTheDocument()
    expect(screen.queryByRole("button", { name: "Pedir documentos" })).not.toBeInTheDocument()

    const composer = document.querySelector("[data-slot=thread-composer]")
    expect(composer).toBeTruthy()
    const scope = within(composer as HTMLElement)
    const enabled = scope.getAllByRole("button").filter((button) => !button.hasAttribute("disabled"))
    expect(enabled.map((button) => button.textContent?.trim() || button.getAttribute("aria-label"))).toEqual(["Usar plantilla"])
    await user.click(scope.getByRole("button", { name: "Usar plantilla" }))
    expect(onUseTemplate).toHaveBeenCalled()
  })
})
