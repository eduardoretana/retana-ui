import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { matchesShortcut, normalizeShortcut, ShortcutList, ShortcutRecorder } from "@/registry/ui/shortcut-recorder"

describe("ShortcutRecorder", () => {
  it("records a modifier chord", async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(<ShortcutRecorder label="Save note" platform="mac" onValueChange={onValueChange} />)
    await user.click(screen.getByRole("button", { name: /Save note/ }))
    await user.keyboard("{Meta>}k{/Meta}")
    expect(onValueChange).toHaveBeenCalledWith("mod+k", {})
    expect(screen.getByRole("status")).toHaveTextContent("Shortcut set to Command K")
    expect(screen.getByText("⌘")).toBeInTheDocument()
    expect(screen.getByText("K")).toBeInTheDocument()
  })

  it("warns before taking a reserved shortcut", async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(<ShortcutRecorder label="Close" platform="mac" defaultValue="mod+s" onValueChange={onValueChange} />)
    await user.click(screen.getByRole("button", { name: /Close/ }))
    await user.keyboard("{Meta>}c{/Meta}")
    expect(screen.getByText(/Reserved for/)).toBeInTheDocument()
    expect(screen.getByText("Copy")).toBeInTheDocument()
    expect(onValueChange).not.toHaveBeenCalled()
    await user.click(screen.getByRole("button", { name: "Use anyway" }))
    expect(onValueChange).toHaveBeenCalledWith("mod+c", {})
  })

  it("asks before stealing another binding and filters the cheatsheet", async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(
      <div>
        <ShortcutRecorder
          label="Focus search"
          platform="other"
          bindings={[{ shortcut: "mod+k", label: "Command palette" }]}
          onValueChange={onValueChange}
        />
        <ShortcutList
          platform="other"
          groups={[{ label: "General", items: [
            { label: "Save note", shortcut: "mod+s" },
            { label: "Find glaze", shortcut: "mod+f" },
          ] }]}
        />
      </div>,
    )
    await user.click(screen.getByRole("button", { name: /Focus search/ }))
    await user.keyboard("{Control>}k{/Control}")
    expect(screen.getByText(/Already used by/)).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: "Cancel" }))
    expect(onValueChange).not.toHaveBeenCalled()
    await user.type(screen.getByRole("searchbox", { name: "Search shortcuts" }), "glaze")
    expect(screen.getByText("Find glaze")).toBeInTheDocument()
    expect(screen.getByText("1 match")).toBeInTheDocument()
  })

  it("normalizes and matches shortcuts", () => {
    expect(normalizeShortcut("ctrl+shift+k", "other")).toBe("mod+shift+k")
    expect(normalizeShortcut("meta+k", "mac")).toBe("mod+k")
    const event = { key: "k", code: "KeyK", metaKey: true, ctrlKey: false, altKey: false, shiftKey: true } as KeyboardEvent
    expect(matchesShortcut(event, "shift+meta+k", "mac")).toBe(true)
  })
})
