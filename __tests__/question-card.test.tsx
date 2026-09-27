import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { QuestionCard } from "@/registry/ui/question-card"

describe("QuestionCard", () => {
  it("submits a single choice and free text", async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(
      <QuestionCard
        prompt="Which file?"
        mode="single"
        options={[{ id: "a", label: "Annex" }]}
        onSubmit={onSubmit}
        freeTextLabel="Your answer"
      />,
    )
    await user.click(screen.getByRole("radio", { name: "Annex" }))
    await user.type(screen.getByRole("textbox", { name: "Your answer" }), "Hoy")
    await user.click(screen.getByRole("button", { name: "Send answer" }))
    expect(onSubmit).toHaveBeenCalledWith({ optionIds: ["a"], text: "Hoy" })
    expect(screen.getByRole("status")).toHaveTextContent("Answer sent")
  })
})
