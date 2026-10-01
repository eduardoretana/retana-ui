import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { SegmentedControl } from "@/registry/ui/segmented-control"

const options = [
  { value: "week", label: "Week" },
  { value: "month", label: "Month" },
  { value: "year", label: "Year" },
]

describe("SegmentedControl", () => {
  it("moves the selection with arrow keys", async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(<SegmentedControl label="Range" options={options} value="week" onValueChange={onValueChange} />)
    screen.getByRole("button", { name: "Week" }).focus()
    await user.keyboard("{ArrowRight}")
    expect(onValueChange).toHaveBeenCalledWith("month")
  })
})
