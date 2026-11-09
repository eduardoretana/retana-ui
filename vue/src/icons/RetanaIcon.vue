<script setup lang="ts">
defineProps<{
  name?: string
  fallback: "check" | "prev" | "next" | "close" | "in" | "out"
}>()
</script>

<template>
  <span class="rt:inline-flex">
    <slot>
      <span v-if="name" :class="name" aria-hidden="true" />
      <svg v-else viewBox="0 0 24 24" class="rt:size-4" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
      <polyline v-if="fallback === 'check'" points="5,12 10,17 19,7" />
      <polyline v-else-if="fallback === 'prev'" points="14,6 8,12 14,18" />
      <polyline v-else-if="fallback === 'next'" points="10,6 16,12 10,18" />
      <path v-else-if="fallback === 'close'" d="M6 6 L18 18 M18 6 L6 18" />
      <path v-else-if="fallback === 'in'" d="M12 6 V18 M6 12 H18" />
      <path v-else d="M6 12 H18" />
    </svg>
    </slot>
  </span>
</template>
