import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it } from "vitest"

import { PageHeader } from "@/registry/blocks/page-header"

describe("PageHeader", () => {
  it("steps into the issues list", async () => {
    const user = userEvent.setup()
    render(<PageHeader />)
    expect(screen.getByRole("tab", { name: /Overview/ })).toHaveAttribute("aria-selected", "true")
    await user.click(screen.getByRole("tab", { name: /Issues/ }))
    expect(screen.getByRole("tab", { name: /Issues/ })).toHaveAttribute("aria-selected", "true")
    expect(screen.getByRole("tab", { name: /Issues/ })).toHaveAttribute("data-state", "active")
    expect(screen.getByRole("button", { name: "Mark CA-138 done" })).toBeInTheDocument()
  })
})
