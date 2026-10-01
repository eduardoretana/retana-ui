import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { ContactSection } from "@/registry/blocks/contact-section"

describe("ContactSection", () => {
  it("validates the form and turns it into a confirmation", async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(<ContactSection className="kiln-contact" onSubmit={onSubmit} />)
    expect(document.querySelector("[data-slot=contact-section]")).toHaveClass("kiln-contact")
    await user.click(screen.getByRole("button", { name: "Send message" }))
    expect(screen.getByText("Enter your name")).toBeInTheDocument()
    await user.type(screen.getByLabelText("Name"), "Ines Calderon")
    await user.type(screen.getByLabelText("Work email"), "hola@costa-atelier.example")
    await user.click(screen.getByRole("radio", { name: "Support" }))
    expect(screen.getByRole("radio", { name: "Support" })).toHaveAttribute("aria-checked", "true")
    await user.type(screen.getByLabelText("Message"), "We need a stoneware bowl for Friday.")
    await user.click(screen.getByRole("button", { name: "Send message" }))
    expect(await screen.findByRole("heading", { name: "Thanks, Ines" })).toBeInTheDocument()
    expect(onSubmit).toHaveBeenCalledWith({
      name: "Ines Calderon",
      email: "hola@costa-atelier.example",
      topic: "Support",
      message: "We need a stoneware bowl for Friday.",
    })
    await user.click(screen.getByRole("button", { name: "Send another message" }))
    expect(screen.getByLabelText("Name")).toHaveValue("")
  })

  it("switches channels and lists offices", async () => {
    const user = userEvent.setup()
    const onChannelChange = vi.fn()
    const { rerender } = render(<ContactSection variant="channels" onChannelChange={onChannelChange} />)
    await user.click(screen.getByRole("tab", { name: /Email the studio/ }))
    expect(onChannelChange).toHaveBeenCalledWith("email")
    expect(screen.getByRole("heading", { name: "Email the studio" })).toBeInTheDocument()
    rerender(<ContactSection variant="offices" />)
    expect(screen.getByRole("heading", { name: "Oaxaca" })).toBeInTheDocument()
    expect(screen.getAllByText(/Open until|Closed now/).length).toBeGreaterThan(0)
  })
})
