import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { ThemeSwitch } from "@/registry/ui/theme-switch"

describe("ThemeSwitch", () => {
  it("asks for the next theme and falls back when view transitions are missing", async () => {
    const user = userEvent.setup()
    const onThemeChange = vi.fn()
    render(<ThemeSwitch theme="light" variant="eclipse" onThemeChange={onThemeChange} />)
    await user.click(screen.getByRole("button", { name: "Switch to dark mode" }))
    expect(onThemeChange).toHaveBeenCalledWith("dark")
  })

  it("runs the change inside startViewTransition when the browser provides it", async () => {
    const user = userEvent.setup()
    const onThemeChange = vi.fn()
    const previous = document.startViewTransition
    const startViewTransition = vi.fn((callback?: () => void) => {
      callback?.()
      return {
        finished: Promise.resolve(),
        ready: Promise.resolve(),
        updateCallbackDone: Promise.resolve(),
        skipTransition() {},
        types: new Set<string>(),
      }
    })
    document.startViewTransition = startViewTransition as unknown as typeof document.startViewTransition
    render(<ThemeSwitch theme="dark" variant="rise" label="Appearance" iconOnly onThemeChange={onThemeChange} />)
    await user.click(screen.getByRole("button", { name: "Appearance" }))
    expect(startViewTransition).toHaveBeenCalledOnce()
    expect(onThemeChange).toHaveBeenCalledWith("light")
    document.startViewTransition = previous
  })
})
