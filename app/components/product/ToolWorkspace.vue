<script setup lang="ts">
withDefaults(defineProps<{ layout?: "workbench" | "form" | "reference" }>(), {
  layout: "workbench",
});
</script>

<template>
  <section
    data-ui
    :data-tool-layout="layout"
    aria-label="Interactive workspace"
    class="@container w-full min-w-0 space-y-6"
    :class="{ 'max-w-3xl': layout === 'form', 'max-w-5xl': layout === 'reference' }"
  >
    <slot />
  </section>
</template>
