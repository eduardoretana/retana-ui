import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { LoginCentered } from "@/registry/blocks/login-centered"

document.elementFromPoint = () => document.body

const fast = { passkey: 0, verified: 0, email: 0, code: 0, provider: 0 }

describe("LoginCentered", () => {
  it("signs in with a passkey, then an email code", async () => {
    const user = userEvent.setup()
    const onSignIn = vi.fn()
    render(<LoginCentered className="kiln-login" delays={fast} resendSeconds={0} onSignIn={onSignIn} demoEmail="hola@costa-atelier.example" />)
    expect(document.querySelector("[data-slot=login-centered]")).toHaveClass("kiln-login")

    await user.click(screen.getByRole("button", { name: "Sign in with passkey" }))
    expect(await screen.findByRole("heading", { name: "Welcome back" })).toBeInTheDocument()
    expect(screen.getByText("hola@costa-atelier.example")).toBeInTheDocument()
    expect(onSignIn).toHaveBeenCalledWith("hola@costa-atelier.example", "Passkey", "sign-in")

    await user.click(screen.getByRole("button", { name: "Sign out" }))
    await user.click(screen.getByRole("button", { name: /Use email instead/ }))
    await user.click(screen.getByRole("button", { name: "Send code" }))
    expect(screen.getByRole("alert")).toHaveTextContent("Enter your email address.")

    await user.type(screen.getByLabelText("Email"), "Hola@Costa-Atelier.example")
    await user.click(screen.getByRole("button", { name: "Send code" }))
    expect(await screen.findByLabelText("Verification code")).toBeInTheDocument()

    await user.type(screen.getByLabelText("Verification code"), "000000")
    expect(await screen.findByRole("alert")).toHaveTextContent("That code didn't match")
    await user.type(screen.getByLabelText("Verification code"), "482913")
    expect(await screen.findByRole("heading", { name: "Welcome back" })).toBeInTheDocument()
    expect(onSignIn).toHaveBeenCalledWith("hola@costa-atelier.example", "Email code", "sign-in")
  })

  it("opens single sign-on and the sign-up email step", async () => {
    const user = userEvent.setup()
    const onSignIn = vi.fn()
    render(<LoginCentered delays={fast} onSignIn={onSignIn} />)
    await user.click(screen.getByRole("button", { name: "Continue with Google" }))
    expect(await screen.findByRole("heading", { name: "Welcome back" })).toBeInTheDocument()
    expect(onSignIn).toHaveBeenCalledWith("maya@studio.example", "Google", "sign-in")
    await user.click(screen.getByRole("button", { name: "Sign out" }))
    await user.click(screen.getByRole("button", { name: "Sign up" }))
    expect(screen.getByRole("heading", { name: "Create your account" })).toBeInTheDocument()
    await user.click(screen.getByRole("link", { name: "Terms" }))
    expect(screen.getByRole("status")).toHaveTextContent(/Terms opens here/)
  })
})
