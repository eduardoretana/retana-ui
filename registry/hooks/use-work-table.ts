"use client"

import * as React from "react"

import {
  applyIdOrder,
  defaultLayout,
  layoutsEqual,
  loadSnapshot,
  presetById,
  reconcileLayout,
  reorderIds,
  savePreset,
  saveSnapshot,
  toggleHidden,
  withSequentialRank,
  type WorkColumnLayout,
  type WorkDensity,
  type WorkMove,
  type WorkTableSnapshot,
} from "@/registry/retana/lib/work-table"

const snapshotListeners = new Set<() => void>()
const snapshotMemory = new Map<string, WorkTableSnapshot>()

function emitSnapshots() {
  snapshotListeners.forEach((listener) => listener())
}

function subscribeSnapshots(listener: () => void) {
  snapshotListeners.add(listener)
  return () => snapshotListeners.delete(listener)
}

function blankSnapshot(columnKey: string, density: WorkDensity): WorkTableSnapshot {
  const ids = columnKey ? columnKey.split("\0") : []
  return { layout: defaultLayout(ids, density), presets: [], activePresetId: null }
}

function readSnapshot(slot: string, columnKey: string, density: WorkDensity, persistenceKey?: string) {
  const ids = columnKey ? columnKey.split("\0") : []
  if (!snapshotMemory.has(slot)) {
    const loaded = persistenceKey && typeof window !== "undefined" ? loadSnapshot(window.localStorage, persistenceKey, ids) : null
    const base = loaded ?? blankSnapshot(columnKey, density)
    snapshotMemory.set(slot, { ...base, layout: reconcileLayout(base.layout, ids) })
  }
  const cached = snapshotMemory.get(slot) ?? blankSnapshot(columnKey, density)
  const layout = reconcileLayout(cached.layout, ids)
  if (layoutsEqual(cached.layout, layout)) return cached
  const next = { ...cached, layout }
  snapshotMemory.set(slot, next)
  return next
}

export function usePrefersReducedMotion() {
  return React.useSyncExternalStore(subscribeReduced, getReduced, () => false)
}

function subscribeReduced(onChange: () => void) {
  const media = window.matchMedia("(prefers-reduced-motion: reduce)")
  media.addEventListener("change", onChange)
  return () => media.removeEventListener("change", onChange)
}

function getReduced() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches
}

export function useWorkTableLayout({
  columnIds,
  persistenceKey,
  density = "comfortable",
}: {
  columnIds: readonly string[]
  persistenceKey?: string
  density?: WorkDensity
}) {
  const columnKey = columnIds.join("\0")
  const slot = React.useId() + (persistenceKey ? `:${persistenceKey}` : "")
  const hydrated = React.useSyncExternalStore(subscribeSnapshots, () => true, () => false)
  const snapshot = React.useSyncExternalStore(
    subscribeSnapshots,
    () => readSnapshot(slot, columnKey, density, persistenceKey),
    () => blankSnapshot(columnKey, density),
  )

  const commit = React.useCallback((next: WorkTableSnapshot) => {
    snapshotMemory.set(slot, next)
    if (persistenceKey) saveSnapshot(window.localStorage, persistenceKey, next)
    emitSnapshots()
  }, [persistenceKey, slot])

  const reorderColumns = React.useCallback((activeId: string, overId: string) => {
    const current = readSnapshot(slot, columnKey, density, persistenceKey)
    commit({
      ...current,
      activePresetId: null,
      layout: { ...current.layout, order: reorderIds(current.layout.order, activeId, overId) },
    })
  }, [columnKey, commit, density, persistenceKey, slot])

  const hideColumn = React.useCallback((columnId: string, locked: readonly string[] = []) => {
    const current = readSnapshot(slot, columnKey, density, persistenceKey)
    commit({ ...current, activePresetId: null, layout: toggleHidden(current.layout, columnId, locked) })
  }, [columnKey, commit, density, persistenceKey, slot])

  const setDensity = React.useCallback((next: WorkDensity) => {
    const current = readSnapshot(slot, columnKey, density, persistenceKey)
    commit({ ...current, activePresetId: null, layout: { ...current.layout, density: next } })
  }, [columnKey, commit, density, persistenceKey, slot])

  const rememberPreset = React.useCallback((name: string) => {
    const current = readSnapshot(slot, columnKey, density, persistenceKey)
    const presets = savePreset(current.presets, name, current.layout)
    commit({ ...current, presets, activePresetId: presets.at(-1)?.id ?? null })
  }, [columnKey, commit, density, persistenceKey, slot])

  const restorePreset = React.useCallback((id?: string | null) => {
    const current = readSnapshot(slot, columnKey, density, persistenceKey)
    const preset = presetById(current.presets, id === undefined ? current.activePresetId : id)
    if (!preset) return
    commit({ ...current, activePresetId: preset.id, layout: reconcileLayout(preset.layout, current.layout.order) })
  }, [columnKey, commit, density, persistenceKey, slot])

  const resetLayout = React.useCallback(() => {
    const ids = columnKey ? columnKey.split("\0") : []
    const current = readSnapshot(slot, columnKey, density, persistenceKey)
    commit({ ...current, activePresetId: null, layout: defaultLayout(ids, density) })
  }, [columnKey, commit, density, persistenceKey, slot])

  return {
    layout: snapshot.layout,
    presets: snapshot.presets,
    activePresetId: snapshot.activePresetId,
    hydrated,
    reorderColumns,
    hideColumn,
    setDensity,
    rememberPreset,
    restorePreset,
    resetLayout,
    setLayout: (layout: WorkColumnLayout) => {
      const current = readSnapshot(slot, columnKey, density, persistenceKey)
      commit({ ...current, layout, activePresetId: null })
    },
  }
}

export function useWorkCollection<T extends { id: string; rank?: number | null }>(initial: readonly T[]) {
  const [rows, setRows] = React.useState<T[]>(() => withSequentialRank(initial.map((row) => ({ ...row }))))

  const reorder = React.useCallback((ids: readonly string[]) => {
    setRows((current) => withSequentialRank(applyIdOrder(current, ids)))
  }, [])

  const applyMove = React.useCallback((event: Pick<WorkMove<T>, "rows">) => {
    setRows(withSequentialRank(event.rows))
  }, [])

  const update = React.useCallback((id: string, patch: Partial<T>) => {
    setRows((current) => current.map((row) => (row.id === id ? { ...row, ...patch } : row)))
  }, [])

  const remove = React.useCallback((id: string) => {
    setRows((current) => withSequentialRank(current.filter((row) => row.id !== id)))
  }, [])

  const assign = React.useCallback((ids: readonly string[], assigneeId: string | null, key: keyof T) => {
    setRows((current) =>
      current.map((row) => (ids.includes(row.id) ? { ...row, [key]: assigneeId } : row)),
    )
  }, [])

  return { rows, setRows, reorder, applyMove, update, remove, assign }
}
