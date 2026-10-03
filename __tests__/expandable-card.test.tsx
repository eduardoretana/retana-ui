import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it } from "vitest"

import { ExpandableCard } from "@/registry/ui/expandable-card"

describe("ExpandableCard", () => {
  it("opens the details and closes them with Escape", async () => {
    const user = userEvent.setup()
    render(
      <ExpandableCard title="Kiln log" description="Saturday firing">
        <p>Cone 6, stoneware.</p>
      </ExpandableCard>,
    )
    const trigger = screen.getByRole("button", { name: /Kiln log/ })
    expect(trigger).toHaveAttribute("aria-expanded", "false")
    await user.click(trigger)
    expect(trigger).toHaveAttribute("aria-expanded", "true")
    expect(screen.getByText("Cone 6, stoneware.")).toBeInTheDocument()
    await user.keyboard("{Escape}")
    expect(trigger).toHaveAttribute("aria-expanded", "false")
  })
})
