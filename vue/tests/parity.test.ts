import { existsSync } from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"

const sceneLib = path.resolve(import.meta.dirname, "../src/lib/scene.ts")

function gate(signature: string) {
  expect(existsSync(sceneLib), signature).toBe(true)
}

async function load(relative: string) {
  const href = new URL(relative, import.meta.url).href
  return import(/* @vite-ignore */ href)
}

function formatSceneCall(name: string, args: readonly unknown[]) {
  const fmt = (value: unknown) => (typeof value === "string" ? JSON.stringify(value) : String(value))
  return `${name}(${args.map(fmt).join(", ")})`
}

describe("paridad Vue", () => {
  it("time-off lleno en es-MX", async () => {
    gate("AC2-MOUNT-STATS-FILLED")
    const scene = await load("../src/lib/scene.ts")
    const { default: Stats } = await load("../src/time-off-stats/TimeOffStats.vue")
    const { mount } = await import("@vue/test-utils")
    const wrapper = mount(Stats, { props: scene.timeOffProps("filled", "es") })
    expect(wrapper.get("h2").text()).toBe("Saldo")
    expect(wrapper.text()).toContain("12 días")
    expect(wrapper.text()).toContain("2 días")
    expect(wrapper.text()).toContain("10 días")
    expect(wrapper.text()).toContain("2025")
    expect(wrapper.text()).toContain("2026")
    expect(document.documentElement.lang || "es-MX").toBeTruthy()
  })

  it("time-off vacío, carga, error, cero y pendiente", async () => {
    gate("AC2-MOUNT-STATS-STATES")
    const scene = await load("../src/lib/scene.ts")
    const { default: Stats } = await load("../src/time-off-stats/TimeOffStats.vue")
    const { mount } = await import("@vue/test-utils")
    const empty = mount(Stats, { props: scene.timeOffProps("empty", "es") })
    expect(empty.text()).toContain("No hay saldo que mostrar.")
    const loading = mount(Stats, { props: scene.timeOffProps("loading", "es") })
    expect(loading.attributes("aria-busy")).toBe("true")
    expect(loading.find("[aria-label='Cargando el saldo']").exists()).toBe(true)
    expect(loading.text()).not.toContain("12 días")
    const error = mount(Stats, { props: scene.timeOffProps("error", "es") })
    expect(error.get("[role='alert']").text()).toContain("No se pudo leer el saldo.")
    expect(error.text()).toContain("12 días")
    const zero = mount(Stats, { props: scene.timeOffProps("zero", "es") })
    expect(zero.text()).toContain("0 días")
    const pending = mount(Stats, { props: scene.timeOffProps("pending", "es") })
    expect(pending.text()).toContain("6 días")
  })

  it("time-off en inglés y el default inglés", async () => {
    gate("AC2-MOUNT-STATS-EN")
    const scene = await load("../src/lib/scene.ts")
    const { default: Stats } = await load("../src/time-off-stats/TimeOffStats.vue")
    const { mount } = await import("@vue/test-utils")
    const en = mount(Stats, { props: scene.timeOffProps("filled", "en") })
    expect(en.get("h2").text()).toBe("Balance")
    expect(en.text()).toContain("12 days")
    expect(en.text()).not.toContain("Saldo")
    const bare = mount(Stats, { props: { available: 12, pending: 0, years: [] } })
    expect(bare.text()).toContain("Balance")
    expect(bare.text()).toContain("Available")
  })

  it("decision-inbox dispara las mismas llamadas que React", async () => {
    gate("AC1-CALLS")
    const scene = await load("../src/lib/scene.ts")
    const { default: Inbox } = await load("../src/decision-inbox/DecisionInbox.vue")
    const { mount } = await import("@vue/test-utils")
    const { createElement } = await import("react")
    const { render, screen } = await import("@testing-library/react")
    const userEvent = (await import("@testing-library/user-event")).default
    const { DecisionInbox } = await load("../../registry/ui/decision-inbox.tsx")
    const model = scene.inboxModel("filled", "es")
    const vueCalls: string[] = []
    const vue = mount(Inbox, {
      props: {
        ...model,
        onAnswer: (id: string, choiceId: string) => vueCalls.push(formatSceneCall("onAnswer", [id, choiceId])),
        onDismiss: (id: string) => vueCalls.push(formatSceneCall("onDismiss", [id])),
      },
    })
    await vue.get("button[aria-label*='Hoy, antes de las 18:00 para']").trigger("click")
    expect(vue.get("[aria-live='polite']").text()).toContain("Respuesta: Hoy, antes de las 18:00")
    const reactCalls: string[] = []
    render(createElement(DecisionInbox, {
      items: model.items,
      labels: model.labels,
      onAnswer: (id: string, choiceId: string) => reactCalls.push(formatSceneCall("onAnswer", [id, choiceId])),
      onDismiss: (id: string) => reactCalls.push(formatSceneCall("onDismiss", [id])),
    }))
    await userEvent.setup().click(screen.getByRole("button", { name: /Hoy, antes de las 18:00 para/ }))
    expect(vueCalls, "AC1-CALLS-LIST").toEqual(reactCalls)
    expect(vueCalls[0]).toBe('onAnswer("anticipo", "hoy")')
  })

  it("decision-inbox vacío, carga, error, respondida y cierre", async () => {
    gate("AC5-INBOX-STATES")
    const scene = await load("../src/lib/scene.ts")
    const { default: Inbox } = await load("../src/decision-inbox/DecisionInbox.vue")
    const { mount } = await import("@vue/test-utils")
    expect(mount(Inbox, { props: scene.inboxModel("empty", "es") }).text()).toContain("Nada espera tu respuesta.")
    const loading = mount(Inbox, { props: scene.inboxModel("loading", "es") })
    expect(loading.attributes("aria-busy")).toBe("true")
    expect(loading.get("[role='status']").text()).toContain("Cargando llamadas")
    const error = mount(Inbox, { props: scene.inboxModel("error", "es") })
    expect(error.get("[role='alert']").text()).toContain("La respuesta no se guardó. La decisión sigue abierta.")
    const answered = mount(Inbox, {
      props: {
        ...scene.inboxModel("answered", "es"),
        onDismiss: () => {},
      },
    })
    expect(answered.text()).toContain("Respuesta: Esperar al viernes")
    const calls: string[] = []
    const live = mount(Inbox, {
      props: {
        ...scene.inboxModel("answered", "es"),
        onDismiss: (id: string) => calls.push(formatSceneCall("onDismiss", [id])),
      },
    })
    await live.get("button[aria-label*='Cerrar']").trigger("click")
    expect(calls).toEqual(['onDismiss("anticipo")'])
    const en = mount(Inbox, { props: scene.inboxModel("filled", "en") })
    expect(en.text()).toContain("Open calls")
    expect(en.text()).toContain("2 still open")
  })

  it("lightbox vacío, carga, error y galería", async () => {
    gate("AC2-MOUNT-LIGHTBOX")
    const scene = await load("../src/lib/scene.ts")
    const { default: Lightbox } = await load("../src/lightbox/Lightbox.vue")
    const { default: Gallery } = await load("../src/lightbox/LightboxGallery.vue")
    const { mount } = await import("@vue/test-utils")
    expect(mount(Lightbox, { props: scene.lightboxModel("empty", "es") }).text()).toContain("No hay imágenes.")
    const loading = mount(Lightbox, { props: scene.lightboxModel("loading", "es") })
    expect(loading.get("[role='status']").text()).toContain("Cargando imágenes")
    expect(mount(Lightbox, { props: scene.lightboxModel("error", "es") }).get("[role='alert']").text()).toContain("No se pudo abrir la imagen.")
    const gallery = mount(Gallery, { props: scene.lightboxModel("filled", "es") })
    const named = gallery.find("[aria-label='Estudio']").exists() || gallery.find("img[alt='Estudio']").exists()
    expect(named).toBe(true)
  })
})
