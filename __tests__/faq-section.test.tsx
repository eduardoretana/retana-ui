import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { FaqSection } from "@/registry/blocks/faq-section"

describe("FaqSection", () => {
  it("opens an answer and moves between questions with the keyboard", async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(<FaqSection className="kiln-faq" onValueChange={onValueChange} />)
    expect(document.querySelector("[data-slot=faq-section]")).toHaveClass("kiln-faq")
    const first = screen.getByRole("button", { name: /How long does a firing take/ })
    expect(first).toHaveAttribute("aria-expanded", "true")
    first.focus()
    await user.keyboard("{ArrowDown}")
    const second = screen.getByRole("button", { name: /Can I visit the workshop/ })
    expect(second).toHaveFocus()
    await user.click(second)
    expect(second).toHaveAttribute("aria-expanded", "true")
    expect(first).toHaveAttribute("aria-expanded", "false")
    expect(onValueChange).toHaveBeenCalled()
    await user.click(screen.getByRole("button", { name: /Still have a question/ }))
  })

  it("filters by topic and by search", async () => {
    const user = userEvent.setup()
    const { rerender } = render(<FaqSection variant="columns" />)
    await user.click(screen.getByRole("button", { name: /Orders/ }))
    expect(screen.getByRole("button", { name: /How do wholesale orders work/ })).toBeInTheDocument()
    expect(screen.queryByRole("button", { name: /Which clays do you fire/ })).not.toBeInTheDocument()

    rerender(<FaqSection variant="search" />)
    await user.type(screen.getByLabelText("Search questions"), "porcelain")
    expect(screen.getByText("1 answer")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /Which clays do you fire/ })).toBeInTheDocument()
    await user.clear(screen.getByLabelText("Search questions"))
    await user.type(screen.getByLabelText("Search questions"), "zzzz-not-a-topic")
    expect(screen.getByText(/No answers mention/)).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: "Clear search" }))
    expect(screen.getByText("8 questions")).toBeInTheDocument()
  })
})
