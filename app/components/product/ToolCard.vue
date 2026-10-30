<script setup lang="ts">
import type { Resource } from "../../features/catalogue/types";
import { categoryPresentation } from "../../features/catalogue/presentation";
defineProps<{ resource: Resource; compact?: boolean }>();
</script>
<template>
  <NuxtLink
    :to="resource.route"
    class="group focus-visible:outline-ring flex h-full min-w-0 flex-col rounded-xl transition-[background-color,border-color] duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 motion-reduce:transition-none"
    :class="
      compact
        ? 'hover:bg-muted/25 p-4'
        : 'border-border/60 bg-card hover:border-input hover:bg-muted/25 border p-5'
    "
    data-tool-card
    data-ui
  >
    <div class="flex items-start gap-3.5">
      <div
        class="text-highlighted grid shrink-0 place-items-center"
        :class="compact ? 'mt-1 size-5' : 'bg-muted/70 size-12 rounded-lg'"
      >
        <Icon
          :name="resource.icon"
          mode="svg"
          :class="compact ? 'size-5' : 'size-7'"
          aria-hidden="true"
        />
      </div>
      <h3 class="text-highlighted pt-0.5 text-[15px] leading-6 font-semibold">
        {{ resource.title }}
      </h3>
    </div>
    <p
      class="text-muted-foreground line-clamp-2 text-[13px] leading-6"
      :class="compact ? 'mt-2' : 'mt-4'"
    >
      {{ resource.description }}
    </p>
    <div
      v-if="!compact"
      class="text-muted-foreground mt-auto flex items-center justify-between gap-3 pt-5 text-xs"
    >
      <span>{{ categoryPresentation[resource.category]?.label ?? resource.category }}</span>
      <Icon
        name="tabler:arrow-up-right"
        mode="svg"
        class="size-4 opacity-50 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100 motion-reduce:transition-none"
        aria-hidden="true"
      />
    </div>
  </NuxtLink>
</template>
