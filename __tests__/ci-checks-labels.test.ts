import { describe, expect, it } from "vitest"

import { agentFixTimelineLabels, agentFixTimelineLabelsEs } from "@/registry/ui/agent-fix-timeline"
import { checksPanelLabels, checksPanelLabelsEs } from "@/registry/ui/checks-panel"
import { mergeButtonLabels, mergeButtonLabelsEs } from "@/registry/ui/merge-button"
import { prCreateCardLabels, prCreateCardLabelsEs } from "@/registry/ui/pr-create-card"

describe("ci check labels", () => {
  it("keeps Spanish and English status words apart", () => {
    expect(checksPanelLabelsEs.status("passed")).toBe("Pasó")
    expect(checksPanelLabels.status("passed")).toBe("Passed")
    expect(checksPanelLabelsEs.pill(2, 5)).toBe("Comprobaciones 2/5")
    expect(checksPanelLabels.pill(2, 5)).toBe("Checks 2/5")
    expect(mergeButtonLabelsEs.merged).toBe("Fusionado en main")
    expect(mergeButtonLabels.merged).toBe("Merged into main")
    expect(mergeButtonLabelsEs.allPassed).toBe("Todas las comprobaciones pasaron")
    expect(mergeButtonLabels.allPassed).toBe("All checks passed")
    expect(prCreateCardLabelsEs.state("open")).toBe("Abierto")
    expect(prCreateCardLabels.state("open")).toBe("Open")
    expect(agentFixTimelineLabelsEs.kind("thought")).toBe("Diagnóstico")
    expect(agentFixTimelineLabels.kind("thought")).toBe("Diagnosis")
    expect(checksPanelLabels.estimated).not.toMatch(/estimado/)
    expect(checksPanelLabelsEs.estimated).toMatch(/estimado/)
  })
})
