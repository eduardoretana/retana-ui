import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { AiDocument } from "@/registry/ui/ai-document"

describe("AiDocument", () => {
  it("accepts a replacement and rejects an insertion", async () => {
    const user = userEvent.setup()
    const onResolve = vi.fn()
    render(
      <AiDocument
        onResolve={onResolve}
        segments={[
          { id: "r", type: "edit", kind: "replace", text: "30 days", replacement: "45 days" },
          { id: "i", type: "edit", kind: "insert", text: "Payment stays." },
        ]}
      />,
    )
    const accept = screen.getAllByRole("button", { name: "Accept" })
    await user.click(accept[0])
    expect(screen.getByText("45 days")).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: "Reject" }))
    expect(screen.queryByText("Payment stays.")).not.toBeInTheDocument()
    expect(onResolve).toHaveBeenCalledWith("r", "accepted")
  })
})
