/**
 * Bandeja de conversaciones.
 * Fuente: concepto visual de Divan Raj (@desdivj),
 * https://x.com/desdivj/status/2119738295039250507
 * Licencia: sin licencia, clean-room. No se copiaron assets, logos,
 * ilustraciones ni textos.
 */
import { mount } from "@vue/test-utils"
import { describe, expect, it } from "vitest"

import ChatThread from "../src/chat-thread/ChatThread.vue"

describe("outgoing card receipt", () => {
  it("CARD-READ aligns an appointment without body as an outgoing read receipt", () => {
    const wrapper = mount(ChatThread, {
      props: {
        label: "Hilo",
        title: "Casa Lerma",
        messages: [
          {
            id: "cita",
            side: "outgoing",
            author: "Tú",
            time: "10:46",
            delivery: "read",
            deliveryLabel: "Leído",
            note: {
              title: "Cita agendada",
              detail: "Jueves 12 nov · 14:30 · 30 min",
              body: "Revisión de expediente.",
            },
          },
        ],
      },
    })
    const bubble = wrapper.get("[data-slot=message-bubble]")
    expect(bubble.attributes("data-side")).toBe("outgoing")
    expect(bubble.attributes("data-delivery")).toBe("read")
    expect(bubble.text()).toContain("Cita agendada")
    expect(bubble.text()).toContain("Revisión de expediente.")
    expect(bubble.text()).toContain("Leído")
    wrapper.unmount()
  })
})
