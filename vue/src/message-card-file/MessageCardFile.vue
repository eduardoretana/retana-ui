<!--
Bandeja de conversaciones.
Fuente: concepto visual de Divan Raj (@desdivj),
https://x.com/desdivj/status/2119738295039250507
Licencia: sin licencia, clean-room. No se copiaron assets, logos,
ilustraciones ni textos.
Un documento con estado de validación es este mismo archivo: el estado llega por prop.
-->
<script setup lang="ts">
withDefaults(defineProps<{
  name?: string
  detail?: string
  status?: string
  downloadLabel?: string
  state?: "ready" | "loading" | "empty" | "error"
  emptyLabel?: string
  loadingLabel?: string
  error?: string
  retryLabel?: string
}>(), {
  downloadLabel: "Descargar",
  state: "ready",
  emptyLabel: "Sin archivo",
  loadingLabel: "Cargando archivo",
  retryLabel: "Reintentar",
})

const emit = defineEmits<{
  download: []
  retry: []
}>()
</script>

<template>
  <div v-if="state === 'loading'" class="retana skel" role="status" :aria-label="loadingLabel" style="height: 4rem" />
  <div v-else-if="state === 'error'" class="retana card" role="alert" style="display: flex; align-items: center; justify-content: space-between; gap: 0.5rem">
    <p class="danger" style="margin: 0">{{ error }}</p>
    <button type="button" class="ghost" @click="emit('retry')">{{ retryLabel }}</button>
  </div>
  <p v-else-if="state === 'empty' || !name" class="retana muted card" role="status" style="border-style: dashed">{{ emptyLabel }}</p>
  <div v-else class="retana card rt:flex rt:items-center rt:border rt:border-border rt:bg-card" data-slot="message-card-file" style="display: flex; align-items: center; gap: 0.75rem">
    <span class="hit" style="background: var(--muted); color: var(--foreground)" aria-hidden="true">
      <slot name="icon">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M7 3 H14 L19 8 V21 H7 Z" />
          <path d="M14 3 V8 H19" />
        </svg>
      </slot>
    </span>
    <span class="grow">
      <span class="ellipsis" style="display: block; font-weight: 500">{{ name }}</span>
      <span v-if="detail" class="ellipsis muted" style="display: block; font-size: 0.75rem">{{ detail }}</span>
      <span v-if="status" class="chip" style="min-height: 0; margin-top: 0.25rem; background: var(--muted); color: var(--primary)">{{ status }}</span>
    </span>
    <button type="button" class="hit" :aria-label="downloadLabel" @click="emit('download')">
      <slot name="download-icon">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
          <path d="M12 4 V16" />
          <path d="M7 12 L12 17 L17 12" />
          <path d="M5 20 H19" />
        </svg>
      </slot>
    </button>
  </div>
</template>

<style src="../styles/inbox.css"></style>
