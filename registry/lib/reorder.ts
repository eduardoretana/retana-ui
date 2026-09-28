/**
 * List ordering helpers.
 *
 * `reorderVisible` only swaps the ids that are on screen. Hidden rows keep
 * their slots. That behavior is adapted from the MIT-licensed admin panel by
 * Maniruzzaman Jubayer. This notice travels with the installed file.
 *
 * Copyright (c) 2026 Maniruzzaman Jubayer
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

export function moveItem<T>(list: readonly T[], from: number, to: number): T[] {
  if (
    from === to ||
    from < 0 ||
    to < 0 ||
    from >= list.length ||
    to >= list.length
  ) {
    return [...list]
  }
  const next = list.slice()
  const [item] = next.splice(from, 1)
  if (item === undefined) return [...list]
  next.splice(to, 0, item)
  return next
}

export type MoveDirection = "up" | "down" | "top" | "bottom"

export function destinationIndex(
  index: number,
  count: number,
  target: MoveDirection | number,
): number {
  if (count <= 0) return 0
  if (typeof target === "number") {
    return Math.max(0, Math.min(count - 1, target))
  }
  if (target === "up") return Math.max(0, index - 1)
  if (target === "down") return Math.min(count - 1, index + 1)
  if (target === "top") return 0
  return count - 1
}

/**
 * Reorder `order` by moving `activeId` to the slot of `overId`, but only
 * among `visibleIds`. Ids that are not visible stay where they are.
 */
export function reorderVisible(
  order: readonly string[],
  visibleIds: readonly string[],
  activeId: string,
  overId: string,
): string[] {
  const from = visibleIds.indexOf(activeId)
  const to = visibleIds.indexOf(overId)
  if (from < 0 || to < 0 || from === to) return [...order]
  const nextVisible = moveItem(visibleIds, from, to)
  const slots = new Set(visibleIds)
  let cursor = 0
  return order.map((id) => {
    if (!slots.has(id)) return id
    const next = nextVisible[cursor]
    cursor += 1
    return next ?? id
  })
}

export function reorderRows<T extends { id: string; position: number }>(
  rows: readonly T[],
  ids: readonly string[],
): T[] {
  const byId = new Map(rows.map((row) => [row.id, row]))
  const seen = new Set<string>()
  const next: T[] = []
  for (const id of ids) {
    const row = byId.get(id)
    if (!row || seen.has(id)) continue
    seen.add(id)
    next.push({ ...row, position: next.length })
  }
  for (const row of rows) {
    if (seen.has(row.id)) continue
    next.push({ ...row, position: next.length })
  }
  return next
}

/** Keep the stored position when a form saves an existing row. */
export function keepPosition<T extends { position: number }>(
  current: T | undefined,
  draft: T,
): T {
  if (!current) return draft
  return { ...draft, position: current.position }
}
