<!--
Bandeja de conversaciones.
Fuente: concepto visual de Divan Raj (@desdivj),
https://x.com/desdivj/status/2119738295039250507
Licencia: sin licencia, clean-room. No se copiaron assets, logos,
ilustraciones ni textos.
La presencia en línea usa --success. No usa el acento ni --primary.
-->
<script setup lang="ts">
import { deskInitials, presenceStyle, type ConversationItemData } from "../lib/thread"

const props = withDefaults(defineProps<{
  item: ConversationItemData
  selected?: boolean
  id?: string
  status?: "ready" | "loading" | "empty" | "error"
  emptyLabel?: string
  loadingLabel?: string
  error?: string
}>(), {
  selected: false,
  status: "ready",
  emptyLabel: "Sin conversación",
  loadingLabel: "Cargando la fila",
})

const emit = defineEmits<{
  select: [id: string]
}>()
</script>

<template>
  <div v-if="status === 'loading'" class="retana skel" role="status" :aria-label="loadingLabel" style="height: 3.5rem" />
  <p v-else-if="status === 'error'" class="retana danger" role="alert">{{ error }}</p>
  <p v-else-if="status === 'empty'" class="retana muted" role="status">{{ emptyLabel }}</p>
  <button
    v-else
    :id="id"
    type="button"
    class="retana row rt:flex rt:min-h-11 rt:w-full"
    role="option"
    :aria-selected="selected"
    data-slot="conversation-item"
    @click="emit('select', item.id)"
  >
    <span class="avatar">
      <span aria-hidden="true">{{ deskInitials(item.title) }}</span>
      <span
        v-if="item.presence"
        class="presence"
        :data-presence="item.presence"
        :data-token="item.presence === 'online' ? 'success' : undefined"
        :style="presenceStyle(item.presence)"
      />
    </span>
    <span class="grow">
      <span class="line">
        <span class="ellipsis" :style="{ fontWeight: item.unread ? 600 : 500, fontSize: '14px' }">{{ item.title }}</span>
        <time v-if="item.time" class="muted" style="margin-inline-start: auto; flex-shrink: 0; font-size: 0.75rem">{{ item.time }}</time>
      </span>
      <span v-if="item.kind === 'contact' && item.role" class="ellipsis muted" style="display: block; font-size: 0.75rem">{{ item.role }}</span>
      <span v-else-if="item.preview" class="ellipsis muted" style="display: block; font-size: 0.75rem">{{ item.preview }}</span>
      <span v-if="item.channel || item.stage || item.windowLabel" style="display: flex; flex-wrap: wrap; gap: 0.375rem; margin-top: 0.25rem">
        <slot name="channel" :item="item">
          <span v-if="item.channel" class="accent" style="font-size: 12px; font-weight: 500; color: var(--primary)">{{ item.channel }}</span>
        </slot>
        <span v-if="item.stage" class="tag">{{ item.stage }}</span>
          <span v-if="item.windowLabel" class="accent" style="font-size: 11px; font-weight: 500; color: var(--primary)">{{ item.windowLabel }}</span>
      </span>
    </span>
    <span v-if="item.unread" class="pill" style="background: var(--primary); color: var(--primary-foreground)">{{ item.unread }}</span>
  </button>
</template>

<style src="../styles/inbox.css"></style>
