"use client"

/**
 * Sales workspace with a spreadsheet-like table. Edits stay in memory and can
 * be undone once, which keeps a mistaken cell from feeling permanent.
 */

import * as React from "react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScreenFrame, acmeNav, type AppShellProps, type ShellDensity, type ShellNavItem } from "@/registry/retana/blocks/app-shell"

export type CrmStage = {
  id: string
  label: string
}

export type CrmRow = {
  id: string
  company: string
  stage: string
  owner: string
  value: number
}

export type CrmColumn = "company" | "stage" | "owner" | "value"

export type CrmSheetClassNames = {
  root?: string
  toolbar?: string
  table?: string
}

export type CrmSheetProps = {
  rows?: CrmRow[]
  stages?: CrmStage[]
  onRowsChange?: (rows: CrmRow[]) => void
  locale?: string
  currency?: string
  readOnly?: boolean
  shell?: boolean
  shellProps?: Partial<AppShellProps>
  density?: ShellDensity
  className?: string
  classNames?: CrmSheetClassNames
  title?: string
}

export const crmStages: CrmStage[] = [
  { id: "lead", label: "Prospecto" },
  { id: "qualified", label: "Calificada" },
  { id: "proposal", label: "Propuesta" },
  { id: "won", label: "Ganada" },
  { id: "lost", label: "Perdida" },
]

export const crmRows: CrmRow[] = [
  { id: "bruma", company: "Taller Bruma", stage: "proposal", owner: "Inés Quesada", value: 48000 },
  { id: "norte", company: "Vidrio Norte", stage: "qualified", owner: "Omar Beltrán", value: 120000 },
  { id: "lumen", company: "Estudio Lumen", stage: "lead", owner: "Mara Solís", value: 18000 },
  { id: "faro", company: "Obra Faro", stage: "won", owner: "Inés Quesada", value: 76000 },
  { id: "costa", company: "Costa Clara", stage: "lost", owner: "Omar Beltrán", value: 9000 },
]

export const salesNav: ShellNavItem[] = [
  { id: "pipeline", label: "Cartera" },
  { id: "accounts", label: "Cuentas" },
  { id: "activity", label: "Actividad" },
  ...acmeNav.filter((item) => item.id === "settings"),
]

const columnLabel: Record<CrmColumn, string> = {
  company: "Empresa",
  stage: "Etapa",
  owner: "Responsable",
  value: "Valor",
}

function formatMoney(value: number, locale: string, currency: string) {
  return new Intl.NumberFormat(locale, { style: "currency", currency, maximumFractionDigits: 0 }).format(value)
}

export function CrmSheet({
  rows: rowsProp,
  stages = crmStages,
  onRowsChange,
  locale = "es-MX",
  currency = "MXN",
  readOnly = false,
  shell = true,
  shellProps,
  density = "comfortable",
  className,
  classNames,
  title = "Cartera",
}: CrmSheetProps) {
  const [rowsState, setRowsState] = React.useState(rowsProp ?? crmRows)
  const rows = rowsProp ?? rowsState
  const [selected, setSelected] = React.useState<string[]>([])
  const [undo, setUndo] = React.useState<CrmRow[] | null>(null)
  const [editing, setEditing] = React.useState<{ id: string; column: CrmColumn } | null>(null)
  const [draft, setDraft] = React.useState("")
  const space = density === "compact" ? "p-3" : "p-4"
  const allSelected = rows.length > 0 && rows.every((row) => selected.includes(row.id))

  function commitRows(next: CrmRow[], remember: CrmRow[]) {
    if (rowsProp === undefined) setRowsState(next)
    onRowsChange?.(next)
    setUndo(remember)
  }

  function beginEdit(row: CrmRow, column: CrmColumn) {
    if (readOnly || column === "stage") return
    const current = column === "value" ? String(row.value) : row[column]
    setEditing({ id: row.id, column })
    setDraft(current)
  }

  function cancelEdit() {
    setEditing(null)
    setDraft("")
  }

  function saveEdit() {
    if (!editing) return
    const previous = rows
    const next = rows.map((row) => {
      if (row.id !== editing.id) return row
      if (editing.column === "value") {
        const parsed = Number(draft.replace(/[^\d.-]/g, ""))
        if (!Number.isFinite(parsed)) return row
        return { ...row, value: parsed }
      }
      if (editing.column === "company" || editing.column === "owner") {
        return { ...row, [editing.column]: draft.trim() || row[editing.column] }
      }
      return row
    })
    commitRows(next, previous)
    cancelEdit()
  }

  function setStage(rowId: string, stage: string) {
    const previous = rows
    commitRows(
      rows.map((row) => (row.id === rowId ? { ...row, stage } : row)),
      previous,
    )
  }

  function undoLast() {
    if (!undo) return
    if (rowsProp === undefined) setRowsState(undo)
    onRowsChange?.(undo)
    setUndo(null)
  }

  function toggleAll() {
    setSelected(allSelected ? [] : rows.map((row) => row.id))
  }

  function toggleOne(id: string) {
    setSelected((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]))
  }

  const total = rows.reduce((sum, row) => sum + row.value, 0)

  return (
    <ScreenFrame
      shell={shell}
      shellProps={{
        activeId: "pipeline",
        nav: salesNav,
        projectsLabel: "Cuentas",
        contentLabel: "Cartera",
        density,
        ...shellProps,
      }}
      className={className}
    >
      <div data-slot="crm-sheet" data-density={density} className={cn("flex min-h-0 min-w-0 flex-1 flex-col", classNames?.root)}>
        <header className={cn("flex flex-wrap items-end justify-between gap-2 border-b border-border", space, classNames?.toolbar)}>
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground">Ventas</p>
            <h1 className="truncate text-lg font-semibold tracking-tight">{title}</h1>
          </div>
          <p className="text-sm tabular-nums text-muted-foreground">
            {selected.length} seleccionadas · {formatMoney(total, locale, currency)}
          </p>
        </header>
        {undo ? (
          <p role="status" className="flex flex-wrap items-center gap-2 border-b border-border bg-muted/60 px-4 py-2 text-sm">
            Cambio guardado en la tabla.
            <Button type="button" size="sm" variant="outline" onClick={undoLast}>
              Deshacer
            </Button>
          </p>
        ) : null}
        <div className={cn("min-h-0 flex-1 overflow-auto", classNames?.table)}>
          {rows.length === 0 ? (
            <p className="p-4 text-sm text-muted-foreground">La cartera está vacía.</p>
          ) : (
            <table className="w-full min-w-[44rem] border-separate border-spacing-0 text-sm">
              <caption className="sr-only">Empresas de la cartera. Las celdas se pueden editar.</caption>
              <thead className="sticky top-0 bg-background text-left text-xs text-muted-foreground">
                <tr>
                  <th scope="col" className="w-10 border-b border-border px-3 py-2">
                    <input
                      type="checkbox"
                      aria-label="Seleccionar todas"
                      checked={allSelected}
                      onChange={toggleAll}
                    />
                  </th>
                  {(Object.keys(columnLabel) as CrmColumn[]).map((column) => (
                    <th key={column} scope="col" className="border-b border-border px-3 py-2 font-medium">
                      {columnLabel[column]}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => {
                  const stage = stages.find((item) => item.id === row.stage)
                  return (
                    <tr key={row.id} className="hover:bg-muted/40" data-selected={selected.includes(row.id) ? "true" : "false"}>
                      <td className="border-b border-border px-3 py-1.5">
                        <input
                          type="checkbox"
                          aria-label={`Seleccionar ${row.company}`}
                          checked={selected.includes(row.id)}
                          onChange={() => toggleOne(row.id)}
                        />
                      </td>
                      <td className="border-b border-border px-3 py-1.5">
                        {editing?.id === row.id && editing.column === "company" ? (
                            <input
                            aria-label={`Empresa ${row.company}`}
                            value={draft}
                            className="h-8 w-full min-w-0 rounded-md border border-input bg-background px-2 text-sm focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
                            onChange={(event) => setDraft(event.target.value)}
                            onBlur={saveEdit}
                            onKeyDown={(event) => {
                              if (event.key === "Enter") {
                                event.preventDefault()
                                saveEdit()
                              }
                              if (event.key === "Escape") cancelEdit()
                            }}
                          />
                        ) : (
                          <button
                            type="button"
                            className="block w-full min-w-0 truncate rounded-md px-1 py-1 text-left font-medium focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none disabled:opacity-60"
                            disabled={readOnly}
                            onClick={() => beginEdit(row, "company")}
                          >
                            {row.company}
                          </button>
                        )}
                      </td>
                      <td className="border-b border-border px-3 py-1.5">
                        <label className="sr-only" htmlFor={`stage-${row.id}`}>
                          Etapa de {row.company}
                        </label>
                        <select
                          id={`stage-${row.id}`}
                          aria-label={`Etapa de ${row.company}`}
                          disabled={readOnly}
                          value={row.stage}
                          className="h-8 max-w-full rounded-md border border-input bg-transparent px-2 text-sm"
                          onChange={(event) => setStage(row.id, event.target.value)}
                        >
                          {stage ? null : <option value={row.stage}>{row.stage}</option>}
                          {stages.map((item) => (
                            <option key={item.id} value={item.id}>
                              {item.label}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="border-b border-border px-3 py-1.5">
                        {editing?.id === row.id && editing.column === "owner" ? (
                            <input
                            aria-label={`Responsable de ${row.company}`}
                            value={draft}
                            className="h-8 w-full min-w-0 rounded-md border border-input bg-background px-2 text-sm focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
                            onChange={(event) => setDraft(event.target.value)}
                            onBlur={saveEdit}
                            onKeyDown={(event) => {
                              if (event.key === "Enter") {
                                event.preventDefault()
                                saveEdit()
                              }
                              if (event.key === "Escape") cancelEdit()
                            }}
                          />
                        ) : (
                          <button
                            type="button"
                            className="block w-full min-w-0 truncate rounded-md px-1 py-1 text-left focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none disabled:opacity-60"
                            disabled={readOnly}
                            onClick={() => beginEdit(row, "owner")}
                          >
                            {row.owner}
                          </button>
                        )}
                      </td>
                      <td className="border-b border-border px-3 py-1.5 text-right">
                        {editing?.id === row.id && editing.column === "value" ? (
                            <input
                            aria-label={`Valor de ${row.company}`}
                            inputMode="decimal"
                            value={draft}
                            className="h-8 w-full min-w-0 rounded-md border border-input bg-background px-2 text-right text-sm tabular-nums focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
                            onChange={(event) => setDraft(event.target.value)}
                            onBlur={saveEdit}
                            onKeyDown={(event) => {
                              if (event.key === "Enter") {
                                event.preventDefault()
                                saveEdit()
                              }
                              if (event.key === "Escape") cancelEdit()
                            }}
                          />
                        ) : (
                          <button
                            type="button"
                            className="ml-auto block w-full min-w-0 truncate rounded-md px-1 py-1 text-right tabular-nums focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none disabled:opacity-60"
                            disabled={readOnly}
                            onClick={() => beginEdit(row, "value")}
                          >
                            {formatMoney(row.value, locale, currency)}
                          </button>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </ScreenFrame>
  )
}
