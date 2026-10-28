export type ExpandableNode = {
  id: string
}

export type ExpandableMap = Record<string, boolean>

export function childRows<T>(row: T, getSubRows?: (row: T) => readonly T[] | undefined) {
  return getSubRows?.(row) ?? []
}

/** Ids that can open: a detail panel, or a row that has children. */
export function expandableIds<T extends ExpandableNode>(
  rows: readonly T[],
  getSubRows?: (row: T) => readonly T[] | undefined,
  hasDetail = false,
): string[] {
  const ids: string[] = []
  const walk = (list: readonly T[]) => {
    for (const row of list) {
      const children = childRows(row, getSubRows)
      if (hasDetail || children.length > 0) ids.push(row.id)
      if (children.length > 0) walk(children)
    }
  }
  walk(rows)
  return ids
}

export function expandAll(ids: readonly string[]): ExpandableMap {
  const next: ExpandableMap = {}
  for (const id of ids) next[id] = true
  return next
}

export function isRowOpen(expanded: ExpandableMap | true | undefined, id: string) {
  if (expanded === true) return true
  return Boolean(expanded?.[id])
}

type FilterOptions<T> = {
  query: string
  searchText?: (row: T) => string
  getSubRows?: (row: T) => readonly T[] | undefined
  setSubRows?: (row: T, children: T[]) => T
  predicates?: readonly ((row: T) => boolean)[]
}

function defaultSetSubRows<T>(row: T, children: T[]): T {
  return { ...(row as object), subRows: children } as T
}

/**
 * Keeps a row when it matches the query and every predicate.
 * A parent stays when any descendant matches, even if the parent text does not.
 */
export function filterExpandableRows<T>(rows: readonly T[], options: FilterOptions<T>): T[] {
  const needle = options.query.trim().toLowerCase()
  const predicates = options.predicates ?? []
  const getSubRows = options.getSubRows
  const write = options.setSubRows ?? defaultSetSubRows

  const passesFilters = (row: T) => predicates.every((predicate) => predicate(row))
  const passesSearch = (row: T) => !needle || !options.searchText || options.searchText(row).toLowerCase().includes(needle)

  if (!getSubRows) return rows.filter((row) => passesFilters(row) && passesSearch(row))

  const visit = (row: T, searchRequired: boolean): T | null => {
    const children = getSubRows(row) ?? []
    const selfOk = passesFilters(row) && (!searchRequired || passesSearch(row))
    if (children.length === 0) return selfOk ? row : null
    const nextRequired = passesSearch(row) ? false : searchRequired
    const kept = children.map((child) => visit(child, nextRequired)).filter((child): child is T => child != null)
    if (kept.length === 0) return selfOk ? write(row, []) : null
    if (kept.length === children.length && kept.every((child, index) => child === children[index])) return row
    return write(row, kept)
  }

  return rows.map((row) => visit(row, true)).filter((row): row is T => row != null)
}
