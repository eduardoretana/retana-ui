export type HexCellCoord = { q: number; r: number }

export function hexPolygon(cx: number, cy: number, size: number) {
  const points: string[] = []
  for (let corner = 0; corner < 6; corner += 1) {
    const angle = (Math.PI / 180) * (60 * corner - 30)
    points.push(`${(cx + size * Math.cos(angle)).toFixed(2)},${(cy + size * Math.sin(angle)).toFixed(2)}`)
  }
  return points.join(" ")
}

/** Pointy-top axial layout. */
export function axialToPixel(q: number, r: number, size: number) {
  return {
    x: size * Math.sqrt(3) * (q + r / 2),
    y: size * 1.5 * r,
  }
}

export function hexBounds(cells: HexCellCoord[], size: number, pad = 2) {
  if (!cells.length) return { minX: 0, minY: 0, width: size * 2, height: size * 2 }
  const pixels = cells.map((cell) => axialToPixel(cell.q, cell.r, size))
  const minX = Math.min(...pixels.map((point) => point.x)) - size - pad
  const maxX = Math.max(...pixels.map((point) => point.x)) + size + pad
  const minY = Math.min(...pixels.map((point) => point.y)) - size - pad
  const maxY = Math.max(...pixels.map((point) => point.y)) + size + pad
  return { minX, minY, width: Math.max(1, maxX - minX), height: Math.max(1, maxY - minY) }
}
