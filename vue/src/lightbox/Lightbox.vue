<script setup lang="ts">
import { computed, ref } from "vue"
import { DialogClose, DialogContent, DialogOverlay, DialogPortal, DialogRoot, DialogTitle } from "reka-ui"

import RetanaIcon from "../icons/RetanaIcon.vue"

type Item = { src: string; alt: string; caption?: string }

const props = withDefaults(defineProps<{
  items?: Item[]
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  index?: number
  defaultIndex?: number
  onIndexChange?: (index: number) => void
  closeLabel?: string
  previousLabel?: string
  nextLabel?: string
  zoomInLabel?: string
  zoomOutLabel?: string
  className?: string
  loading?: boolean
  error?: string
  emptyLabel?: string
  loadingLabel?: string
  previousIcon?: string
  nextIcon?: string
  closeIcon?: string
  zoomInIcon?: string
  zoomOutIcon?: string
  gallery?: boolean
}>(), {
  items: () => [],
  defaultOpen: false,
  defaultIndex: 0,
  closeLabel: "Close",
  previousLabel: "Previous",
  nextLabel: "Next",
  zoomInLabel: "Zoom in",
  zoomOutLabel: "Zoom out",
  emptyLabel: "No images.",
  loadingLabel: "Loading images",
})

const opener = ref<HTMLElement | null>(null)
const uncontrolledOpen = ref(props.defaultOpen)
const uncontrolledIndex = ref(props.defaultIndex)
const zoom = ref(1)
const controlledOpen = computed(() => props.onOpenChange != null)
const isOpen = computed(() => (controlledOpen.value ? props.open : uncontrolledOpen.value))
const current = computed(() => props.index ?? uncontrolledIndex.value)
const item = computed(() => props.items[current.value])

function setOpen(next: boolean) {
  if (!controlledOpen.value) uncontrolledOpen.value = next
  props.onOpenChange?.(next)
  if (!next) zoom.value = 1
}

function setIndex(next: number) {
  const count = Math.max(props.items.length, 1)
  const bounded = (next + props.items.length) % count
  if (props.index === undefined) uncontrolledIndex.value = bounded
  props.onIndexChange?.(bounded)
  zoom.value = 1
}

function openAt(next: number, event: MouseEvent) {
  opener.value = event.currentTarget as HTMLElement
  setIndex(next)
  setOpen(true)
}

function onCloseAutoFocus(event: Event) {
  event.preventDefault()
  opener.value?.focus()
}

function onKeyDown(event: KeyboardEvent) {
  if (event.key === "ArrowRight") {
    event.preventDefault()
    setIndex(current.value + 1)
  } else if (event.key === "ArrowLeft") {
    event.preventDefault()
    setIndex(current.value - 1)
  } else if (event.key === "+" || event.key === "=") {
    event.preventDefault()
    zoom.value = Math.min(4, zoom.value + 0.25)
  } else if (event.key === "-" || event.key === "_") {
    event.preventDefault()
    zoom.value = Math.max(1, zoom.value - 0.25)
  }
}

const iconButton = "retana-button rt:inline-flex rt:size-8 rt:items-center rt:justify-center rt:rounded-lg rt:border rt:border-border rt:bg-secondary rt:text-secondary-foreground rt:focus-visible:outline-2 rt:focus-visible:outline-offset-2 rt:focus-visible:outline-ring"
</script>

<template>
  <div v-if="loading" role="status" class="retana rt:p-3 rt:text-sm" data-retana="lightbox">
    <span class="rt:sr-only">{{ loadingLabel }}</span>
    <div data-slot="skeleton" class="rt:h-40 rt:w-full rt:animate-pulse rt:rounded-md rt:bg-muted rt:motion-reduce:animate-none" />
  </div>
  <p v-else-if="error" role="alert" class="retana rt:p-3 rt:text-sm rt:text-destructive" data-retana="lightbox">{{ error }}</p>
  <p v-else-if="items.length === 0" class="retana rt:p-3 rt:text-sm rt:text-muted-foreground" data-retana="lightbox">{{ emptyLabel }}</p>
  <DialogRoot v-else :open="isOpen" @update:open="setOpen">
    <div v-if="gallery" :class="className" data-retana="lightbox-gallery">
      <ul class="rt:grid rt:grid-cols-3 rt:gap-2">
        <li v-for="(entry, itemIndex) in items" :key="entry.src">
          <button
            type="button"
            class="retana-button rt:block rt:w-full rt:overflow-hidden rt:rounded-lg rt:border rt:border-border rt:bg-card rt:text-inherit rt:focus-visible:outline-2 rt:focus-visible:outline-offset-2 rt:focus-visible:outline-ring"
            @click="openAt(itemIndex, $event)"
          >
            <img :src="entry.src" :alt="entry.alt" class="rt:aspect-square rt:w-full rt:object-cover" />
          </button>
        </li>
      </ul>
    </div>
    <DialogPortal>
      <DialogOverlay class="rt:fixed rt:inset-0 rt:z-50" :style="{ backgroundColor: 'var(--background)', opacity: 0.8 }" />
      <DialogContent
        aria-describedby="undefined"
        data-slot="lightbox"
        class="retana rt:fixed rt:inset-0 rt:z-50 rt:flex rt:flex-col rt:outline-none"
        :class="className"
        @keydown="onKeyDown"
        @close-auto-focus="onCloseAutoFocus"
      >
        <DialogTitle class="rt:sr-only">{{ item?.alt ?? closeLabel }}</DialogTitle>
        <div class="rt:flex rt:items-center rt:justify-end rt:gap-1 rt:p-3">
          <button type="button" :class="iconButton" :aria-label="zoomOutLabel" @click="zoom = Math.max(1, zoom - 0.25)">
            <slot name="zoom-out-icon"><RetanaIcon :name="zoomOutIcon" fallback="out" /></slot>
          </button>
          <button type="button" :class="iconButton" :aria-label="zoomInLabel" @click="zoom = Math.min(4, zoom + 0.25)">
            <slot name="zoom-in-icon"><RetanaIcon :name="zoomInIcon" fallback="in" /></slot>
          </button>
          <DialogClose as-child>
            <button type="button" :class="iconButton" :aria-label="closeLabel">
              <slot name="close-icon"><RetanaIcon :name="closeIcon" fallback="close" /></slot>
            </button>
          </DialogClose>
        </div>
        <div class="rt:relative rt:flex rt:min-h-0 rt:flex-1 rt:items-center rt:justify-center rt:px-14">
          <button v-if="items.length > 1" type="button" :class="[iconButton, 'rt:absolute rt:left-3']" :aria-label="previousLabel" @click="setIndex(current - 1)">
            <slot name="previous-icon"><RetanaIcon :name="previousIcon" fallback="prev" /></slot>
          </button>
          <figure v-if="item" class="rt:flex rt:max-h-full rt:max-w-full rt:flex-col rt:items-center rt:gap-3">
            <img
              :src="item.src"
              :alt="item.alt"
              class="rt:max-h-[70vh] rt:max-w-full rt:rounded-lg rt:object-contain rt:transition-transform rt:duration-200 rt:motion-reduce:transition-none"
              :style="{ transform: `scale(${zoom})` }"
              draggable="false"
            />
            <figcaption v-if="item.caption" class="rt:text-sm rt:text-muted-foreground">{{ item.caption }}</figcaption>
          </figure>
          <button v-if="items.length > 1" type="button" :class="[iconButton, 'rt:absolute rt:right-3']" :aria-label="nextLabel" @click="setIndex(current + 1)">
            <slot name="next-icon"><RetanaIcon :name="nextIcon" fallback="next" /></slot>
          </button>
        </div>
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>
