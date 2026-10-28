import type { SceneLocale } from "@/app/catalog/scene-types"
import type { DiffDecision, InlineDiffLabels } from "@/registry/ui/inline-diff"

export type DiffFixture = {
  es: { original: string; suggested: string }
  en: { original: string; suggested: string }
  settle?: DiffDecision
  loading?: boolean
  banner?: { es: string; en: string }
  acceptError?: { es: string; en: string }
}

const original = {
  es: "Hola. El pedido PED-990 sigue en el taller y el esmalte cobalto se queda ahí. La entrega a Mariana Ruiz en León es el viernes 30 de octubre porque el horno 2 no enciende.",
  en: "Hello. Order PED-990 is still at the workshop and the cobalt glaze stays there. Delivery to Mariana Ruiz in León is Friday 30 October because kiln 2 will not light.",
}

const suggested = {
  es: "Hola. El pedido PED-990 sigue en el taller. La entrega a Mariana Ruiz en León es el lunes 2 de noviembre porque el horno 2 no enciende.",
  en: "Hello. Order PED-990 is still at the workshop. Delivery to Mariana Ruiz in León is Monday 2 November because kiln 2 will not light.",
}

export const filled: DiffFixture = { es: { original: original.es, suggested: suggested.es }, en: { original: original.en, suggested: suggested.en } }

export const empty: DiffFixture = {
  es: { original: "El horno 2 no enciende.", suggested: "El horno 2 no enciende." },
  en: { original: "Kiln 2 will not light.", suggested: "Kiln 2 will not light." },
}

export const loading: DiffFixture = { ...filled, loading: true }

export const error: DiffFixture = {
  ...filled,
  banner: {
    es: "No se aceptó el cambio. El viernes sigue en el texto.",
    en: "The change was not accepted. Friday is still in the text.",
  },
  acceptError: {
    es: "No se aceptó el cambio. El viernes sigue en el texto.",
    en: "The change was not accepted. Friday is still in the text.",
  },
}

export const settled: DiffFixture = { ...filled, settle: "accept" }

export function diffLabels(locale: SceneLocale): Partial<InlineDiffLabels> {
  if (locale === "en") return {}
  return {
    label: "Cambio sugerido",
    suggestion: (index, total, remove, insert) => {
      const from = remove.trim() || "nada"
      const to = insert.trim() || "nada"
      return `Cambio ${index} de ${total}: reemplazar “${from}” por “${to}”. Pulsa Y para aceptar, N para rechazar`
    },
    accept: "Aceptar",
    reject: "Rechazar",
    acceptAll: "Aceptar todo",
    rejectAll: "Rechazar todo",
    undo: "Deshacer",
    previous: "Cambio anterior",
    next: "Cambio siguiente",
    done: "Ya se revisaron todos los cambios",
    empty: "No hay nada que revisar.",
    loading: "Cargando la sugerencia",
    accepted: (left) => (left === 0 ? "Aceptado. No queda ninguno" : `Aceptado. Quedan ${left}`),
    rejected: (left) => (left === 0 ? "Rechazado. No queda ninguno" : `Rechazado. Quedan ${left}`),
  }
}
