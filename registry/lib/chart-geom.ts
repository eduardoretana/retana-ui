export type Point = { x: number; y: number }

export function clamp(value: number, low: number, high: number) {
  return Math.min(high, Math.max(low, value))
}

export function extentWithZero(values: number[]) {
  if (!values.length) return { min: 0, max: 1 }
  const low = Math.min(0, ...values)
  const high = Math.max(0, ...values)
  if (low === 0 && high === 0) return { min: 0, max: 1 }
  const pad = (high - low) * 0.08
  return { min: low < 0 ? low - pad : 0, max: high === 0 ? 1 : high + pad }
}

export function scaleLinear(value: number, min: number, max: number, start: number, end: number) {
  const span = max - min || 1
  return start + ((value - min) / span) * (end - start)
}

export function linePath(points: Point[]) {
  return points.map((point, index) => `${index === 0 ? "M" : "L"}${point.x.toFixed(2)} ${point.y.toFixed(2)}`).join(" ")
}

export function areaPath(points: Point[], baseline: number) {
  if (!points.length) return ""
  const first = points[0]!
  const last = points[points.length - 1]!
  return `${linePath(points)} L${last.x.toFixed(2)} ${baseline.toFixed(2)} L${first.x.toFixed(2)} ${baseline.toFixed(2)} Z`
}

export function polarPoint(cx: number, cy: number, radius: number, angle: number): Point {
  return { x: cx + radius * Math.cos(angle), y: cy + radius * Math.sin(angle) }
}

/** Nightingale wedge. Angles are radians, 0 at the right, clockwise in SVG y-down space. */
export function wedgePath(cx: number, cy: number, inner: number, outer: number, start: number, end: number) {
  const span = end - start
  const large = span > Math.PI ? 1 : 0
  const a = polarPoint(cx, cy, outer, start)
  const b = polarPoint(cx, cy, outer, end)
  const c = polarPoint(cx, cy, inner, end)
  const d = polarPoint(cx, cy, inner, start)
  return `M${a.x.toFixed(2)} ${a.y.toFixed(2)} A${outer.toFixed(2)} ${outer.toFixed(2)} 0 ${large} 1 ${b.x.toFixed(2)} ${b.y.toFixed(2)} L${c.x.toFixed(2)} ${c.y.toFixed(2)} A${inner.toFixed(2)} ${inner.toFixed(2)} 0 ${large} 0 ${d.x.toFixed(2)} ${d.y.toFixed(2)} Z`
}

export type IsoFaces = { front: string; roof: string; side: string }

/** Extruded bar sitting on `base`. Positive `height` grows up. */
export function isoFaces(x: number, base: number, width: number, height: number, depth: number): IsoFaces {
  const top = base - height
  const front = `M${x.toFixed(2)} ${top.toFixed(2)} H${(x + width).toFixed(2)} V${base.toFixed(2)} H${x.toFixed(2)} Z`
  const roof = `M${x.toFixed(2)} ${top.toFixed(2)} L${(x + depth).toFixed(2)} ${(top - depth).toFixed(2)} H${(x + width + depth).toFixed(2)} L${(x + width).toFixed(2)} ${top.toFixed(2)} Z`
  const side = `M${(x + width).toFixed(2)} ${top.toFixed(2)} L${(x + width + depth).toFixed(2)} ${(top - depth).toFixed(2)} V${(base - depth).toFixed(2)} L${(x + width).toFixed(2)} ${base.toFixed(2)} Z`
  return { front, roof, side }
}

export function moveIndex(index: number, count: number, key: string) {
  if (count <= 0) return 0
  if (key === "Home") return 0
  if (key === "End") return count - 1
  if (key === "ArrowRight" || key === "ArrowUp") return Math.min(count - 1, index + 1)
  if (key === "ArrowLeft" || key === "ArrowDown") return Math.max(0, index - 1)
  return index
}

export function indexFromPointer(clientX: number, left: number, width: number, count: number) {
  if (count <= 0 || width <= 0) return 0
  const ratio = clamp((clientX - left) / width, 0, 0.9999)
  return Math.min(count - 1, Math.floor(ratio * count))
}
