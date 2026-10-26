import { act, renderHook } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { formatSceneCall } from "@/app/catalog/scene-types"
import { useSceneSim } from "@/app/catalog/use-scene-sim"
import { mergePlpExamples, normalizePlpScenes, plpSceneExamples } from "@/lib/plp"

describe("formatSceneCall", () => {
  it("prints the callback the way the host would write it", () => {
    expect(formatSceneCall("onApprove")).toBe("onApprove()")
    expect(formatSceneCall("onMoveCandidate", ["mariana", "entrevista", "oferta"])).toBe(
      'onMoveCandidate("mariana", "entrevista", "oferta")',
    )
  })
})

describe("PLP scene examples", () => {
  it("builds scene links and keeps the ones already listed", () => {
    const scenes = normalizePlpScenes([
      { id: "filled", label: "Lleno", labelEn: "Filled" },
      "empty",
    ])
    expect(scenes.map((scene) => scene.label)).toEqual(["Lleno", "Vacío"])
    const examples = mergePlpExamples(
      [{ title: "Estrés", href: "/examples/usage-meter/stress" }],
      plpSceneExamples("usage-meter", scenes),
    )
    expect(examples.map((example) => example.href)).toEqual([
      "/examples/usage-meter/stress",
      "/examples/usage-meter?scene=filled",
      "/examples/usage-meter?scene=empty",
    ])
  })
})

describe("useSceneSim", () => {
  it("applies an optimistic change and rolls it back when the call fails", async () => {
    vi.useFakeTimers()
    const log = vi.fn()
    const { result } = renderHook(() => useSceneSim({ n: 1 }, log))
    let pending!: Promise<boolean>
    act(() => {
      pending = result.current.call("onApprove()", (current) => ({ n: current.n + 1 }), undefined, { fail: true, delay: 100 })
    })
    expect(result.current.state.n).toBe(2)
    expect(result.current.pending).toBe("onApprove()")
    await act(async () => {
      await vi.advanceTimersByTimeAsync(100)
      await pending
    })
    expect(result.current.state.n).toBe(1)
    expect(result.current.failed).toBe(true)
    expect(result.current.pending).toBeNull()
    expect(log).toHaveBeenCalledWith("onApprove()")
    vi.useRealTimers()
  })

  it("keeps the committed state when the call succeeds", async () => {
    vi.useFakeTimers()
    const { result } = renderHook(() => useSceneSim({ n: 1 }))
    let pending!: Promise<boolean>
    act(() => {
      pending = result.current.call(
        "onApprove()",
        (current) => ({ n: current.n + 1 }),
        (current) => ({ n: current.n + 1 }),
        { delay: 50 },
      )
    })
    await act(async () => {
      await vi.advanceTimersByTimeAsync(50)
      await pending
    })
    expect(result.current.state.n).toBe(3)
    expect(result.current.failed).toBe(false)
    vi.useRealTimers()
  })
})
