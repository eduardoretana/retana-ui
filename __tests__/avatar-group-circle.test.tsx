import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { AvatarGroup } from "@/registry/ui/avatar-group"
import { empty, error, filled } from "@/app/examples/avatar-group/fixtures"

describe("avatar-group circle", () => {
  it("renders the filled row with placeholder images and names", () => {
    render(<AvatarGroup layout="circle" members={filled} label="Círculo del taller" />)
    expect(screen.getByRole("list", { name: "Círculo del taller" })).toBeInTheDocument()
    for (const person of filled) {
      expect(screen.getByText(person.name)).toBeInTheDocument()
    }
    expect(document.querySelectorAll("[data-portrait=image]")).toHaveLength(filled.length)
  })

  it("renders the empty row as initials without images", () => {
    render(<AvatarGroup layout="circle" members={empty} label="Círculo del taller" />)
    expect(screen.getByText("IC")).toBeInTheDocument()
    expect(document.querySelector("[data-portrait=image]")).toBeNull()
  })

  it("points the error row at a missing file and still shows initials", () => {
    render(<AvatarGroup layout="circle" members={error} label="Círculo del taller" />)
    const image = document.querySelector("[data-portrait=image]")
    expect(image).toHaveAttribute("data-src", "/idea-450-missing-avatar.svg")
    expect(screen.getByText("IC")).toBeInTheDocument()
  })

  it("can place names above", () => {
    const { container } = render(<AvatarGroup layout="circle" namePlace="above" members={empty} label="Círculo del taller" />)
    expect(container.querySelector("[data-name-place=above]")).toBeTruthy()
  })
})
