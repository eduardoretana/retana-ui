import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it } from "vitest"

import { ReasoningSteps } from "@/registry/ui/reasoning-steps"

describe("ReasoningSteps", () => {
  it("collapses the step list", async () => {
    const user = userEvent.setup()
    render(
      <ReasoningSteps
        title="Reasoning"
        steps={[{ id: "1", title: "Read the file", status: "done", durationMs: 500 }]}
      />,
    )
    expect(screen.getByText("Read the file")).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: /Reasoning/ }))
    expect(screen.queryByText("Read the file")).not.toBeInTheDocument()
  })
})
