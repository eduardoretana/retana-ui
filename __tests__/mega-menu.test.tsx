import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it } from "vitest"

import { MegaMenu, type MegaMenuItem } from "@/registry/ui/mega-menu"

const items: MegaMenuItem[] = [
  { id: "home", label: "Home", href: "/" },
  {
    id: "products",
    label: "Products",
    panel: {
      featured: {
        title: "The weekday edit",
        description: "Quiet pieces for work and the weekend.",
        cta: { label: "Shop the edit", href: "/edit" },
      },
      columns: [
        {
          id: "men",
          title: "Men",
          items: [{ id: "shirts", label: "Oxford shirts", href: "/men/shirts" }],
          viewAll: { label: "View all", href: "/men" },
        },
      ],
      highlights: [{ id: "new", label: "New arrivals", description: "Check what's new", href: "/new" }],
    },
  },
  { id: "offers", label: "Offers", href: "/offers", badge: "New" },
]

describe("MegaMenu", () => {
  it("opens from a click, renders links, and closes on Escape", async () => {
    const user = userEvent.setup()
    render(<MegaMenu label="Store" items={items} layout="wide" openOn="click" />)
    expect(screen.getByRole("navigation", { name: "Store" })).toBeInTheDocument()
    expect(screen.getByRole("link", { name: "Home" })).toHaveAttribute("href", "/")
    const products = screen.getByRole("button", { name: "Products" })
    expect(products).toHaveAttribute("aria-expanded", "false")
    await user.click(products)
    expect(products).toHaveAttribute("aria-expanded", "true")
    expect(screen.getByRole("region", { name: "Products" })).toBeInTheDocument()
    expect(screen.getByRole("link", { name: "Oxford shirts" })).toHaveAttribute("href", "/men/shirts")
    expect(screen.getByRole("link", { name: /New arrivals/ })).toHaveAttribute("href", "/new")
    await user.keyboard("{Escape}")
    expect(products).toHaveFocus()
    expect(products).toHaveAttribute("aria-expanded", "false")
    expect(screen.queryByRole("region", { name: "Products" })).not.toBeInTheDocument()
  })

  it("opens from hover", async () => {
    const user = userEvent.setup()
    render(<MegaMenu label="Store" items={items} layout="wide" openDelayMs={0} closeDelayMs={0} />)
    await user.hover(screen.getByRole("button", { name: "Products" }))
    expect(screen.getByRole("region", { name: "Products" })).toBeInTheDocument()
  })

  it("opens from the keyboard", async () => {
    const user = userEvent.setup()
    render(<MegaMenu label="Store" items={items} layout="wide" openOn="click" />)
    await user.tab()
    expect(screen.getByRole("link", { name: "Home" })).toHaveFocus()
    await user.keyboard("{ArrowRight}")
    const products = screen.getByRole("button", { name: "Products" })
    expect(products).toHaveFocus()
    await user.keyboard("{Enter}")
    expect(products).toHaveAttribute("aria-expanded", "true")
  })

  it("closes when the pointer goes outside", async () => {
    const user = userEvent.setup()
    render(
      <div>
        <MegaMenu label="Store" items={items} layout="wide" openOn="click" />
        <button type="button">Outside</button>
      </div>,
    )
    await user.click(screen.getByRole("button", { name: "Products" }))
    expect(screen.getByRole("region", { name: "Products" })).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: "Outside" }))
    expect(screen.queryByRole("region", { name: "Products" })).not.toBeInTheDocument()
  })

  it("stacks an accordion in the narrow layout", async () => {
    const user = userEvent.setup()
    const { container } = render(<MegaMenu label="Store" items={items} layout="narrow" openOn="click" />)
    expect(container.querySelector("[data-slot='mega-menu']")).toHaveAttribute("data-layout", "narrow")
    expect(screen.queryByRole("region")).not.toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: "Products" }))
    const region = screen.getByRole("region", { name: "Products" })
    expect(region).toBeInTheDocument()
    expect(screen.getByRole("link", { name: "Oxford shirts" })).toBeInTheDocument()
    expect(region.compareDocumentPosition(screen.getByRole("button", { name: "Products" })) & Node.DOCUMENT_POSITION_FOLLOWING).toBe(0)
  })
})
