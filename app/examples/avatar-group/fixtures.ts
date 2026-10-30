/** Same neutral swatches the lightbox demo already uses. Not photographs. */
const tones = ["#ddd6cc", "#c9c1b6", "#b3aa9e"]

/** Names from the auditor fixture list only. */
const crew = [
  { name: "Inés Ejemplo" },
  { name: "Diego Ejemplo" },
  { name: "Marta Muestra" },
]

export type CirclePerson = {
  name: string
  src?: string
}

function swatch(name: string, tone: string) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80"><rect width="80" height="80" fill="${tone}"/><circle cx="40" cy="40" r="18" fill="#ffffff" fill-opacity="0.45"/><text x="40" y="46" text-anchor="middle" font-size="14" fill="#2a2724">${name.slice(0, 1)}</text></svg>`
  return `data:image/svg+xml,${encodeURIComponent(svg)}`
}

/** Generic placeholders. No real portraits. */
export const filled: CirclePerson[] = crew.map((person, index) => ({
  name: person.name,
  src: swatch(person.name, tones[index] ?? tones[0]!),
}))

/** Same people, initials only. */
export const empty: CirclePerson[] = crew.map((person) => ({ name: person.name }))

/** The row is not ready. The scene draws the skeleton. */
export const loading: CirclePerson[] = empty

/** Broken sources. The avatar falls back to initials. */
export const error: CirclePerson[] = crew.map((person) => ({
  name: person.name,
  src: "/idea-450-missing-avatar.svg",
}))

export const copy = {
  title: { es: "Círculo del taller", en: "Workshop circle" },
  empty: { es: "Sin retrato: quedan las iniciales.", en: "No portrait: initials stay." },
  error: { es: "El retrato no cargó. Mostramos las iniciales.", en: "The portrait did not load. Initials are the fallback." },
  loading: { es: "Cargando el círculo…", en: "Loading the circle…" },
  label: { es: "Círculo del taller", en: "Workshop circle" },
}
