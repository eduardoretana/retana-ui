<!--
Bandeja de conversaciones.
Fuente: concepto visual de Divan Raj (@desdivj),
https://x.com/desdivj/status/2119738295039250507
Licencia: sin licencia, clean-room. No se copiaron assets, logos,
ilustraciones ni textos.
Con names es presentacional y no exige un proveedor de presencia.
-->
<script setup lang="ts">
import { computed } from "vue"

const props = defineProps<{
  names?: readonly string[]
  label?: string | ((names: string[]) => string)
  dots?: boolean
  avatar?: string
}>()

function fallback(names: readonly string[]) {
  if (names.length === 0) return ""
  if (names.length === 1) return `${names[0]} está escribiendo…`
  if (names.length === 2) return `${names[0]} y ${names[1]} están escribiendo…`
  return `${names[0]} y ${names.length - 1} más están escribiendo…`
}

const text = computed(() => {
  const names = props.names ?? []
  if (typeof props.label === "function") return props.label([...names])
  if (typeof props.label === "string") return props.label
  return fallback(names)
})
</script>

<template>
  <p
    v-if="text || dots"
    class="retana muted rt:flex rt:min-h-11 rt:items-center"
    data-slot="typing-indicator"
    :data-dots="dots ? 'true' : undefined"
    style="display: flex; min-height: 44px; align-items: center; gap: 0.5rem; margin: 0"
    aria-live="polite"
  >
    <slot name="avatar">
      <span v-if="avatar" :class="avatar" aria-hidden="true" />
    </slot>
    <span v-if="dots" aria-hidden="true" style="display: inline-flex; gap: 0.125rem">
      <i class="dot" />
      <i class="dot" />
      <i class="dot" />
    </span>
    <span>{{ text }}</span>
  </p>
</template>

<style src="../styles/inbox.css"></style>
