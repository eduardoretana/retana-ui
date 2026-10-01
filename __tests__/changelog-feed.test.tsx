import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it } from "vitest"

import { ChangelogFeed } from "@/registry/blocks/changelog-feed"

describe("ChangelogFeed", () => {
  it("filters release notes by kind", async () => {
    const user = userEvent.setup()
    render(<ChangelogFeed />)
    expect(screen.getByText("Showing 9 updates")).toBeInTheDocument()
    expect(screen.getByText("Shelf gallery for the shop")).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: "Fixed" }))
    expect(screen.getByRole("button", { name: "Fixed" })).toHaveAttribute("aria-pressed", "true")
    expect(screen.getByText("Showing 2 of 9 updates")).toBeInTheDocument()
    await waitFor(() => expect(screen.queryByText("Shelf gallery for the shop")).not.toBeInTheDocument())
    expect(screen.getByText("Discount codes stay applied after a currency switch")).toBeInTheDocument()
  })
})
