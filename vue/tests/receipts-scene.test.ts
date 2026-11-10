/**
 * Bandeja de conversaciones.
 * Fuente: concepto visual de Divan Raj (@desdivj),
 * https://x.com/desdivj/status/2119738295039250507
 * Licencia: sin licencia, clean-room. No se copiaron assets, logos,
 * ilustraciones ni textos.
 */
import { mount } from "@vue/test-utils"
import { describe, expect, it } from "vitest"

import InboxCrm from "../src/inbox-crm/InboxCrm.vue"
import { bandejaProps } from "../src/lib/bandeja-scene"

describe("receipts scene", () => {
  it("RECEIPTS shows sent, delivered, and read together", () => {
    const wrapper = mount(InboxCrm, {
      attachTo: document.body,
      props: bandejaProps("receipts", "es"),
    })
    expect(wrapper.get("[data-delivery=sent]").text()).toContain("Enviado")
    expect(wrapper.get("[data-delivery=delivered]").text()).toContain("Entregado")
    expect(wrapper.get("[data-delivery=read]").text()).toContain("Leído")
    expect(wrapper.get("[data-delivery=sent]").text()).toContain("Te mando el corte.")
    expect(wrapper.get("[data-delivery=delivered]").text()).toContain("¿Lo ves?")
    expect(wrapper.get("[data-delivery=read]").text()).toContain("Quedó leído.")
    wrapper.unmount()
  })
})
