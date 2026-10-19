"use client"

/**
 * First-run flow: four steps, a tool connection grid, and a side checklist
 * the reader can complete in any order.
 */

import * as React from "react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScreenFrame, type AppShellProps, type ShellDensity } from "@/registry/retana/blocks/app-shell"

export type OnboardingStep = {
  id: string
  label: string
  title: string
  description: string
}

export type OnboardingTool = {
  id: string
  name: string
  detail: string
  connected?: boolean
}

export type OnboardingCheck = {
  id: string
  label: string
  done?: boolean
}

export type OnboardingClassNames = {
  root?: string
  stepper?: string
  panel?: string
  checklist?: string
}

export type OnboardingProps = {
  steps?: OnboardingStep[]
  step?: number
  defaultStep?: number
  onStepChange?: (index: number) => void
  tools?: OnboardingTool[]
  onToolConnect?: (id: string, connected: boolean) => void
  checks?: OnboardingCheck[]
  onCheckChange?: (id: string, done: boolean) => void
  workspaceDefault?: string
  onComplete?: (payload: { workspace: string; invites: string[]; connectedToolIds: string[] }) => void
  shell?: boolean
  shellProps?: Partial<AppShellProps>
  density?: ShellDensity
  className?: string
  classNames?: OnboardingClassNames
}

export const onboardingSteps: OnboardingStep[] = [
  { id: "space", label: "Espacio", title: "Nombra el espacio", description: "El nombre aparece en la barra y en las facturas." },
  { id: "tools", label: "Herramientas", title: "Conecta lo que ya usas", description: "Puedes saltar este paso y volver después." },
  { id: "team", label: "Equipo", title: "Invita a tu equipo", description: "Un correo por línea. Nadie recibe un mensaje desde esta demo." },
  { id: "ready", label: "Listo", title: "Todo queda en este navegador", description: "Revisa el resumen y entra al espacio." },
]

export const onboardingTools: OnboardingTool[] = [
  { id: "mail", name: "Correo", detail: "Avisos del espacio", connected: true },
  { id: "calendar", name: "Calendario", detail: "Fechas de entrega" },
  { id: "files", name: "Archivos", detail: "Carpeta compartida" },
  { id: "board", name: "Tablero", detail: "Tareas de obra" },
]

export const onboardingChecks: OnboardingCheck[] = [
  { id: "name", label: "Espacio con nombre", done: false },
  { id: "tool", label: "Una herramienta conectada", done: true },
  { id: "invite", label: "Al menos una invitación", done: false },
  { id: "review", label: "Resumen leído", done: false },
]

export function Onboarding({
  steps = onboardingSteps,
  step,
  defaultStep = 0,
  onStepChange,
  tools = onboardingTools,
  onToolConnect,
  checks = onboardingChecks,
  onCheckChange,
  workspaceDefault = "Acme",
  onComplete,
  shell = false,
  shellProps,
  density = "comfortable",
  className,
  classNames,
}: OnboardingProps) {
  const [indexState, setIndexState] = React.useState(defaultStep)
  const index = Math.min(step ?? indexState, Math.max(steps.length - 1, 0))
  const current = steps[index]
  const [workspace, setWorkspace] = React.useState(workspaceDefault)
  const [invites, setInvites] = React.useState("ines@acme.example")
  const [toolState, setToolState] = React.useState(tools)
  const [checkState, setCheckState] = React.useState(checks)
  const visibleTools = onToolConnect ? tools : toolState
  const visibleChecks = onCheckChange ? checks : checkState
  const space = density === "compact" ? "p-3" : "p-6"
  const inviteList = invites
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)

  function go(next: number) {
    const clamped = Math.max(0, Math.min(next, steps.length - 1))
    onStepChange?.(clamped)
    if (step === undefined) setIndexState(clamped)
  }

  function toggleTool(tool: OnboardingTool) {
    const connected = !tool.connected
    onToolConnect?.(tool.id, connected)
    if (!onToolConnect) {
      setToolState((currentTools) => currentTools.map((item) => (item.id === tool.id ? { ...item, connected } : item)))
    }
  }

  function toggleCheck(item: OnboardingCheck) {
    const done = !item.done
    onCheckChange?.(item.id, done)
    if (!onCheckChange) {
      setCheckState((currentChecks) => currentChecks.map((check) => (check.id === item.id ? { ...check, done } : check)))
    }
  }

  return (
    <ScreenFrame shell={shell} shellProps={{ activeId: "home", showSearch: false, density, ...shellProps }} className={className}>
      <div data-slot="onboarding" data-density={density} className={cn("@container flex min-h-0 min-w-0 flex-1 flex-col", space, classNames?.root)}>
        <div className="mx-auto flex w-full max-w-5xl min-w-0 flex-1 flex-col gap-4 @min-[800px]:flex-row">
          <div className="flex min-w-0 flex-1 flex-col">
            <ol aria-label="Pasos" className={cn("grid gap-2", steps.length > 1 && "grid-cols-2 @min-[640px]:grid-cols-4", classNames?.stepper)}>
              {steps.map((item, itemIndex) => {
                const state = itemIndex === index ? "current" : itemIndex < index ? "complete" : "upcoming"
                return (
                  <li key={item.id}>
                    <button
                      type="button"
                      aria-current={state === "current" ? "step" : undefined}
                      className={cn(
                        "flex w-full min-w-0 flex-col rounded-lg border px-2 py-2 text-left focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                        state === "current" ? "border-primary bg-primary/5" : "border-border",
                      )}
                      onClick={() => go(itemIndex)}
                    >
                      <span className="text-[11px] text-muted-foreground tabular-nums">
                        {itemIndex + 1}. {state === "complete" ? "Listo" : state === "current" ? "Actual" : "Pendiente"}
                      </span>
                      <span className="truncate text-sm font-medium">{item.label}</span>
                    </button>
                  </li>
                )
              })}
            </ol>

            {current ? (
              <section aria-labelledby="onboarding-title" className={cn("mt-4 flex-1 rounded-xl border border-border p-4", classNames?.panel)}>
                <h1 id="onboarding-title" className="text-xl font-semibold tracking-tight">
                  {current.title}
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">{current.description}</p>
                <div className="mt-4">
                  {current.id === "space" ? (
                    <label className="grid max-w-sm gap-1 text-sm">
                      Nombre
                      <Input value={workspace} onChange={(event) => setWorkspace(event.target.value)} />
                    </label>
                  ) : null}
                  {current.id === "tools" ? (
                    <ul className="grid gap-2 @min-[520px]:grid-cols-2">
                      {visibleTools.length === 0 ? (
                        <li className="text-sm text-muted-foreground">No hay herramientas.</li>
                      ) : (
                        visibleTools.map((tool) => (
                          <li key={tool.id} aria-label={tool.name} className="flex min-w-0 items-center justify-between gap-2 rounded-lg border border-border px-3 py-2">
                            <span className="min-w-0">
                              <span className="block truncate text-sm font-medium">{tool.name}</span>
                              <span className="block truncate text-xs text-muted-foreground">{tool.detail}</span>
                            </span>
                            <Button type="button" size="sm" variant={tool.connected ? "secondary" : "outline"} aria-pressed={Boolean(tool.connected)} onClick={() => toggleTool(tool)}>
                              {tool.connected ? "Conectada" : "Conectar"}
                            </Button>
                          </li>
                        ))
                      )}
                    </ul>
                  ) : null}
                  {current.id === "team" ? (
                    <label className="grid max-w-md gap-1 text-sm">
                      Invitaciones
                      <textarea
                        value={invites}
                        rows={4}
                        className="rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
                        onChange={(event) => setInvites(event.target.value)}
                      />
                    </label>
                  ) : null}
                  {current.id === "ready" ? (
                    <dl className="grid gap-2 text-sm">
                      <div>
                        <dt className="text-xs text-muted-foreground">Espacio</dt>
                        <dd className="break-words font-medium">{workspace || "Sin nombre"}</dd>
                      </div>
                      <div>
                        <dt className="text-xs text-muted-foreground">Herramientas</dt>
                        <dd>{visibleTools.filter((tool) => tool.connected).map((tool) => tool.name).join(", ") || "Ninguna"}</dd>
                      </div>
                      <div>
                        <dt className="text-xs text-muted-foreground">Invitaciones</dt>
                        <dd className="break-words">{inviteList.join(", ") || "Ninguna"}</dd>
                      </div>
                    </dl>
                  ) : null}
                </div>
                <div className="mt-6 flex flex-wrap gap-2">
                  <Button type="button" variant="outline" disabled={index === 0} onClick={() => go(index - 1)}>
                    Atrás
                  </Button>
                  {index < steps.length - 1 ? (
                    <Button type="button" onClick={() => go(index + 1)}>
                      Siguiente
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      onClick={() =>
                        onComplete?.({
                          workspace,
                          invites: inviteList,
                          connectedToolIds: visibleTools.filter((tool) => tool.connected).map((tool) => tool.id),
                        })
                      }
                    >
                      Entrar
                    </Button>
                  )}
                </div>
              </section>
            ) : (
              <p className="mt-4 text-sm text-muted-foreground">No hay pasos configurados.</p>
            )}
          </div>

          <aside aria-label="Lista de preparación" className={cn("w-full shrink-0 rounded-xl border border-border p-4 @min-[800px]:w-72", classNames?.checklist)}>
            <h2 className="text-sm font-medium">Lista</h2>
            {visibleChecks.length === 0 ? (
              <p className="mt-2 text-sm text-muted-foreground">Sin pendientes.</p>
            ) : (
              <ul className="mt-3 flex flex-col gap-2">
                {visibleChecks.map((item) => (
                  <li key={item.id}>
                    <label className="flex min-w-0 items-start gap-2 text-sm">
                      <input type="checkbox" className="mt-1 size-4 accent-primary" checked={Boolean(item.done)} onChange={() => toggleCheck(item)} />
                      <span className={cn("min-w-0 break-words", item.done && "text-muted-foreground line-through")}>{item.label}</span>
                    </label>
                  </li>
                ))}
              </ul>
            )}
          </aside>
        </div>
      </div>
    </ScreenFrame>
  )
}
