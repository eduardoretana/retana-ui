"use client"

import { useRef } from "react"

import { SceneStatus } from "@/app/catalog/scene-frame"
import type { Scene, SceneRenderProps } from "@/app/catalog/scene-types"
import { formatSceneCall } from "@/app/catalog/scene-types"
import { useSceneSim } from "@/app/catalog/use-scene-sim"
import { expandAll, expandableIds } from "@/registry/lib/expandable-table"
import { ExpandableTable, ExpansionChecklist, ExpansionLines } from "@/registry/ui/expandable-table"
import type { ExpandedState } from "@tanstack/react-table"

import {
  allExpanded,
  checklistCaption,
  checklistRows,
  empty,
  error as errorScene,
  filled,
  linesCaption,
  loading,
  nested,
  nestedRows,
  orderActions,
  orderColumns,
  orderFilter,
  subtasks,
  tableLabels,
  taskRows,
  threeLevels,
  type OrderRow,
  type TableSceneSpec,
} from "./fixtures"

const frame = { size: "desk" as const, surface: "card" as const, padding: "md" as const }

function rowsOf(kind: "checks" | "lines" | "tasks", locale: SceneRenderProps["locale"]) {
  if (kind === "lines") return nestedRows(locale)
  if (kind === "tasks") return taskRows(locale)
  return checklistRows(locale)
}

function TableScene({
  locale,
  log,
  spec,
  banner,
}: SceneRenderProps & {
  spec: TableSceneSpec
  banner?: string
}) {
  const kind = spec.mode
  const rows = spec.empty ? [] : rowsOf(kind, locale)
  const initial: ExpandedState | undefined = spec.all
    ? expandAll(expandableIds(rows, kind === "tasks" ? (row) => row.subRows : undefined, kind !== "tasks"))
    : spec.openId
      ? { [spec.openId]: true }
      : undefined
  const sim = useSceneSim({ expanded: initial ?? {}, subtasks: spec.mode === "tasks" && Boolean(spec.all) }, log)
  const attempt = useRef(0)
  return (
    <div className="flex flex-col gap-3">
      {sim.failed && banner ? <SceneStatus tone="error">{banner}</SceneStatus> : null}
      <ExpandableTable<OrderRow>
        rows={rows}
        columns={orderColumns(locale)}
        getSubRows={kind === "tasks" ? (row) => row.subRows : undefined}
        setSubRows={kind === "tasks" ? (row, children) => ({ ...row, subRows: children }) : undefined}
        renderDetail={
          kind === "tasks"
            ? undefined
            : (row) =>
                kind === "lines" && row.lines ? (
                  <ExpansionLines lines={row.lines} caption={linesCaption[locale]} />
                ) : (
                  <ExpansionChecklist items={row.checks ?? []} label={checklistCaption[locale]} />
                )
        }
        rowTitle={(row) => row.code}
        searchText={(row) => `${row.code} ${row.account} ${row.owner}`}
        filters={[orderFilter(locale)]}
        actions={orderActions(locale)}
        onAction={(actionId, row) => log(formatSceneCall("onAction", [actionId, row.id]))}
        expanded={sim.state.expanded}
        onExpandedChange={(expanded) => {
          attempt.current += 1
          const first = Boolean(spec.fail) && attempt.current === 1
          void sim.call(formatSceneCall("onExpandedChange", []), (current) => ({ ...current, expanded }), undefined, {
            fail: first,
          })
        }}
        onRowSelectionChange={(selection) => log(formatSceneCall("onRowSelectionChange", [selection]))}
        onDensityChange={(density) => log(formatSceneCall("onDensityChange", [density]))}
        subtasksOpen={kind === "tasks" ? sim.state.subtasks : undefined}
        onSubtasksChange={
          kind === "tasks"
            ? (open) => {
                const ids = expandableIds(rows, (row) => row.subRows, false)
                sim.patch(formatSceneCall("onSubtasksChange", [open]), (current) => ({
                  ...current,
                  subtasks: open,
                  expanded: open ? expandAll(ids) : {},
                }))
              }
            : undefined
        }
        pageSize={4}
        loading={spec.loading}
        error={banner && !spec.fail ? banner : undefined}
        labels={tableLabels(locale)}
      />
    </div>
  )
}

const errorCopy = {
  es: "No se abrió la fila. Sigue cerrada.",
  en: "The row did not open. It stays closed.",
}

export const scenes: Scene[] = [
  {
    id: "filled",
    label: "Lleno",
    labelEn: "Filled",
    frame,
    render: (props) => <TableScene {...props} spec={filled} />,
  },
  {
    id: "empty",
    label: "Vacío",
    labelEn: "Empty",
    frame,
    render: (props) => <TableScene {...props} spec={empty} />,
  },
  {
    id: "loading",
    label: "Cargando",
    labelEn: "Loading",
    frame,
    render: (props) => <TableScene {...props} spec={loading} />,
  },
  {
    id: "error",
    label: "Error",
    labelEn: "Error",
    frame,
    render: (props) => <TableScene {...props} spec={errorScene} banner={errorCopy[props.locale]} />,
  },
  {
    id: "nested",
    label: "Partidas",
    labelEn: "Lines",
    frame,
    render: (props) => <TableScene {...props} spec={nested} />,
  },
  {
    id: "subtasks",
    label: "Subtareas",
    labelEn: "Subtasks",
    frame,
    render: (props) => <TableScene {...props} spec={subtasks} />,
  },
  {
    id: "all-expanded",
    label: "Todas abiertas",
    labelEn: "All open",
    frame,
    render: (props) => <TableScene {...props} spec={allExpanded} />,
  },
  {
    id: "nested-3-levels",
    label: "Tres niveles",
    labelEn: "Three levels",
    frame,
    render: (props) => <TableScene {...props} spec={threeLevels} />,
  },
]
