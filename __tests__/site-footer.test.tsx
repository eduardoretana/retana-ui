import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { SiteFooter } from "@/registry/blocks/site-footer"

describe("SiteFooter", () => {
  it("validates the newsletter and confirms a subscription", async () => {
    const user = userEvent.setup()
    const onSubscribe = vi.fn()
    const onNavigate = vi.fn()
    render(<SiteFooter className="kiln-footer" onNavigate={onNavigate} newsletter={{ title: "Notes from the kiln", onSubscribe }} />)
    expect(document.querySelector("[data-slot=site-footer]")).toHaveClass("kiln-footer")
    await user.click(screen.getByRole("button", { name: "Subscribe" }))
    expect(screen.getByRole("alert")).toHaveTextContent("Enter your email address")
    await user.type(screen.getByLabelText("Email address"), "not-an-email")
    await user.click(screen.getByRole("button", { name: "Subscribe" }))
    expect(screen.getByRole("alert")).toHaveTextContent("That email doesn't look right")
    await user.clear(screen.getByLabelText("Email address"))
    await user.type(screen.getByLabelText("Email address"), "hola@costa-atelier.example")
    await user.click(screen.getByRole("button", { name: "Subscribe" }))
    expect(await screen.findByRole("button", { name: "Subscribed" })).toBeDisabled()
    expect(onSubscribe).toHaveBeenCalledWith("hola@costa-atelier.example")
    await user.click(screen.getByRole("button", { name: "Privacy" }))
    expect(onNavigate).toHaveBeenCalledWith({ label: "Privacy" })
  })

  it("closes with the brand name as text", () => {
    render(<SiteFooter variant="logo" brand={{ name: "Costa Atelier" }} newsletter={null} />)
    const mark = screen.getByText("Costa Atelier", { selector: "[data-slot=site-footer-wordmark]" })
    expect(mark.tagName).toBe("P")
    expect(mark.querySelector("svg")).toBeNull()
    expect(mark.textContent).toBe("Costa Atelier")
  })
})
