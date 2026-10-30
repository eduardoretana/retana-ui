import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MotionConfig } from "motion/react"
import { useState } from "react"
import { describe, expect, it } from "vitest"

import { STAGGER_LIST_MAX, staggerDelay, StaggerList } from "@/registry/ui/stagger-list"

describe("staggerDelay", () => {
  it("caps the total wait", () => {
    expect(staggerDelay(0, 10, 0.035, 0.4)).toBe(0)
    expect(staggerDelay(9, 10, 0.035, STAGGER_LIST_MAX)).toBeCloseTo(0.315)
    expect(staggerDelay(19, 20, 0.2, 0.4)).toBeCloseTo(0.4)
    expect(staggerDelay(2, 1, 0.2, 0.4)).toBe(0)
    for (let count = 1; count <= 40; count += 1) {
      for (let index = 0; index < count; index += 1) {
        expect(staggerDelay(index, count, 0.2, 0.4)).toBeLessThanOrEqual(0.4 + 1e-9)
      }
    }
  })
})

function Swap() {
  const [items, setItems] = useState([
    { id: "kiln", label: "Horneada" },
    { id: "glaze", label: "Esmalte" },
  ])
  return (
    <>
      <button type="button" onClick={() => setItems([{ id: "handoff", label: "Entrega" }])}>
        Cambiar día
      </button>
      <StaggerList items={items} label="Agenda">
        {(item) => item.label}
      </StaggerList>
    </>
  )
}

describe("StaggerList", () => {
  it("renders the items as a named list", () => {
    render(
      <StaggerList
        items={[
          { id: "a", label: "Horneada" },
          { id: "b", label: "Esmalte" },
        ]}
        label="Agenda del jueves"
      >
        {(item) => item.label}
      </StaggerList>,
    )
    expect(screen.getByRole("list", { name: "Agenda del jueves" })).toBeInTheDocument()
    expect(screen.getByText("Horneada")).toBeInTheDocument()
    expect(screen.getByText("Esmalte")).toBeInTheDocument()
  })

  it("shows the empty state", () => {
    render(
      <StaggerList items={[]} empty="El horno no tiene nada programado.">
        {() => null}
      </StaggerList>,
    )
    expect(screen.getByText("El horno no tiene nada programado.")).toBeInTheDocument()
  })

  it("skips travel when motion is reduced and swaps the rows", async () => {
    const user = userEvent.setup()
    render(
      <MotionConfig reducedMotion="always">
        <Swap />
      </MotionConfig>,
    )
    expect(screen.getByRole("list").getAttribute("data-motion")).toBe("reduced")
    await user.click(screen.getByRole("button", { name: "Cambiar día" }))
    expect(screen.getByText("Entrega")).toBeInTheDocument()
    expect(screen.queryByText("Horneada")).not.toBeInTheDocument()
  })
})
