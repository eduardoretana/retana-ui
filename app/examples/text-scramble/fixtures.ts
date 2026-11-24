/**
 * Copy for the text-scramble scenes. Electrónica Cobre is an invented hardware workshop in
 * Guadalajara. No real product, price or brand. Strings only: the piece inherits the host theme.
 */
export type ScrambleCopy = { es: string; en: string }

export type ScrambleFixture = {
  /** Hero line. Empty means the host has nothing to show yet. */
  title: ScrambleCopy
  /** Optional support line under the title. */
  support?: ScrambleCopy
}

/** The launch line of the workshop's terminal, decoded once. */
export const filled: ScrambleFixture = {
  title: { es: "Consola Cobre 84, lista para enviar", en: "Copper 84 console, ready to ship" },
  support: { es: "Ensamblada a mano en Guadalajara. Garantía de dos años.", en: "Hand-assembled in Guadalajara. Two-year warranty." },
}

/** No launch copy yet. The piece renders nothing visible and the host says why. */
export const empty: ScrambleFixture = {
  title: { es: "", en: "" },
}

/** The copy arrives from the CMS; it decodes once when it lands. */
export const loading: ScrambleFixture = filled

/** The CMS failed. After a retry, the same launch copy decodes. */
export const error: ScrambleFixture = filled

/** A product card for a terminal: the thematic case the effect was made for. */
export const terminal = {
  name: { es: "Consola Cobre 84", en: "Copper 84 console" },
  price: { es: "$18,400 MXN", en: "MXN 18,400" },
  specs: [
    { label: { es: "Pantalla", en: "Screen" }, value: { es: "CRT ámbar de 9 in", en: "9 in amber CRT" } },
    { label: { es: "Teclas", en: "Keys" }, value: { es: "84, mecánicas", en: "84, mechanical" } },
    { label: { es: "Peso", en: "Weight" }, value: { es: "6.2 kg", en: "6.2 kg" } },
  ],
} as const

/** Over the 120-character cap: body copy, shown at once with no effect. */
export const long: ScrambleFixture = {
  title: {
    es: "Cada consola sale del taller con su bitácora de pruebas: encendido en frío, cuarenta horas de quemado, revisión de teclas y un último ajuste de brillo a mano.",
    en: "Every console leaves the workshop with its test log: a cold start, forty hours of burn-in, a key check and one last brightness adjustment by hand, one unit at a time.",
  },
}
