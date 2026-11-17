<script setup lang="ts">
import { computed } from "vue"

type Year = { year: number; granted: number; used: number }

type Labels = {
  title: string
  available: string
  pending: string
  left: string
  year: string
  granted: string
  used: string
  empty: string
  loading: string
  amount: (value: number) => string
}

const props = withDefaults(defineProps<{
  available?: number | null
  pending?: number
  years?: Year[]
  loading?: boolean
  error?: string
  labels?: Partial<Labels>
  className?: string
}>(), {
  available: null,
  pending: 0,
  years: () => [],
  loading: false,
})

const defaults: Labels = {
  title: "Balance",
  available: "Available",
  pending: "Pending",
  left: "Left this year",
  year: "Year",
  granted: "Granted",
  used: "Used",
  empty: "No balance to show.",
  loading: "Loading the balance",
  amount: (value) => String(value),
}

const labels = computed(() => ({ ...defaults, ...props.labels }))
const left = computed(() => (props.available == null ? null : props.available - props.pending))
const empty = computed(() => props.available == null && props.years.length === 0)
</script>

<template>
  <section
    class="retana rt:flex rt:flex-col rt:gap-3 rt:rounded-xl rt:border rt:border-border rt:bg-card rt:p-3 rt:text-sm rt:text-card-foreground"
    :class="className"
    :aria-busy="loading ? true : undefined"
    data-retana="time-off-stats"
  >
    <h2 class="rt:font-medium">{{ labels.title }}</h2>
    <p v-if="error" role="alert" class="rt:text-destructive">{{ error }}</p>
    <div v-if="loading" role="status" :aria-label="labels.loading" class="rt:grid rt:gap-2">
      <slot name="skeleton">
        <div data-slot="skeleton" class="rt:h-14 rt:w-full rt:animate-pulse rt:rounded-md rt:bg-muted rt:motion-reduce:animate-none" />
        <div data-slot="skeleton" class="rt:h-8 rt:w-full rt:animate-pulse rt:rounded-md rt:bg-muted rt:motion-reduce:animate-none" />
      </slot>
    </div>
    <p v-else-if="empty" class="rt:text-muted-foreground">{{ labels.empty }}</p>
    <template v-else>
      <dl class="rt:grid rt:grid-cols-3 rt:gap-2">
        <div class="rt:rounded-lg rt:bg-muted rt:px-2 rt:py-2">
          <dt class="rt:text-muted-foreground">{{ labels.available }}</dt>
          <dd class="rt:text-lg rt:font-medium rt:tabular-nums">{{ labels.amount(available ?? 0) }}</dd>
        </div>
        <div class="rt:rounded-lg rt:bg-muted rt:px-2 rt:py-2">
          <dt class="rt:text-muted-foreground">{{ labels.pending }}</dt>
          <dd class="rt:text-lg rt:font-medium rt:tabular-nums">{{ labels.amount(pending) }}</dd>
        </div>
        <div class="rt:rounded-lg rt:bg-muted rt:px-2 rt:py-2">
          <dt class="rt:text-muted-foreground">{{ labels.left }}</dt>
          <dd class="rt:text-lg rt:font-medium rt:tabular-nums">{{ labels.amount(left ?? 0) }}</dd>
        </div>
      </dl>
      <table v-if="years.length" class="rt:w-full rt:text-xs">
        <thead class="rt:text-muted-foreground">
          <tr>
            <th class="rt:py-1 rt:text-start rt:font-medium">{{ labels.year }}</th>
            <th class="rt:py-1 rt:text-end rt:font-medium">{{ labels.granted }}</th>
            <th class="rt:py-1 rt:text-end rt:font-medium">{{ labels.used }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="year in years" :key="year.year" class="rt:border-t rt:border-border">
            <td class="rt:py-1.5">
              <div class="rt:font-medium rt:tabular-nums">{{ year.year }}</div>
              <div class="rt:mt-1 rt:h-1.5 rt:overflow-hidden rt:rounded-full rt:bg-muted">
                <div
                  class="rt:h-full rt:rounded-full rt:bg-primary"
                  :style="{ width: `${year.granted <= 0 ? 0 : Math.min(100, Math.round((year.used / year.granted) * 100))}%` }"
                />
              </div>
            </td>
            <td class="rt:py-1.5 rt:text-end rt:tabular-nums">{{ labels.amount(year.granted) }}</td>
            <td class="rt:py-1.5 rt:text-end rt:tabular-nums">{{ labels.amount(year.used) }}</td>
          </tr>
        </tbody>
      </table>
    </template>
  </section>
</template>
