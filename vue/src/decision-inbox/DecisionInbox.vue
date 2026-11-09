<script setup lang="ts">
import { computed, ref, useId, useSlots } from "vue"

import RetanaIcon from "../icons/RetanaIcon.vue"

type Choice = { id: string; label: string }
type Item = {
  id: string
  title: string
  detail?: string
  agent?: string
  choices: Choice[]
  answerId?: string | null
}

type Labels = {
  title: string
  open: (count: number) => string
  empty: string
  loading: string
  answered: (choice: string) => string
  dismiss: string
  dismissNamed: (title: string) => string
  choose: (title: string, choice: string) => string
  from: (agent: string) => string
}

const props = withDefaults(defineProps<{
  items?: Item[]
  title?: string
  loading?: boolean
  error?: string
  onAnswer?: (id: string, choiceId: string) => void
  onDismiss?: (id: string) => void
  className?: string
  classNames?: { root?: string; item?: string; choice?: string }
  labels?: Partial<Labels>
  answeredIcon?: string
}>(), {
  items: () => [],
  loading: false,
})

const defaults: Labels = {
  title: "Open calls",
  open: (count) => (count === 1 ? "1 still open" : `${count} still open`),
  empty: "Nothing is waiting on you.",
  loading: "Loading open calls",
  answered: (choice) => `Answered: ${choice}`,
  dismiss: "Dismiss",
  dismissNamed: (title) => `Dismiss “${title}”`,
  choose: (title, choice) => `${choice} for “${title}”`,
  from: (agent) => `From ${agent}`,
}

const slots = useSlots()
const labels = computed(() => ({ ...defaults, ...props.labels }))
const titleId = useId()
const heading = computed(() => props.title ?? labels.value.title)
const open = computed(() => props.items.filter((item) => !item.answerId).length)
const live = ref("")

function choose(item: Item, choice: Choice) {
  props.onAnswer?.(item.id, choice.id)
  live.value = labels.value.answered(choice.label)
}

function dismiss(item: Item) {
  props.onDismiss?.(item.id)
}

const buttonClass = "retana-button rt:inline-flex rt:min-h-8 rt:items-center rt:justify-center rt:rounded-lg rt:border rt:border-border rt:bg-background rt:px-2.5 rt:text-sm rt:font-medium rt:text-inherit rt:focus-visible:outline-2 rt:focus-visible:outline-offset-2 rt:focus-visible:outline-ring"
</script>

<template>
  <section
    class="retana rt:flex rt:flex-col rt:gap-3 rt:rounded-xl rt:border rt:border-border rt:bg-card rt:p-3 rt:text-sm rt:text-card-foreground"
    :class="[className, classNames?.root]"
    :aria-labelledby="titleId"
    :aria-busy="loading ? true : undefined"
    data-retana="decision-inbox"
  >
    <header class="rt:flex rt:flex-wrap rt:items-center rt:gap-2">
      <h2 :id="titleId" class="rt:font-medium">{{ heading }}</h2>
      <slot name="badge" :label="labels.open(open)">
        <span class="rt:inline-flex rt:items-center rt:rounded-full rt:bg-secondary rt:px-2 rt:py-0.5 rt:text-xs rt:text-secondary-foreground">{{ labels.open(open) }}</span>
      </slot>
    </header>
    <p class="rt:sr-only" aria-live="polite">{{ live }}</p>
    <div v-if="loading" role="status" class="rt:flex rt:flex-col rt:gap-2">
      <span class="rt:sr-only">{{ labels.loading }}</span>
      <slot name="skeleton">
        <div data-slot="skeleton" class="rt:h-16 rt:w-full rt:animate-pulse rt:rounded-md rt:bg-muted rt:motion-reduce:animate-none" />
        <div data-slot="skeleton" class="rt:h-16 rt:w-full rt:animate-pulse rt:rounded-md rt:bg-muted rt:motion-reduce:animate-none" />
      </slot>
    </div>
    <p v-else-if="error && items.length === 0" role="alert" class="rt:text-destructive">{{ error }}</p>
    <p v-else-if="items.length === 0" class="rt:text-muted-foreground">{{ labels.empty }}</p>
    <template v-else>
      <p v-if="error" role="alert" class="rt:text-destructive">{{ error }}</p>
    <ul class="rt:flex rt:flex-col rt:gap-2">
      <li v-for="item in items" :key="item.id" class="rt:rounded-lg rt:border rt:border-border rt:px-3 rt:py-2" :class="classNames?.item">
        <div class="rt:flex rt:flex-wrap rt:items-baseline rt:gap-2">
          <h3 class="rt:font-medium">{{ item.title }}</h3>
          <p v-if="item.agent" class="rt:text-xs rt:text-muted-foreground">{{ labels.from(item.agent) }}</p>
        </div>
        <p v-if="item.detail && !item.answerId" class="rt:mt-1 rt:text-xs rt:text-muted-foreground">{{ item.detail }}</p>
        <div v-if="item.choices.find((choice) => choice.id === item.answerId)" class="rt:mt-2 rt:flex rt:items-center rt:gap-2">
          <slot name="answered-icon">
            <RetanaIcon :name="answeredIcon" fallback="check" class="rt:text-primary" />
          </slot>
          <p>{{ labels.answered(item.choices.find((choice) => choice.id === item.answerId)!.label) }}</p>
          <slot v-if="onDismiss && slots.dismiss" name="dismiss" :item="item" :dismiss="() => dismiss(item)" />
          <button v-else-if="onDismiss" type="button" :class="[buttonClass, 'rt:ms-auto']" :aria-label="labels.dismissNamed(item.title)" @click="dismiss(item)">
            {{ labels.dismiss }}
          </button>
        </div>
        <div v-else class="rt:mt-2 rt:flex rt:flex-wrap rt:gap-2">
          <template v-for="choice in item.choices" :key="choice.id">
            <slot v-if="slots.choice" name="choice" :item="item" :choice="choice" :choose="() => choose(item, choice)" />
            <button
              v-else
              type="button"
              :class="[buttonClass, classNames?.choice]"
              :aria-label="labels.choose(item.title, choice.label)"
              @click="choose(item, choice)"
            >
              {{ choice.label }}
            </button>
          </template>
        </div>
      </li>
    </ul>
    </template>
  </section>
</template>
