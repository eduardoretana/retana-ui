import { describe, expect, it } from "vitest"

import {
  applyMove,
  hiringStage,
  publicStage,
  RETANA_STAGE_IDS,
  RETANA_SYSTEM_STAGE_IDS,
  retanaCanMove,
  retanaCandidates,
  retanaDebriefId,
  retanaGetStage,
  retanaStages,
  retanaWhatsAppHref,
  type RetanaMeta,
} from "@/app/examples/ats/eduardoretana/data"
import { atsLabels, recommendationLine, verdictTally, type AtsCandidate } from "@/registry/lib/ats"

const shell: RetanaMeta = {
  track: "public",
  full_name: "Prueba Inventada",
  email: "prueba@example.com",
  phone: "55 0000 0000",
  vacancy: { title: "Vacante de prueba", area: "General" },
  screening_status: "pending",
}

function candidate(meta: RetanaMeta): AtsCandidate<RetanaMeta> {
  return { id: "prueba", name: meta.full_name, appliedAt: "2026-10-01T15:00:00.000Z", source: "inbound", meta }
}

describe("preset eduardoretana", () => {
  it("uses the public labels and keeps the stage off the candidate", () => {
    expect(retanaStages.map((stage) => stage.label)).toEqual([
      "Postulación",
      "Screening",
      "Prueba técnica",
      "Calculadora",
      "Entrevista",
      "Registro",
      "Vacante",
      "Psicometría",
      "Revisión RH",
      "Identidad",
      "Contratos",
      "Adjudicación",
      "Contratado",
      "No apto",
      "Rechazado",
    ])
    expect(retanaStages.find((stage) => stage.id === "psychometric")?.className).toContain("violet")
    expect(retanaStages.find((stage) => stage.id === "review")?.className).toContain("amber")
    expect(retanaStages.find((stage) => stage.id === "application")?.className).toContain("teal")
    for (const person of retanaCandidates) expect("stage" in person).toBe(false)
  })

  it("derives the public funnel and the hiring chain from flags", () => {
    expect(publicStage({ ...shell, screening_status: "pending" })).toBe("application")
    expect(publicStage({ ...shell, screening_status: "in_progress", screening_step: 2 })).toBe("screening")
    expect(publicStage({ ...shell, screening_status: "failed" })).toBe("rejected")
    expect(publicStage({ ...shell, screening_status: "passed", assessment_status: "not_started" })).toBe("tech_test")
    expect(publicStage({ ...shell, screening_status: "passed", assessment_status: "submitted", calculator_status: "locked" })).toBe(
      "calculator",
    )
    expect(
      publicStage({
        ...shell,
        screening_status: "passed",
        assessment_status: "scored",
        calculator_status: "scored",
        interview_status: "pending",
      }),
    ).toBe("interview")
    expect(publicStage({ ...shell, screening_status: "passed", interview_status: "failed", assessment_status: "scored", calculator_status: "scored" })).toBe(
      "rejected",
    )

    expect(hiringStage({ ...shell, track: "hiring", status: "hired" })).toBe("hired")
    expect(hiringStage({ ...shell, track: "hiring", status: "rejected" })).toBe("rejected")
    expect(hiringStage({ ...shell, track: "hiring", eligibility_status: "not_apt" })).toBe("not_apt")
    expect(hiringStage({ ...shell, track: "hiring", wizard_step: 3 })).toBe("registration")
    expect(hiringStage({ ...shell, track: "hiring", wizard_step: 7, module_vacancy_status: "pending" })).toBe("vacancy")
    expect(
      hiringStage({
        ...shell,
        track: "hiring",
        wizard_step: 7,
        module_vacancy_status: "completed",
        module_psychometric_status: "pending",
      }),
    ).toBe("psychometric")
    expect(
      hiringStage({
        ...shell,
        track: "hiring",
        wizard_step: 7,
        module_vacancy_status: "completed",
        psychometric_waived: true,
        eligibility_status: "pending",
      }),
    ).toBe("review")
    expect(
      hiringStage({
        ...shell,
        track: "hiring",
        module_vacancy_status: "completed",
        module_psychometric_status: "completed",
        eligibility_status: "apt",
        identity_verified_at: null,
      }),
    ).toBe("identity")
    expect(
      hiringStage({
        ...shell,
        track: "hiring",
        module_vacancy_status: "completed",
        module_psychometric_status: "completed",
        eligibility_status: "apt",
        identity_verified_at: "2026-10-01T18:00:00.000Z",
        identity_enabled: false,
      }),
    ).toBe("identity")
    expect(
      hiringStage({
        ...shell,
        track: "hiring",
        module_vacancy_status: "completed",
        module_psychometric_status: "completed",
        eligibility_status: "apt",
        identity_verified_at: "2026-10-01T18:00:00.000Z",
        module_contracts_status: "pending",
      }),
    ).toBe("contracts")
    expect(
      hiringStage({
        ...shell,
        track: "hiring",
        module_vacancy_status: "completed",
        module_psychometric_status: "completed",
        eligibility_status: "apt",
        identity_verified_at: "2026-10-01T18:00:00.000Z",
        module_contracts_status: "completed",
        employment: false,
      }),
    ).toBe("adjudication")
    expect(
      hiringStage({
        ...shell,
        track: "hiring",
        module_vacancy_status: "completed",
        module_psychometric_status: "completed",
        eligibility_status: "apt",
        identity_verified_at: "2026-10-01T18:00:00.000Z",
        module_contracts_status: "completed",
        employment: true,
      }),
    ).toBe("hired")
  })

  it("blocks the system-only hiring stages and round-trips every column", () => {
    for (const stage of RETANA_SYSTEM_STAGE_IDS) {
      expect(retanaCanMove("review", stage)).toBe(false)
      expect(retanaCanMove(stage, "review")).toBe(false)
    }
    expect(retanaCanMove("interview", "registration")).toBe(true)
    expect(retanaCanMove("review", "review")).toBe(false)

    for (const stage of RETANA_STAGE_IDS) {
      expect(retanaGetStage(candidate(applyMove(shell, stage)))).toBe(stage)
    }
  })

  it("puts one invented person in each column", () => {
    const counts = Object.fromEntries(RETANA_STAGE_IDS.map((id) => [id, 0])) as Record<string, number>
    for (const person of retanaCandidates) counts[retanaGetStage(person)] += 1
    expect(counts).toEqual({
      application: 1,
      screening: 1,
      tech_test: 1,
      calculator: 1,
      interview: 1,
      registration: 1,
      vacancy: 1,
      psychometric: 1,
      review: 1,
      identity: 1,
      contracts: 1,
      adjudication: 1,
      hired: 1,
      not_apt: 1,
      rejected: 1,
    })
  })

  it("recommends the next hiring stage from four invented scorecards", () => {
    const helena = retanaCandidates.find((person) => person.id === retanaDebriefId)
    expect(helena).toBeDefined()
    expect(retanaGetStage(helena!)).toBe("review")
    expect(verdictTally(helena!.scorecards)).toEqual({ yes: 3, total: 4 })
    expect(recommendationLine(retanaGetStage(helena!), helena!.scorecards, retanaStages, atsLabels)).toBe(
      "Mover a Identidad, 3 de 4 sí",
    )
    expect(retanaWhatsAppHref(helena!)).toContain("https://wa.me/525510001009")
    expect(retanaWhatsAppHref(helena!)).toContain(encodeURIComponent("Helena"))
    expect(retanaWhatsAppHref({ ...helena!, phone: "" })).toBeNull()
  })
})
