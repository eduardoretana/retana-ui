<!--
Bandeja de conversaciones.
Fuente: concepto visual de Divan Raj (@desdivj),
https://x.com/desdivj/status/2119738295039250507
Licencia: sin licencia, clean-room. No se copiaron assets, logos,
ilustraciones ni textos.
La tinta propia usa foreground. El acento único es primary. Las palomitas no son de un canal.
-->
<script setup lang="ts">
import { Comment, Fragment, Text, computed, useSlots, type VNode } from "vue"

import { deskInitials, motionReduced, type DeliveryState } from "../lib/thread"

const props = withDefaults(defineProps<{
  side: "incoming" | "outgoing"
  author: string
  time?: string
  delivery?: DeliveryState
  deliveryLabel?: string
  grouped?: "single" | "start" | "middle" | "end"
  enter?: boolean
  retryLabel?: string
}>(), {
  grouped: "single",
  enter: false,
  retryLabel: "Reintentar",
})

const emit = defineEmits<{
  retry: []
}>()

const slots = useSlots()

function nodeHasText(node: VNode): boolean {
  if (node.type === Comment) return false
  if (node.type === Text || typeof node.children === "string") return String(node.children ?? "").trim().length > 0
  if (Array.isArray(node.children)) return node.children.some((child) => (typeof child === "string" ? child.trim().length > 0 : nodeHasText(child as VNode)))
  if (node.type === Fragment && Array.isArray(node.children)) return (node.children as VNode[]).some(nodeHasText)
  return false
}

function hasBody() {
  return (slots.default?.() ?? []).some(nodeHasText)
}

const mine = computed(() => props.side === "outgoing")
const showMeta = computed(() => props.grouped === "single" || props.grouped === "start")
const showAvatar = computed(() => !mine.value && (props.grouped === "single" || props.grouped === "end"))
const motion = computed(() => (props.enter && !motionReduced() ? "rise" : "off"))
</script>

<template>
  <article
    class="retana rt:flex rt:w-full"
    data-slot="message-bubble"
    :data-side="side"
    :data-delivery="delivery"
    :data-grouped="grouped"
    :style="{ display: 'flex', width: '100%', gap: '0.5rem', justifyContent: mine ? 'flex-end' : 'flex-start' }"
  >
    <template v-if="!mine">
      <span v-if="showAvatar" class="avatar-sm" aria-hidden="true">{{ deskInitials(author) }}</span>
      <span v-else class="avatar-sm" aria-hidden="true" />
    </template>
    <div :data-motion="motion" :class="motion === 'rise' ? 'rise' : undefined" :style="{ display: 'flex', maxWidth: 'min(100%, 28rem)', flexDirection: 'column', gap: '0.25rem', alignItems: mine ? 'flex-end' : 'flex-start' }">
      <p v-if="showMeta" class="muted" :style="{ margin: 0, fontSize: '12px', lineHeight: '16px', textAlign: mine ? 'end' : 'start' }">
        <template v-if="mine">
          <time v-if="time">{{ time }}</time>
          <template v-if="time"> · </template>
          {{ author }}
        </template>
        <template v-else>
          <span style="font-weight: 500; color: var(--foreground)">{{ author }}</span>
          <time v-if="time" style="margin-inline-start: 0.5rem">{{ time }}</time>
        </template>
      </p>
      <div v-if="hasBody()" class="bubble" :data-side="side">
        <slot />
      </div>
      <slot name="attachment" />
      <p v-if="delivery && delivery !== 'sending'" :class="delivery === 'failed' ? 'danger' : 'muted'" style="display: flex; align-items: center; gap: 0.25rem; margin: 0; font-size: 0.6875rem">
        <svg v-if="delivery === 'sent'" viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
          <polyline points="5,12 10,17 19,7" />
        </svg>
        <svg v-else-if="delivery === 'delivered' || delivery === 'read'" viewBox="0 0 24 24" width="14" height="12" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true" :style="delivery === 'read' ? { color: 'var(--primary)' } : undefined">
          <polyline points="2,12 7,17 16,7" />
          <polyline points="8,12 13,17 22,7" />
        </svg>
        <svg v-else viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
          <circle cx="12" cy="12" r="8" />
          <path d="M12 8 V13" />
        </svg>
        {{ deliveryLabel }}
      </p>
      <button v-if="delivery === 'failed'" type="button" class="ghost" style="border: 0; color: var(--primary)" @click="emit('retry')">
        {{ retryLabel }}
      </button>
    </div>
  </article>
</template>

<style src="../styles/inbox.css"></style>
