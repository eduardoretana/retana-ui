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
import { bandejaProps } from "../src/lib/bandeja-scene"

describe("cenit fixture parity", () => {
  it("FIXTURES matches the React rail, mark, template chip, and file actions", () => {
    const props = bandejaProps("cenit", "es")
    expect(props.railMark).toBe("Á")
    expect(props.railItems.map((item) => item.label)).toEqual([
      "Inicio",
      "Archivos",
      "Reportes",
      "Mensajes",
      "Pagos",
      "Contactos",
    ])
    expect(props.suggestions.map((item) => item.label)).toContain("Usar plantilla")

    const thread = mount(ChatThread, {
      props: {
        label: "Hilo",
        messages: [
          {
            id: "ine",
            side: "incoming",
            author: "Casa Lerma",
            time: "10:48",
            file: { name: "ine-demo.pdf", detail: "1.2 MB · Documento", status: "En revisión" },
          },
        ],
      },
    })
    expect(thread.text()).toContain("ine-demo.pdf")
    expect(thread.text()).toContain("En revisión")
    expect(thread.find("button[aria-label=Descargar]").exists()).toBe(false)
    thread.unmount()
  })
})
