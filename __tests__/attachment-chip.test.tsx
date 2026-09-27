import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { AttachmentChip } from "@/registry/ui/attachment-chip"

describe("AttachmentChip", () => {
  it("shows the size and removes the chip", async () => {
    const user = userEvent.setup()
    const onRemove = vi.fn()
    render(<AttachmentChip name="anexo.pdf" size={2048} type="application/pdf" removeLabel="Remove" onRemove={onRemove} />)
    expect(screen.getByText("2 KB")).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: "Remove anexo.pdf" }))
    expect(onRemove).toHaveBeenCalledOnce()
  })
})
