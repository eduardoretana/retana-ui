<!--
Bandeja de conversaciones.
Fuente: concepto visual de Divan Raj (@desdivj),
https://x.com/desdivj/status/2119738295039250507
Licencia: sin licencia, clean-room. No se copiaron assets, logos,
ilustraciones ni textos.
Cada chip pide aprobación. Esta pieza no envía el mensaje.
-->
<script setup lang="ts">
import type { SuggestionItem } from "../lib/thread"

withDefaults(defineProps<{
  label?: string
  items?: readonly SuggestionItem[]
  status?: "ready" | "loading" | "empty" | "error"
  emptyLabel?: string
  loadingLabel?: string
  error?: string
}>(), {
  label: "Sugerencias",
  items: () => [],
  status: "ready",
  emptyLabel: "Sin sugerencias",
  loadingLabel: "Cargando sugerencias",
})

const emit = defineEmits<{
  approve: [id: string]
}>()
</script>

<template>
  <div v-if="status === 'loading'" class="retana skel" role="status" :aria-label="loadingLabel" style="height: 44px; width: 10rem; border-radius: 999px" />
  <p v-else-if="status === 'error'" class="retana danger" role="alert">{{ error }}</p>
  <p v-else-if="status === 'empty' || items.length === 0" class="retana muted" role="status">{{ emptyLabel }}</p>
  <div v-else class="retana" role="list" :aria-label="label" data-slot="suggested-replies" style="display: flex; flex-wrap: wrap; gap: 0.5rem">
    <div v-for="(item, index) in items" :key="item.id" role="listitem">
      <button
        type="button"
        class="chip"
        :class="index ? 'rise' : undefined"
        :data-stagger="String(index * 50)"
        :style="index ? { animationDelay: `${index * 50}ms` } : undefined"
        @click="emit('approve', item.id)"
      >
        <slot name="icon">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true" style="color: var(--primary)">
            <path d="M12 3 L14 9 L20 12 L14 15 L12 21 L10 15 L4 12 L10 9 Z" />
          </svg>
        </slot>
        {{ item.label }}
      </button>
    </div>
  </div>
</template>

<style src="../styles/inbox.css"></style>
