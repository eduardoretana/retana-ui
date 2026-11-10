<!--
Bandeja de conversaciones.
Fuente: concepto visual de Divan Raj (@desdivj),
https://x.com/desdivj/status/2119738295039250507
Licencia: sin licencia, clean-room. No se copiaron assets, logos,
ilustraciones ni textos.
El texto no se parte a media palabra: la pista se desplaza y se desvanece.
-->
<script setup lang="ts">
import { onMounted, onUnmounted, ref } from "vue"

type Option = { value: string; label: string }

const props = withDefaults(defineProps<{
  label?: string
  options?: readonly Option[]
  value?: string
  status?: "ready" | "loading" | "empty" | "error"
  emptyLabel?: string
  loadingLabel?: string
  error?: string
}>(), {
  options: () => [],
  status: "ready",
  emptyLabel: "Sin filtros",
  loadingLabel: "Cargando filtros",
})

const emit = defineEmits<{
  "update:value": [value: string]
}>()

const track = ref<HTMLElement | null>(null)
let observer: ResizeObserver | null = null

function edges() {
  const node = track.value
  if (!node) return
  const rest = node.scrollWidth - node.clientWidth - node.scrollLeft
  node.toggleAttribute("data-fade-start", node.scrollLeft > 1)
  node.toggleAttribute("data-fade-end", rest > 1)
}

onMounted(() => {
  edges()
  track.value?.addEventListener("scroll", edges, { passive: true })
  observer = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(edges)
  if (track.value) observer?.observe(track.value)
})

onUnmounted(() => {
  track.value?.removeEventListener("scroll", edges)
  observer?.disconnect()
})
</script>

<template>
  <div v-if="status === 'loading'" class="retana skel" role="status" :aria-label="loadingLabel" style="height: 44px" />
  <p v-else-if="status === 'error'" class="retana danger" role="alert">{{ error }}</p>
  <p v-else-if="status === 'empty' || options.length === 0" class="retana muted" role="status">{{ emptyLabel }}</p>
  <div v-else class="retana" role="group" :aria-label="label" data-slot="segmented-filter">
    <div
      ref="track"
      class="inbox-track rt:flex rt:overflow-x-auto"
      data-slot="segmented-filter-track"
      style="overflow-x: auto"
    >
      <button
        v-for="option in options"
        :key="option.value"
        type="button"
        class="inbox-option rt:whitespace-nowrap rt:min-h-11"
        :data-value="option.value"
        :aria-pressed="option.value === value"
        style="white-space: nowrap; min-height: 44px"
        @click="emit('update:value', option.value)"
      >
        {{ option.label }}
      </button>
    </div>
  </div>
</template>

<style src="../styles/inbox.css"></style>
