import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { TaskList } from "@/registry/ui/task-list"

describe("TaskList", () => {
  it("reports progress and toggles a task", async () => {
    const user = userEvent.setup()
    const onToggle = vi.fn()
    render(
      <TaskList
        tasks={[
          { id: "a", title: "Read", done: true },
          { id: "b", title: "Send", done: false },
        ]}
        onToggle={onToggle}
      />,
    )
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "50")
    await user.click(screen.getByRole("checkbox", { name: /Send/ }))
    expect(onToggle).toHaveBeenCalledWith("b", true)
  })
})
