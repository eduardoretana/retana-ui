/** URL slug from a human title. Accents are stripped. */
export function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

/**
 * `slugify(base)`, then `-2`, `-3`, … until the slug is unused.
 * `ignore` is a slug that does not count as taken (the row being edited).
 */
export function uniqueSlug(
  base: string,
  existing: Iterable<string>,
  ignore?: string,
): string {
  const slug = slugify(base) || "item"
  const taken = new Set(existing)
  if (ignore) taken.delete(ignore)
  if (!taken.has(slug)) return slug
  let n = 2
  while (taken.has(`${slug}-${n}`)) n += 1
  return `${slug}-${n}`
}

export function createId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID()
  }
  return `id-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
}
