export type FlowInputNode = { id: string; label: string; column: number }
export type FlowInputLink = { id: string; source: string; target: string; value: number }

export type FlowNodeBox = FlowInputNode & { x: number; y: number; width: number; height: number; value: number }
export type FlowLinkBox = FlowInputLink & { path: string; thickness: number; value: number }

export type FlowLayout = { nodes: FlowNodeBox[]; links: FlowLinkBox[] }

function ribbon(x0: number, y0: number, h0: number, x1: number, y1: number, h1: number) {
  const mid = (x0 + x1) / 2
  return `M${x0.toFixed(2)} ${y0.toFixed(2)} C${mid.toFixed(2)} ${y0.toFixed(2)}, ${mid.toFixed(2)} ${y1.toFixed(2)}, ${x1.toFixed(2)} ${y1.toFixed(2)} L${x1.toFixed(2)} ${(y1 + h1).toFixed(2)} C${mid.toFixed(2)} ${(y1 + h1).toFixed(2)}, ${mid.toFixed(2)} ${(y0 + h0).toFixed(2)}, ${x0.toFixed(2)} ${(y0 + h0).toFixed(2)} Z`
}

/**
 * Column sankey. Nodes declare their column. Link thickness follows the value.
 * Negative link values are dropped from the geometry.
 */
export function layoutFlow(
  nodes: FlowInputNode[],
  links: FlowInputLink[],
  width: number,
  height: number,
  options?: { nodeWidth?: number; nodeGap?: number },
): FlowLayout {
  const nodeWidth = options?.nodeWidth ?? 14
  const nodeGap = options?.nodeGap ?? 10
  const usable = links.filter((link) => link.value > 0 && nodes.some((node) => node.id === link.source) && nodes.some((node) => node.id === link.target))
  const valueOf = new Map<string, number>()
  for (const node of nodes) valueOf.set(node.id, 0)
  for (const link of usable) {
    valueOf.set(link.source, (valueOf.get(link.source) ?? 0) + link.value)
    valueOf.set(link.target, (valueOf.get(link.target) ?? 0) + link.value)
  }
  for (const node of nodes) {
    const incoming = usable.filter((link) => link.target === node.id).reduce((sum, link) => sum + link.value, 0)
    const outgoing = usable.filter((link) => link.source === node.id).reduce((sum, link) => sum + link.value, 0)
    valueOf.set(node.id, Math.max(incoming, outgoing))
  }

  const columns = new Map<number, FlowInputNode[]>()
  for (const node of nodes) {
    const list = columns.get(node.column) ?? []
    list.push(node)
    columns.set(node.column, list)
  }
  const indexes = [...columns.keys()].sort((a, b) => a - b)
  const span = Math.max(1, indexes.length - 1)
  const gapX = indexes.length > 1 ? (width - nodeWidth) / span : 0
  const boxes = new Map<string, FlowNodeBox>()

  for (const column of indexes) {
    const list = columns.get(column) ?? []
    const total = list.reduce((sum, node) => sum + (valueOf.get(node.id) ?? 0), 0)
    const free = Math.max(0, height - nodeGap * Math.max(0, list.length - 1))
    let y = 0
    const x = indexes.indexOf(column) * gapX
    for (const node of list) {
      const share = total > 0 ? (valueOf.get(node.id) ?? 0) / total : 1 / list.length
      const bar = Math.max(total > 0 ? 4 : free / list.length, share * free)
      boxes.set(node.id, { ...node, x, y, width: nodeWidth, height: bar, value: valueOf.get(node.id) ?? 0 })
      y += bar + nodeGap
    }
  }

  const sourceOffset = new Map<string, number>()
  const targetOffset = new Map<string, number>()
  const drawn: FlowLinkBox[] = []
  const ordered = [...usable].sort((a, b) => a.id.localeCompare(b.id))
  for (const link of ordered) {
    const source = boxes.get(link.source)
    const target = boxes.get(link.target)
    if (!source || !target) continue
    const sourceValue = source.value || 1
    const targetValue = target.value || 1
    const sourceH = (link.value / sourceValue) * source.height
    const targetH = (link.value / targetValue) * target.height
    const y0 = source.y + (sourceOffset.get(source.id) ?? 0)
    const y1 = target.y + (targetOffset.get(target.id) ?? 0)
    sourceOffset.set(source.id, (sourceOffset.get(source.id) ?? 0) + sourceH)
    targetOffset.set(target.id, (targetOffset.get(target.id) ?? 0) + targetH)
    drawn.push({
      ...link,
      value: link.value,
      thickness: sourceH,
      path: ribbon(source.x + source.width, y0, sourceH, target.x, y1, targetH),
    })
  }

  return { nodes: [...boxes.values()], links: drawn }
}

/** Nodes and links on the directed path through `nodeId`. Side branches stay out. */
export function flowRoute(nodeId: string, links: FlowInputLink[]) {
  const nodes = new Set<string>([nodeId])
  const used = new Set<string>()
  const downstream = new Set<string>([nodeId])
  const upstream = new Set<string>([nodeId])
  let grew = true
  while (grew) {
    grew = false
    for (const link of links) {
      if (link.value <= 0 || used.has(link.id) || !downstream.has(link.source)) continue
      used.add(link.id)
      if (!downstream.has(link.target)) {
        downstream.add(link.target)
        nodes.add(link.target)
        grew = true
      }
    }
  }
  grew = true
  while (grew) {
    grew = false
    for (const link of links) {
      if (link.value <= 0 || used.has(link.id) || !upstream.has(link.target)) continue
      used.add(link.id)
      if (!upstream.has(link.source)) {
        upstream.add(link.source)
        nodes.add(link.source)
        grew = true
      }
    }
  }
  return { nodes, links: used }
}
