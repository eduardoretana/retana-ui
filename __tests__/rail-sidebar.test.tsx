import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { RailSidebar, type RailSection } from "@/registry/blocks/rail-sidebar"

const sections: RailSection[] = [
  {
    id: "home",
    label: "Home",
    icon: <span>H</span>,
    nav: [
      {
        id: "top",
        items: [
          { id: "overview", label: "Overview", href: "/overview" },
          { id: "inbox", label: "Inbox", href: "/inbox", badge: 4 },
        ],
      },
    ],
  },
  {
    id: "studio",
    label: "Studio",
    icon: <span>S</span>,
    badge: 2,
    nav: [
      {
        id: "work",
        label: "Workspace",
        items: [
          {
            id: "projects",
            label: "Projects",
            defaultOpen: true,
            items: [
              { id: "active", label: "Active", href: "/projects", badge: 5, dot: "chart-1" },
              { id: "archive", label: "Archive", href: "/archive" },
            ],
          },
          {
            id: "tasks",
            label: "Tasks",
            items: [{ id: "mine", label: "Mine", href: "/tasks", badge: 3, dot: "chart-2" }],
          },
        ],
      },
    ],
  },
]

describe("RailSidebar", () => {
  it("shows the active section, current link, and an open group", () => {
    render(
      <RailSidebar
        contained
        sections={sections}
        defaultValue="studio"
        activeHref="/projects"
        workspace={{ name: "Lumen Field", subtitle: "18 people" }}
        user={{ name: "Elena Voss", email: "elena@lumenfield.example" }}
      />,
    )
    expect(screen.getByRole("button", { name: "Studio, 2" })).toHaveAttribute("aria-pressed", "true")
    expect(screen.getByRole("link", { name: /Active/ })).toHaveAttribute("aria-current", "page")
    expect(screen.getByRole("button", { name: /Projects/ })).toHaveAttribute("aria-expanded", "true")
    expect(screen.getByRole("button", { name: /Tasks/ })).toHaveAttribute("aria-expanded", "false")
    expect(screen.getByText("Elena Voss")).toBeInTheDocument()
  })

  it("keeps a controlled section until the parent changes it", async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    const { rerender } = render(
      <RailSidebar contained sections={sections} value="home" onValueChange={onValueChange} />,
    )
    await user.click(screen.getByRole("button", { name: "Studio, 2" }))
    expect(onValueChange).toHaveBeenCalledWith("studio")
    expect(screen.getByRole("link", { name: "Overview" })).toBeInTheDocument()
    rerender(<RailSidebar contained sections={sections} value="studio" onValueChange={onValueChange} />)
    expect(screen.getByRole("button", { name: /Projects/ })).toBeInTheDocument()
  })

  it("opens one group at a time and reports search and command", async () => {
    const user = userEvent.setup()
    const onSearch = vi.fn()
    const onOpenCommand = vi.fn()
    const onNavigate = vi.fn()
    render(
      <RailSidebar
        contained
        sections={sections}
        defaultValue="studio"
        onSearch={onSearch}
        onOpenCommand={onOpenCommand}
        onNavigate={onNavigate}
      />,
    )
    await user.click(screen.getByRole("button", { name: /Tasks/ }))
    expect(screen.getByRole("button", { name: /Projects/ })).toHaveAttribute("aria-expanded", "false")
    expect(screen.getByRole("link", { name: /Mine/ })).toBeInTheDocument()
    await user.type(screen.getByRole("searchbox", { name: "Search" }), "cedar")
    expect(onSearch).toHaveBeenCalled()
    await user.click(screen.getByRole("button", { name: "Open command menu" }))
    expect(onOpenCommand).toHaveBeenCalled()
    await user.click(screen.getByRole("link", { name: /Mine/ }))
    expect(onNavigate).toHaveBeenCalledWith("/tasks")
  })

  it("moves between rail sections with the arrow keys", async () => {
    const user = userEvent.setup()
    render(<RailSidebar contained sections={sections} defaultValue="home" />)
    screen.getByRole("button", { name: "Home" }).focus()
    await user.keyboard("{ArrowDown}")
    expect(screen.getByRole("button", { name: "Studio, 2" })).toHaveFocus()
  })
})
