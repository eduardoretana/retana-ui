import { act, renderHook } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { createHistoryAdapter, useMultiView, useOptimisticRecords } from "@/registry/hooks/use-multi-view"
import type { ViewConfig } from "@/registry/lib/multi-view"

const views: ViewConfig[] = [
  { id: "table", kind: "table", label: "Table", groupField: "stage" },
  { id: "board", kind: "kanban", label: "Board", groupField: "health" },
]

const nav = vi.hoisted(() => ({ params: new URLSearchParams() }))

vi.mock("next/navigation", () => ({
  usePathname: () => "/examples/multi-view",
  useSearchParams: () => nav.params,
}))

import { useNextMultiViewAdapter } from "@/registry/hooks/use-multi-view-url"

describe("useMultiView", () => {
  it("keeps selection and search when the view changes", () => {
    const { result } = renderHook(() => useMultiView({ views, defaultQuery: "bruma" }))
    act(() => result.current.toggleSelected("op-bruma"))
    act(() => result.current.setViewId("board"))
    expect(result.current.query).toBe("bruma")
    expect(result.current.selectedIds).toEqual(["op-bruma"])
    expect(result.current.groupBy).toBe("health")
  })

  it("reads and writes a url adapter", () => {
    const store = new Map<string, string>([["mv.q", "hola"]])
    const url = {
      get: (key: string) => store.get(key) ?? null,
      set: (key: string, value: string | null) => {
        if (value == null || value === "") store.delete(key)
        else store.set(key, value)
      },
    }
    const { result } = renderHook(() => useMultiView({ views, url }))
    expect(result.current.query).toBe("hola")
    act(() => result.current.setQuery("adios"))
    expect(store.get("mv.q")).toBe("adios")
  })

  it("writes through the history adapter", () => {
    const replace = vi.spyOn(window.history, "replaceState").mockImplementation(() => undefined)
    const url = createHistoryAdapter()
    const { result } = renderHook(() => useMultiView({ views, url }))
    act(() => result.current.setQuery("faro"))
    expect(replace).toHaveBeenCalled()
    const urlArg = String(replace.mock.calls.at(-1)?.[2] ?? "")
    expect(urlArg).toContain("mv.q=faro")
    replace.mockRestore()
  })
})

describe("useNextMultiViewAdapter", () => {
  beforeEach(() => {
    nav.params = new URLSearchParams("mv.q=nube")
    vi.spyOn(window.history, "replaceState").mockImplementation(() => undefined)
  })

  it("reads the App Router query", () => {
    const { result } = renderHook(() => {
      const url = useNextMultiViewAdapter()
      return useMultiView({ views, url })
    })
    expect(result.current.query).toBe("nube")
  })
})

describe("enabled views", () => {
  const storage = {
    data: new Map<string, string>(),
    getItem(key: string) {
      return this.data.get(key) ?? null
    },
    setItem(key: string, value: string) {
      this.data.set(key, value)
    },
  }
  const persistViews = { scope: "project" as const, id: "niebla", storage }

  it("keeps at least one view and remembers the set", async () => {
    const first = renderHook(() => useMultiView({ views, persistViews }))
    expect(first.result.current.enabledViews).toEqual(["table", "board"])
    act(() => first.result.current.setEnabledViews(["board"]))
    expect(first.result.current.enabledViews).toEqual(["board"])
    expect(storage.getItem("retana.views.project.niebla")).toBe(JSON.stringify(["board"]))
    act(() => first.result.current.setEnabledViews([]))
    expect(first.result.current.enabledViews).toEqual(["board"])

    const second = renderHook(() => useMultiView({ views, persistViews, defaultEnabledViews: ["table"] }))
    await act(async () => {})
    expect(second.result.current.enabledViews).toEqual(["board"])
    expect(second.result.current.viewId).toBe("board")
  })
})

describe("useOptimisticRecords", () => {
  it("rolls a patch back when the save rejects", async () => {
    const records = [{ id: "a", name: "Before" }]
    const { result } = renderHook(() =>
      useOptimisticRecords({
        records,
        onRecordChange: async () => {
          throw new Error("nope")
        },
      }),
    )
    await act(async () => {
      await expect(result.current.update("a", { name: "After" })).rejects.toThrow("nope")
    })
    expect(result.current.records[0]?.name).toBe("Before")
  })
})
