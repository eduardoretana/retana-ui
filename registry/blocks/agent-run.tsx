"use client"

/**
 * A single agent run: plan, tool activity, a question the run cannot answer
 * alone, and a draft the reader can accept. Sample payloads are fictional.
 */

import * as React from "react"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScreenFrame, type AppShellProps, type ShellDensity } from "@/registry/retana/blocks/app-shell"

export type PlanStatus = "done" | "active" | "pending" | "blocked"

export type PlanStep = {
  id: string
  title: string
  detail?: string
  status: PlanStatus
  tools?: string[]
}

export type ToolActivity = {
  id: string
  title: string
  tool: string
  state: "ok" | "running" | "error"
  payload: unknown
}

export type RunInputOption = {
  id: string
  label: string
}

export type RunNeedsInput = {
  title: string
  prompt: string
  options: RunInputOption[]
}

export type DraftLine = {
  kind: "same" | "add" | "remove"
  text: string
}

export type RunDraft = {
  path: string
  summary?: string
  lines: DraftLine[]
}

export type RunDetails = {
  model: string
  tokens: string
  cost: string
  duration: string
}

export type DraftDecision = "accepted" | "rejected"

export type AgentRunClassNames = {
  root?: string
  plan?: string
  activity?: string
  input?: string
  draft?: string
  details?: string
}

export type AgentRunProps = {
  title?: string
  status?: string
  steps?: PlanStep[]
  activity?: ToolActivity[]
  needsInput?: RunNeedsInput | null
  selectedOption?: string
  onResolveInput?: (optionId: string) => void
  draft?: RunDraft | null
  decision?: DraftDecision | null
  onDecision?: (decision: DraftDecision) => void
  details?: RunDetails
  shell?: boolean
  shellProps?: Partial<AppShellProps>
  density?: ShellDensity
  className?: string
  classNames?: AgentRunClassNames
}

const planStatusLabel: Record<PlanStatus, string> = {
  done: "Hecho",
  active: "En curso",
  pending: "Pendiente",
  blocked: "Detenido",
}

const planStatusClass: Record<PlanStatus, string> = {
  done: "bg-primary/10 text-primary",
  active: "bg-accent text-accent-foreground",
  pending: "bg-muted text-muted-foreground",
  blocked: "bg-destructive/10 text-destructive",
}

const lineClass: Record<DraftLine["kind"], string> = {
  same: "text-muted-foreground",
  add: "bg-primary/10 text-foreground",
  remove: "bg-destructive/10 text-destructive line-through",
}

export const agentRunSteps: PlanStep[] = [
  { id: "read", title: "Leer el encargo", status: "done", tools: ["leer"] },
  { id: "search", title: "Buscar referencias", status: "done", detail: "Tres notas del cuaderno Faro.", tools: ["buscar"] },
  { id: "draft", title: "Redactar el borrador", status: "active", tools: ["escribir"] },
  { id: "approve", title: "Pedir aprobación", status: "pending", tools: ["preguntar"] },
]

export const agentRunActivity: ToolActivity[] = [
  {
    id: "a1",
    title: "Notas del cuaderno",
    tool: "buscar",
    state: "ok",
    payload: { carpeta: "Faro", coincidencias: 3, consulta: "linterna alcance" },
  },
  {
    id: "a2",
    title: "Borrador abierto",
    tool: "escribir",
    state: "running",
    payload: { archivo: "encargo.md", seccion: "llamada" },
  },
]

export const agentRunNeedsInput: RunNeedsInput = {
  title: "Falta una decisión",
  prompt: "¿Qué tono debe usar el borrador?",
  options: [
    { id: "close", label: "Cercano" },
    { id: "formal", label: "Formal" },
  ],
}

export const agentRunDraft: RunDraft = {
  path: "encargo.md",
  summary: "La llamada a la acción pasa de un enlace genérico a una muestra.",
  lines: [
    { kind: "same", text: "Linterna de campo para cuadrillas pequeñas." },
    { kind: "remove", text: "Más información en el sitio." },
    { kind: "add", text: "Pide una muestra y te la llevamos el jueves." },
  ],
}

export const agentRunDetails: RunDetails = {
  model: "Bruma",
  tokens: "12 400",
  cost: "$0.18",
  duration: "46 s",
}

export function AgentRun({
  title = "Corrida del encargo",
  status = "Esperando una respuesta",
  steps = agentRunSteps,
  activity = agentRunActivity,
  needsInput = agentRunNeedsInput,
  selectedOption,
  onResolveInput,
  draft = agentRunDraft,
  decision: decisionProp,
  onDecision,
  details = agentRunDetails,
  shell = true,
  shellProps,
  density = "comfortable",
  className,
  classNames,
}: AgentRunProps) {
  const space = density === "compact" ? "gap-3 p-3" : "gap-4 p-4"
  const [choice, setChoice] = React.useState(selectedOption ?? "")
  const [decisionState, setDecisionState] = React.useState<DraftDecision | null>(null)
  const decision = decisionProp === undefined ? decisionState : decisionProp
  const [openActivity, setOpenActivity] = React.useState<string | null>(activity[0]?.id ?? null)

  function choose(id: string) {
    setChoice(id)
  }

  function resolve(event: React.FormEvent) {
    event.preventDefault()
    if (!choice) return
    onResolveInput?.(choice)
  }

  function decide(next: DraftDecision) {
    onDecision?.(next)
    if (decisionProp === undefined) setDecisionState(next)
  }

  return (
    <ScreenFrame
      shell={shell}
      shellProps={{ activeId: "assistant", contentLabel: "Corrida", density, ...shellProps }}
      className={className}
    >
      <div data-slot="agent-run" data-density={density} className={cn("@container flex min-h-0 min-w-0 flex-1 flex-col", space, classNames?.root)}>
        <header className="flex flex-wrap items-end justify-between gap-2">
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground">Corrida</p>
            <h1 className="truncate text-lg font-semibold tracking-tight">{title}</h1>
          </div>
          <Badge variant="outline">{status}</Badge>
        </header>

        <div className="grid min-h-0 flex-1 gap-4 @min-[860px]:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <section aria-label="Plan" className={cn("rounded-xl border border-border p-3", classNames?.plan)}>
            <h2 className="text-sm font-medium">Plan</h2>
            {steps.length === 0 ? (
              <p className="mt-2 text-sm text-muted-foreground">Sin pasos.</p>
            ) : (
              <ol className="mt-3 flex flex-col gap-3">
                {steps.map((step, index) => (
                  <li key={step.id} className="min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="min-w-0 text-sm font-medium">
                        <span className="mr-2 text-muted-foreground tabular-nums">{index + 1}</span>
                        <span className="break-words">{step.title}</span>
                      </p>
                      <span className={cn("shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium", planStatusClass[step.status])}>
                        {planStatusLabel[step.status]}
                      </span>
                    </div>
                    {step.detail ? <p className="mt-1 text-xs break-words text-muted-foreground">{step.detail}</p> : null}
                    {step.tools && step.tools.length > 0 ? (
                      <ul className="mt-1.5 flex flex-wrap gap-1" aria-label={`Herramientas de ${step.title}`}>
                        {step.tools.map((tool) => (
                          <li key={tool}>
                            <Badge variant="secondary">{tool}</Badge>
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </li>
                ))}
              </ol>
            )}
          </section>

          <section aria-label="Actividad" className={cn("rounded-xl border border-border p-3", classNames?.activity)}>
            <h2 className="text-sm font-medium">Actividad</h2>
            {activity.length === 0 ? (
              <p className="mt-2 text-sm text-muted-foreground">Sin llamadas.</p>
            ) : (
              <ul className="mt-3 flex flex-col gap-2">
                {activity.map((item) => {
                  const open = openActivity === item.id
                  const panelId = `activity-${item.id}`
                  return (
                    <li key={item.id} className="rounded-lg border border-border">
                      <button
                        type="button"
                        className="flex w-full min-w-0 items-center justify-between gap-2 px-3 py-2 text-left focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                        aria-expanded={open}
                        aria-controls={panelId}
                        onClick={() => setOpenActivity(open ? null : item.id)}
                      >
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-medium">{item.title}</span>
                          <span className="block truncate text-xs text-muted-foreground">{item.tool}</span>
                        </span>
                        <Badge variant={item.state === "error" ? "destructive" : "outline"}>
                          {item.state === "ok" ? "Lista" : item.state === "running" ? "En curso" : "Error"}
                        </Badge>
                      </button>
                      {open ? (
                        <pre
                          id={panelId}
                          className="overflow-auto border-t border-border bg-muted/50 px-3 py-2 font-mono text-xs break-all whitespace-pre-wrap text-foreground"
                        >
                          {JSON.stringify(item.payload, null, 2)}
                        </pre>
                      ) : null}
                    </li>
                  )
                })}
              </ul>
            )}
          </section>
        </div>

        {needsInput ? (
          <form aria-label={needsInput.title} className={cn("rounded-xl border border-border p-3", classNames?.input)} onSubmit={resolve}>
            <h2 className="text-sm font-medium">{needsInput.title}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{needsInput.prompt}</p>
            {needsInput.options.length === 0 ? (
              <p className="mt-2 text-sm text-muted-foreground">Sin opciones.</p>
            ) : (
              <fieldset className="mt-3 flex flex-wrap gap-3">
                <legend className="sr-only">{needsInput.prompt}</legend>
                {needsInput.options.map((option) => (
                  <label key={option.id} className="inline-flex items-center gap-2 text-sm">
                    <input
                      type="radio"
                      name="run-input"
                      value={option.id}
                      checked={choice === option.id}
                      onChange={() => choose(option.id)}
                    />
                    {option.label}
                  </label>
                ))}
              </fieldset>
            )}
            <Button type="submit" size="sm" className="mt-3" disabled={!choice}>
              Continuar
            </Button>
          </form>
        ) : null}

        {draft ? (
          <section aria-label="Borrador" className={cn("rounded-xl border border-border p-3", classNames?.draft)}>
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div className="min-w-0">
                <h2 className="text-sm font-medium">Borrador</h2>
                <p className="truncate font-mono text-xs text-muted-foreground">{draft.path}</p>
                {draft.summary ? <p className="mt-1 text-sm break-words">{draft.summary}</p> : null}
              </div>
              <div className="flex gap-2">
                <Button type="button" size="sm" disabled={decision != null} onClick={() => decide("accepted")}>
                  Aceptar
                </Button>
                <Button type="button" size="sm" variant="outline" disabled={decision != null} onClick={() => decide("rejected")}>
                  Rechazar
                </Button>
              </div>
            </div>
            {decision ? (
              <p role="status" className="mt-2 text-sm">
                {decision === "accepted" ? "Borrador aceptado." : "Borrador rechazado."}
              </p>
            ) : null}
            <ol className="mt-3 overflow-hidden rounded-lg border border-border font-mono text-xs">
              {draft.lines.length === 0 ? (
                <li className="px-3 py-2 text-muted-foreground">Sin diferencias.</li>
              ) : (
                draft.lines.map((line, index) => (
                  <li key={`${line.kind}-${index}`} className={cn("px-3 py-1 break-all whitespace-pre-wrap", lineClass[line.kind])}>
                    <span className="mr-2 text-muted-foreground" aria-hidden>
                      {line.kind === "add" ? "+" : line.kind === "remove" ? "−" : " "}
                    </span>
                    <span className="sr-only">
                      {line.kind === "add" ? "Añadida: " : line.kind === "remove" ? "Quitada: " : "Igual: "}
                    </span>
                    {line.text}
                  </li>
                ))
              )}
            </ol>
          </section>
        ) : null}

        <section aria-label="Detalles" className={cn("rounded-xl border border-border p-3", classNames?.details)}>
          <h2 className="text-sm font-medium">Detalles</h2>
          <dl className="mt-2 grid grid-cols-2 gap-3 text-sm @min-[640px]:grid-cols-4">
            {(
              [
                ["Modelo", details.model],
                ["Tokens", details.tokens],
                ["Costo", details.cost],
                ["Duración", details.duration],
              ] as const
            ).map(([label, value]) => (
              <div key={label} className="min-w-0">
                <dt className="text-xs text-muted-foreground">{label}</dt>
                <dd className="truncate font-medium tabular-nums">{value || "—"}</dd>
              </div>
            ))}
          </dl>
        </section>
      </div>
    </ScreenFrame>
  )
}
