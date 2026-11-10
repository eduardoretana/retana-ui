/**
 * Bandeja de conversaciones.
 * Fuente: concepto visual de Divan Raj (@desdivj),
 * https://x.com/desdivj/status/2119738295039250507
 * Licencia: sin licencia, clean-room. No se copiaron assets, logos,
 * ilustraciones ni textos.
 */
import { mount } from "@vue/test-utils"
import { describe, expect, it } from "vitest"

import ConversationItem from "../src/conversation-item/ConversationItem.vue"
import InboxCrm from "../src/inbox-crm/InboxCrm.vue"
import MessageCardInvoice from "../src/message-card-invoice/MessageCardInvoice.vue"
import PartyPanel from "../src/party-panel/PartyPanel.vue"
import SuggestedReplies from "../src/suggested-replies/SuggestedReplies.vue"
import { bandejaThemes } from "../src/vuetify/theme"

function usesPrimary(element: Element) {
  const value = element.getAttribute("style") ?? ""
  expect(value, element.textContent ?? element.tagName).toContain("var(--primary")
  expect(value).not.toContain("var(--foreground")
}

describe("accent", () => {
  it("ACCENT paints unread, window, due, progress, suggestions and reveal with primary", () => {
    const item = mount(ConversationItem, {
      props: {
        item: {
          id: "lerma",
          title: "Casa Lerma",
          unread: 2,
          windowLabel: "Cerrada",
          channel: "WhatsApp",
        },
      },
    })
    usesPrimary(item.get(".pill").element)
    const closed = item.findAll("span").find((node) => node.text() === "Cerrada")
    usesPrimary(closed!.element)
    item.unmount()

    const invoice = mount(MessageCardInvoice, { props: { title: "Cotización", amount: "$186,400", due: "Vence 14 nov" } })
    usesPrimary(invoice.get(".pill").element)
    invoice.unmount()

    const party = mount(PartyPanel, {
      props: {
        name: "Casa Lerma",
        revealLabel: "Mostrar",
        deal: { title: "Crédito puente", status: "Abierto", amount: "$186,400 de $240,000", value: 40, label: "40 %" },
        secrets: [{ id: "curp", label: "CURP", masked: "••••", revealed: "DEMO" }],
      },
    })
    usesPrimary(party.get("[role=progressbar] div").element)
    usesPrimary(party.get("button").element)
    party.unmount()

    const chips = mount(SuggestedReplies, { props: { items: [{ id: "call", label: "Agendar llamada" }] } })
    usesPrimary(chips.get("svg").element)
    chips.unmount()
  })

  it("PRIMARY resolves to the React ae-ember accent in light and dark", () => {
    expect(bandejaThemes.light.colors.primary.toLowerCase()).toBe("#c33e00")
    expect(bandejaThemes.light.colors["on-primary"].toLowerCase()).toBe("#fcfcfc")
    expect(bandejaThemes.dark.colors.primary.toLowerCase()).toBe("#fd8537")
    expect(bandejaThemes.dark.colors["on-primary"].toLowerCase()).toBe("#21110a")
    expect(bandejaThemes.light.colors.primary.toLowerCase()).not.toBe("#171717")
  })
})

describe("closed window", () => {
  it("LOCKED hides suggestion chips and only offers the template", () => {
    const wrapper = mount(InboxCrm, {
      attachTo: document.body,
      props: {
        layout: "wide",
        title: "Mensajes",
        conversations: [{ id: "lerma", title: "Casa Lerma", section: "all" }],
        selectedId: "lerma",
        messages: [{ id: "m", side: "incoming", author: "Casa Lerma", body: "Hola" }],
        suggestions: [{ id: "call", label: "Agendar llamada" }],
        locked: { title: "La ventana de 24 h está cerrada.", action: "Usar plantilla" },
        party: { name: "Casa Lerma", facts: [], members: [], files: [] },
      },
    })
    expect(wrapper.text()).not.toContain("Agendar llamada")
    expect(wrapper.text()).toContain("Usar plantilla")
    expect(wrapper.emitted("suggestion")).toBeUndefined()
    expect(wrapper.emitted("send")).toBeUndefined()
    wrapper.unmount()
  })
})

describe("party actions", () => {
  it("PARTY-ACTIONS are rounded squares that share one row", () => {
    const wrapper = mount(PartyPanel, {
      attachTo: document.body,
      props: {
        name: "Casa Lerma",
        actions: [
          { id: "expediente", label: "Expediente" },
          { id: "llamadas", label: "Llamadas" },
          { id: "docs", label: "Documentos" },
        ],
      },
    })
    const buttons = wrapper.findAll("button")
    expect(buttons).toHaveLength(3)
    const style = buttons[2]!.attributes("style") ?? ""
    expect(style).toContain("var(--radius")
    expect(style).not.toContain("999px")
    const grid = buttons[0]!.element.parentElement!
    expect(grid.getAttribute("style") ?? "").toContain("minmax(0, 1fr)")
    wrapper.unmount()
  })
})
