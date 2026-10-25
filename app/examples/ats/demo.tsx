"use client"

import { useRef, useState } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Ats } from "@/registry/blocks/ats"
import type { AtsInterviewSlot, AtsScorecardDraft } from "@/registry/lib/ats"
import type { AtsCandidate } from "@/registry/lib/ats"

import {
  demoCanMove,
  demoCandidates,
  demoCriteria,
  demoGetStage,
  demoJob,
  demoNow,
  demoPeople,
  demoStages,
  type NubeMeta,
  type NubeStatus,
} from "./data"

export type DemoScenario = "ready" | "empty" | "loading" | "error" | "readOnly"

const scenarios: { id: DemoScenario; label: string }[] = [
  { id: "ready", label: "Listo" },
  { id: "empty", label: "Vacío" },
  { id: "loading", label: "Cargando" },
  { id: "error", label: "Error" },
  { id: "readOnly", label: "Solo lectura" },
]

export function AtsDemo({ chrome = true, initialScenario = "ready" }: { chrome?: boolean; initialScenario?: DemoScenario }) {
  const [scenario, setScenario] = useState<DemoScenario>(initialScenario)
  const [candidates, setCandidates] = useState<AtsCandidate<NubeMeta>[]>(demoCandidates)
  const [rejectNext, setRejectNext] = useState(false)
  const sequence = useRef(0)

  function nextId(prefix: string) {
    sequence.current += 1
    return `${prefix}-${sequence.current}`
  }

  async function move(id: string, _from: string, to: string) {
    if (rejectNext) {
      setRejectNext(false)
      throw new Error("rpc")
    }
    setCandidates((current) =>
      current.map((candidate) =>
        candidate.id === id ? { ...candidate, meta: { status: to as NubeStatus } } : candidate,
      ),
    )
  }

  function submit(id: string, scorecard: AtsScorecardDraft) {
    setCandidates((current) =>
      current.map((candidate) =>
        candidate.id === id
          ? {
              ...candidate,
              scorecards: [
                ...(candidate.scorecards ?? []),
                {
                  ...scorecard,
                  id: nextId("score"),
                  authorId: "mesa",
                  createdAt: demoNow,
                  stageId: demoGetStage(candidate),
                },
              ],
            }
          : candidate,
      ),
    )
  }

  function note(id: string, body: string) {
    setCandidates((current) =>
      current.map((candidate) =>
        candidate.id === id
          ? {
              ...candidate,
              notes: [...(candidate.notes ?? []), { id: nextId("note"), authorId: "mesa", body, createdAt: demoNow }],
            }
          : candidate,
      ),
    )
  }

  function schedule(id: string, slot: AtsInterviewSlot) {
    setCandidates((current) =>
      current.map((candidate) =>
        candidate.id === id
          ? {
              ...candidate,
              interviews: [...(candidate.interviews ?? []), { id: nextId("meet"), ...slot }],
              nextStep: { label: slot.kind || "Entrevista", at: slot.startsAt },
            }
          : candidate,
      ),
    )
  }

  return (
    <div className="flex h-full min-h-0 flex-col gap-3">
      {chrome ? (
        <div className="flex flex-wrap gap-1" role="group" aria-label="Escenario de demostración">
          {scenarios.map((item) => (
            <button
              key={item.id}
              type="button"
              aria-pressed={scenario === item.id}
              className="rounded-full border border-border px-3 py-1 text-xs aria-pressed:bg-foreground aria-pressed:text-background"
              onClick={() => setScenario(item.id)}
            >
              {item.label}
            </button>
          ))}
          <button
            type="button"
            aria-pressed={rejectNext}
            className="rounded-full border border-border px-3 py-1 text-xs aria-pressed:bg-foreground aria-pressed:text-background"
            onClick={() => setRejectNext((value) => !value)}
          >
            Rechazar el siguiente movimiento
          </button>
        </div>
      ) : null}
      <Ats
        className="min-h-0 flex-1"
        job={demoJob}
        candidates={scenario === "empty" ? [] : candidates}
        stages={demoStages}
        getStage={demoGetStage}
        people={demoPeople}
        criteria={demoCriteria}
        author={demoPeople.find((person) => person.id === "mesa")}
        canMove={demoCanMove}
        now={demoNow}
        locale="es-MX"
        timeZone="America/Mexico_City"
        loading={scenario === "loading"}
        error={scenario === "error" ? "No se pudo cargar la vacante de demostración." : null}
        readOnly={scenario === "readOnly"}
        onRetry={() => setScenario("ready")}
        onMoveCandidate={move}
        onSubmitScorecard={submit}
        onScheduleInterview={schedule}
        onSendEmail={(id) => {
          const name = candidates.find((candidate) => candidate.id === id)?.name ?? id
          toast(`Correo listo para ${name}`)
        }}
        onAddNote={note}
        onOpenCandidate={() => undefined}
        onShare={() => toast("Enlace de la vacante copiado en la demostración")}
        onFilterChange={() => undefined}
        renderActions={(info) => (
          <>
            <Button type="button" variant="ghost" size="sm" onClick={() => toast(`WhatsApp · ${info.candidate.name}`)}>
              WhatsApp
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => void navigator.clipboard.writeText(`https://nube.example/candidatos/${info.candidate.id}`)}
            >
              Copiar enlace
            </Button>
          </>
        )}
      />
    </div>
  )
}
