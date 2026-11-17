<script setup lang="ts">
import Lightbox from "./Lightbox.vue"

defineProps<{
  items: { src: string; alt: string; caption?: string }[]
  className?: string
  closeLabel?: string
  previousLabel?: string
  nextLabel?: string
  zoomInLabel?: string
  zoomOutLabel?: string
  previousIcon?: string
  nextIcon?: string
  closeIcon?: string
  zoomInIcon?: string
  zoomOutIcon?: string
  emptyLabel?: string
  loadingLabel?: string
  loading?: boolean
  error?: string
}>()
</script>

<template>
  <Lightbox v-bind="$props" gallery />
</template>
