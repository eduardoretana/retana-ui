import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { SiteHeader } from "@/registry/blocks/site-header"

describe("SiteHeader", () => {
  it("opens a panel, moves with the arrow keys, and reports navigation", async () => {
    const user = userEvent.setup()
    const onNavigate = vi.fn()
    const onCurrentChange = vi.fn()
    render(<SiteHeader className="kiln-header" onNavigate={onNavigate} onCurrentChange={onCurrentChange} />)
    expect(document.querySelector("[data-slot=site-header]")).toHaveClass("kiln-header")
    const work = screen.getByRole("button", { name: "Work" })
    work.focus()
    await user.keyboard("{ArrowRight}")
    expect(screen.getByRole("button", { name: "Visit" })).toHaveFocus()
    await user.click(work)
    expect(work).toHaveAttribute("aria-expanded", "true")
    await user.click(screen.getByRole("button", { name: /Bowls/ }))
    expect(onNavigate).toHaveBeenCalledWith({ label: "Bowls", href: undefined, section: "work" })
    expect(onCurrentChange).toHaveBeenCalledWith("work")
    expect(work).toHaveAttribute("aria-expanded", "false")
  })

  it("opens the mobile sheet and turns solid after scroll", async () => {
    const user = userEvent.setup()
    const node = document.createElement("div")
    Object.defineProperty(node, "scrollTop", { value: 24, configurable: true })
    const scrollContainer = { current: node }
    render(<SiteHeader scrollContainer={scrollContainer} />)
    expect(screen.getByRole("banner")).toHaveAttribute("data-scrolled", "")
    await user.click(screen.getByRole("button", { name: "Open menu" }))
    expect(screen.getByRole("button", { name: "Close menu" })).toHaveAttribute("aria-expanded", "true")
    const kiln = screen.getAllByRole("button", { name: "Kiln" })
    await user.click(kiln[kiln.length - 1])
    expect(screen.getByRole("button", { name: "Open menu" })).toHaveAttribute("aria-expanded", "false")
  })
})
