import type { SceneLocale } from "@/app/catalog/scene-types"
import type { DraftContact, DraftStatus, DraftTone, EmailDraftLabels } from "@/registry/ui/email-draft"

export type OrderMeta = { pedido: string }

type ContactSeed = { id: string; email: string; es: string; en: string }

export type EmailFixture = {
  reference?: string
  account?: string
  amount?: string
  statusLabel?: { es: string; en: string }
  agent?: string
  contacts: readonly ContactSeed[]
  contactId?: string
  tones: { es: DraftTone[]; en: DraftTone[] }
  bodies: Record<string, Record<string, { es: string; en: string }>>
  toneId?: string
  attachment?: string
  link?: { es: string; en: string }
  status?: DraftStatus | null
  loading?: boolean
  banner?: { es: string; en: string }
  sendError?: { es: string; en: string }
}

const ramon: ContactSeed = { id: "ramon", email: "pedidos@bajio.example", es: "Ramón Solís", en: "Ramón Solís" }
const mariana: ContactSeed = { id: "mariana", email: "mariana@leon.example", es: "Mariana Ruiz", en: "Mariana Ruiz" }

const bodies: EmailFixture["bodies"] = {
  claro: {
    ramon: {
      es: "Hola, Ramón. El correo del pedido PED-990 no había salido. El horno 2 no enciende y el anticipo sigue en $18,400.00 MXN. La entrega a Mariana Ruiz en León pasa al lunes 2 de noviembre.",
      en: "Hello, Ramón. The mail for order PED-990 had not gone out. Kiln 2 will not light and the deposit stays at $18,400.00 MXN. Delivery to Mariana Ruiz in León moves to Monday 2 November.",
    },
    mariana: {
      es: "Hola, Mariana. Tu pieza sigue en el taller de León. El horno 2 no enciende, así que la entrega pasa al lunes 2 de noviembre. El anticipo queda en $18,400.00 MXN.",
      en: "Hello, Mariana. Your piece is still at the workshop for León. Kiln 2 will not light, so delivery moves to Monday 2 November. The deposit stays at $18,400.00 MXN.",
    },
  },
  breve: {
    ramon: {
      es: "Ramón, el pedido PED-990 sigue aquí: el horno 2 no enciende. El anticipo queda en $18,400.00 MXN.",
      en: "Ramón, order PED-990 is still here: kiln 2 will not light. The deposit stays at $18,400.00 MXN.",
    },
    mariana: {
      es: "Mariana, la entrega en León pasa al lunes 2 de noviembre. El horno 2 no enciende.",
      en: "Mariana, delivery in León moves to Monday 2 November. Kiln 2 will not light.",
    },
  },
  formal: {
    ramon: {
      es: "Estimado Ramón Solís: le avisamos que el pedido PED-990 no se envió. El horno 2 no enciende. El anticipo permanece en $18,400.00 MXN y la entrega en León se mueve al lunes 2 de noviembre.",
      en: "Dear Ramón Solís: order PED-990 was not sent. Kiln 2 will not light. The deposit remains $18,400.00 MXN and the León delivery moves to Monday 2 November.",
    },
    mariana: {
      es: "Estimada Mariana Ruiz: la pieza para León no sale el viernes 30 de octubre. La entrega queda para el lunes 2 de noviembre.",
      en: "Dear Mariana Ruiz: the piece for León does not leave on Friday 30 October. Delivery is now Monday 2 November.",
    },
  },
}

export const filled: EmailFixture = {
  reference: "PED-990",
  account: "Cerámica del Bajío",
  amount: "$18,400.00 MXN",
  statusLabel: { es: "No salió", en: "Did not go out" },
  agent: "Bruma",
  contacts: [ramon, mariana],
  contactId: "ramon",
  tones: {
    es: [
      { id: "claro", label: "Claro" },
      { id: "breve", label: "Breve" },
      { id: "formal", label: "Formal" },
    ],
    en: [
      { id: "claro", label: "Plain" },
      { id: "breve", label: "Short" },
      { id: "formal", label: "Formal" },
    ],
  },
  bodies,
  toneId: "claro",
  attachment: "cotizacion-PED-990.pdf",
  link: { es: "Ver el pedido", en: "Open the order" },
}

export const empty: EmailFixture = { contacts: [], tones: { es: [], en: [] }, bodies: {} }

export const loading: EmailFixture = { ...filled, loading: true }

export const error: EmailFixture = {
  ...filled,
  banner: {
    es: "No se envió el correo. Sigue en el borrador.",
    en: "The mail was not sent. It is still a draft.",
  },
  sendError: {
    es: "No se envió el correo. Sigue en el borrador.",
    en: "The mail was not sent. It is still a draft.",
  },
}

export const sent: EmailFixture = { ...filled, status: "sent" }

export const discarded: EmailFixture = { ...filled, status: "discarded" }

export const short: EmailFixture = { ...filled, toneId: "breve" }

export function draftLabels(locale: SceneLocale): Partial<EmailDraftLabels> {
  if (locale === "en") return {}
  return {
    title: "Borrador",
    to: "Para",
    recipients: "Destinatarios",
    tone: "Tono",
    edit: "Editar el mensaje",
    send: "Enviar",
    discard: "Descartar",
    undo: "Deshacer",
    sent: (name) => `Enviado a ${name}`,
    discarded: "Borrador descartado",
    remove: "Quitar",
    removeNamed: (name) => `Quitar “${name}”`,
    restore: "Devolver el archivo",
    attachment: "Adjunto",
    empty: "No hay borrador que revisar.",
    loading: "Cargando el borrador",
    from: (agent) => `Borrador de ${agent}`,
    open: "Ver el pedido",
    message: "Mensaje",
  }
}

export function contactsFrom(fixture: EmailFixture, locale: SceneLocale): DraftContact<OrderMeta>[] {
  return fixture.contacts.map((contact) => ({ id: contact.id, name: contact[locale], email: contact.email, meta: { pedido: "PED-990" } }))
}

export function bodyFor(fixture: EmailFixture, locale: SceneLocale, toneId: string, contactId: string) {
  return fixture.bodies[toneId]?.[contactId]?.[locale] ?? ""
}
