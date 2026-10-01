import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { ChipGroup } from "@/registry/ui/chip-group"

const options = [
  { value: "clay", label: "Clay" },
  { value: "glaze", label: "Glaze" },
  { value: "kiln", label: "Kiln" },
]

describe("ChipGroup", () => {
  it("toggles chips and keeps option order", async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(<ChipGroup label="Topics" options={options} value={["kiln"]} onValueChange={onValueChange} />)
    await user.click(screen.getByRole("button", { name: "Clay" }))
    expect(onValueChange).toHaveBeenCalledWith(["clay", "kiln"])
    await user.click(screen.getByRole("button", { name: "Kiln" }))
    expect(onValueChange).toHaveBeenLastCalledWith([])
  })

  it("clears the only selection in single mode and folds the rest", async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(<ChipGroup label="Topics" options={options} value={["clay"]} multiple={false} maxVisible={1} onValueChange={onValueChange} />)
    expect(screen.getByRole("button", { name: "+2 more" })).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: "Clay" }))
    expect(onValueChange).toHaveBeenCalledWith([])
  })
})
