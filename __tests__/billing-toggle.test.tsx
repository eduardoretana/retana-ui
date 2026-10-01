import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { BillingPrice, BillingToggle } from "@/registry/ui/billing-toggle"

describe("BillingToggle", () => {
  it("moves between periods with the arrow keys and rewrites the badge", async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    const { rerender } = render(
      <BillingToggle
        value="monthly"
        onValueChange={onValueChange}
        options={[
          { value: "monthly", label: "Monthly" },
          { value: "yearly", label: "Yearly", badge: "Save 20%", activeBadge: "You save $48" },
        ]}
      />,
    )
    expect(screen.getByRole("radio", { name: /Save 20%/ })).toHaveAttribute("aria-checked", "false")
    screen.getByRole("radio", { name: "Monthly" }).focus()
    await user.keyboard("{ArrowRight}")
    expect(onValueChange).toHaveBeenCalledWith("yearly")
    rerender(
      <BillingToggle
        value="yearly"
        onValueChange={onValueChange}
        options={[
          { value: "monthly", label: "Monthly" },
          { value: "yearly", label: "Yearly", badge: "Save 20%", activeBadge: "You save $48" },
        ]}
      />,
    )
    expect(screen.getByRole("radio", { name: /You save \$48/ })).toHaveAttribute("aria-checked", "true")
  })

  it("strikes the previous price when it is higher", () => {
    render(<BillingPrice amount={64} was={80} period="per month" />)
    expect(screen.getByText("64")).toBeInTheDocument()
    expect(screen.getByText("$80")).toBeInTheDocument()
    expect(screen.getAllByText("per month").length).toBeGreaterThan(0)
  })
})
