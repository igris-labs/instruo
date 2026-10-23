<script setup lang="ts">
const props = withDefaults(defineProps<{ description?: string }>(), {
  description: "Results update as your input changes.",
});
</script>

<template>
  <section class="not-prose border-outline bg-elevated overflow-hidden rounded-lg border">
    <div class="min-w-0">
      <header class="border-outline border-b px-4 py-3">
        <p class="text-foreground-muted text-sm leading-6">{{ props.description }}</p>
      </header>

      <div class="min-w-0 p-4">
        <slot />
      </div>
    </div>
  </section>
</template>
