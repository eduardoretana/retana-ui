import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it } from "vitest"

import { InboxList } from "@/registry/ui/inbox-list"

const items = [
  { id: "a", title: "Inés Soler", subtitle: "Horno", preview: "El esmalte", time: "10m", unread: 2, presence: "online" as const },
  { id: "b", title: "Bruno Hale", subtitle: "Caja", preview: "Llegó rota", time: "1h" },
]

describe("InboxList", () => {
  it("filters accents, moves with arrows, and shows an empty state", async () => {
    const user = userEvent.setup()
    render(<InboxList label="Inbox" title="Bandeja" countLabel="2" searchLabel="Search" items={items} emptyTitle="Nada" />)

    expect(screen.getByText("2 unread")).toBeInTheDocument()
    expect(screen.getByText("online")).toBeInTheDocument()

    const first = screen.getByRole("option", { name: /Inés Soler/ })
    first.focus()
    await user.keyboard("{ArrowDown}")
    expect(screen.getByRole("option", { name: /Bruno Hale/ })).toHaveAttribute("aria-selected", "true")

    await user.type(screen.getByRole("textbox", { name: "Search" }), "ines")
    expect(screen.getByRole("option", { name: /Inés Soler/ })).toBeInTheDocument()
    expect(screen.queryByRole("option", { name: /Bruno Hale/ })).not.toBeInTheDocument()

    await user.type(screen.getByRole("textbox", { name: "Search" }), "zzz")
    expect(screen.getByRole("status")).toHaveTextContent("Nada")
  })
})
