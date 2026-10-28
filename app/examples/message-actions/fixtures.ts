import type { SceneLocale } from "@/app/catalog/scene-types"
import type { MessageActionsLabels, MessageVote } from "@/registry/ui/message-actions"

export type MessageFixture = {
  versions: { es: string; en: string }[]
  retry: { es: string; en: string }
  version?: number
  feedback?: MessageVote
  speaking?: boolean
  quiet?: boolean
  loading?: boolean
  banner?: { es: string; en: string }
  retryError?: { es: string; en: string }
}

const long = {
  es: "El anticipo de PED-1048 queda en $18,400.00 MXN. La entrega a Mariana Ruiz en León pasa al lunes 2 de noviembre porque el horno 2 no enciende.",
  en: "The deposit for PED-1048 stays at $18,400.00 MXN. Delivery to Mariana Ruiz in León moves to Monday 2 November because kiln 2 will not light.",
}

const short = {
  es: "PED-1048 sigue en $18,400.00 MXN y León espera hasta el lunes 2 de noviembre.",
  en: "PED-1048 stays at $18,400.00 MXN and León waits until Monday 2 November.",
}

const retry = {
  es: "En corto: el horno 2 no enciende, así que León espera al lunes 2 de noviembre. El anticipo sigue en $18,400.00 MXN.",
  en: "In short: kiln 2 will not light, so León waits until Monday 2 November. The deposit stays at $18,400.00 MXN.",
}

export const filled: MessageFixture = { versions: [long, short], retry, version: 0, quiet: false }

export const empty: MessageFixture = { versions: [], retry: { es: "", en: "" } }

export const loading: MessageFixture = { ...filled, loading: true }

export const error: MessageFixture = {
  ...filled,
  banner: {
    es: "No salió otra versión. Sigue la misma respuesta.",
    en: "Another version did not arrive. The same answer is still here.",
  },
  retryError: {
    es: "No salió otra versión. Sigue la misma respuesta.",
    en: "Another version did not arrive. The same answer is still here.",
  },
}

export const down: MessageFixture = { ...filled, feedback: "down" }

export const speaking: MessageFixture = { ...filled, speaking: true }

export const quiet: MessageFixture = { ...filled, quiet: true }

export function messageLabels(locale: SceneLocale): Partial<MessageActionsLabels> {
  if (locale === "en") return {}
  return {
    bar: "Acciones del mensaje",
    copy: "Copiar",
    copied: "Copiado",
    again: "Otra vez",
    againBusy: "Escribiendo otra versión",
    up: "Buena respuesta",
    down: "Respuesta floja",
    why: "Por qué",
    send: "Enviar la nota",
    other: "Otra",
    otherField: "Tu propia razón",
    speak: "Leer en voz alta",
    stop: "Dejar de leer",
    reading: "Leyendo en voz alta",
    version: (current, total) => `Versión ${current} de ${total}`,
    previous: "Versión anterior",
    next: "Versión siguiente",
    thanks: "Gracias, la nota quedó guardada",
    empty: "No hay mensaje sobre el que actuar.",
    loading: "Cargando el mensaje",
    ready: "Ya hay otra versión",
  }
}

export const messageReasons = {
  es: ["El anticipo está mal", "Se va de largo", "No menciona el horno", "Otra"],
  en: ["The deposit is wrong", "It runs long", "It misses the kiln", "Other"],
}
