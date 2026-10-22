import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { toneAt, toneVar } from "@/registry/lib/clinical-tone"
import { BodyMap } from "@/registry/ui/body-map"
import { dermatomeColor, DermatomeMap } from "@/registry/ui/dermatome-map"
import { LabResultsTable, resultFlag } from "@/registry/ui/lab-results"
import { organAnatomyNodes } from "@/registry/ui/organ-viewer"
import { musclesModel } from "@/registry/ui/organ-muscles"
import { skeletonModel } from "@/registry/ui/organ-skeleton"
import { VitalSigns, vitalStatus, adultVitalRanges } from "@/registry/ui/vital-signs"

describe("clinical-tone", () => {
  it("maps tones to host tokens only", () => {
    expect(toneVar("chart-1")).toBe("var(--chart-1)")
    expect(toneVar("chart-2", 0.2)).toBe("color-mix(in oklch, var(--chart-2), var(--background) 20%)")
    expect(toneVar("chart-2", -0.3)).toBe("color-mix(in oklch, var(--chart-2), var(--foreground) 30%)")
    expect(toneAt(7)).toBe("chart-3")
  })
})

describe("organ models", () => {
  it("keep OrganUI's realistic colours (ui-system exception) and their credit", () => {
    for (const model of [musclesModel, skeletonModel]) {
      expect(model.src).toMatch(/@[0-9a-f]{40}\//)
      expect(model.attribution.license).toMatch(/CC/)
      for (const structure of model.structures) expect(structure.color).toMatch(/^#[0-9a-f]{6}$/i)
    }
    const groups = organAnatomyNodes(musclesModel)
    expect(groups.length).toBeGreaterThan(3)
    expect(groups[0]!.children[0]!.color).toMatch(/^#/)
  })
})

describe("vital signs", () => {
  it("flags readings against adult ranges", () => {
    expect(vitalStatus(130, adultVitalRanges.heartRate)).toBe("high")
    render(<VitalSigns readings={{ heartRate: 72, systolic: 118, diastolic: 76, spo2: 98, temperature: 36.8 }} />)
    expect(screen.getByText("72")).toBeTruthy()
  })
})

describe("lab results", () => {
  it("flags values out of range", () => {
    const result = { id: "ck", name: "CK", value: 412, unit: "U/L", referenceRange: { low: 30, high: 200 } }
    expect(resultFlag(result)).toBe("high")
    render(<LabResultsTable results={[result]} caption="Panel" />)
    expect(screen.getByRole("table")).toBeTruthy()
  })
})

describe("body and dermatome maps", () => {
  it("render accessible controls", () => {
    render(<BodyMap label="¿Dónde duele?" value={["right-knee"]} onValueChange={() => {}} name="regiones" />)
    expect(screen.getAllByRole("button").length).toBeGreaterThan(0)
  })
  it("keeps the clinical dermatome palette", () => {
    expect(dermatomeColor("C5")).toMatch(/^oklch\(/)
    const { container } = render(<DermatomeMap selectedId={null} onSelectionChange={() => {}} />)
    expect(container.querySelector("svg")).toBeTruthy()
  })
})

describe("scientific colour exception", () => {
  it("is scoped to the listed anatomy files only", async () => {
    const { isScientificColorException } = await import("@/scripts/validate-registry")
    expect(isScientificColorException("registry/ui/organ-muscles.tsx")).toBe(true)
    expect(isScientificColorException("registry/ui/molecule-viewer.tsx")).toBe(true)
    expect(isScientificColorException("registry/ui/vital-signs.tsx")).toBe(false)
    expect(isScientificColorException("registry/ui/organ-explorer-chrome.tsx")).toBe(false)
  })
})
