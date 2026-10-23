<script setup lang="ts">
const colorMode = useColorMode();
const isDark = computed(() => colorMode.value === "dark");
</script>
<template>
  <ClientOnly>
    <UiButton
      variant="ghost"
      :icon="isDark ? 'i-tabler-sun' : 'i-tabler-moon'"
      :aria-label="isDark ? 'Switch to light theme' : 'Switch to dark theme'"
      @click="colorMode.preference = isDark ? 'light' : 'dark'"
    />
    <template #fallback
      ><span
        class="size-7"
        aria-hidden="true"
    /></template>
  </ClientOnly>
</template>
