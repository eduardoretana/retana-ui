import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { CtaSection } from "@/registry/blocks/cta-section"

describe("CtaSection", () => {
  it("dismisses the banner", async () => {
    const user = userEvent.setup()
    const onDismiss = vi.fn()
    render(<CtaSection variant="banner" onDismiss={onDismiss} />)
    expect(screen.getByText("Workflows are here")).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: "Dismiss" }))
    expect(screen.getByRole("region")).toHaveAttribute("data-open", "false")
    await waitFor(() => expect(onDismiss).toHaveBeenCalled())
  })
})
