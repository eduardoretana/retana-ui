import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it } from "vitest"

import { PlanComparison } from "@/registry/blocks/plan-comparison"

describe("PlanComparison", () => {
  it("filters the matrix down to differences", async () => {
    const user = userEvent.setup()
    render(<PlanComparison />)
    expect(screen.getByText("8 of 8 features")).toBeInTheDocument()
    expect(screen.getByRole("rowheader", { name: "Active firings" })).toBeInTheDocument()
    await user.click(screen.getByRole("switch", { name: "Show differences only" }))
    expect(screen.getByRole("switch", { name: "Show differences only" })).toHaveAttribute("aria-checked", "true")
    expect(screen.getByText("6 of 8 features")).toBeInTheDocument()
    await waitFor(() => expect(screen.queryByRole("rowheader", { name: "Active firings" })).not.toBeInTheDocument())
    expect(screen.getByRole("rowheader", { name: "Shared benches" })).toBeInTheDocument()
  })
})
