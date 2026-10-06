"use client"

import * as React from "react"

import {
  coerceEnabledViews,
  decodeFilters,
  decodeSort,
  encodeFilters,
  encodeSort,
  readEnabledViews,
  viewPersistenceKey,
  type FilterClause,
  type MultiRecord,
  type SortClause,
  type ViewConfig,
  type ViewPersistenceScope,
} from "@/registry/retana/lib/multi-view"

export type UrlAdapter = {
  get: (key: string) => string | null
  set: (key: string, value: string | null) => void
}

/** Plain History API adapter. Stable if you memoize the returned object. */
export function createHistoryAdapter(): UrlAdapter {
  let search = typeof window === "undefined" ? "" : window.location.search
  return {
    get(key) {
      if (typeof window !== "undefined") search = search || window.location.search
      return new URLSearchParams(search).get(key)
    },
    set(key, value) {
      if (typeof window === "undefined") return
      const params = new URLSearchParams(search || window.location.search)
      if (value == null || value === "") params.delete(key)
      else params.set(key, value)
      const qs = params.toString()
      search = qs ? `?${qs}` : ""
      const url = qs ? `${window.location.pathname}?${qs}` : window.location.pathname
      window.history.replaceState(window.history.state, "", url)
    },
  }
}

export type ViewPersistence = {
  scope: ViewPersistenceScope
  /** Collection id. Combined with `scope` into the storage key. */
  id: string
  /** Defaults to localStorage in the browser. Pass a memory store in tests. */
  storage?: Pick<Storage, "getItem" | "setItem">
}

export type UseMultiViewOptions = {
  views: readonly ViewConfig[]
  /** Prefix for query keys. Default `mv`, producing `mv.view`, `mv.q`, and so on. */
  urlPrefix?: string
  url?: UrlAdapter | null
  /** Which views can be selected. Omit it to enable every view, which is the previous behavior. */
  enabledViews?: readonly string[]
  defaultEnabledViews?: readonly string[]
  onEnabledViewsChange?: (ids: string[]) => void
  /** Remembers the enabled set for one project or for every project. At least one view stays on. */
  persistViews?: ViewPersistence
  viewId?: string
  defaultViewId?: string
  onViewIdChange?: (viewId: string) => void
  query?: string
  defaultQuery?: string
  onQueryChange?: (query: string) => void
  filters?: readonly FilterClause[]
  defaultFilters?: readonly FilterClause[]
  onFiltersChange?: (filters: FilterClause[]) => void
  sort?: SortClause | null
  defaultSort?: SortClause | null
  onSortChange?: (sort: SortClause | null) => void
  /** `undefined` follows the active view. `null` is an explicit "no group". */
  groupBy?: string | null
  defaultGroupBy?: string | null
  onGroupByChange?: (groupBy: string | null) => void
  selectedIds?: readonly string[]
  defaultSelectedIds?: readonly string[]
  onSelectedIdsChange?: (ids: string[]) => void
  openId?: string | null
  defaultOpenId?: string | null
  onOpenIdChange?: (id: string | null) => void
}

type UrlSnapshot = {
  viewId?: string
  query?: string
  filters?: FilterClause[]
  sort?: SortClause | null
  groupBy?: string | null
  selectedIds?: string[]
  openId?: string | null
}

function readUrl(adapter: UrlAdapter | null | undefined, prefix: string): UrlSnapshot {
  if (!adapter) return {}
  const key = (name: string) => adapter.get(`${prefix}.${name}`)
  const viewId = key("view")
  const query = key("q")
  const filtersRaw = key("filters")
  const sortRaw = key("sort")
  const group = key("group")
  const open = key("open")
  const selected = key("sel")
  return {
    viewId: viewId || undefined,
    query: query ?? undefined,
    filters: filtersRaw ? decodeFilters(filtersRaw) : undefined,
    sort: sortRaw ? decodeSort(sortRaw) : undefined,
    groupBy: group == null ? undefined : group === "" ? null : group,
    selectedIds: selected ? selected.split(",").filter(Boolean) : undefined,
    openId: open === "" ? null : open,
  }
}

function useControllable<T>(
  controlled: T | undefined,
  uncontrolled: T,
  onChange?: (value: T) => void,
) {
  const [inner, setInner] = React.useState(uncontrolled)
  const isControlled = controlled !== undefined
  const value = isControlled ? controlled : inner
  const setValue = React.useCallback(
    (next: T) => {
      if (!isControlled) setInner(next)
      onChange?.(next)
    },
    [isControlled, onChange],
  )
  return [value, setValue] as const
}

export function useMultiView({
  views,
  urlPrefix = "mv",
  url,
  enabledViews: enabledProp,
  defaultEnabledViews,
  onEnabledViewsChange,
  persistViews,
  viewId: viewIdProp,
  defaultViewId,
  onViewIdChange,
  query: queryProp,
  defaultQuery,
  onQueryChange,
  filters: filtersProp,
  defaultFilters,
  onFiltersChange,
  sort: sortProp,
  defaultSort,
  onSortChange,
  groupBy: groupByProp,
  defaultGroupBy,
  onGroupByChange,
  selectedIds: selectedProp,
  defaultSelectedIds,
  onSelectedIdsChange,
  openId: openProp,
  defaultOpenId,
  onOpenIdChange,
}: UseMultiViewOptions) {
  const initialUrl = React.useState(() => readUrl(url, urlPrefix))[0]
  const viewIds = React.useMemo(() => views.map((view) => view.id), [views])
  const fallbackEnabled = React.useMemo(
    () => coerceEnabledViews(defaultEnabledViews ?? viewIds, viewIds),
    [defaultEnabledViews, viewIds],
  )
  const fallbackView = defaultViewId ?? initialUrl.viewId ?? views[0]?.id ?? ""

  const [enabledViews, setEnabledViews] = useControllable(
    enabledProp as string[] | undefined,
    fallbackEnabled,
    onEnabledViewsChange,
  )
  const [viewId, setViewId] = useControllable(
    viewIdProp,
    fallbackView,
    onViewIdChange,
  )
  const [query, setQuery] = useControllable(
    queryProp,
    defaultQuery ?? initialUrl.query ?? "",
    onQueryChange,
  )
  const [filters, setFilters] = useControllable(
    filtersProp as FilterClause[] | undefined,
    [...(defaultFilters ?? initialUrl.filters ?? [])],
    onFiltersChange,
  )
  const [sort, setSort] = useControllable(
    sortProp,
    defaultSort !== undefined ? defaultSort : (initialUrl.sort ?? null),
    onSortChange,
  )
  const [groupMode, setGroupMode] = React.useState<"view" | "value">(
    defaultGroupBy !== undefined || initialUrl.groupBy !== undefined ? "value" : "view",
  )
  const [groupBy, setGroupByState] = useControllable(
    groupByProp,
    defaultGroupBy !== undefined ? defaultGroupBy : (initialUrl.groupBy ?? null),
    onGroupByChange,
  )
  const setGroupBy = React.useCallback(
    (next: string | null) => {
      setGroupMode("value")
      setGroupByState(next)
    },
    [setGroupByState],
  )
  const [selectedIds, setSelectedIds] = useControllable(
    selectedProp as string[] | undefined,
    [...(defaultSelectedIds ?? initialUrl.selectedIds ?? [])],
    onSelectedIdsChange,
  )
  const [openId, setOpenId] = useControllable(
    openProp,
    defaultOpenId !== undefined ? defaultOpenId : (initialUrl.openId ?? null),
    onOpenIdChange,
  )

  const updateEnabledViews = React.useCallback(
    (next: readonly string[]) => {
      const coerced = coerceEnabledViews(next, viewIds, enabledViews)
      const same =
        coerced.length === enabledViews.length &&
        coerced.every((id, index) => id === enabledViews[index])
      if (same) return
      setEnabledViews(coerced)
      if (!persistViews || typeof window === "undefined") return
      try {
        const store = persistViews.storage ?? window.localStorage
        store.setItem(viewPersistenceKey(persistViews.scope, persistViews.id), JSON.stringify(coerced))
      } catch {
        // A blocked store still leaves the in-memory set in place.
      }
    },
    [enabledViews, persistViews, setEnabledViews, viewIds],
  )

  const loadedViews = React.useRef(false)
  React.useEffect(() => {
    if (loadedViews.current) return
    loadedViews.current = true
    if (!persistViews || enabledProp !== undefined || typeof window === "undefined") return
    try {
      const store = persistViews.storage ?? window.localStorage
      const stored = readEnabledViews(
        store.getItem(viewPersistenceKey(persistViews.scope, persistViews.id)),
        viewIds,
      )
      if (stored) updateEnabledViews(stored)
    } catch {
      // Ignore an unreadable store and keep the default set.
    }
  }, [enabledProp, persistViews, updateEnabledViews, viewIds])

  const requestedView = React.useRef<string | null>(null)
  React.useEffect(() => {
    if (enabledViews.includes(viewId)) {
      requestedView.current = null
      return
    }
    const next = enabledViews[0]
    if (!next || requestedView.current === next) return
    requestedView.current = next
    setViewId(next)
  }, [enabledViews, setViewId, viewId])

  const active = views.find((view) => view.id === viewId) ?? views.find((view) => enabledViews.includes(view.id)) ?? views[0]
  const resolvedGroupBy =
    groupByProp !== undefined || groupMode === "value" ? groupBy : (active?.groupField ?? null)

  React.useEffect(() => {
    if (!url) return
    url.set(`${urlPrefix}.view`, viewId || null)
    url.set(`${urlPrefix}.q`, query || null)
    url.set(`${urlPrefix}.filters`, filters.length ? encodeFilters(filters) : null)
    url.set(`${urlPrefix}.sort`, encodeSort(sort))
    url.set(`${urlPrefix}.group`, resolvedGroupBy)
    url.set(`${urlPrefix}.sel`, selectedIds.length ? selectedIds.join(",") : null)
    url.set(`${urlPrefix}.open`, openId)
  }, [filters, openId, query, resolvedGroupBy, selectedIds, sort, url, urlPrefix, viewId])

  React.useEffect(() => {
    if (!url || viewIdProp !== undefined) return
    const onPop = () => {
      const next = readUrl(url, urlPrefix)
      if (next.viewId) setViewId(next.viewId)
      if (next.query !== undefined) setQuery(next.query)
    }
    window.addEventListener("popstate", onPop)
    return () => window.removeEventListener("popstate", onPop)
  }, [setQuery, setViewId, url, urlPrefix, viewIdProp])

  const toggleSelected = React.useCallback(
    (id: string, selected?: boolean) => {
      const has = selectedIds.includes(id)
      const nextSelected = selected ?? !has
      const next = nextSelected
        ? has
          ? selectedIds
          : [...selectedIds, id]
        : selectedIds.filter((item) => item !== id)
      setSelectedIds([...next])
    },
    [selectedIds, setSelectedIds],
  )

  const clearSelection = React.useCallback(() => {
    setSelectedIds([])
  }, [setSelectedIds])

  return {
    views,
    enabledViews,
    setEnabledViews: updateEnabledViews,
    active,
    viewId,
    setViewId,
    query,
    setQuery,
    filters,
    setFilters,
    sort,
    setSort,
    groupBy: resolvedGroupBy,
    setGroupBy,
    selectedIds,
    setSelectedIds,
    toggleSelected,
    clearSelection,
    openId,
    setOpenId,
  }
}

export type OptimisticHandlers<T extends MultiRecord> = {
  records: readonly T[]
  onRecordChange?: (id: string, patch: Partial<T>) => Promise<void> | void
  onCreate?: (draft: Partial<T>) => Promise<void> | void
  onDelete?: (ids: readonly string[]) => Promise<void> | void
  onMove?: (id: string, patch: Partial<T>) => Promise<void> | void
}

/**
 * Applies a patch immediately and restores the previous row if the callback rejects.
 * Incoming `records` replace a patch once every patched key matches.
 */
export function useOptimisticRecords<T extends MultiRecord>({
  records,
  onRecordChange,
  onCreate,
  onDelete,
  onMove,
}: OptimisticHandlers<T>) {
  const [patches, setPatches] = React.useState<Record<string, Partial<T>>>({})
  const [added, setAdded] = React.useState<T[]>([])
  const [hidden, setHidden] = React.useState<ReadonlySet<string>>(new Set())
  const [seen, setSeen] = React.useState(records)
  if (seen !== records) {
    setSeen(records)
    setPatches((prev) => {
      let changed = false
      const next = { ...prev }
      for (const [id, patch] of Object.entries(prev)) {
        const record = records.find((item) => item.id === id)
        if (!record) continue
        const applied = Object.entries(patch).every(([key, value]) =>
          Object.is(record[key as keyof T], value),
        )
        if (applied) {
          delete next[id]
          changed = true
        }
      }
      return changed ? next : prev
    })
    setAdded((prev) => prev.filter((item) => !records.some((record) => record.id === item.id)))
    setHidden((prev) => {
      if (prev.size === 0) return prev
      const next = new Set([...prev].filter((id) => records.some((record) => record.id === id)))
      return next.size === prev.size ? prev : next
    })
  }

  const view = React.useMemo(() => {
    const base = records
      .filter((record) => !hidden.has(record.id))
      .map((record) => (patches[record.id] ? ({ ...record, ...patches[record.id] } as T) : record))
    const extras = added.filter(
      (record) => !records.some((item) => item.id === record.id) && !hidden.has(record.id),
    )
    return [...base, ...extras]
  }, [added, hidden, patches, records])

  const change = React.useCallback(
    async (id: string, patch: Partial<T>, commit?: (id: string, patch: Partial<T>) => Promise<void> | void) => {
      let snapshot: Partial<T> | undefined
      let had = false
      setPatches((prev) => {
        had = Object.prototype.hasOwnProperty.call(prev, id)
        snapshot = prev[id]
        return { ...prev, [id]: { ...prev[id], ...patch } }
      })
      try {
        await commit?.(id, patch)
      } catch (error) {
        setPatches((prev) => {
          const rolled = { ...prev }
          if (had && snapshot) rolled[id] = snapshot
          else delete rolled[id]
          return rolled
        })
        throw error
      }
    },
    [],
  )

  const update = React.useCallback(
    (id: string, patch: Partial<T>) => change(id, patch, onRecordChange),
    [change, onRecordChange],
  )

  const move = React.useCallback(
    (id: string, patch: Partial<T>) => change(id, patch, onMove ?? onRecordChange),
    [change, onMove, onRecordChange],
  )

  const create = React.useCallback(
    async (draft: Partial<T>) => {
      const id = typeof draft.id === "string" && draft.id ? draft.id : `tmp_${Math.random().toString(36).slice(2, 8)}`
      const row = { ...draft, id } as T
      setAdded((prev) => [...prev, row])
      try {
        await onCreate?.(row)
      } catch (error) {
        setAdded((prev) => prev.filter((item) => item.id !== id))
        throw error
      }
    },
    [onCreate],
  )

  const remove = React.useCallback(
    async (ids: readonly string[]) => {
      setHidden((prev) => {
        const next = new Set(prev)
        for (const id of ids) next.add(id)
        return next
      })
      try {
        await onDelete?.(ids)
      } catch (error) {
        setHidden((prev) => {
          const next = new Set(prev)
          for (const id of ids) next.delete(id)
          return next
        })
        throw error
      }
    },
    [onDelete],
  )

  return { records: view, update, move, create, remove }
}
