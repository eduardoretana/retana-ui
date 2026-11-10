<!--
Bandeja de conversaciones.
Fuente: concepto visual de Divan Raj (@desdivj),
https://x.com/desdivj/status/2119738295039250507
Licencia: sin licencia, clean-room. No se copiaron assets, logos,
ilustraciones ni textos.
Una cotización es este mismo componente: el título y el monto llegan por props.
-->
<script setup lang="ts">
withDefaults(defineProps<{
  title?: string
  amount?: string
  due?: string
  state?: "ready" | "loading" | "empty" | "error"
  emptyLabel?: string
  loadingLabel?: string
  error?: string
}>(), {
  state: "ready",
  emptyLabel: "Sin monto",
  loadingLabel: "Cargando monto",
})
</script>

<template>
  <div v-if="state === 'loading'" class="retana skel" role="status" :aria-label="loadingLabel" style="height: 5rem" />
  <p v-else-if="state === 'error'" class="retana card danger" role="alert">{{ error }}</p>
  <p v-else-if="state === 'empty' || !amount" class="retana muted card" role="status" style="border-style: dashed">{{ emptyLabel }}</p>
  <div v-else class="retana card rt:border rt:border-border rt:bg-card" data-slot="message-card-invoice" style="display: grid; gap: 0.5rem">
    <p v-if="title" class="muted" style="margin: 0; font-size: 0.75rem">{{ title }}</p>
    <div style="display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 0.5rem">
      <p style="margin: 0; font-size: 1.5rem; font-weight: 600">{{ amount }}</p>
      <span v-if="due" class="pill" style="height: auto; padding: 0.25rem 0.625rem; background: var(--primary); color: var(--primary-foreground)">{{ due }}</span>
    </div>
  </div>
</template>

<style src="../styles/inbox.css"></style>
