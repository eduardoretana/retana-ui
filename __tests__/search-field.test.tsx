import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { useState } from "react"
import { describe, expect, it } from "vitest"

import { SearchField } from "@/registry/ui/search-field"

function Harness() {
  const [value, setValue] = useState("")
  return <SearchField label="Find a glaze" value={value} onValueChange={setValue} />
}

describe("SearchField", () => {
  it("clears the query and returns focus to the field", async () => {
    const user = userEvent.setup()
    render(<Harness />)
    const input = screen.getByLabelText("Find a glaze")
    await user.type(input, "celadon")
    expect(input).toHaveValue("celadon")
    await user.click(screen.getByRole("button", { name: "Clear search" }))
    expect(input).toHaveValue("")
    expect(input).toHaveFocus()
  })
})
