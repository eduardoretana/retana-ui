import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { ResetPassword } from "@/registry/blocks/reset-password"

const strong = "Abcdefghij1!"

describe("ResetPassword", () => {
  it("reuses the password field and the strength meter", () => {
    const source = readFileSync(resolve("registry/blocks/reset-password.tsx"), "utf8")
    expect(source).toContain('from "@/registry/retana/ui/password-field"')
    expect(source).toContain('from "@/registry/retana/ui/password-strength"')
    expect(source).toContain("<PasswordField")
    expect(source).toContain("<PasswordStrength")
  })

  it("rejects a mismatch and a password that misses the rules", async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn(async () => {})
    render(<ResetPassword locale="en" onSubmit={onSubmit} />)

    await user.type(screen.getByLabelText("New password"), "short")
    await user.type(screen.getByLabelText("Confirm password"), "short")
    await user.click(screen.getByRole("button", { name: "Update password" }))
    expect(onSubmit).not.toHaveBeenCalled()
    expect(screen.getByRole("alert")).toHaveTextContent("The password does not meet the rules yet.")

    await user.clear(screen.getByLabelText("New password"))
    await user.type(screen.getByLabelText("New password"), strong)
    await user.clear(screen.getByLabelText("Confirm password"))
    await user.type(screen.getByLabelText("Confirm password"), `${strong}x`)
    await user.click(screen.getByRole("button", { name: "Update password" }))
    expect(onSubmit).not.toHaveBeenCalled()
    expect(screen.getByRole("alert")).toHaveTextContent("Those passwords do not match.")
  })

  it("submits the new password when the rules pass and the fields match", async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn(async () => {})
    render(<ResetPassword locale="es-MX" onSubmit={onSubmit} signInHref="/entrar" />)
    await user.type(screen.getByLabelText("Contraseña nueva"), strong)
    await user.type(screen.getByLabelText("Confirmar contraseña"), strong)
    await user.click(screen.getByRole("button", { name: "Actualizar contraseña" }))
    expect(onSubmit).toHaveBeenCalledWith({ password: strong })
    expect(await screen.findByRole("heading", { name: "Contraseña actualizada" })).toBeInTheDocument()
  })

  it("explains an invalid or expired link without mentioning an account", () => {
    const { rerender } = render(<ResetPassword onSubmit={async () => {}} tokenState="invalid" requestHref="/forgot" />)
    expect(screen.getByRole("heading", { name: "This link is not valid" })).toBeInTheDocument()
    expect(screen.getByRole("link", { name: "Request a new link" })).toHaveAttribute("href", "/forgot")
    expect(screen.queryByLabelText("New password")).not.toBeInTheDocument()
    rerender(<ResetPassword onSubmit={async () => {}} tokenState="expired" requestHref="/forgot" />)
    expect(screen.getByRole("heading", { name: "This link has expired" })).toBeInTheDocument()
    expect(screen.queryByText(/no account|not found|does not exist/i)).not.toBeInTheDocument()
  })

  it("shows a generic failure when the host rejects the new password", async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn(async () => {
      throw new Error("Token belongs to nobody@costa-atelier.example")
    })
    render(<ResetPassword onSubmit={onSubmit} />)
    await user.type(screen.getByLabelText("New password"), strong)
    await user.type(screen.getByLabelText("Confirm password"), strong)
    await user.click(screen.getByRole("button", { name: "Update password" }))
    expect(await screen.findByRole("alert")).toHaveTextContent("We could not update the password. Try again in a moment.")
    expect(screen.queryByText(/nobody@costa-atelier.example/)).not.toBeInTheDocument()
  })
})
