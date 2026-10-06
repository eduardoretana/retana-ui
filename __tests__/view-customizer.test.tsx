import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { useState } from "react"
import { describe, expect, it } from "vitest"

import { ViewCustomizer, ViewSwitcher, type ViewOption } from "@/registry/ui/view-customizer"

const options: ViewOption[] = [
  { id: "list", label: "List" },
  { id: "grid", label: "Grid" },
  { id: "board", label: "Board" },
  { id: "canvas", label: "Canvas" },
]

function Harness({ initial }: { initial: string[] }) {
  const [enabled, setEnabled] = useState(initial)
  const shown = options.filter((view) => enabled.includes(view.id))
  return (
    <ViewSwitcher
      views={shown}
      value={shown[0]?.id}
      menu={
        <ViewCustomizer
          views={options}
          enabled={enabled}
          onEnabledChange={setEnabled}
          footer="Saved with this project."
        >
          <button type="button">Views</button>
        </ViewCustomizer>
      }
    />
  )
}

describe("ViewCustomizer", () => {
  it("hides the pill at one view and shows it at two", () => {
    const single = render(<Harness initial={["list"]} />)
    expect(document.querySelector("[data-slot='view-switcher-pill']")).toBeNull()
    single.unmount()
    render(<Harness initial={["list", "grid"]} />)
    expect(document.querySelector("[data-slot='view-switcher-pill']")).not.toBeNull()
  })

  it("hides show-all when every view is on and refuses to turn off the last one", async () => {
    const user = userEvent.setup()
    render(<Harness initial={["list"]} />)
    await user.click(screen.getByRole("button", { name: "Views" }))
    expect(screen.getByRole("button", { name: "Show all" })).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: "List" }))
    expect(screen.getByRole("status")).toHaveTextContent("At least one view stays on.")
    await user.click(screen.getByRole("button", { name: "Show all" }))
    expect(screen.queryByRole("button", { name: "Show all" })).not.toBeInTheDocument()
    expect(screen.getByText("Saved with this project.")).toBeInTheDocument()
  })
})
