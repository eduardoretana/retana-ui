/**
 * Bandeja de conversaciones.
 * Fuente: concepto visual de Divan Raj (@desdivj),
 * https://x.com/desdivj/status/2119738295039250507
 * Licencia: sin licencia, clean-room. No se copiaron assets, logos,
 * ilustraciones ni textos.
 */
import { mount } from "@vue/test-utils"
import { describe, expect, it, vi } from "vitest"

import PartyPanel from "../src/party-panel/PartyPanel.vue"

describe("NSS reveal", () => {
  it("NSS stays masked until reveal emits only the id", async () => {
    const wrapper = mount(PartyPanel, {
      props: {
        name: "Casa Lerma",
        revealLabel: "Mostrar",
        secrets: [
          { id: "curp", label: "CURP", masked: "••••••••••••••••••", revealed: "DEMO000000HDFXXX00" },
          { id: "nss", label: "NSS", masked: "•••••••••••", revealed: "00000000000" },
        ],
      },
    })
    const rows = wrapper.findAll("[data-revealed]")
    expect(rows[1]!.text()).toBe("•••••••••••")
    expect(rows[0]!.text()).toBe("••••••••••••••••••")
    const buttons = wrapper.findAll("button").filter((button) => button.text() === "Mostrar")
    await buttons[1]!.trigger("click")
    expect(rows[1]!.text()).toBe("00000000000")
    expect(rows[0]!.text()).toBe("••••••••••••••••••")
    expect(wrapper.emitted("reveal")).toEqual([["nss"]])
    wrapper.unmount()
  })
})
