import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { CodeBlock, highlightLine } from "@/registry/ui/code-block"

describe("CodeBlock", () => {
  it("numbers lines and copies the source", async () => {
    const user = userEvent.setup()
    const writeText = vi.spyOn(navigator.clipboard, "writeText").mockResolvedValue(undefined)
    render(<CodeBlock code={"const a = 1\nreturn a"} filename="nota.ts" language="ts" />)
    expect(screen.getByText("2")).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: "Copy" }))
    expect(writeText).toHaveBeenCalledWith("const a = 1\nreturn a")
  })

  it("collapses lines past maxLines", async () => {
    const user = userEvent.setup()
    render(<CodeBlock code={"one\ntwo\nthree"} maxLines={1} expandLabel="Show all lines" />)
    expect(screen.queryByText("three", { exact: false })).not.toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: "Show all lines" }))
    expect(screen.getByText("3")).toBeInTheDocument()
  })

  it("classifies keywords and strings", () => {
    const tokens = highlightLine('const name = "Bruma"')
    expect(tokens.some((token) => token.type === "keyword" && token.value === "const")).toBe(true)
    expect(tokens.some((token) => token.type === "string")).toBe(true)
  })
})
