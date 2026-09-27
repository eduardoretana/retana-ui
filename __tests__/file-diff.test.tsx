import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it } from "vitest"

import { FileDiff, parseUnifiedDiff } from "@/registry/ui/file-diff"

describe("FileDiff", () => {
  it("parses additions and collapses a long unchanged run", async () => {
    const user = userEvent.setup()
    const lines = parseUnifiedDiff("+nuevo\n-viejo\n igual")
    expect(lines.map((line) => line.kind)).toEqual(["add", "delete", "context"])

    render(
      <FileDiff
        filename="nota.md"
        collapseAfter={2}
        lines={[
          { kind: "context", text: "a", oldNumber: 1, newNumber: 1 },
          { kind: "context", text: "b", oldNumber: 2, newNumber: 2 },
          { kind: "context", text: "c", oldNumber: 3, newNumber: 3 },
          { kind: "add", text: "d", newNumber: 4 },
        ]}
      />,
    )
    expect(screen.queryByText("b")).not.toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: /Show unchanged lines/ }))
    expect(screen.getByText("b")).toBeInTheDocument()
  })
})
