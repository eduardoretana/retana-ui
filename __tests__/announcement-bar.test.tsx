import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { AnnouncementBar, clearAnnouncementDismissal } from "@/registry/ui/announcement-bar"

const messages = [
  { id: "kiln", message: "Kiln 2 is at temperature" },
  { id: "gallery", message: "Gallery opens Friday" },
]

describe("AnnouncementBar", () => {
  it("rotates to the next message and dismisses", async () => {
    const user = userEvent.setup()
    const onOpenChange = vi.fn()
    const onIndexChange = vi.fn()
    render(<AnnouncementBar messages={messages} controls autoPlay={false} onOpenChange={onOpenChange} onIndexChange={onIndexChange} />)
    expect(screen.getByText("Kiln 2 is at temperature")).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: "Next announcement" }))
    expect(onIndexChange).toHaveBeenCalledWith(1)
    expect(screen.getByText("Gallery opens Friday")).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: "Previous announcement" }))
    expect(onIndexChange).toHaveBeenCalledWith(0)
    await user.click(screen.getByRole("button", { name: "Dismiss" }))
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it("remembers a dismissal", async () => {
    const user = userEvent.setup()
    clearAnnouncementDismissal("studio")
    const { unmount } = render(<AnnouncementBar id="studio" messages={messages} autoPlay={false} />)
    await user.click(screen.getByRole("button", { name: "Dismiss" }))
    expect(window.localStorage.getItem("arc-announcement:studio")).toBe("dismissed")
    unmount()
    render(<AnnouncementBar id="studio" messages={messages} autoPlay={false} />)
    expect(window.localStorage.getItem("arc-announcement:studio")).toBe("dismissed")
    clearAnnouncementDismissal("studio")
  })
})
