import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { NotificationCenter, type NotificationItem } from "@/registry/blocks/notification-center"

const notes: NotificationItem[] = [
  { id: "kiln", title: "Kiln 2 reached temperature", description: "Stoneware is ready to review.", time: "2m" },
  { id: "glaze", title: "Glaze note from Mateo", description: "Celadon batch is mixed.", time: "1h", read: true },
]

describe("NotificationCenter", () => {
  it("dismisses an expanded update", async () => {
    const user = userEvent.setup()
    const onDismiss = vi.fn()
    render(<NotificationCenter notifications={notes} onDismiss={onDismiss} />)
    await user.click(screen.getByRole("button", { name: /Notifications/ }))
    await user.click(screen.getByRole("button", { name: /Kiln 2 reached temperature/ }))
    await user.click(screen.getByRole("button", { name: "Dismiss" }))
    expect(onDismiss).toHaveBeenCalledWith(expect.objectContaining({ id: "kiln" }))
    await waitFor(() => expect(screen.queryByRole("button", { name: /Kiln 2 reached temperature/ })).not.toBeInTheDocument())
  })
})
