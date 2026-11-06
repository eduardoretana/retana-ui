import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MotionConfig } from "motion/react"
import { describe, expect, it, vi } from "vitest"

import { recoverySentBody } from "@/registry/blocks/auth-recovery-copy"
import { ForgotPassword } from "@/registry/blocks/forgot-password"

async function submit(email: string, onSubmit: (value: string) => Promise<void>) {
  const user = userEvent.setup()
  const view = render(<ForgotPassword locale="en" onSubmit={onSubmit} signInHref="/sign-in" />)
  await user.type(screen.getByLabelText("Email"), email)
  await user.click(screen.getByRole("button", { name: "Send link" }))
  return { user, view }
}

describe("ForgotPassword", () => {
  it("shows the same sent copy whether the host accepts the address or not", async () => {
    const known = vi.fn(async () => {})
    const unknown = vi.fn(async () => {})
    const first = await submit("ada@costa-atelier.example", known)
    expect(await screen.findByRole("heading", { name: "Check your inbox" })).toBeInTheDocument()
    expect(screen.getByText(recoverySentBody("en"))).toBeInTheDocument()
    expect(known).toHaveBeenCalledWith("ada@costa-atelier.example")
    first.view.unmount()

    await submit("nobody@costa-atelier.example", unknown)
    expect(await screen.findByRole("heading", { name: "Check your inbox" })).toBeInTheDocument()
    expect(screen.getByText(recoverySentBody("en"))).toBeInTheDocument()
    expect(screen.queryByText(/not found|no account|does not exist/i)).not.toBeInTheDocument()
  })

  it("hides a rejection message that would reveal the account", async () => {
    const onSubmit = vi.fn(async () => {
      throw new Error("No account for this email")
    })
    await submit("ada@costa-atelier.example", onSubmit)
    expect(await screen.findByRole("alert")).toHaveTextContent("We could not send the link. Try again in a moment.")
    expect(screen.queryByText(/No account for this email/)).not.toBeInTheDocument()
    expect(screen.queryByRole("heading", { name: "Check your inbox" })).not.toBeInTheDocument()
  })

  it("rejects an incomplete address before calling the host", async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn(async () => {})
    render(<ForgotPassword locale="es-MX" onSubmit={onSubmit} />)
    await user.click(screen.getByRole("button", { name: "Enviar enlace" }))
    expect(screen.getByRole("alert")).toHaveTextContent("Escribe tu correo.")
    expect(onSubmit).not.toHaveBeenCalled()
    await user.type(screen.getByLabelText("Correo"), "ada@")
    await user.click(screen.getByRole("button", { name: "Enviar enlace" }))
    expect(screen.getByRole("alert")).toHaveTextContent("Escribe un correo completo, como nombre@ejemplo.com.")
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it("drops the enter offset when motion is reduced", () => {
    render(
      <MotionConfig reducedMotion="always">
        <ForgotPassword onSubmit={async () => {}} />
      </MotionConfig>,
    )
    expect(document.querySelector("[data-slot=forgot-password]")).toHaveAttribute("data-motion", "reduced")
  })

  it("moves focus from the email field to the action and the way back", async () => {
    const user = userEvent.setup()
    render(<ForgotPassword onSubmit={async () => {}} signInHref="/sign-in" />)
    await user.tab()
    expect(screen.getByLabelText("Email")).toHaveFocus()
    await user.tab()
    expect(screen.getByRole("button", { name: "Send link" })).toHaveFocus()
    await user.tab()
    expect(screen.getByRole("link", { name: "Back to sign in" })).toHaveFocus()
  })
})
