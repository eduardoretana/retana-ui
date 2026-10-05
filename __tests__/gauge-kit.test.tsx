import { act, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { useState } from "react"
import { describe, expect, it, vi } from "vitest"

import { CarDashboard } from "@/registry/blocks/gauge-scenes"
import {
  Gauge,
  GaugeArc,
  GaugeControl,
  GaugeTrack,
  clockLabel,
  clockTime,
  compassLabel,
  durationLabel,
  gaugeTemplates,
  springPhysics,
  stepSpring,
  templatePreview,
  useAnimatedValue,
  zoneColor,
} from "@/registry/ui/gauge-kit"

describe("gauge kit helpers", () => {
  it("names zones, compass points, and clock labels", () => {
    const zones = [
      { to: 60, color: "var(--chart-2)" },
      { to: 80, color: "var(--chart-4)" },
      { to: 100, color: "var(--destructive)" },
    ]
    expect(zoneColor(zones, 10, "var(--primary)")).toBe("var(--chart-2)")
    expect(zoneColor(zones, 90, "var(--primary)")).toBe("var(--destructive)")
    expect(zoneColor([], 1, "var(--primary)")).toBe("var(--primary)")
    expect(compassLabel(0)).toBe("N")
    expect(compassLabel(90)).toBe("E")
    expect(clockLabel(0)).toBe("12")
    expect(clockLabel(15)).toBe("3")
    expect(clockTime(6.5)).toBe("06:30")
    expect(durationLabel(1.5)).toBe("1h 30m")
  })

  it("settles a spring on its target", () => {
    const physics = springPhysics({ type: "spring", visualDuration: 0.4, bounce: 0 })
    let state = { value: 0, velocity: 0 }
    for (let i = 0; i < 240; i++) {
      const step = stepSpring(state, 80, physics, 1 / 60, 0.01)
      state = step.state
      if (step.done) break
    }
    expect(state.value).toBe(80)
  })

  it("builds a finite spec for every template", () => {
    expect(gaugeTemplates.length).toBeGreaterThanOrEqual(27)
    for (const template of gaugeTemplates) {
      const { spec, value } = templatePreview(template)
      expect(Number.isFinite(spec.domain.min)).toBe(true)
      expect(Number.isFinite(spec.domain.max)).toBe(true)
      expect(spec.domain.max).toBeGreaterThan(spec.domain.min)
      expect(Number.isFinite(value)).toBe(true)
    }
  })
})

function Knob() {
  const [value, setValue] = useState(10)
  return (
    <GaugeControl value={value} onChange={setValue} min={0} max={100} step={5} label="Luz del taller">
      <Gauge value={value} label="Luz del taller">
        <GaugeTrack />
        <GaugeArc />
      </Gauge>
    </GaugeControl>
  )
}

describe("gauge kit accessibility", () => {
  it("exposes a meter", () => {
    render(
      <Gauge value={42} min={0} max={180} label="Velocidad">
        <GaugeTrack />
        <GaugeArc />
      </Gauge>,
    )
    const meter = screen.getByRole("meter", { name: "Velocidad" })
    expect(meter).toHaveAttribute("aria-valuenow", "42")
    expect(meter).toHaveAttribute("aria-valuemin", "0")
    expect(meter).toHaveAttribute("aria-valuemax", "180")
  })

  it("moves a knob from the keyboard", async () => {
    const user = userEvent.setup()
    render(<Knob />)
    const slider = screen.getByRole("slider", { name: "Luz del taller" })
    slider.focus()
    await user.keyboard("{ArrowUp}")
    expect(slider).toHaveAttribute("aria-valuenow", "15")
    await user.keyboard("{Home}")
    expect(slider).toHaveAttribute("aria-valuenow", "0")
    await user.keyboard("{End}")
    expect(slider).toHaveAttribute("aria-valuenow", "100")
  })

  it("snaps when reduced motion is requested", async () => {
    const frames: FrameRequestCallback[] = []
    vi.stubGlobal("requestAnimationFrame", (cb: FrameRequestCallback) => {
      frames.push(cb)
      return frames.length
    })
    vi.stubGlobal("cancelAnimationFrame", () => {})
    vi.stubGlobal("matchMedia", (query: string) => ({
      matches: query.includes("reduce"),
      media: query,
      addEventListener() {},
      removeEventListener() {},
      addListener() {},
      removeListener() {},
      dispatchEvent() {
        return false
      },
      onchange: null,
    }))

    function Probe() {
      const value = useAnimatedValue(80, { type: "tween", duration: 4 }, 100, 0)
      return <output>{value}</output>
    }

    render(<Probe />)
    expect(frames.length).toBeGreaterThan(0)
    await act(async () => {
      frames.splice(0).forEach((frame) => frame(performance.now()))
    })
    expect(screen.getByText("80")).toBeInTheDocument()
    vi.unstubAllGlobals()
  })

  it("renders the car cluster", () => {
    render(<CarDashboard />)
    expect(screen.getAllByRole("meter").length).toBeGreaterThan(0)
  })
})
