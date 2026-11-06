import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { VerifyEmail } from "@/registry/blocks/verify-email"

document.elementFromPoint = () => document.body

describe("VerifyEmail", () => {
  it("reuses the otp field when a code can be entered", () => {
    const source = readFileSync(resolve("registry/blocks/verify-email.tsx"), "utf8")
    expect(source).toContain('from "@/registry/retana/ui/otp-field"')
    expect(source).toContain("<OtpField")
  })

  it("disables resend during the cooldown", async () => {
    const user = userEvent.setup()
    const onResend = vi.fn(async () => {})
    render(<VerifyEmail locale="en" email="ada@costa-atelier.example" onResend={onResend} cooldownSeconds={30} />)
    await user.click(screen.getByRole("button", { name: "Resend email" }))
    expect(onResend).toHaveBeenCalledOnce()
    expect(screen.getByRole("button", { name: "Resend email in 0:30" })).toBeDisabled()
  })

  it("starts disabled when the scene opens inside the cooldown", () => {
    render(<VerifyEmail onResend={async () => {}} initialCooldown={12} />)
    expect(screen.getByRole("button", { name: "Resend email in 0:12" })).toBeDisabled()
  })

  it("checks a code and does not surface a missing account", async () => {
    const user = userEvent.setup()
    const onVerifyCode = vi.fn(async (code: string) => code === "123456")
    const onVerified = vi.fn()
    render(
      <VerifyEmail
        locale="es-MX"
        email="ada@costa-atelier.example"
        otp
        onResend={async () => {}}
        onVerifyCode={onVerifyCode}
        onVerified={onVerified}
      />,
    )
    expect(screen.getByRole("heading", { name: "Revisa tu correo" })).toBeInTheDocument()
    await user.type(screen.getByLabelText("Código de verificación"), "000000")
    expect(await screen.findByRole("alert")).toHaveTextContent("Ese código no coincide. Revisa el mensaje más reciente.")
    expect(onVerified).not.toHaveBeenCalled()
    await user.type(screen.getByLabelText("Código de verificación"), "123456")
    expect(await screen.findByRole("heading", { name: "Correo verificado" })).toBeInTheDocument()
    expect(onVerified).toHaveBeenCalledOnce()
    expect(screen.queryByText(/no existe|sin cuenta|not found/i)).not.toBeInTheDocument()
  })

  it("uses the same resend failure copy for every rejection", async () => {
    const user = userEvent.setup()
    const onResend = vi.fn(async () => {
      throw new Error("No account for ada@costa-atelier.example")
    })
    render(<VerifyEmail onResend={onResend} />)
    await user.click(screen.getByRole("button", { name: "Resend email" }))
    expect(await screen.findByRole("alert")).toHaveTextContent("We could not send the email. Try again in a moment.")
    expect(screen.queryByText(/No account/)).not.toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Resend email" })).toBeEnabled()
  })
})
