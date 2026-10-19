"use client"

/**
 * Prompt evaluation review. The diff is a line comparison written for this
 * registry; it does not vendor a diff library or another product's cases.
 */

import * as React from "react"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { ScreenFrame, type AppShellProps, type ShellDensity, type ShellNavItem } from "@/registry/retana/blocks/app-shell"

export type EvalKpi = {
  id: string
  label: string
  current: string
  previous: string
  direction?: "up" | "down" | "flat"
}

export type EvalVersion = {
  id: string
  label: string
  passRate: number
}

export type EvalPrompt = {
  before: string
  after: string
}

export type EvalCaseStatus = "pass" | "fail" | "skip"

export type EvalCase = {
  id: string
  name: string
  status: EvalCaseStatus
  score: string
  note: string
}

export type EvalReviewClassNames = {
  root?: string
  kpis?: string
  chart?: string
  diff?: string
  cases?: string
}

export type EvalReviewProps = {
  title?: string
  versionLabel?: string
  kpis?: EvalKpi[]
  versions?: EvalVersion[]
  prompt?: EvalPrompt
  cases?: EvalCase[]
  shell?: boolean
  shellProps?: Partial<AppShellProps>
  density?: ShellDensity
  className?: string
  classNames?: EvalReviewClassNames
}

export const evalNav: ShellNavItem[] = [
  { id: "evals", label: "Evaluaciones" },
  { id: "prompts", label: "Prompts" },
  { id: "cases", label: "Casos" },
  { id: "settings", label: "Ajustes" },
]

export const evalKpis: EvalKpi[] = [
  { id: "pass", label: "Aprobación", current: "86%", previous: "79%", direction: "up" },
  { id: "fail", label: "Fallos", current: "4", previous: "7", direction: "down" },
  { id: "latency", label: "Latencia", current: "1.8 s", previous: "2.4 s", direction: "down" },
  { id: "cost", label: "Costo medio", current: "$0.04", previous: "$0.05", direction: "down" },
]

export const evalVersions: EvalVersion[] = [
  { id: "v1", label: "v1", passRate: 71 },
  { id: "v2", label: "v2", passRate: 79 },
  { id: "v3", label: "v3", passRate: 86 },
]

export const evalPrompt: EvalPrompt = {
  before: "Describe el producto.\nIncluye un enlace.",
  after: "Describe la linterna de campo en tres frases.\nCierra pidiendo una muestra.\nNo inventes cifras.",
}

export const evalCases: EvalCase[] = [
  { id: "greeting", name: "Saludo", status: "pass", score: "1.0", note: "Responde en español y no pide datos." },
  { id: "numbers", name: "Cifras", status: "pass", score: "1.0", note: "No agrega precios que no están en el encargo." },
  { id: "tone", name: "Tono", status: "fail", score: "0.4", note: "Usa un trato formal cuando se pidió cercano." },
  { id: "cite", name: "Cita", status: "skip", score: "—", note: "El caso no aplica a esta versión." },
]

const statusLabel: Record<EvalCaseStatus, string> = {
  pass: "Pasa",
  fail: "Falla",
  skip: "Omitido",
}

const directionWord: Record<NonNullable<EvalKpi["direction"]>, string> = {
  up: "Sube",
  down: "Baja",
  flat: "Igual",
}

function promptRows(prompt: EvalPrompt) {
  const before = prompt.before.split("\n")
  const after = prompt.after.split("\n")
  const length = Math.max(before.length, after.length)
  return Array.from({ length }, (_, index) => {
    const left = before[index]
    const right = after[index]
    return { left, right, changed: left !== right }
  })
}

export function EvalReview({
  title = "Evaluación del encargo",
  versionLabel = "v3 frente a v2",
  kpis = evalKpis,
  versions = evalVersions,
  prompt = evalPrompt,
  cases = evalCases,
  shell = true,
  shellProps,
  density = "comfortable",
  className,
  classNames,
}: EvalReviewProps) {
  const space = density === "compact" ? "gap-3 p-3" : "gap-4 p-4"
  const maxRate = Math.max(...versions.map((version) => version.passRate), 0)
  const rows = promptRows(prompt)

  return (
    <ScreenFrame
      shell={shell}
      shellProps={{ activeId: "evals", nav: evalNav, contentLabel: "Evaluaciones", density, ...shellProps }}
      className={className}
    >
      <div data-slot="evals" data-density={density} className={cn("@container flex min-h-0 min-w-0 flex-1 flex-col", space, classNames?.root)}>
        <header>
          <p className="text-xs text-muted-foreground">{versionLabel}</p>
          <h1 className="text-lg font-semibold tracking-tight">{title}</h1>
        </header>

        {kpis.length === 0 ? (
          <p className="text-sm text-muted-foreground">Sin indicadores.</p>
        ) : (
          <ul className={cn("grid grid-cols-1 gap-3 @min-[640px]:grid-cols-2 @min-[960px]:grid-cols-4", classNames?.kpis)}>
            {kpis.map((kpi) => (
              <li key={kpi.id} className="min-w-0 rounded-xl border border-border p-3">
                <p className="truncate text-xs text-muted-foreground">{kpi.label}</p>
                <p className="mt-1 truncate text-2xl font-semibold tabular-nums">{kpi.current}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  <span className="font-medium text-foreground">{directionWord[kpi.direction ?? "flat"]}</span>
                  <span className="ml-1">antes {kpi.previous}</span>
                </p>
              </li>
            ))}
          </ul>
        )}

        <section aria-label="Aprobación por versión" className={cn("rounded-xl border border-border p-3", classNames?.chart)}>
          <h2 className="text-sm font-medium">Aprobación por versión</h2>
          {versions.length === 0 ? (
            <p className="mt-2 text-sm text-muted-foreground">Sin versiones.</p>
          ) : (
            <div className="mt-3 flex h-40 items-end gap-3" role="list">
              {versions.map((version) => {
                const height = maxRate === 0 ? 0 : (version.passRate / Math.max(maxRate, 100)) * 100
                return (
                  <div key={version.id} role="listitem" className="flex min-w-0 flex-1 flex-col items-center gap-1">
                    <span className="text-xs tabular-nums">{version.passRate}%</span>
                    <div className="relative h-24 w-full max-w-16">
                      <div
                        className="absolute inset-x-0 bottom-0 rounded-t-md bg-chart-2 motion-safe:transition-[height] motion-reduce:transition-none"
                        style={{ height: `${height}%` }}
                        role="meter"
                        aria-label={version.label}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-valuenow={version.passRate}
                      />
                    </div>
                    <span className="truncate text-xs text-muted-foreground">{version.label}</span>
                  </div>
                )
              })}
            </div>
          )}
        </section>

        <section aria-label="Diferencia del prompt" className={cn("rounded-xl border border-border p-3", classNames?.diff)}>
          <h2 className="text-sm font-medium">Diferencia del prompt</h2>
          {rows.length === 0 ? (
            <p className="mt-2 text-sm text-muted-foreground">Sin texto.</p>
          ) : (
            <div className="mt-3 grid gap-3 @min-[720px]:grid-cols-2">
              <div>
                <h3 className="mb-1 text-xs text-muted-foreground">Antes</h3>
                <ol className="overflow-hidden rounded-lg border border-border font-mono text-xs">
                  {rows.map((row, index) => (
                    <li key={`before-${index}`} className={cn("px-2 py-1 break-all whitespace-pre-wrap", row.changed && "bg-destructive/10")}>
                      {row.left ?? ""}
                    </li>
                  ))}
                </ol>
              </div>
              <div>
                <h3 className="mb-1 text-xs text-muted-foreground">Después</h3>
                <ol className="overflow-hidden rounded-lg border border-border font-mono text-xs">
                  {rows.map((row, index) => (
                    <li key={`after-${index}`} className={cn("px-2 py-1 break-all whitespace-pre-wrap", row.changed && row.right != null && "bg-primary/10")}>
                      {row.right ?? ""}
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          )}
        </section>

        <section aria-label="Casos de prueba" className={cn("rounded-xl border border-border", classNames?.cases)}>
          <h2 className="px-3 pt-3 text-sm font-medium">Casos</h2>
          {cases.length === 0 ? (
            <p className="px-3 py-3 text-sm text-muted-foreground">Sin casos.</p>
          ) : (
            <div className="overflow-auto">
              <table className="w-full min-w-[36rem] text-sm">
                <caption className="sr-only">Casos de la evaluación</caption>
                <thead className="text-left text-xs text-muted-foreground">
                  <tr>
                    <th scope="col" className="px-3 py-2 font-medium">Caso</th>
                    <th scope="col" className="px-3 py-2 font-medium">Estado</th>
                    <th scope="col" className="px-3 py-2 font-medium">Puntaje</th>
                    <th scope="col" className="px-3 py-2 font-medium">Nota</th>
                  </tr>
                </thead>
                <tbody>
                  {cases.map((item) => (
                    <tr key={item.id} className="border-t border-border">
                      <th scope="row" className="px-3 py-2 text-left font-medium">{item.name}</th>
                      <td className="px-3 py-2">
                        <Badge variant={item.status === "fail" ? "destructive" : item.status === "pass" ? "secondary" : "outline"}>
                          {statusLabel[item.status]}
                        </Badge>
                      </td>
                      <td className="px-3 py-2 tabular-nums">{item.score}</td>
                      <td className="px-3 py-2 break-words text-muted-foreground">{item.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </ScreenFrame>
  )
}
