import { describe, expect, it } from "vitest"
import { nextTick } from "vue"

// ui-ux-pro-max (stacks/vue.csv): bind ARIA values, never write them static.
// A static aria-describedby="undefined" renders the literal string as an ID
// reference, so the dialog points at an element that does not exist.
async function load(relative: string) {
  return import(/* @vite-ignore */ new URL(relative, import.meta.url).href)
}

describe("lightbox Vue: ARIA del diálogo", () => {
  it("abre sin un aria-describedby que apunte a un id inexistente", async () => {
    const scene = await load("../src/lib/scene.ts")
    const { default: Lightbox } = await load("../src/lightbox/Lightbox.vue")
    const { mount } = await import("@vue/test-utils")
    const wrapper = mount(Lightbox, { props: { ...scene.lightboxModel("filled", "es"), defaultOpen: true }, attachTo: document.body })
    await nextTick()
    const dialog = document.body.querySelector("[role='dialog']")
    expect(dialog).not.toBeNull()
    const ref = dialog?.getAttribute("aria-describedby")
    if (ref !== null && ref !== undefined) {
      for (const id of ref.split(/\s+/)) expect(document.getElementById(id), `aria-describedby → #${id}`).not.toBeNull()
    }
    wrapper.unmount()
  })
})
