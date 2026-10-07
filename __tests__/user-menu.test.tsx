import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { UserMenu } from "@/registry/ui/user-menu"

const user = { name: "Inés Calderón", email: "ines@costa-atelier.example", plan: "Studio" }

function mockViewport(compact: boolean) {
  const original = window.matchMedia
  window.matchMedia = (query: string) =>
    ({
      matches: compact && query.includes("max-width"),
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }) as MediaQueryList
  return () => {
    window.matchMedia = original
  }
}

describe("UserMenu", () => {
  it("opens the account menu and keeps theme and sign-out as actions", async () => {
    const actor = userEvent.setup()
    const onThemeChange = vi.fn()
    const onSignOut = vi.fn()
    const onSelect = vi.fn()
    render(
      <UserMenu
        user={user}
        showTheme
        defaultTheme="system"
        onThemeChange={onThemeChange}
        onSignOut={onSignOut}
        items={[{ label: "Profile", onSelect }]}
      />,
    )
    await actor.click(screen.getByRole("button", { name: /Account menu, Inés Calderón/ }))
    expect(screen.getByRole("menu")).toBeInTheDocument()
    expect(screen.getByText("ines@costa-atelier.example")).toBeInTheDocument()
    const dark = screen.getByRole("menuitemradio", { name: "Dark" })
    expect(dark.className).toContain("focus-visible:ring-2")
    await actor.click(dark)
    expect(onThemeChange).toHaveBeenCalledWith("dark")
    expect(screen.getByRole("menu")).toBeInTheDocument()
    await actor.click(screen.getByRole("menuitem", { name: "Profile" }))
    expect(onSelect).toHaveBeenCalledOnce()
    expect(screen.getByRole("button", { name: /Account menu, Inés Calderón/ })).toHaveAttribute("aria-expanded", "false")
    await actor.click(screen.getByRole("button", { name: /Account menu, Inés Calderón/ }))
    await actor.click(screen.getByRole("menuitem", { name: "Sign out" }))
    expect(onSignOut).toHaveBeenCalledOnce()
  })

  it("presents the actions in a bottom sheet on a narrow viewport", async () => {
    const restore = mockViewport(true)
    const actor = userEvent.setup()
    render(<UserMenu user={user} showTheme={false} onSignOut={() => {}} />)
    await actor.click(screen.getByRole("button", { name: /Account menu, Inés Calderón/ }))
    expect(screen.getByRole("dialog")).toBeInTheDocument()
    expect(screen.getByRole("menuitem", { name: "Sign out" })).toBeInTheDocument()
    restore()
  })

  it("shows progress while sign-out is pending", async () => {
    const actor = userEvent.setup()
    let finish: () => void = () => {}
    const onSignOut = () => new Promise<void>((resolve) => { finish = resolve })
    render(<UserMenu user={user} showTheme={false} onSignOut={onSignOut} />)
    await actor.click(screen.getByRole("button", { name: /Account menu/ }))
    await actor.click(screen.getByRole("menuitem", { name: /Sign out/ }))
    expect(screen.getByRole("menuitem", { name: /Sign/ })).toHaveAttribute("aria-busy", "true")
    expect(screen.getByText("Signing out")).toBeInTheDocument()
    finish()
    expect(await screen.findByRole("button", { name: /Account menu/ })).toHaveAttribute("aria-expanded", "false")
  })
})
