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

describe("card without body", () => {
  it("EMPTY-BUBBLE does not paint an ink bubble above a textless card", () => {
    const wrapper = mount(ChatThread, {
      props: {
        label: "Hilo",
        messages: [
          {
            id: "cot",
            side: "incoming",
            author: "Casa Lerma",
            time: "10:42",
            invoice: { title: "Cotización", amount: "$186,400", due: "Vence 14 nov" },
          },
        ],
      },
    })
    const bubble = wrapper.get("[data-slot=message-bubble]")
    expect(bubble.attributes("data-side")).toBe("incoming")
    expect(bubble.find(".bubble").exists()).toBe(false)
    expect(bubble.text()).toContain("Cotización")
    expect(bubble.text()).toContain("$186,400")
    wrapper.unmount()
  })
})
