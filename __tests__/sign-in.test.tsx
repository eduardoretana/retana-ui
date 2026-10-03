import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it } from "vitest"

import { SignIn } from "@/registry/blocks/sign-in"

describe("SignIn", () => {
  it("steps from email to the verification code", async () => {
    const user = userEvent.setup()
    render(<SignIn />)
    await user.type(screen.getByLabelText("Email"), "hola@costa-atelier.example")
    await user.click(screen.getByRole("button", { name: "Continue" }))
    expect(await screen.findByRole("heading", { name: "Check your email" }, { timeout: 3000 })).toBeInTheDocument()
    expect(screen.getByText("hola@costa-atelier.example")).toBeInTheDocument()
    expect(screen.getByText(/123456/)).toBeInTheDocument()
  })
})
