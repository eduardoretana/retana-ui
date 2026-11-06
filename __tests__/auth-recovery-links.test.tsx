import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { LoginCentered } from "@/registry/blocks/login-centered"
import { SignIn } from "@/registry/blocks/sign-in"

describe("forgot password links", () => {
  it("stays hidden on sign-in and the centered login until a host passes a href", () => {
    const signIn = render(<SignIn />)
    expect(screen.queryByRole("link", { name: "Forgot password?" })).not.toBeInTheDocument()
    signIn.unmount()
    const login = render(<LoginCentered />)
    expect(screen.queryByRole("link", { name: "Forgot password?" })).not.toBeInTheDocument()
    login.unmount()
  })

  it("points sign-in and the centered login at the recovery route", async () => {
    const signIn = render(<SignIn forgotPasswordHref="/forgot" />)
    expect(screen.getByRole("link", { name: "Forgot password?" })).toHaveAttribute("href", "/forgot")
    signIn.unmount()
    render(<LoginCentered forgotPasswordHref="/forgot" forgotPasswordLabel="Forgot password?" />)
    expect(screen.getByRole("link", { name: "Forgot password?" })).toHaveAttribute("href", "/forgot")
  })
})
