import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { TagInput } from "@/registry/ui/tag-input"

describe("TagInput", () => {
  it("adds a tag on Enter and ignores a duplicate", async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(<TagInput label="Tags" onValueChange={onValueChange} />)
    const input = screen.getByLabelText("Tags")
    await user.type(input, "clay{Enter}")
    expect(onValueChange).toHaveBeenCalledWith(["clay"])
    await user.type(input, "Clay{Enter}")
    expect(onValueChange).toHaveBeenCalledTimes(1)
    expect(screen.getByText("clay is already added")).toBeInTheDocument()
  })

  it("removes the picked tag with Backspace", async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(<TagInput label="Tags" defaultValue={["clay", "glaze"]} onValueChange={onValueChange} />)
    screen.getByLabelText("Tags").focus()
    await user.keyboard("{Backspace}{Backspace}")
    expect(onValueChange).toHaveBeenCalledWith(["clay"])
    expect(screen.getByText("Removed glaze")).toBeInTheDocument()
  })
})
