/** Pure planning math. The host owns labels, money, and which periods are forecast. */

export type PeriodKind = "actual" | "forecast"

export type PlanPeriod = {
  id: string
  label: string
  kind: PeriodKind
}

export type PlanValues = Record<string, number>

export type PlanNode = {
  id: string
  label: string
  weight: number
  prior: number
  plan: number
  /** Period ids the host has locked. */
  locked: readonly string[]
  values: PlanValues
  children?: PlanNode[]
}

export type CellChange = {
  id: string
  periodId: string
  before: number
  after: number
}

/** Locked entries are numbers. Free entries are null. Weights only apply to free cells. */
export function spread(total: number, weights: readonly number[], locked: readonly (number | null)[]): number[] {
  const free = locked.flatMap((value, index) => (value == null ? [index] : []))
  const lockedSum = locked.reduce<number>((sum, value) => sum + (value ?? 0), 0)
  const remaining = total - lockedSum
  const weightSum = free.reduce((sum, index) => sum + Math.max(0, weights[index] ?? 0), 0)
  return locked.map((value, index) => {
    if (value != null) return round2(value)
    if (free.length === 0) return 0
    const share = weightSum === 0 ? 1 / free.length : Math.max(0, weights[index] ?? 0) / weightSum
    return round2(remaining * share)
  })
}

export function sumValues(values: PlanValues, ids: readonly string[]) {
  return round2(ids.reduce((sum, id) => sum + (values[id] ?? 0), 0))
}

export function outlookOf(values: PlanValues, periods: readonly PlanPeriod[]) {
  const actual = sumValues(values, periods.filter((period) => period.kind === "actual").map((period) => period.id))
  const forecast = sumValues(values, periods.filter((period) => period.kind === "forecast").map((period) => period.id))
  return { actual, forecast, outlook: round2(actual + forecast) }
}

export function variance(outlook: number, plan: number) {
  return round2(outlook - plan)
}

function round2(value: number) {
  return Math.round(value * 100) / 100
}

function isLocked(node: PlanNode, periodId: string) {
  return node.locked.includes(periodId)
}

/**
 * Raise or cut a group's forecast total by `growth` (0.1 = +10%) and push the
 * new total down to children, then to unlocked forecast periods by weight.
 */
export function applyGrowth(node: PlanNode, periods: readonly PlanPeriod[], growth: number, periodWeights: Readonly<Record<string, number>>): PlanNode {
  const forecast = periods.filter((period) => period.kind === "forecast")
  const current = sumValues(node.values, forecast.map((period) => period.id))
  const target = round2(current * (1 + growth))
  return distributeForecast(node, forecast, target, periodWeights)
}

function distributeForecast(node: PlanNode, forecast: readonly PlanPeriod[], target: number, periodWeights: Readonly<Record<string, number>>): PlanNode {
  const children = node.children ?? []
  if (children.length === 0) {
    const weights = forecast.map((period) => periodWeights[period.id] ?? 1)
    const locked = forecast.map((period) => (isLocked(node, period.id) ? (node.values[period.id] ?? 0) : null))
    const next = spread(target, weights, locked)
    const values = { ...node.values }
    forecast.forEach((period, index) => {
      values[period.id] = next[index] ?? 0
    })
    return { ...node, values }
  }
  const weights = children.map((child) => child.weight)
  const locked = children.map((child) => {
    const lockedForecast = forecast.filter((period) => isLocked(child, period.id))
    if (lockedForecast.length === forecast.length && forecast.length > 0) {
      return sumValues(child.values, forecast.map((period) => period.id))
    }
    return null
  })
  const shares = spread(target, weights, locked)
  const nextChildren = children.map((child, index) => distributeForecast(child, forecast, shares[index] ?? 0, periodWeights))
  return { ...node, children: nextChildren, values: rollupValues(nextChildren, [...new Set([...Object.keys(node.values), ...forecast.map((period) => period.id)])]) }
}

function rollupValues(children: readonly PlanNode[], periodIds: readonly string[]): PlanValues {
  const values: PlanValues = {}
  for (const id of periodIds) values[id] = round2(children.reduce((sum, child) => sum + (child.values[id] ?? 0), 0))
  return values
}

export function rollupTree(nodes: readonly PlanNode[], periods: readonly PlanPeriod[]): PlanNode[] {
  const ids = periods.map((period) => period.id)
  return nodes.map((node) => {
    if (!node.children?.length) return node
    const children = rollupTree(node.children, periods)
    return { ...node, children, values: rollupValues(children, ids) }
  })
}

export function leafNodes(nodes: readonly PlanNode[]): PlanNode[] {
  const leaves: PlanNode[] = []
  const walk = (list: readonly PlanNode[]) => {
    for (const node of list) {
      if (node.children?.length) walk(node.children)
      else leaves.push(node)
    }
  }
  walk(nodes)
  return leaves
}

export function findNode(nodes: readonly PlanNode[], id: string): PlanNode | null {
  for (const node of nodes) {
    if (node.id === id) return node
    const child = node.children ? findNode(node.children, id) : null
    if (child) return child
  }
  return null
}

export function updateCell(nodes: readonly PlanNode[], id: string, periodId: string, value: number): PlanNode[] {
  return nodes.map((node) => {
    if (node.id === id) {
      if (node.locked.includes(periodId)) return node
      return { ...node, values: { ...node.values, [periodId]: round2(value) } }
    }
    if (!node.children) return node
    return { ...node, children: updateCell(node.children, id, periodId, value) }
  })
}

export function addChild(nodes: readonly PlanNode[], parentId: string, child: PlanNode): PlanNode[] {
  return nodes.map((node) => {
    if (node.id === parentId) return { ...node, children: [...(node.children ?? []), child] }
    if (!node.children) return node
    return { ...node, children: addChild(node.children, parentId, child) }
  })
}

export function historyUndo(past: readonly CellChange[][], future: readonly CellChange[][]) {
  const change = past.at(-1)
  if (!change) return { past, future }
  return { past: past.slice(0, -1), future: [...future, change] }
}

export function historyRedo(past: readonly CellChange[][], future: readonly CellChange[][]) {
  const change = future.at(-1)
  if (!change) return { past, future }
  return { past: [...past, change], future: future.slice(0, -1) }
}
