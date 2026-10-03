import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it } from "vitest"

import { ComparisonTable } from "@/registry/blocks/comparison-table"

describe("ComparisonTable", () => {
  it("switches the competitor in the stacked layout", async () => {
    const user = userEvent.setup()
    render(<ComparisonTable stackBelow={10000} />)
    expect(screen.getByRole("button", { name: "Legacy suite" })).toHaveAttribute("aria-pressed", "true")
    await user.click(screen.getByRole("button", { name: "Spreadsheets" }))
    expect(screen.getByRole("button", { name: "Spreadsheets" })).toHaveAttribute("aria-pressed", "true")
    expect(screen.getByRole("button", { name: "Legacy suite" })).toHaveAttribute("aria-pressed", "false")
    expect(screen.getByText("Free")).toBeInTheDocument()
  })
})
