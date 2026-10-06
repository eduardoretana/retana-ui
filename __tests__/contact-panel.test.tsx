import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it } from "vitest"

import { ContactPanel } from "@/registry/ui/contact-panel"

describe("ContactPanel", () => {
  it("moves from details to the copilot slot", async () => {
    const user = userEvent.setup()
    render(
      <ContactPanel
        contactName="Inés Soler"
        fields={[{ id: "email", label: "Email", value: "ines@faro.test" }]}
        copilot={<p>Borrador del taller</p>}
      />,
    )
    expect(document.querySelector("[data-slot='contact-panel']")).toHaveAttribute("data-tab", "details")
    expect(screen.getByText("Borrador del taller")).not.toBeVisible()
    await user.click(screen.getByRole("tab", { name: "Copilot" }))
    expect(document.querySelector("[data-slot='contact-panel']")).toHaveAttribute("data-tab", "copilot")
    expect(screen.getByText("Borrador del taller")).toBeVisible()
  })
})
