export type RowSelectionMap = Record<string, true>

export type SelectionFlag = boolean | "indeterminate"

export type BranchRow = {
  id: string
  subRows: readonly BranchRow[]
}

/** Rows with no children. Group headers and tree parents are skipped. */
export function terminalRows<T extends BranchRow>(rows: readonly T[]): T[] {
  const leaves: T[] = []
  const walk = (list: readonly T[]) => {
    for (const row of list) {
      if (row.subRows.length > 0) walk(row.subRows as readonly T[])
      else leaves.push(row)
    }
  }
  walk(rows)
  return leaves
}

export function selectionFlag(ids: readonly string[], selection: RowSelectionMap): SelectionFlag {
  if (ids.length === 0) return false
  let selected = 0
  for (const id of ids) if (selection[id]) selected += 1
  if (selected === 0) return false
  if (selected === ids.length) return true
  return "indeterminate"
}

export function patchSelection(
  selection: RowSelectionMap,
  ids: readonly string[],
  selected: boolean,
): RowSelectionMap {
  const next: RowSelectionMap = { ...selection }
  for (const id of ids) {
    if (selected) next[id] = true
    else delete next[id]
  }
  return next
}

export function selectedCount(ids: readonly string[], selection: RowSelectionMap) {
  let count = 0
  for (const id of ids) if (selection[id]) count += 1
  return count
}

type FilterOptions<T> = {
  matchSearch: (row: T) => boolean
  matchFilters: (row: T) => boolean
  getSubRows?: (row: T) => readonly T[] | undefined
  setSubRows?: (row: T, children: T[]) => T
}

function defaultSetSubRows<T>(row: T, children: T[]): T {
  return { ...(row as object), children } as T
}

/**
 * Keeps a row when it passes the filters and the search, and keeps a parent
 * when any descendant remains. A parent that itself matches the search keeps
 * every child that still passes the filters.
 */
export function filterTableRows<T>(rows: readonly T[], options: FilterOptions<T>): T[] {
  const { matchSearch, matchFilters, getSubRows } = options
  if (!getSubRows) return rows.filter((row) => matchFilters(row) && matchSearch(row))

  const write = options.setSubRows ?? defaultSetSubRows

  const visit = (row: T, searchRequired: boolean): T | null => {
    const children = getSubRows(row) ?? []
    if (children.length === 0) {
      if (!matchFilters(row)) return null
      if (searchRequired && !matchSearch(row)) return null
      return row
    }
    const nextRequired = matchSearch(row) ? false : searchRequired
    const kept = children
      .map((child) => visit(child, nextRequired))
      .filter((child): child is T => child != null)
    if (kept.length === 0) return null
    if (kept.length === children.length && kept.every((child, index) => child === children[index])) return row
    return write(row, kept)
  }

  return rows.map((row) => visit(row, true)).filter((row): row is T => row != null)
}
