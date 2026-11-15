import { act } from "react"
import { renderToString } from "react-dom/server"
import { cleanup, render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"

import StressPage from "@/app/examples/timeline-gantt/stress/page"

afterEach(() => cleanup())

describe("timeline-gantt stress page", () => {
  // React #311 in production: a hook ran only after hydration (called behind a short-circuit).
  it("GANTT-STRESS-HYDRATE: hydrates the server markup without a hooks error", async () => {
    const errors: string[] = []
    const spy = vi.spyOn(console, "error").mockImplementation((...args) => { errors.push(args.map(String).join(" ")) })
    const container = document.createElement("div")
    container.innerHTML = renderToString(<StressPage />)
    document.body.appendChild(container)
    let thrown: unknown = null
    try {
      await act(async () => { render(<StressPage />, { container, hydrate: true }) })
    } catch (error) {
      thrown = error
    }
    spy.mockRestore()
    expect(thrown).toBeNull()
    expect(errors.filter((line) => /hook|Hooks|queue|#31[01]/i.test(line))).toEqual([])
    expect(screen.getByRole("heading", { level: 1, name: /Estrés · Cronograma/ })).toBeTruthy()
  })
})
