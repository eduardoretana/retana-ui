<!--
Bandeja de conversaciones.
Fuente: concepto visual de Divan Raj (@desdivj),
https://x.com/desdivj/status/2119738295039250507
Licencia: sin licencia, clean-room. No se copiaron assets, logos,
ilustraciones ni textos.
No reutiliza page-header: esa pieza es el encabezado de un proyecto.
-->
<script setup lang="ts">
type Crumb = { label: string; href?: string }
type Action = { id: string; label: string }

withDefaults(defineProps<{
  crumbs?: readonly Crumb[]
  title: string
  subtitle?: string
  actions?: readonly Action[]
  bellLabel?: string
  bellCount?: number
  status?: "ready" | "loading" | "empty" | "error"
  emptyLabel?: string
  loadingLabel?: string
  error?: string
}>(), {
  crumbs: () => [],
  actions: () => [],
  bellCount: 0,
  status: "ready",
  emptyLabel: "Sin encabezado",
  loadingLabel: "Cargando el encabezado",
})

const emit = defineEmits<{
  action: [id: string]
  bell: []
}>()
</script>

<template>
  <div v-if="status === 'loading'" class="skel" role="status" :aria-label="loadingLabel" style="height: 6rem" />
  <p v-else-if="status === 'error'" class="retana danger" role="alert">{{ error }}</p>
  <p v-else-if="status === 'empty'" class="retana muted" role="status">{{ emptyLabel }}</p>
  <header v-else class="retana rt:flex rt:flex-col rt:gap-4" data-slot="inbox-page-header" style="display: flex; flex-direction: column; gap: 1rem">
    <div style="display: flex; align-items: center; justify-content: space-between; gap: 0.75rem">
      <nav v-if="crumbs.length" class="crumbs" aria-label="Breadcrumb">
        <span v-for="(crumb, index) in crumbs" :key="`${crumb.label}-${index}`" style="display: inline-flex; align-items: center; gap: 0.375rem">
          <span v-if="index > 0" aria-hidden="true">/</span>
          <a v-if="crumb.href && index < crumbs.length - 1" :href="crumb.href">{{ crumb.label }}</a>
          <span v-else>{{ crumb.label }}</span>
        </span>
      </nav>
      <span v-else />
      <button v-if="bellLabel" type="button" class="hit" style="position: relative" :aria-label="bellCount > 0 ? `${bellLabel}, ${bellCount}` : bellLabel" @click="emit('bell')">
        <slot name="bell-icon">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <path d="M6 9a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6z" />
            <path d="M10 19a2 2 0 0 0 4 0" />
          </svg>
        </slot>
        <span class="sr">{{ bellLabel }}</span>
        <span v-if="bellCount > 0" class="pill" style="position: absolute; top: 2px; inset-inline-end: 2px">{{ bellCount }}</span>
      </button>
    </div>
    <div style="display: flex; flex-wrap: wrap; align-items: flex-end; justify-content: space-between; gap: 0.75rem">
      <div style="flex: 1 1 18rem; min-width: 0">
        <h1 class="title">{{ title }}</h1>
        <p v-if="subtitle" class="muted" style="margin: 0.25rem 0 0">{{ subtitle }}</p>
      </div>
      <div v-if="actions.length" style="display: flex; flex-wrap: wrap; gap: 0.5rem">
        <slot name="actions" :actions="actions">
          <button v-for="action in actions" :key="action.id" type="button" class="ghost" @click="emit('action', action.id)">
            {{ action.label }}
          </button>
        </slot>
      </div>
    </div>
  </header>
</template>

<style src="../styles/inbox.css"></style>
