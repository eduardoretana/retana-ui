import { useState } from "react"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { DockNav, dockScaleForDistance, type DockNavItem } from "@/registry/ui/dock-nav"

const items: DockNavItem[] = [
  { value: "home", label: "Home", icon: <span>H</span>, group: "main" },
  { value: "services", label: "Services", icon: <span>S</span>, group: "main" },
  { value: "pathways", label: "Pathways", icon: <span>P</span>, badge: "NEW", group: "main" },
  { value: "tools", label: "Tools", icon: <span>T</span>, disabled: true, group: "main" },
  { value: "search", label: "Search", icon: <span>Q</span>, kind: "search", group: "account" },
  { value: "profile", label: "Profile", icon: <span>U</span>, href: "/profile", group: "account" },
]

describe("dockScaleForDistance", () => {
  it("peaks on the pointer and falls off toward neighbors", () => {
    expect(dockScaleForDistance(0, 44)).toBeCloseTo(1.55, 2)
    expect(dockScaleForDistance(52, 44)).toBeCloseTo(1.29, 2)
    expect(dockScaleForDistance(180, 44)).toBeCloseTo(1, 2)
  })
})

describe("DockNav", () => {
  it("exposes a navigation landmark, the active route, and a group separator", () => {
    const { container } = render(
      <DockNav label="Primary" defaultValue="home" items={items} search={{ placeholder: "Search services" }} />,
    )
    expect(screen.getByRole("navigation", { name: "Primary" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Home" })).toHaveAttribute("aria-current", "page")
    expect(screen.getByRole("button", { name: "Tools" })).toBeDisabled()
    expect(container.querySelectorAll("[data-slot=separator]")).toHaveLength(1)
    expect(screen.getByRole("button", { name: "Search" })).toHaveAttribute("aria-expanded", "false")
  })

  it("selects an item and keeps a controlled value until the parent changes it", async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    const { rerender } = render(
      <DockNav label="Primary" value="home" onValueChange={onValueChange} items={items} />,
    )
    await user.click(screen.getByRole("button", { name: "Services" }))
    expect(onValueChange).toHaveBeenCalledWith("services")
    expect(screen.getByRole("button", { name: "Home" })).toHaveAttribute("aria-current", "page")
    rerender(<DockNav label="Primary" value="services" onValueChange={onValueChange} items={items} />)
    expect(screen.getByRole("button", { name: "Services" })).toHaveAttribute("aria-current", "page")
  })

  it("moves focus with arrows, Home, and End, and skips disabled items", async () => {
    const user = userEvent.setup()
    render(<DockNav label="Primary" defaultValue="home" items={items} />)
    await user.tab()
    expect(screen.getByRole("button", { name: "Home" })).toHaveFocus()
    await user.keyboard("{ArrowRight}")
    expect(screen.getByRole("button", { name: "Services" })).toHaveFocus()
    await user.keyboard("{ArrowRight}")
    expect(screen.getByRole("button", { name: "Pathways" })).toHaveFocus()
    await user.keyboard("{ArrowRight}")
    expect(screen.getByRole("button", { name: "Search" })).toHaveFocus()
    await user.keyboard("{End}")
    expect(screen.getByRole("link", { name: "Profile" })).toHaveFocus()
    await user.keyboard("{Home}")
    expect(screen.getByRole("button", { name: "Home" })).toHaveFocus()
  })

  it("opens search, reports the query, and restores focus on Escape", async () => {
    const user = userEvent.setup()
    const onSearch = vi.fn()
    const onOpenChange = vi.fn()
    render(
      <DockNav
        label="Primary"
        defaultValue="home"
        items={items}
        search={{ placeholder: "Search services", onSearch, onOpenChange }}
      />,
    )
    await user.click(screen.getByRole("button", { name: "Search" }))
    expect(onOpenChange).toHaveBeenCalledWith(true)
    const field = screen.getByRole("searchbox", { name: "Search" })
    expect(field).toHaveFocus()
    expect(screen.getByRole("button", { name: "Search" })).toHaveAttribute("aria-expanded", "true")
    await user.type(field, "paths")
    expect(onSearch).toHaveBeenLastCalledWith("paths")
    await user.keyboard("{Escape}")
    expect(onOpenChange).toHaveBeenCalledWith(false)
    expect(screen.getByRole("button", { name: "Search" })).toHaveFocus()
    expect(screen.queryByRole("searchbox", { name: "Search" })).not.toBeInTheDocument()
  })

  it("closes search from the close button and from a click outside", async () => {
    const user = userEvent.setup()
    render(
      <div>
        <DockNav label="Primary" items={items} search={{ placeholder: "Search services" }} />
        <button type="button">Outside</button>
      </div>,
    )
    await user.click(screen.getByRole("button", { name: "Search" }))
    await user.click(screen.getByRole("button", { name: "Close search" }))
    expect(screen.queryByRole("searchbox")).not.toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Search" })).toHaveFocus()
    await user.click(screen.getByRole("button", { name: "Search" }))
    await user.click(screen.getByRole("button", { name: "Outside" }))
    expect(screen.queryByRole("searchbox")).not.toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Outside" })).toHaveFocus()
  })

  it("does not take focus when search is already open, then focuses on a later open", async () => {
    const user = userEvent.setup()
    const { rerender } = render(
      <DockNav label="Primary" items={items} search={{ defaultOpen: true, placeholder: "Search services" }} />,
    )
    expect(screen.getByRole("searchbox", { name: "Search" })).not.toHaveFocus()

    function Controlled({ open }: { open: boolean }) {
      const [current, setCurrent] = useState(open)
      return (
        <DockNav
          label="Primary"
          items={items}
          search={{ open: current, onOpenChange: setCurrent, placeholder: "Search services" }}
        />
      )
    }
    rerender(<Controlled open />)
    expect(screen.getByRole("searchbox", { name: "Search" })).not.toHaveFocus()
    await user.click(screen.getByRole("button", { name: "Close search" }))
    await user.click(screen.getByRole("button", { name: "Search" }))
    expect(screen.getByRole("searchbox", { name: "Search" })).toHaveFocus()
  })

  it("leaves focus on another control and ignores Escape that starts outside the dock", async () => {
    const user = userEvent.setup()
    function Harness() {
      const [open, setOpen] = useState(true)
      return (
        <div>
          <DockNav
            label="Primary"
            items={items}
            search={{ open, onOpenChange: setOpen, placeholder: "Search services" }}
          />
          <input aria-label="Notes" />
          <div role="dialog" aria-label="Confirm">
            <button type="button">Stay</button>
          </div>
        </div>
      )
    }
    render(<Harness />)
    const notes = screen.getByRole("textbox", { name: "Notes" })
    notes.focus()
    await user.keyboard("{Escape}")
    expect(screen.getByRole("searchbox", { name: "Search" })).toBeInTheDocument()
    expect(notes).toHaveFocus()

    await user.click(screen.getByRole("button", { name: "Stay" }))
    expect(screen.queryByRole("searchbox", { name: "Search" })).not.toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Stay" })).toHaveFocus()
  })

  it("renders href and asChild targets", async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(
      <DockNav
        label="Primary"
        defaultValue="home"
        onValueChange={onValueChange}
        items={[
          { value: "home", label: "Home", icon: <span>H</span>, href: "/home" },
          {
            value: "profile",
            label: "Profile",
            icon: <span>U</span>,
            asChild: <a href="/profile" />,
          },
        ]}
      />,
    )
    expect(screen.getByRole("link", { name: "Home" })).toHaveAttribute("href", "/home")
    expect(screen.getByRole("link", { name: "Profile" })).toHaveAttribute("href", "/profile")
    await user.keyboard("{Tab}{ }")
    expect(onValueChange).toHaveBeenCalledWith("home")
  })

  it("shows the tooltip label and badge on focus", async () => {
    const user = userEvent.setup()
    render(<DockNav label="Primary" defaultValue="home" items={items} />)
    await user.tab()
    await user.keyboard("{ArrowRight}{ArrowRight}")
    expect(screen.getByRole("button", { name: "Pathways" })).toHaveFocus()
    expect(await screen.findByRole("tooltip")).toHaveTextContent("Pathways")
    expect(screen.getByRole("tooltip")).toHaveTextContent("NEW")
  })

  it("remeasures the open search panel on resize when motion is reduced", async () => {
    const originalMatch = window.matchMedia
    const originalRect = HTMLElement.prototype.getBoundingClientRect
    const originalObserver = globalThis.ResizeObserver
    const observed: { current: ResizeObserverCallback | null } = { current: null }
    let width = 100
    window.matchMedia = (query: string) =>
      ({
        matches: query.includes("prefers-reduced-motion"),
        media: query,
        onchange: null,
        addListener: () => {},
        removeListener: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => false,
      }) as MediaQueryList
    HTMLElement.prototype.getBoundingClientRect = function () {
      return {
        x: 0,
        y: 0,
        left: 0,
        top: 0,
        right: width,
        bottom: 44,
        width,
        height: 44,
        toJSON() {},
      } as DOMRect
    }
    globalThis.ResizeObserver = class {
      constructor(next: ResizeObserverCallback) {
        observed.current = next
      }
      observe() {}
      unobserve() {}
      disconnect() {}
    } as unknown as typeof ResizeObserver

    try {
      const { container } = render(<DockNav label="Primary" items={items} search={{ placeholder: "Search services" }} />)
      await waitFor(() => expect(container.querySelector("[data-motion=reduce]")).toBeInTheDocument())
      await userEvent.setup().click(screen.getByRole("button", { name: "Search" }))
      const panel = container.querySelector("form")
      expect(panel).toHaveStyle({ width: "280px" })
      width = 600
      observed.current?.([], {} as ResizeObserver)
      expect(panel).toHaveStyle({ width: "512px" })
    } finally {
      window.matchMedia = originalMatch
      HTMLElement.prototype.getBoundingClientRect = originalRect
      globalThis.ResizeObserver = originalObserver
    }
  })

  it("marks reduced motion when the reader requests it", () => {
    const original = window.matchMedia
    window.matchMedia = (query: string) =>
      ({
        matches: query.includes("prefers-reduced-motion"),
        media: query,
        onchange: null,
        addListener: () => {},
        removeListener: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => false,
      }) as MediaQueryList
    const { container } = render(<DockNav label="Primary" items={items} />)
    expect(container.querySelector("[data-motion=reduce]")).toBeInTheDocument()
    expect(container.querySelector("[data-magnify=false]")).toBeInTheDocument()
    window.matchMedia = original
  })
})
