import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { PasswordStrength, estimateStrength } from "@/registry/ui/password-strength"

describe("PasswordStrength", () => {
  it("scores short and complete passwords", () => {
    expect(estimateStrength("abc")).toMatchObject({ level: 1, label: "Too short" })
    expect(estimateStrength("Abcdefghij1!")).toMatchObject({ level: 4, label: "Strong", met: ["length", "case", "number", "symbol"] })
  })

  it("updates the meter while typing and reveals the value", async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(<PasswordStrength label="Password" onValueChange={onValueChange} />)
    const input = screen.getByLabelText("Password")
    expect(screen.getByRole("meter")).toHaveAttribute("aria-valuetext", "No password yet")
    await user.type(input, "a")
    expect(screen.getByRole("meter")).toHaveAttribute("aria-valuetext", "Too short")
    expect(onValueChange).toHaveBeenLastCalledWith("a", expect.objectContaining({ label: "Too short" }))
    await user.click(screen.getByRole("button", { name: "Show password" }))
    expect(input).toHaveAttribute("type", "text")
    expect(input).toHaveValue("a")
  })
})
