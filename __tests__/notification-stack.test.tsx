import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { NotificationStack, type NotificationStackItem } from "@/registry/ui/notification-stack"

const notices: NotificationStackItem[] = [
  { id: "note", title: "New message", body: "Inés sent a note.", time: "2m", tone: "chart-1" },
  { id: "like", title: "Liked your post", body: "Mateo liked the log.", time: "8m", tone: "chart-2" },
  { id: "comment", title: "New comment", body: "Lucía left a comment.", time: "15m", tone: "chart-3" },
  { id: "follow", title: "New follower", body: "Omar followed the studio.", time: "1h", tone: "chart-4" },
]

function front(container: HTMLElement) {
  const node = container.querySelector("[data-slot='notification-front']")
  if (!(node instanceof HTMLElement)) throw new Error("Missing front card")
  return node
}

function reduceMotion() {
  const original = window.matchMedia
  window.matchMedia = (query: string) =>
    ({
      matches: query.includes("prefers-reduced-motion"),
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }) as MediaQueryList
  return () => {
    window.matchMedia = original
  }
}

describe("NotificationStack", () => {
  it("dismisses the front card, advances the queue, and updates the counter", async () => {
    const user = userEvent.setup()
    const onDismiss = vi.fn()
    const { container } = render(<NotificationStack defaultItems={notices} onDismiss={onDismiss} />)
    expect(screen.getByText("+3")).toBeVisible()
    expect(container.querySelectorAll("[data-slot='notification-tier']")).toHaveLength(3)
    expect(container.querySelector("[data-slot='notification-tier']")).toHaveAttribute("aria-hidden", "true")
    expect(front(container)).toHaveTextContent("New message")

    await user.click(screen.getByRole("button", { name: "Mark New message as done" }))
    expect(onDismiss).toHaveBeenCalledWith("note")
    expect(front(container)).toHaveTextContent("Liked your post")
    expect(screen.getByText("+2")).toBeVisible()
    expect(screen.getByText("Notification dismissed, 3 remaining")).toBeInTheDocument()

    await user.click(screen.getByRole("button", { name: "Mark Liked your post as done" }))
    await user.click(screen.getByRole("button", { name: "Mark New comment as done" }))
    expect(front(container)).toHaveTextContent("New follower")
    expect(screen.queryByText(/^\+/)).not.toBeInTheDocument()
  })

  it("dismisses the focused card with Delete, Backspace, and Escape", async () => {
    const user = userEvent.setup()
    const { container } = render(<NotificationStack defaultItems={notices.slice(0, 3)} expandable={false} />)
    front(container).focus()
    await user.keyboard("{Delete}")
    expect(front(container)).toHaveTextContent("Liked your post")
    front(container).focus()
    await user.keyboard("{Backspace}")
    expect(front(container)).toHaveTextContent("New comment")
    front(container).focus()
    await user.keyboard("{Escape}")
    expect(screen.getByText("You're all caught up")).toBeVisible()
  })

  it("crossfades without a leaving slide when reduced motion is preferred", async () => {
    const restore = reduceMotion()
    try {
      const user = userEvent.setup()
      const { container } = render(<NotificationStack defaultItems={notices.slice(0, 2)} expandable={false} />)
      expect(container.querySelector("[data-slot='notification-stack']")).toHaveAttribute("data-motion", "reduce")
      expect(container.querySelector("style")?.textContent).toContain("prefers-reduced-motion: reduce")
      const tier = container.querySelector<HTMLElement>("[data-slot='notification-tier']")
      expect(tier?.getAttribute("style")).toContain("scale(1)")
      await user.click(screen.getByRole("button", { name: "Mark New message as done" }))
      expect(front(container)).toHaveTextContent("Liked your post")
      expect(container.querySelector("[data-slot='notification-leaving']")).toBeNull()
    } finally {
      restore()
    }
  })

  it("shows the empty state for an empty list and after the last dismiss", async () => {
    const user = userEvent.setup()
    const onEmpty = vi.fn()
    const emptyList = render(<NotificationStack items={[]} emptyLabel="Nothing waiting" />)
    expect(screen.getByText("Nothing waiting")).toBeInTheDocument()
    emptyList.unmount()

    render(
      <NotificationStack defaultItems={[notices[0]]} onEmpty={onEmpty} empty={<p>Clear sky</p>} />,
    )
    await user.click(screen.getByRole("button", { name: "Mark New message as done" }))
    expect(onEmpty).toHaveBeenCalledOnce()
    expect(screen.getByText("Clear sky")).toBeInTheDocument()
    expect(screen.getByText("Notification dismissed, 0 remaining")).toBeInTheDocument()
  })
})
