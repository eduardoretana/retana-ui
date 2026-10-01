import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it } from "vitest"

import { PasswordField } from "@/registry/ui/password-field"

describe("PasswordField", () => {
  it("reveals and hides the password", async () => {
    const user = userEvent.setup()
    render(<PasswordField label="Kiln password" defaultValue="clay-2048" />)
    const input = screen.getByLabelText("Kiln password")
    expect(input).toHaveAttribute("type", "password")
    await user.click(screen.getByRole("button", { name: "Show password" }))
    expect(input).toHaveAttribute("type", "text")
    expect(input).toHaveValue("clay-2048")
    await user.click(screen.getByRole("button", { name: "Hide password" }))
    expect(input).toHaveAttribute("type", "password")
  })
})
