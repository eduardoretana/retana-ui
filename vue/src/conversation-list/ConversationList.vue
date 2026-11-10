<!--
Bandeja de conversaciones.
Fuente: concepto visual de Divan Raj (@desdivj),
https://x.com/desdivj/status/2119738295039250507
Licencia: sin licencia, clean-room. No se copiaron assets, logos,
ilustraciones ni textos.
-->
<script setup lang="ts">
import { computed, ref, useId } from "vue"

import { matchesConversation, type ConversationItemData, type ConversationSection, type ThreadFilter, type ThreadStatus } from "../lib/thread"
import ConversationItem from "../conversation-item/ConversationItem.vue"
import SegmentedFilter from "../segmented-filter/SegmentedFilter.vue"

const props = withDefaults(defineProps<{
  label: string
  title?: string
  countLabel?: string
  searchLabel?: string
  shortcut?: string
  query?: string
  filters?: readonly ThreadFilter[]
  filter?: string
  sections?: readonly ConversationSection[]
  items?: readonly ConversationItemData[]
  selectedId?: string | null
  status?: ThreadStatus
  emptyTitle?: string
  loadingLabel?: string
  error?: string
  retryLabel?: string
}>(), {
  searchLabel: "Buscar",
  items: () => [],
  status: "ready",
  emptyTitle: "Sin conversaciones",
  loadingLabel: "Cargando conversaciones",
  retryLabel: "Reintentar",
})

const emit = defineEmits<{
  select: [id: string]
  "update:filter": [value: string]
  "update:query": [value: string]
  retry: []
}>()

const listId = useId()
const queryState = ref("")
const query = computed(() => props.query ?? queryState.value)
const visible = computed(() => props.items.filter((item) => matchesConversation(item, props.filter, query.value)))

function setQuery(next: string) {
  if (props.query === undefined) queryState.value = next
  emit("update:query", next)
}

function onListKey(event: KeyboardEvent) {
  if (!visible.value.length) return
  const index = Math.max(0, visible.value.findIndex((item) => item.id === props.selectedId))
  const nextIndex = event.key === "ArrowDown" ? Math.min(visible.value.length - 1, index + 1) : event.key === "ArrowUp" ? Math.max(0, index - 1) : -1
  if (nextIndex < 0) {
    const current = visible.value[index]
    if (event.key === "Enter" && current) emit("select", current.id)
    return
  }
  event.preventDefault()
  const next = visible.value[nextIndex]
  if (next) emit("select", next.id)
}

const groups = computed(() => {
  const sections = props.sections ?? []
  const known = new Set(sections.map((section) => section.id))
  if (!sections.length) return [{ id: "all", label: "", hint: undefined as string | undefined, rows: visible.value }]
  const named = sections.map((section) => ({ ...section, rows: visible.value.filter((item) => item.section === section.id) }))
  const extraIds = [...new Set(visible.value.map((item) => item.section).filter((id): id is string => typeof id === "string" && !known.has(id)))]
  const extra = extraIds.map((id) => ({ id, label: id, hint: undefined as string | undefined, rows: visible.value.filter((item) => item.section === id) }))
  return [...named, ...extra]
})
</script>

<template>
  <section class="retana rt:flex rt:min-w-0 rt:flex-col" data-slot="conversation-list" style="display: flex; min-width: 0; flex-direction: column; gap: 0.75rem">
    <div v-if="title || countLabel" style="display: flex; align-items: center; justify-content: space-between; gap: 0.5rem">
      <h2 v-if="title" class="ellipsis" style="margin: 0; font-size: 14px; line-height: 20px">{{ title }}</h2>
      <span v-else />
      <p v-if="countLabel" class="tag">
        <span class="sr">Total {{ countLabel }}</span>
        <span aria-hidden="true">{{ countLabel }}</span>
      </p>
    </div>
    <div style="position: relative">
      <input
        type="search"
        class="inbox-search"
        data-slot="conversation-search"
        :value="query"
        :aria-label="searchLabel"
        :placeholder="searchLabel"
        @input="setQuery(($event.target as HTMLInputElement).value)"
      />
      <kbd v-if="shortcut" class="muted" style="position: absolute; inset-inline-end: 0.5rem; top: 50%; transform: translateY(-50%); border-radius: 0.375rem; background: var(--muted); padding: 0.125rem 0.375rem; font-size: 0.6875rem">{{ shortcut }}</kbd>
    </div>
    <SegmentedFilter
      v-if="filters?.length"
      :label="label"
      :options="filters"
      :value="filter"
      @update:value="emit('update:filter', $event)"
    />
    <div v-if="status === 'loading'" role="status" :aria-label="loadingLabel" style="display: grid; gap: 0.5rem">
      <span class="sr">{{ loadingLabel }}</span>
      <span class="skel" style="height: 3.5rem" />
      <span class="skel" style="height: 3.5rem" />
    </div>
    <div v-else-if="status === 'error'" role="alert" class="card" style="display: grid; gap: 0.5rem">
      <p class="danger" style="margin: 0">{{ error }}</p>
      <button type="button" class="solid" @click="emit('retry')">{{ retryLabel }}</button>
    </div>
    <div v-else-if="status === 'empty' || visible.length === 0" role="status" class="muted" style="padding: 2rem 0.5rem; text-align: center">
      {{ emptyTitle }}
    </div>
    <div
      v-else
      role="listbox"
      :aria-label="label"
      tabindex="0"
      style="display: flex; min-height: 0; flex: 1; flex-direction: column; gap: 0.75rem; overflow-y: auto"
      @keydown="onListKey"
    >
      <div v-for="group in groups" :key="group.id" style="display: grid; gap: 0.25rem">
        <template v-if="group.rows.length">
          <p v-if="group.label" class="muted" style="margin: 0; padding: 0 0.5rem; font-size: 0.6875rem; font-weight: 500; letter-spacing: 0.04em; text-transform: uppercase">
            {{ group.label }}
            <span v-if="group.hint" style="margin-inline-start: 0.5rem; letter-spacing: 0; text-transform: none">{{ group.hint }}</span>
          </p>
          <ConversationItem
            v-for="item in group.rows"
            :id="`${listId}-${item.id}`"
            :key="item.id"
            :item="item"
            :selected="item.id === selectedId"
            @select="emit('select', $event)"
          />
        </template>
      </div>
    </div>
  </section>
</template>

<style src="../styles/inbox.css"></style>
