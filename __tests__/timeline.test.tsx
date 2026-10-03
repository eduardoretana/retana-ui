import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it } from "vitest"

import { Timeline, type TimelineEvent } from "@/registry/ui/timeline"

const now = Date.parse("2026-04-02T15:00:00Z")
const events: TimelineEvent[] = [
  { id: "merge", at: "2026-04-02T14:00:00Z", actor: "Inés", title: "merged the glaze notes", detail: "Stoneware batch 12" },
  { id: "ship", at: "2026-04-01T14:00:00Z", actor: "Noa", title: "packed the wholesale crate", detail: "Four bowls" },
]

describe("Timeline", () => {
  it("expands a row and moves between rows with the keyboard", async () => {
    const user = userEvent.setup()
    render(<Timeline events={events} now={now} label="Studio log" />)
    expect(screen.getByRole("heading", { name: /Today/ })).toBeInTheDocument()
    const first = screen.getByRole("button", { name: /merged the glaze notes/ })
    expect(first).toHaveAttribute("aria-expanded", "false")
    await user.click(first)
    expect(first).toHaveAttribute("aria-expanded", "true")
    expect(screen.getByText("Stoneware batch 12")).toBeInTheDocument()
    first.focus()
    await user.keyboard("{ArrowDown}")
    expect(screen.getByRole("button", { name: /packed the wholesale crate/ })).toHaveFocus()
  })

  it("renders an empty feed", () => {
    render(<Timeline events={[]} now={now} label="Studio log" />)
    expect(screen.getByRole("region", { name: "Studio log" })).toBeInTheDocument()
  })
})
