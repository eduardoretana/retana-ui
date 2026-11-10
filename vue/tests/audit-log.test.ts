/**
 * Bandeja de conversaciones.
 * Fuente: concepto visual de Divan Raj (@desdivj),
 * https://x.com/desdivj/status/2119738295039250507
 * Licencia: sin licencia, clean-room. No se copiaron assets, logos,
 * ilustraciones ni textos.
 */
import { mount } from "@vue/test-utils"
import { beforeEach, describe, expect, it, vi } from "vitest"

import App from "../demo/bandeja/App.vue"

describe("demo audit", () => {
  beforeEach(() => {
    window.history.replaceState({}, "", "/vue/demo/bandeja/index.html?scene=cenit")
  })

  it("AUDIT records an NSS reveal on screen and in the console", async () => {
    const info = vi.spyOn(console, "info").mockImplementation(() => {})
    const wrapper = mount(App, {
      attachTo: document.body,
      global: {
        stubs: {
          "v-app": { template: "<div><slot /></div>" },
          "v-main": { template: "<div><slot /></div>" },
        },
      },
    })
    const buttons = wrapper.findAll("button").filter((button) => button.text() === "Mostrar")
    await buttons[1]!.trigger("click")
    const log = wrapper.get("[data-slot=audit-log]")
    expect(log.text()).toContain("nss")
    expect(info).toHaveBeenCalledWith(expect.stringContaining("nss"))
    info.mockRestore()
    wrapper.unmount()
  })
})
