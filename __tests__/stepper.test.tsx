import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { useState } from "react"
import { describe, expect, it } from "vitest"

import { Stepper, type StepperStep } from "@/registry/ui/stepper"

const steps: StepperStep[] = [
  { id: "prep", label: "Prepare", description: "Wedge the clay" },
  { id: "fire", label: "Fire", description: "Stoneware curve", error: "Kiln cold" },
  { id: "cool", label: "Cool", description: "Open tomorrow" },
]

function Harness({ initial = 1 }: { initial?: number }) {
  const [current, setCurrent] = useState(initial)
  return <Stepper steps={steps} current={current} onStepSelect={setCurrent} label="Firing" />
}

describe("Stepper", () => {
  it("returns to a completed step and announces the current one", async () => {
    const user = userEvent.setup()
    render(<Harness />)
    expect(screen.getByRole("navigation", { name: "Firing" })).toBeInTheDocument()
    expect(screen.getByText("Step 2 of 3: Fire")).toBeInTheDocument()
    const prepare = screen.getByRole("button", { name: /Prepare/ })
    expect(prepare).not.toHaveAttribute("aria-current")
    await user.click(prepare)
    expect(screen.getByText("Step 1 of 3: Prepare")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /Prepare/ })).toHaveAttribute("aria-current", "step")
  })

  it("shows an error in place of the description", () => {
    render(<Stepper steps={steps} current={1} label="Firing" />)
    expect(screen.getAllByText("Kiln cold").length).toBeGreaterThan(0)
    expect(screen.queryByText("Stoneware curve")).not.toBeInTheDocument()
  })

  it("moves between reachable steps with the arrow keys", async () => {
    const user = userEvent.setup()
    render(<Harness initial={2} />)
    const prepare = screen.getByRole("button", { name: /Prepare/ })
    prepare.focus()
    await user.keyboard("{ArrowRight}")
    expect(screen.getByRole("button", { name: /Fire/ })).toHaveFocus()
  })
})
