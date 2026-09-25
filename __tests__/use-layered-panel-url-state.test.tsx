import { act, renderHook } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

const nav = vi.hoisted(() => ({
  params: new URLSearchParams(),
}))

vi.mock("next/navigation", () => ({
  usePathname: () => "/team",
  useSearchParams: () => nav.params,
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
  }),
}))

import { useLayeredPanelUrlState } from "@/registry/hooks/use-layered-panel-url-state"

type Entry = { url: string; state: { lpDepth?: number } | null }

let stack: Entry[]
let index: number

function apply(url: string) {
  const next = new URL(url, "http://localhost")
  nav.params = next.searchParams
}

beforeEach(() => {
  stack = [{ url: "http://localhost/team", state: null }]
  index = 0
  nav.params = new URLSearchParams()

  vi.spyOn(window.history, "pushState").mockImplementation((state, _title, url) => {
    const entry = {
      url: new URL(String(url), "http://localhost").toString(),
      state: state as Entry["state"],
    }
    stack = stack.slice(0, index + 1)
    stack.push(entry)
    index += 1
    apply(entry.url)
  })

  vi.spyOn(window.history, "replaceState").mockImplementation((state, _title, url) => {
    const entry = {
      url: new URL(String(url), "http://localhost").toString(),
      state: state as Entry["state"],
    }
    stack[index] = entry
    apply(entry.url)
  })

  vi.spyOn(window.history, "back").mockImplementation(() => {
    index = Math.max(0, index - 1)
    apply(stack[index]?.url ?? "http://localhost/team")
    window.dispatchEvent(
      new PopStateEvent("popstate", { state: stack[index]?.state ?? null }),
    )
  })

  vi.spyOn(window.history, "go").mockImplementation((delta) => {
    index = Math.max(0, Math.min(stack.length - 1, index + (delta ?? 0)))
    apply(stack[index]?.url ?? "http://localhost/team")
    window.dispatchEvent(
      new PopStateEvent("popstate", { state: stack[index]?.state ?? null }),
    )
  })

  Object.defineProperty(window.history, "state", {
    configurable: true,
    get: () => stack[index]?.state ?? null,
  })
})

describe("useLayeredPanelUrlState", () => {
  it("reads id and mode from the query string", () => {
    nav.params = new URLSearchParams("member=emma&view=full")
    const { result } = renderHook(() =>
      useLayeredPanelUrlState({ param: "member", viewParam: "view" }),
    )

    expect(result.current.open).toBe(true)
    expect(result.current.id).toBe("emma")
    expect(result.current.mode).toBe("full")
  })

  it("pushes peek, then full, and back collapses", () => {
    const { result, rerender } = renderHook(() =>
      useLayeredPanelUrlState({ param: "member", viewParam: "view" }),
    )

    act(() => {
      result.current.openItem("emma")
    })
    rerender()

    expect(result.current.open).toBe(true)
    expect(result.current.id).toBe("emma")
    expect(result.current.mode).toBe("peek")
    expect(window.history.pushState).toHaveBeenCalled()

    act(() => {
      result.current.setMode("full")
    })
    rerender()

    expect(result.current.mode).toBe("full")
    expect(String(stack[index]?.url)).toContain("view=full")

    act(() => {
      result.current.setMode("peek")
    })
    rerender()

    expect(window.history.back).toHaveBeenCalled()
    expect(result.current.mode).toBe("peek")
    expect(result.current.open).toBe(true)
  })

  it("closes a pushed full view with history.go so Back does not stop on peek", () => {
    const { result, rerender } = renderHook(() =>
      useLayeredPanelUrlState({ param: "member", viewParam: "view" }),
    )

    act(() => result.current.openItem("emma"))
    rerender()
    act(() => result.current.setMode("full"))
    rerender()
    act(() => result.current.close())
    rerender()

    expect(window.history.go).toHaveBeenCalledWith(-2)
    expect(result.current.open).toBe(false)
  })

  it("replaces a directly opened full URL instead of leaving the page", () => {
    nav.params = new URLSearchParams("member=emma&view=full")
    const { result, rerender } = renderHook(() =>
      useLayeredPanelUrlState({ param: "member", viewParam: "view" }),
    )

    act(() => result.current.onModeChange("peek"))
    rerender()

    expect(window.history.back).not.toHaveBeenCalled()
    expect(window.history.replaceState).toHaveBeenCalled()
    expect(result.current.mode).toBe("peek")
    expect(result.current.id).toBe("emma")
  })
})
