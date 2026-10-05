import { render, screen } from "@testing-library/react"
import { beforeAll, describe, expect, it } from "vitest"

import { GaugeStudio } from "@/registry/blocks/gauge-studio"
import { TimeDashboard } from "@/registry/blocks/gauge-scenes"
import { gaugeTemplates, palette } from "@/registry/ui/gauge-kit"

const SHOWCASE = [
  "Simple",
  "Speedometer",
  "Internet speed",
  "SaaS metric",
  "Sun path",
  "Temperature",
  "Thermostat",
  "Progress ring",
  "Dimmer",
  "Analog dial",
  "Compass",
  "Wind direction",
  "Clock",
  "Activity ring",
  "Fuel",
  "Battery",
  "Tachometer",
  "Power meter",
  "Air quality",
  "Heart rate",
]

beforeAll(() => {
  window.matchMedia = ((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  })) as typeof window.matchMedia
})

describe("gauge studio", () => {
  it("lists the showcase templates and token palette", () => {
    const names = gaugeTemplates.map((template) => template.name)
    for (const name of SHOWCASE) expect(names).toContain(name)
    const tokens = palette.map((entry) => entry.value)
    for (const token of ["primary", "foreground", "muted", "background", "destructive", "chart-1", "chart-2", "chart-3", "chart-4", "chart-5"]) {
      expect(tokens).toContain(token)
    }
  })

  it("renders the studio chrome", () => {
    render(<GaugeStudio />)
    expect(screen.getByRole("heading", { name: "Studio" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Undo" })).toBeDisabled()
    expect(screen.getByRole("button", { name: "Redo" })).toBeDisabled()
    expect(screen.getByRole("button", { name: "Reset" })).toBeEnabled()
    expect(screen.getByRole("button", { name: "View code" })).toBeEnabled()
    expect(screen.getByText("Controls")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Edit gauge value" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /Play mode/ })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /Gauges:/ })).toBeInTheDocument()
  })

  it("gives the alarm ring a keyboard knob", () => {
    render(<TimeDashboard />)
    expect(screen.getByRole("slider", { name: /Mover/ })).toBeInTheDocument()
  })
})
