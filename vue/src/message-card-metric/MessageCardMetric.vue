<!--
Bandeja de conversaciones.
Fuente: concepto visual de Divan Raj (@desdivj),
https://x.com/desdivj/status/2119738295039250507
Licencia: sin licencia, clean-room. No se copiaron assets, logos,
ilustraciones ni textos.
Barra en píldoras. Solo el color de cada segmento.
-->
<script setup lang="ts">
import { computed } from "vue"

const props = withDefaults(defineProps<{
  title?: string
  chip?: string
  value?: string
  caption?: string
  filled?: number
  total?: number
  start?: string
  end?: string
  state?: "ready" | "loading" | "empty" | "error"
  emptyLabel?: string
  loadingLabel?: string
  error?: string
}>(), {
  filled: 0,
  total: 0,
  state: "ready",
  emptyLabel: "Sin métrica",
  loadingLabel: "Cargando métrica",
})

const safeFilled = computed(() => Math.max(0, Math.min(props.filled, props.total)))
</script>

<template>
  <div v-if="state === 'loading'" class="retana skel" role="status" :aria-label="loadingLabel" style="height: 6rem" />
  <p v-else-if="state === 'error'" class="retana card danger" role="alert">{{ error }}</p>
  <p v-else-if="state === 'empty' || total <= 0" class="retana muted card" role="status" style="border-style: dashed">{{ emptyLabel }}</p>
  <div v-else class="retana card rt:border rt:border-border rt:bg-card" data-slot="message-card-metric" style="display: grid; gap: 0.75rem">
    <div style="display: flex; align-items: center; justify-content: space-between; gap: 0.5rem">
      <p v-if="title" style="margin: 0; font-weight: 500">{{ title }}</p>
      <span v-else />
      <span v-if="chip" class="tag">{{ chip }}</span>
    </div>
    <p style="margin: 0; font-size: 1.5rem; font-weight: 600">
      {{ value }}
      <span v-if="caption" class="muted" style="font-size: 0.875rem; font-weight: 400">{{ caption }}</span>
    </p>
    <div class="meter" aria-hidden="true">
      <i
        v-for="index in total"
        :key="index"
        data-slot="metric-segment"
        :data-filled="index - 1 < safeFilled ? 'true' : 'false'"
      />
    </div>
    <div class="muted" style="display: flex; justify-content: space-between; gap: 0.75rem; font-size: 0.75rem">
      <span>{{ start }}</span>
      <span v-if="end">{{ end }}</span>
    </div>
  </div>
</template>

<style src="../styles/inbox.css"></style>
