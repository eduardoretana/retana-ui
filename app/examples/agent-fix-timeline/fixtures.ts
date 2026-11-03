import type { FixStep } from "@/registry/ui/agent-fix-timeline"

export const filledSteps: FixStep[] = [
  { id: "1", kind: "thought", label: "El recibo pierde el folio cuando el horno recarga", status: "done" },
  { id: "2", kind: "edit", label: "Edité horno.ts", status: "done", files: [{ path: "horno.ts" }, { path: "folio.spec.ts" }] },
  { id: "3", kind: "test", label: "12 pruebas de punta a punta pasaron", status: "done" },
  { id: "4", kind: "push", label: "Empujé b7e21aa al pull request 42", status: "done" },
  { id: "5", kind: "done", label: "El folio se conserva", status: "done" },
]

export const filled = { steps: filledSteps }
export const empty = { steps: [] as FixStep[] }
export const loading = { steps: [{ id: "1", kind: "thought" as const, label: "Revisando el folio", status: "active" as const }] }
export const error = { steps: [{ id: "1", kind: "test" as const, label: "La prueba del folio falló", status: "failed" as const }] }
