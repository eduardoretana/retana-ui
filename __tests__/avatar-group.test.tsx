import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { AvatarGroup } from "@/registry/ui/avatar-group"

const members = [
  { name: "Inés Calderón", status: "online" as const },
  { name: "Mateo Ruiz" },
  { name: "Lucía Peña" },
]

describe("AvatarGroup", () => {
  it("shows the visible people and names the overflow", () => {
    render(<AvatarGroup members={members} max={2} label="Kiln crew" />)
    expect(screen.getByRole("group", { name: "Kiln crew" })).toBeInTheDocument()
    expect(screen.getByRole("img", { name: "Inés Calderón, online" })).toBeInTheDocument()
    expect(screen.getByRole("img", { name: "Mateo Ruiz" })).toBeInTheDocument()
    expect(screen.queryByRole("img", { name: "Lucía Peña" })).not.toBeInTheDocument()
    expect(screen.getByRole("img", { name: "1 more kiln crew" })).toHaveTextContent("+1")
  })

  it("renders an empty stack", () => {
    render(<AvatarGroup members={[]} label="Empty crew" />)
    expect(screen.getByRole("group", { name: "Empty crew" })).toBeEmptyDOMElement()
  })
})
