import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { SignupForm } from "@/registry/blocks/signup-form"

describe("SignupForm", () => {
  it("submits valid account details", async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(<SignupForm onSubmit={onSubmit} />)
    await user.type(screen.getByLabelText("Full name"), "Ines Calderon")
    await user.type(screen.getByLabelText("Work email"), "hola@costa-atelier.example")
    await user.type(screen.getByLabelText("Password"), "kiln-2048")
    await user.click(screen.getByRole("button", { name: "Create account" }))
    await waitFor(() => expect(onSubmit).toHaveBeenCalledOnce(), { timeout: 3000 })
    expect(onSubmit).toHaveBeenCalledWith({
      name: "Ines Calderon",
      email: "hola@costa-atelier.example",
      password: "kiln-2048",
      productUpdates: false,
    })
    expect(await screen.findByRole("heading", { name: "Welcome, Ines" })).toBeInTheDocument()
  })
})
