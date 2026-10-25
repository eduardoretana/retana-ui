import { act, render, screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { demoCandidates, demoCriteria, demoGetStage, demoStages } from "@/app/examples/ats/data"
import { Ats } from "@/registry/blocks/ats"
import { PipelineBoard } from "@/registry/blocks/pipeline-board"
import {
  atsLabels,
  atsStageClass,
  buildScorecard,
  candidateMatchesFilters,
  candidateNeedsFeedback,
  candidateScore,
  criterionBars,
  emptyAtsFilters,
  feedbackStageIds,
  formatAtsPosition,
  funnelSteps,
  recommendationLine,
  sortCandidates,
  verdictTally,
  type AtsCandidate,
  type AtsJob,
  type AtsStage,
} from "@/registry/lib/ats"

const stages: AtsStage[] = [
  { id: "postulacion", label: "Periodo de postulación", tone: "neutral" },
  { id: "filtro", label: "Filtro", tone: "info" },
  { id: "entrevista", label: "Entrevista", className: "bg-accent text-accent-foreground" },
]

type Meta = { status: string }

const ana: AtsCandidate<Meta> = {
  id: "ana",
  name: "Ana Ríos",
  appliedAt: "2026-10-08T15:00:00.000Z",
  source: "referral",
  location: "Guadalajara",
  tags: [{ id: "ref", label: "Referido" }],
  scorecards: [
    {
      criteria: [{ key: "oficio", label: "Oficio", rating: 5 }],
      overall: 5,
      verdict: "strong_yes",
    },
  ],
  meta: { status: "postulacion" },
}

const bruno: AtsCandidate<Meta> = {
  id: "bruno",
  name: "Bruno Díaz",
  appliedAt: "2026-09-28T15:00:00.000Z",
  source: "inbound",
  meta: { status: "filtro" },
}

const job: AtsJob = {
  id: "nube",
  title: "Diseñador de producto senior",
  openedAt: "2026-10-13T15:00:00.000Z",
  hired: 1,
  headcount: 2,
}

function stageOf(candidate: AtsCandidate<Meta>) {
  return candidate.meta?.status ?? "postulacion"
}

function adjacent(from: string, to: string) {
  const order = stages.map((stage) => stage.id)
  const start = order.indexOf(from)
  const end = order.indexOf(to)
  return start >= 0 && end >= 0 && Math.abs(start - end) === 1
}

function Board({
  candidates = [ana, bruno],
  onMoveCandidate,
  canMove = adjacent,
}: {
  candidates?: AtsCandidate<Meta>[]
  onMoveCandidate?: (id: string, from: string, to: string) => void | Promise<unknown>
  canMove?: (from: string, to: string) => boolean
} = {}) {
  return (
    <PipelineBoard
      candidates={candidates}
      stages={stages}
      getStage={stageOf}
      canMove={canMove}
      onMoveCandidate={onMoveCandidate}
    />
  )
}

describe("ats model", () => {
  it("derives the funnel, the tally, and a score that ignores a missing stage field", () => {
    expect(formatAtsPosition(2, 14)).toBe("02 de 14")
    expect("stage" in ana).toBe(false)
    const steps = funnelSteps([ana, bruno], stages, stageOf)
    expect(steps.map((step) => step.count)).toEqual([1, 1, 0])
    expect(steps[1]?.ofPrevious).toBe(1)
    expect(steps[0]?.ofPrevious).toBeNull()

    const camila = demoCandidates.find((candidate) => candidate.id === "camila")
    expect(camila).toBeDefined()
    expect(candidateScore(camila!)).toBeCloseTo(4.3)
    expect(verdictTally(camila!.scorecards)).toEqual({ yes: 3, total: 4 })
    expect(recommendationLine(demoGetStage(camila!), camila!.scorecards, demoStages, atsLabels)).toBe(
      "Mover a Onsite, 3 de 4 sí",
    )
    expect(criterionBars(camila!.scorecards ?? [], demoCriteria).find((bar) => bar.key === "sistemas")?.average).toBeCloseTo(3.5)
    expect(buildScorecard([{ key: "oficio", label: "Oficio", rating: 4, comment: "  claro  " }], "yes")).toEqual({
      criteria: [{ key: "oficio", label: "Oficio", rating: 4, comment: "claro" }],
      overall: 4,
      verdict: "yes",
    })
    expect(atsStageClass(stages[2])).toBe("bg-accent text-accent-foreground")
    expect(atsStageClass(stages[0])).toBe("bg-muted text-muted-foreground")

    const ranked = sortCandidates([bruno, ana], { key: "score", direction: "desc" })
    expect(ranked.map((candidate) => candidate.id)).toEqual(["ana", "bruno"])
    expect(
      candidateMatchesFilters(bruno, { ...emptyAtsFilters, from: "2026-10-01", to: "2026-10-31" }, {
        getStage: stageOf,
        labels: atsLabels,
      }),
    ).toBe(false)
    expect(candidateNeedsFeedback(bruno, "filtro", { criteria: demoCriteria, stageIds: feedbackStageIds(stages) })).toBe(true)
    expect(candidateNeedsFeedback(ana, "postulacion", { criteria: demoCriteria, stageIds: feedbackStageIds(stages) })).toBe(false)
  })
})

describe("pipeline board", () => {
  it("filters by search and switches to the list", async () => {
    const user = userEvent.setup()
    render(<Board />)
    expect(screen.getByRole("region", { name: "Periodo de postulación" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Abrir Ana Ríos" })).toBeInTheDocument()

    await user.type(screen.getByRole("searchbox", { name: "Buscar" }), "bruno")
    expect(screen.queryByRole("button", { name: "Abrir Ana Ríos" })).not.toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Abrir Bruno Díaz" })).toBeInTheDocument()

    await user.clear(screen.getByRole("searchbox", { name: "Buscar" }))
    await user.click(screen.getByRole("button", { name: "Lista" }))
    const board = screen.getByRole("region", { name: "Seguimiento de candidatos" })
    expect(board).toHaveAttribute("data-view", "list")
    const rows = board.querySelectorAll("[data-slot=candidate-row]")
    expect(rows[0]).toHaveAttribute("data-candidate-id", "ana")
    expect(rows[1]).toHaveAttribute("data-candidate-id", "bruno")
  })

  it("moves with the arrow keys and rolls back when the move is rejected", async () => {
    const user = userEvent.setup()
    let rejectMove: (error: Error) => void = () => {}
    const onMoveCandidate = vi.fn(
      () =>
        new Promise<void>((_resolve, reject) => {
          rejectMove = reject
        }),
    )
    render(<Board onMoveCandidate={onMoveCandidate} />)
    screen.getByRole("button", { name: "Abrir Ana Ríos" }).focus()
    await user.keyboard("{ArrowRight}")
    expect(onMoveCandidate).toHaveBeenCalledWith("ana", "postulacion", "filtro")
    expect(within(screen.getByRole("region", { name: "Filtro" })).getByRole("button", { name: "Abrir Ana Ríos" })).toBeInTheDocument()

    await act(async () => {
      rejectMove(new Error("rpc"))
    })
    await waitFor(() => {
      expect(
        within(screen.getByRole("region", { name: "Periodo de postulación" })).getByRole("button", { name: "Abrir Ana Ríos" }),
      ).toBeInTheDocument()
    })
    expect(document.querySelector("[data-slot=pipeline-announcement]")).toHaveTextContent(
      "Ana Ríos sigue en Periodo de postulación.",
    )
  })

  it("blocks a transition that has no move", async () => {
    const user = userEvent.setup()
    const onMoveCandidate = vi.fn()
    render(<Board onMoveCandidate={onMoveCandidate} canMove={() => false} />)
    screen.getByRole("button", { name: "Abrir Ana Ríos" }).focus()
    await user.keyboard("{ArrowRight}")
    expect(onMoveCandidate).not.toHaveBeenCalled()
    expect(document.querySelector("[data-slot=pipeline-announcement]")).toHaveTextContent("Esa transición no está disponible.")

    await user.click(screen.getByRole("button", { name: "Acciones de Ana Ríos" }))
    expect(screen.getByRole("menuitem", { name: "Entrevista" })).toHaveAttribute("aria-disabled", "true")
    expect(screen.getByRole("menuitem", { name: "Filtro" })).toHaveAttribute("aria-disabled", "true")
  })

  it("shows empty, loading, error, and read only", async () => {
    const user = userEvent.setup()
    const onRetry = vi.fn()
    const onMoveCandidate = vi.fn()
    const { rerender } = render(<Board candidates={[]} />)
    expect(screen.getByText("No hay candidatos")).toBeInTheDocument()

    rerender(<PipelineBoard candidates={[ana]} stages={stages} getStage={stageOf} loading />)
    expect(screen.getByRole("status", { name: "Cargando candidatos" })).toBeInTheDocument()

    rerender(
      <PipelineBoard candidates={[ana]} stages={stages} getStage={stageOf} error="Se cortó la red." onRetry={onRetry} />,
    )
    expect(screen.getByRole("alert")).toHaveTextContent("No se pudo cargar el seguimiento")
    await user.click(screen.getByRole("button", { name: "Reintentar" }))
    expect(onRetry).toHaveBeenCalledOnce()

    rerender(<PipelineBoard candidates={[ana]} stages={stages} getStage={stageOf} readOnly onMoveCandidate={onMoveCandidate} />)
    expect(screen.getByRole("region", { name: "Seguimiento de candidatos" })).toHaveAttribute("data-readonly", "true")
    screen.getByRole("button", { name: "Abrir Ana Ríos" }).focus()
    await user.keyboard("{ArrowRight}")
    expect(onMoveCandidate).not.toHaveBeenCalled()
  })
})

describe("ats composite", () => {
  it("opens the detail, pages, and submits one evaluator scorecard", async () => {
    const user = userEvent.setup()
    const onSubmitScorecard = vi.fn()
    const onMoveCandidate = vi.fn()
    render(
      <Ats
        job={job}
        candidates={[ana, bruno]}
        stages={stages}
        getStage={stageOf}
        criteria={[{ key: "oficio", label: "Oficio" }]}
        canMove={adjacent}
        onMoveCandidate={onMoveCandidate}
        onSubmitScorecard={onSubmitScorecard}
        now="2026-10-25T18:00:00.000Z"
        renderActions={({ candidate }) => <button type="button">WhatsApp {candidate.name}</button>}
      />,
    )
    expect(screen.getByText("100% de Periodo de postulación")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "WhatsApp Ana Ríos" })).toBeInTheDocument()

    await user.click(screen.getByRole("button", { name: "Abrir Ana Ríos" }))
    const dialog = await screen.findByRole("dialog")
    expect(within(dialog).getByText("01 de 2")).toBeInTheDocument()
    await user.click(within(dialog).getByRole("button", { name: "Siguiente" }))
    expect(dialog.querySelector("[data-slot=candidate-detail]")).toHaveAttribute("data-candidate-id", "bruno")
    expect(within(dialog).getByText("02 de 2")).toBeInTheDocument()
    await user.click(within(dialog).getByRole("button", { name: "Cerrar" }))
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument()

    await user.click(screen.getByRole("button", { name: "Agregar evaluación de Bruno Díaz" }))
    const form = await screen.findByRole("dialog")
    await user.click(within(form).getByRole("button", { name: "Calificar Oficio" }))
    await user.click(within(form).getByRole("radio", { name: "4 de 5 estrellas" }))
    await user.selectOptions(within(form).getByRole("combobox", { name: "Recomendación" }), "strong_yes")
    await user.click(within(form).getByRole("button", { name: "Enviar evaluación" }))
    expect(onSubmitScorecard).toHaveBeenCalledWith("bruno", {
      criteria: [{ key: "oficio", label: "Oficio", rating: 4, comment: undefined }],
      overall: 4,
      verdict: "strong_yes",
    })
    expect(screen.getByRole("dialog").querySelector("[data-slot=candidate-detail]")).toHaveAttribute("data-candidate-id", "bruno")
  })

  it("aggregates several scorecards in the debrief", async () => {
    const user = userEvent.setup()
    const camila = demoCandidates.find((candidate) => candidate.id === "camila")!
    render(
      <Ats
        job={job}
        candidates={[camila]}
        stages={demoStages}
        getStage={demoGetStage}
        criteria={demoCriteria}
        now="2026-10-25T18:00:00.000Z"
      />,
    )
    await user.click(screen.getByRole("button", { name: "Abrir Camila Ríos" }))
    const dialog = await screen.findByRole("dialog")
    expect(within(dialog).getByText("Mover a Onsite, 3 de 4 sí")).toBeInTheDocument()
    expect(within(dialog).getByText("General 4.3")).toBeInTheDocument()
  })
})
