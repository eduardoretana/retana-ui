/**
 * Bandeja de conversaciones.
 * Fuente: concepto visual de Divan Raj (@desdivj),
 * https://x.com/desdivj/status/2119738295039250507
 * Licencia: sin licencia, clean-room. No se copiaron assets, logos,
 * ilustraciones ni textos.
 */
import { mount, type VueWrapper } from "@vue/test-utils"
import { describe, expect, it } from "vitest"

import AppRail from "../src/app-rail/AppRail.vue"
import ChatThread from "../src/chat-thread/ChatThread.vue"
import ConversationItem from "../src/conversation-item/ConversationItem.vue"
import ConversationList from "../src/conversation-list/ConversationList.vue"
import InboxCrm from "../src/inbox-crm/InboxCrm.vue"
import InboxPageHeader from "../src/inbox-page-header/InboxPageHeader.vue"
import MessageBubble from "../src/message-bubble/MessageBubble.vue"
import MessageCardFile from "../src/message-card-file/MessageCardFile.vue"
import MessageCardInvoice from "../src/message-card-invoice/MessageCardInvoice.vue"
import MessageCardMetric from "../src/message-card-metric/MessageCardMetric.vue"
import PartyPanel from "../src/party-panel/PartyPanel.vue"
import SegmentedFilter from "../src/segmented-filter/SegmentedFilter.vue"
import SuggestedReplies from "../src/suggested-replies/SuggestedReplies.vue"
import ThreadComposer from "../src/thread-composer/ThreadComposer.vue"
import TypingIndicator from "../src/typing-indicator/TypingIndicator.vue"

const conversations = [
  {
    id: "ambar",
    title: "Taller Ámbar",
    preview: "Tú: Va el corte",
    time: "10:44",
    unread: 2,
    section: "pinned",
    tags: ["clients"],
    stage: "Propuesta",
    windowLabel: "6 h",
    channel: "WhatsApp",
    presence: "online" as const,
  },
  {
    id: "lerma",
    title: "Casa Lerma",
    preview: "¿Me compartes la simulación?",
    time: "Ayer",
    section: "all",
    tags: ["leads", "mine"],
    unread: 1,
  },
]

function shell(extra: Record<string, unknown> = {}) {
  return mount(InboxCrm, {
    attachTo: document.body,
    props: {
      layout: "wide",
      railLabel: "Espacios",
      railItems: [{ id: "chat", label: "Mensajes", active: true }],
      crumbs: [{ label: "Espacio", href: "#espacio" }, { label: "Mensajes" }],
      title: "Mensajes",
      subtitle: "Conversaciones con clientes y el equipo · 2 sin leer",
      actions: [{ id: "chat", label: "Nuevo chat" }],
      listLabel: "Conversaciones",
      searchLabel: "Buscar mensajes",
      filters: [
        { value: "all", label: "Todos" },
        { value: "unread", label: "Sin leer" },
      ],
      filter: "all",
      sections: [{ id: "pinned", label: "Fijados" }],
      conversations,
      selectedId: "ambar",
      threadLabel: "Hilo con Taller Ámbar",
      threadTitle: "Taller Ámbar",
      threadStatus: "En línea · Marca",
      messages: [{ id: "m1", side: "incoming", author: "Marina Soler", time: "10:46", body: "¿Podemos hablar el jueves?" }],
      suggestions: [{ id: "call", label: "Agendar llamada" }],
      party: {
        name: "Taller Ámbar",
        meta: "Cliente desde 2024 · León",
        facts: [],
        members: [],
        files: [],
      },
      ...extra,
    },
  })
}

function emitted(wrapper: VueWrapper, name: string) {
  return wrapper.emitted(name)
}

describe("conversation list", () => {
  it("LISTBOX announces unread rows and moves with the arrow keys", async () => {
    const wrapper = mount(ConversationList, {
      attachTo: document.body,
      props: {
        label: "Conversaciones",
        title: "Mensajes",
        countLabel: "2",
        searchLabel: "Buscar mensajes",
        shortcut: "⌘K",
        filters: [
          { value: "all", label: "Todos" },
          { value: "unread", label: "Sin leer" },
        ],
        filter: "all",
        sections: [
          { id: "pinned", label: "Fijados" },
          { id: "all", label: "Todos los mensajes" },
        ],
        items: conversations,
        selectedId: "ambar",
      },
    })
    const list = wrapper.get('[role="listbox"]')
    expect(list.attributes("aria-label")).toBe("Conversaciones")
    const selected = wrapper.get('[role="option"][aria-selected="true"]')
    expect(selected.text()).toContain("Taller Ámbar")
    expect(selected.text()).toContain("2")
    expect(wrapper.text()).toContain("WhatsApp")
    expect(wrapper.text()).toContain("Propuesta")
    expect(wrapper.text()).toContain("6 h")
    ;(list.element as HTMLElement).focus()
    await list.trigger("keydown", { key: "ArrowDown" })
    expect(emitted(wrapper, "select")?.[0]).toEqual(["lerma"])
    wrapper.unmount()
  })

  it("LIST-STATES shows an empty, loading, and error state", () => {
    const empty = mount(ConversationList, { props: { label: "Conversaciones", items: [], status: "empty", emptyTitle: "Sin chats" } })
    expect(empty.get('[role="status"]').text()).toContain("Sin chats")
    empty.unmount()

    const loading = mount(ConversationList, { props: { label: "Conversaciones", items: [], status: "loading", loadingLabel: "Cargando chats" } })
    expect(loading.get('[role="status"]').attributes("aria-label")).toBe("Cargando chats")
    loading.unmount()

    const error = mount(ConversationList, {
      props: { label: "Conversaciones", items: [], status: "error", error: "No se pudo leer la lista.", retryLabel: "Reintentar" },
    })
    expect(error.get('[role="alert"]').text()).toContain("No se pudo leer la lista.")
    error.unmount()
  })
})

describe("segmented filter", () => {
  it("FILTER-SCROLL keeps Sin leer whole and scrolls instead of clipping a word", async () => {
    const wrapper = mount(SegmentedFilter, {
      attachTo: document.body,
      props: {
        label: "Filtro",
        options: [
          { value: "all", label: "Todos" },
          { value: "unread", label: "Sin leer" },
        ],
        value: "all",
      },
    })
    const unread = wrapper.get('[data-value="unread"]')
    expect(unread.text()).toBe("Sin leer")
    expect(getComputedStyle(unread.element).whiteSpace).toBe("nowrap")
    const track = wrapper.get("[data-slot=segmented-filter-track]")
    expect(getComputedStyle(track.element).overflowX).toBe("auto")
    expect(parseFloat(getComputedStyle(unread.element).minHeight)).toBeGreaterThanOrEqual(44)
    await unread.trigger("click")
    expect(emitted(wrapper, "update:value")?.[0]).toEqual(["unread"])
    wrapper.unmount()
  })
})

describe("presence", () => {
  it("PRESENCE-SUCCESS paints the online dot with the success token", () => {
    const wrapper = mount(ConversationItem, {
      props: { item: conversations[0], selected: true },
    })
    const dot = wrapper.get("[data-presence=online]")
    const style = dot.attributes("style") ?? ""
    expect(style).toContain("var(--success)")
    expect(style).not.toContain("var(--primary)")
    expect(style).not.toContain("var(--accent)")
    wrapper.unmount()
  })
})

describe("message bubble", () => {
  it("BUBBLE-READ marks sent, delivered, and read, and hides a grouped author", () => {
    const wrapper = mount({
      components: { MessageBubble },
      template: `
        <div>
          <MessageBubble side="outgoing" author="Tú" time="10:40" delivery="sent" delivery-label="Enviado">Va.</MessageBubble>
          <MessageBubble side="outgoing" author="Tú" time="10:41" delivery="delivered" delivery-label="Entregado">Listo.</MessageBubble>
          <MessageBubble side="outgoing" author="Tú" time="10:42" delivery="read" delivery-label="Leído">Solo falta el visto.</MessageBubble>
          <MessageBubble side="incoming" author="Marina Soler" time="10:46" grouped="middle">Sigo aquí.</MessageBubble>
        </div>
      `,
    })
    expect(wrapper.get("[data-delivery=sent]").text()).toContain("Enviado")
    expect(wrapper.get("[data-delivery=delivered]").text()).toContain("Entregado")
    const read = wrapper.get("[data-delivery=read]")
    expect(read.attributes("data-side")).toBe("outgoing")
    expect(read.text()).toContain("Leído")
    expect(wrapper.text()).not.toContain("Marina Soler")
    wrapper.unmount()
  })

  it("BUBBLE-RETRY offers retry when sending fails", async () => {
    const wrapper = mount(MessageBubble, {
      props: { side: "outgoing", author: "Tú", delivery: "failed", retryLabel: "Reintentar" },
      slots: { default: "Va el corte." },
    })
    await wrapper.get("button").trigger("click")
    expect(emitted(wrapper, "retry")).toHaveLength(1)
    wrapper.unmount()
  })

  it("BUBBLE-MOTION rises on enter and stays still when motion is reduced", () => {
    const original = window.matchMedia
    window.matchMedia = ((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    })) as typeof window.matchMedia
    const rising = mount(MessageBubble, {
      props: { side: "incoming", author: "Marina", enter: true },
      slots: { default: "Llegué." },
    })
    expect(rising.get("[data-motion]").attributes("data-motion")).toBe("rise")
    rising.unmount()

    window.matchMedia = ((query: string) => ({
      matches: query.includes("prefers-reduced-motion"),
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    })) as typeof window.matchMedia
    const still = mount(MessageBubble, {
      props: { side: "incoming", author: "Marina", enter: true },
      slots: { default: "Llegué." },
    })
    expect(still.get("[data-motion]").attributes("data-motion")).toBe("off")
    still.unmount()
    window.matchMedia = original
  })
})

describe("rich cards", () => {
  it("CARDS renders a file, an amount due, and a segmented bar", async () => {
    const wrapper = mount({
      components: { MessageCardFile, MessageCardInvoice, MessageCardMetric },
      template: `
        <div>
          <MessageCardFile name="corte-marca.pdf" detail="248 KB · PDF" status="En revisión" download-label="Descargar" />
          <MessageCardInvoice title="Monto a pagar" amount="$18,640" due="Vence 14 nov" />
          <MessageCardMetric title="Salud de entrega" chip="Analítica" value="92 %" caption="a tiempo" :filled="11" :total="12" start="11 de 12 hitos" end="Lanzamiento 10 dic" />
        </div>
      `,
    })
    expect(wrapper.text()).toContain("corte-marca.pdf")
    expect(wrapper.text()).toContain("En revisión")
    await wrapper.get("button").trigger("click")
    expect(wrapper.getComponent(MessageCardFile).emitted("download")).toHaveLength(1)
    expect(wrapper.text()).toContain("$18,640")
    expect(wrapper.text()).toContain("Vence 14 nov")
    const segments = wrapper.findAll("[data-slot=metric-segment]")
    expect(segments).toHaveLength(12)
    expect(segments.filter((node) => node.attributes("data-filled") === "true")).toHaveLength(11)
    wrapper.unmount()
  })

  it("CARDS-GENERIC keeps voice, quote, appointment, and document on generic props", () => {
    const wrapper = mount(ChatThread, {
      props: {
        label: "Hilo",
        title: "Casa Lerma",
        messages: [
          { id: "voz", side: "incoming", author: "Casa Lerma", time: "10:41", note: { title: "Nota de voz · 0:18", detail: "Audio", body: "Quedamos el jueves." } },
          { id: "cot", side: "incoming", author: "Casa Lerma", time: "10:42", invoice: { title: "Cotización", amount: "$186,400", due: "Vence 14 nov" } },
          { id: "cita", side: "outgoing", author: "Tú", time: "10:46", note: { title: "Cita agendada", detail: "Jueves 12 nov · 14:30", body: "Revisión de expediente." } },
          { id: "doc", side: "incoming", author: "Casa Lerma", time: "10:48", file: { name: "ine-demo.pdf", detail: "1.2 MB · Documento", status: "En revisión" } },
        ],
      },
    })
    expect(wrapper.text()).toContain("Nota de voz · 0:18")
    expect(wrapper.text()).toContain("Cotización")
    expect(wrapper.text()).toContain("Cita agendada")
    expect(wrapper.text()).toContain("ine-demo.pdf")
    expect(wrapper.text()).toContain("En revisión")
    wrapper.unmount()
  })
})

describe("typing indicator", () => {
  it("TYPING names who is typing without a presence provider", () => {
    const wrapper = mount(TypingIndicator, { props: { names: ["Marina Soler"], label: () => "Marina escribe…", dots: true } })
    expect(wrapper.text()).toContain("Marina escribe…")
    expect(wrapper.get("[data-dots=true]").exists()).toBe(true)
    wrapper.unmount()
  })
})

describe("suggested replies", () => {
  it("SUGGESTIONS asks for approval and never emits a send", async () => {
    const wrapper = mount(SuggestedReplies, {
      props: {
        label: "Sugerencias",
        items: [
          { id: "timeline", label: "Compartir timeline" },
          { id: "call", label: "Agendar llamada" },
        ],
      },
    })
    const chips = wrapper.findAll("button")
    expect(chips[1]?.attributes("data-stagger")).toBe("50")
    await chips[1]?.trigger("click")
    expect(emitted(wrapper, "approve")?.[0]).toEqual(["call"])
    expect(emitted(wrapper, "send")).toBeUndefined()
    expect(wrapper.find('button[aria-label="Enviar"]').exists()).toBe(false)
    wrapper.unmount()
  })
})

describe("thread composer", () => {
  it("COMPOSER-SEND sends the draft and keeps ask-ai from sending", async () => {
    const wrapper = mount(ThreadComposer, {
      props: { placeholder: "Mensaje a Taller Ámbar…", sendLabel: "Enviar", askLabel: "Preguntar a IA", attachLabel: "Adjuntar" },
    })
    await wrapper.get("textarea").setValue("Va el jueves")
    const ask = wrapper.findAll("button").find((button) => button.text().includes("Preguntar a IA"))
    await ask?.trigger("click")
    expect(emitted(wrapper, "ask")).toHaveLength(1)
    expect(emitted(wrapper, "send")).toBeUndefined()
    const send = wrapper.findAll("button").find((button) => (button.attributes("aria-label") ?? button.text()) === "Enviar")
    await send?.trigger("click")
    expect(emitted(wrapper, "send")?.[0]).toEqual(["Va el jueves"])
    wrapper.unmount()
  })

  it("COMPOSER-LOCKED blocks free text and only offers a template", async () => {
    const wrapper = mount(ThreadComposer, {
      props: { sendLabel: "Enviar", locked: { title: "La ventana de 24 h está cerrada.", action: "Usar plantilla" } },
    })
    expect(wrapper.get('[role="status"]').text()).toContain("La ventana de 24 h está cerrada.")
    const send = wrapper.findAll("button").find((button) => button.attributes("aria-label") === "Enviar")
    expect(send?.attributes("disabled")).toBeDefined()
    const template = wrapper.findAll("button").find((button) => button.text().includes("Usar plantilla"))
    await template?.trigger("click")
    expect(emitted(wrapper, "use-template")).toHaveLength(1)
    expect(emitted(wrapper, "send")).toBeUndefined()
    wrapper.unmount()
  })
})

describe("party panel", () => {
  it("PARTY-MASK masks a sensitive field until someone asks to show it", async () => {
    const wrapper = mount(PartyPanel, {
      props: {
        name: "Casa Lerma",
        meta: "Prospecto desde 2026 · León",
        deal: { title: "Crédito puente", status: "Abierto", amount: "$186,400 de $240,000", value: 40, label: "40 %" },
        facts: [{ id: "hito", label: "Próximo hito", value: "12 nov" }],
        members: [{ id: "m", name: "Marina Soler", role: "Cliente · Finanzas" }],
        files: [{ id: "f", name: "ine-demo.pdf", detail: "1.2 MB · Hoy" }],
        secrets: [{ id: "curp", label: "CURP", masked: "••••••••••••••••••", revealed: "DEMO000000HDFXXX00" }],
        revealLabel: "Mostrar",
      },
    })
    expect(wrapper.text()).toContain("••••••••••••••••••")
    expect(wrapper.text()).not.toContain("DEMO000000HDFXXX00")
    await wrapper.get("button").trigger("click")
    expect(wrapper.text()).toContain("DEMO000000HDFXXX00")
    expect(emitted(wrapper, "reveal")?.[0]).toEqual(["curp"])
    expect(JSON.stringify(emitted(wrapper, "reveal"))).not.toContain("DEMO000000HDFXXX00")
    wrapper.unmount()
  })
})

describe("inbox shell", () => {
  const party = {
    name: "Taller Ámbar",
    meta: "Cliente desde 2024 · León",
    facts: [] as { id: string; label: string; value: string }[],
    members: [] as { id: string; name: string; role: string }[],
    files: [] as { id: string; name: string; detail: string }[],
  }

  it("PHONE keeps one column and goes back to the list", async () => {
    const wrapper = shell({ layout: "phone", party })
    expect(wrapper.text()).not.toContain("¿Podemos hablar el jueves?")
    await wrapper.get('[role="option"]').trigger("click")
    expect(wrapper.text()).toContain("¿Podemos hablar el jueves?")
    const back = wrapper.findAll("button").find((button) => button.text() === "Volver")
    await back?.trigger("click")
    expect(wrapper.text()).not.toContain("¿Podemos hablar el jueves?")
    wrapper.unmount()
  })

  it("DRAWER hides the rail on a tablet and closes the context with escape", async () => {
    const tablet = shell({ layout: "tablet", party })
    expect(tablet.find('nav[aria-label="Espacios"]').exists()).toBe(false)
    expect(tablet.text()).not.toContain("Cliente desde 2024 · León")
    tablet.unmount()

    const desk = shell({ layout: "desk", party })
    expect(desk.get('nav[aria-label="Espacios"]').exists()).toBe(true)
    expect(desk.text()).not.toContain("Cliente desde 2024 · León")
    const context = desk.findAll("button").find((button) => button.text() === "Contexto")
    await context?.trigger("click")
    expect(desk.text()).toContain("Cliente desde 2024 · León")
    window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }))
    expect(desk.text()).not.toContain("Cliente desde 2024 · León")
    desk.unmount()
  })

  it("SEARCH focuses the field with the command shortcut", async () => {
    const wrapper = shell()
    window.dispatchEvent(new KeyboardEvent("keydown", { key: "k", metaKey: true }))
    expect(document.activeElement).toBe(wrapper.get('[data-slot=conversation-search]').element)
    wrapper.unmount()
  })

  it("STATES covers loading, empty, error, and offline", async () => {
    const loading = shell({ status: "loading" })
    expect(loading.get("[data-slot=inbox-crm]").attributes("aria-busy")).toBe("true")
    loading.unmount()

    const empty = shell({ status: "empty", conversations: [], emptyLabel: "No hay conversaciones" })
    expect(empty.text()).toContain("No hay conversaciones")
    empty.unmount()

    const error = shell({ status: "error", error: "No se pudo abrir la bandeja.", retryLabel: "Reintentar" })
    expect(error.get('[role="alert"]').text()).toContain("No se pudo abrir la bandeja.")
    const retry = error.findAll("button").find((button) => button.text() === "Reintentar")
    await retry?.trigger("click")
    expect(emitted(error, "retry")).toHaveLength(1)
    error.unmount()

    const offline = shell({ status: "offline", offlineLabel: "Sin conexión" })
    expect(offline.get('[role="status"]').text()).toContain("Sin conexión")
    const send = offline.findAll("button").find((button) => button.attributes("aria-label") === "Enviar")
    expect(send?.attributes("disabled")).toBeDefined()
    offline.unmount()
  })

  it("SUGGESTION-DRAFT puts a suggestion into the draft and does not send it", async () => {
    const wrapper = shell()
    const chip = wrapper.findAll("button").find((button) => button.text().includes("Agendar llamada"))
    await chip?.trigger("click")
    expect((wrapper.get("textarea").element as HTMLTextAreaElement).value).toBe("Agendar llamada")
    expect(emitted(wrapper, "send")).toBeUndefined()
    expect(emitted(wrapper, "suggestion")?.[0]).toEqual(["call"])
    wrapper.unmount()
  })

  it("LOG threads a log with typing, a failed send, and a closed window", () => {
    const wrapper = mount(ChatThread, {
      props: {
        label: "Hilo",
        title: "Casa Lerma",
        status: "Ventana cerrada",
        messages: [
          { id: "v", side: "incoming", author: "Casa Lerma", time: "09:12", note: { title: "Nota de voz · 0:18", detail: "Audio", body: "Quedamos el jueves por la tarde." } },
          { id: "bad", side: "outgoing", author: "Tú", time: "09:14", body: "Te la mando.", delivery: "failed" },
        ],
        typing: { names: ["Casa Lerma"], label: "Casa Lerma escribe…" },
        retryLabel: "Reintentar",
      },
    })
    const log = wrapper.get('[role="log"]')
    expect(log.attributes("aria-live")).toBe("polite")
    expect(wrapper.text()).toContain("Quedamos el jueves por la tarde.")
    expect(wrapper.text()).toContain("Casa Lerma escribe…")
    expect(wrapper.findAll("button").some((button) => button.text() === "Reintentar" || button.attributes("aria-label") === "Reintentar")).toBe(true)
    wrapper.unmount()
  })
})

describe("page chrome", () => {
  it("CHROME renders the rail, the header, and a touch-sized filter", async () => {
    const wrapper = mount({
      components: { AppRail, InboxPageHeader, SegmentedFilter },
      template: `
        <div>
          <AppRail label="Espacios" mark="Á" :items="[{ id: 'chat', label: 'Mensajes', active: true }]" />
          <InboxPageHeader :crumbs="[{ label: 'Espacio', href: '#espacio' }, { label: 'Mensajes' }]" title="Mensajes" subtitle="2 sin leer" :actions="[{ id: 'new', label: 'Nuevo chat' }]" bell-label="Avisos" :bell-count="3" />
          <SegmentedFilter label="Filtro" :options="[{ value: 'all', label: 'Todos' }, { value: 'unread', label: 'Sin leer' }]" value="all" />
        </div>
      `,
    })
    expect(wrapper.get('nav[aria-label="Espacios"]').exists()).toBe(true)
    expect(wrapper.get("h1").text()).toBe("Mensajes")
    expect(wrapper.text()).toContain("Avisos")
    await wrapper.get('[data-value="unread"]').trigger("click")
    expect(wrapper.getComponent(SegmentedFilter).emitted("update:value")?.[0]).toEqual(["unread"])
    wrapper.unmount()
  })
})
