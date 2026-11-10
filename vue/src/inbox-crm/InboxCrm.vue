<!--
Bandeja de conversaciones.
Fuente: concepto visual de Divan Raj (@desdivj),
https://x.com/desdivj/status/2119738295039250507
Licencia: sin licencia, clean-room. No se copiaron assets, logos,
ilustraciones ni textos.
Compone el riel, el encabezado, la lista, el hilo y la ficha.
El canal, la etapa y la ventana llegan por props. Nada se envía solo.
-->
<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from "vue"

import type { ComposerLock, ConversationItemData, ConversationSection, PartyPanelData, SuggestionItem, ThreadFilter, ThreadMessageData, ThreadStatus } from "../lib/thread"
import AppRail from "../app-rail/AppRail.vue"
import ChatThread from "../chat-thread/ChatThread.vue"
import ConversationList from "../conversation-list/ConversationList.vue"
import InboxPageHeader from "../inbox-page-header/InboxPageHeader.vue"
import PartyPanel from "../party-panel/PartyPanel.vue"
import SuggestedReplies from "../suggested-replies/SuggestedReplies.vue"
import ThreadComposer from "../thread-composer/ThreadComposer.vue"

type RailItem = { id: string; label: string; icon?: string; active?: boolean }
type Crumb = { label: string; href?: string }
type Action = { id: string; label: string }
export type InboxLayout = "auto" | "wide" | "desk" | "tablet" | "phone"

const props = withDefaults(defineProps<{
  layout?: InboxLayout
  railLabel?: string
  railMark?: string
  railItems?: readonly RailItem[]
  crumbs?: readonly Crumb[]
  title?: string
  subtitle?: string
  actions?: readonly Action[]
  bellLabel?: string
  bellCount?: number
  listLabel?: string
  listTitle?: string
  countLabel?: string
  searchLabel?: string
  shortcut?: string
  filters?: readonly ThreadFilter[]
  filter?: string
  sections?: readonly ConversationSection[]
  conversations?: readonly ConversationItemData[]
  selectedId?: string | null
  threadLabel?: string
  threadTitle?: string
  threadStatus?: string
  threadPresence?: "online" | "offline" | "away"
  messages?: readonly ThreadMessageData[]
  typing?: { names: readonly string[]; label?: string }
  suggestions?: readonly SuggestionItem[]
  locked?: ComposerLock | null
  party?: PartyPanelData
  revealLabel?: string
  status?: ThreadStatus
  emptyLabel?: string
  loadingLabel?: string
  error?: string
  offlineLabel?: string
  retryLabel?: string
  backLabel?: string
  contextLabel?: string
  initialColumn?: "list" | "thread"
  sendLabel?: string
  askLabel?: string
  attachLabel?: string
  placeholder?: string
}>(), {
  layout: "auto",
  railLabel: "Espacios",
  railItems: () => [],
  crumbs: () => [],
  title: "Mensajes",
  actions: () => [],
  listLabel: "Conversaciones",
  listTitle: "Mensajes",
  searchLabel: "Buscar mensajes",
  shortcut: "⌘K",
  conversations: () => [],
  threadLabel: "Hilo",
  messages: () => [],
  suggestions: () => [],
  locked: null,
  revealLabel: "Mostrar",
  status: "ready",
  emptyLabel: "No hay conversaciones",
  loadingLabel: "Cargando la bandeja",
  offlineLabel: "Sin conexión",
  retryLabel: "Reintentar",
  backLabel: "Volver",
  contextLabel: "Contexto",
  initialColumn: "list",
  sendLabel: "Enviar",
  askLabel: "Preguntar a IA",
  attachLabel: "Adjuntar",
})

const emit = defineEmits<{
  select: [id: string]
  send: [value: string]
  suggestion: [id: string]
  ask: []
  attach: [files: File[]]
  "use-template": []
  reveal: [id: string]
  retry: []
  "retry-message": [id: string]
  "update:filter": [value: string]
  action: [id: string]
  bell: []
  rail: [id: string]
}>()

function readViewport(): Exclude<InboxLayout, "auto"> {
  if (typeof window.matchMedia !== "function") return "wide"
  if (window.matchMedia("(max-width: 639px)").matches) return "phone"
  if (window.matchMedia("(max-width: 1023px)").matches) return "tablet"
  if (window.matchMedia("(max-width: 1279px)").matches) return "desk"
  return "wide"
}

const viewport = ref<Exclude<InboxLayout, "auto">>("wide")
const column = ref<"list" | "thread" | "context">(props.initialColumn)
const drawer = ref(false)
const draft = ref("")
const root = ref<HTMLElement | null>(null)

const layout = computed(() => (props.layout === "auto" ? viewport.value : props.layout))
const showRail = computed(() => layout.value === "wide" || layout.value === "desk")
const showList = computed(() => layout.value !== "phone" || column.value === "list")
const showThread = computed(() => layout.value !== "phone" || column.value === "thread" || column.value === "context")
const showParty = computed(() => layout.value === "wide")

function onKey(event: KeyboardEvent) {
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
    event.preventDefault()
    root.value?.querySelector<HTMLElement>("[data-slot=conversation-search]")?.focus()
  }
  if (event.key === "Escape") drawer.value = false
}

function onViewport() {
  viewport.value = readViewport()
}

let queries: MediaQueryList[] = []

onMounted(() => {
  if (props.layout === "auto" && typeof window.matchMedia === "function") {
    onViewport()
    queries = ["(max-width: 639px)", "(max-width: 1023px)", "(max-width: 1279px)"].map((query) => window.matchMedia(query))
    queries.forEach((query) => query.addEventListener("change", onViewport))
  }
  window.addEventListener("keydown", onKey)
})

onUnmounted(() => {
  queries.forEach((query) => query.removeEventListener("change", onViewport))
  window.removeEventListener("keydown", onKey)
})

function approve(id: string) {
  const item = props.suggestions.find((suggestion) => suggestion.id === id)
  if (item) draft.value = item.label
  emit("suggestion", id)
}

function send(value: string) {
  emit("send", value)
  draft.value = ""
}
</script>

<template>
  <div
    ref="root"
    class="retana inbox rt:flex rt:overflow-hidden rt:bg-background rt:text-foreground"
    data-slot="inbox-crm"
    :data-layout="layout"
    :aria-busy="status === 'loading' ? 'true' : undefined"
  >
    <AppRail v-if="showRail" :label="railLabel" :mark="railMark" :items="railItems" @select="emit('rail', $event)" />
    <div class="inbox-body">
      <InboxPageHeader
        :crumbs="crumbs"
        :title="title"
        :subtitle="subtitle"
        :actions="actions"
        :bell-label="bellLabel"
        :bell-count="bellCount"
        @action="emit('action', $event)"
        @bell="emit('bell')"
      />
      <div v-if="status === 'loading'" role="status" :aria-label="loadingLabel" style="display: grid; flex: 1; gap: 0.75rem">
        <span class="sr">{{ loadingLabel }}</span>
        <span class="skel" style="height: 6rem" />
        <span class="skel" style="height: 10rem" />
      </div>
      <div v-else-if="status === 'error'" role="alert" class="card" style="display: grid; gap: 0.75rem">
        <p class="danger" style="margin: 0">{{ error }}</p>
        <button type="button" class="solid" style="justify-self: start" @click="emit('retry')">{{ retryLabel }}</button>
      </div>
      <div v-else class="inbox-grid">
        <ConversationList
          v-if="showList"
          :label="listLabel"
          :title="listTitle"
          :count-label="countLabel"
          :search-label="searchLabel"
          :shortcut="shortcut"
          :filters="filters"
          :filter="filter"
          :sections="sections"
          :items="conversations"
          :selected-id="selectedId"
          :status="status === 'empty' ? 'empty' : 'ready'"
          :empty-title="emptyLabel"
          @update:filter="emit('update:filter', $event)"
          @select="(id) => { emit('select', id); column = 'thread' }"
        />
        <div v-if="showThread" style="display: flex; min-width: 0; min-height: 0; flex-direction: column; gap: 0.75rem">
          <div style="display: flex; align-items: center; gap: 0.5rem">
            <button v-if="layout === 'phone'" type="button" class="ghost" style="border: 0" @click="column = 'list'">{{ backLabel }}</button>
            <button v-if="!showParty && party" type="button" class="ghost" style="border: 0; margin-inline-start: auto" @click="drawer = true">{{ contextLabel }}</button>
          </div>
          <p v-if="status === 'offline'" class="lock" role="status" style="margin: 0">{{ offlineLabel }}</p>
          <ChatThread
            :label="threadLabel"
            :title="threadTitle"
            :status="threadStatus"
            :presence="threadPresence"
            :messages="messages"
            :typing="typing"
            :retry-label="retryLabel"
            :state="status === 'empty' ? 'empty' : 'ready'"
            :empty-label="emptyLabel"
            @retry-message="emit('retry-message', $event)"
          />
          <SuggestedReplies v-if="suggestions.length" :items="suggestions" @approve="approve" />
          <ThreadComposer
            :model-value="draft"
            :locked="locked"
            :offline="status === 'offline'"
            :placeholder="placeholder"
            :send-label="sendLabel"
            :ask-label="askLabel"
            :attach-label="attachLabel"
            @update:model-value="draft = $event"
            @send="send"
            @ask="emit('ask')"
            @attach="emit('attach', $event)"
            @use-template="emit('use-template')"
          />
        </div>
        <div v-if="showParty && party" style="min-width: 0; border-inline-start: 1px solid var(--border); padding-inline-start: 1rem">
          <PartyPanel v-bind="party" :reveal-label="revealLabel" @reveal="emit('reveal', $event)" />
        </div>
      </div>
    </div>
    <div v-if="drawer && party" class="drawer" role="dialog" :aria-label="contextLabel">
      <button type="button" class="ghost" style="align-self: flex-end; border: 0" @click="drawer = false">{{ backLabel }}</button>
      <PartyPanel v-bind="party" :reveal-label="revealLabel" @reveal="emit('reveal', $event)" />
    </div>
  </div>
</template>

<style src="../styles/inbox.css"></style>
