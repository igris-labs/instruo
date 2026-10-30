<script setup lang="ts">
import AppFooter from "../components/product/AppFooter.vue";
import AppHeader from "../components/product/AppHeader.vue";
import { AppLayout } from "../components/ui/app-layout";
</script>
<template>
  <AppLayout
    scroll="page"
    sticky-header
    :ui="{
      root: 'min-h-dvh bg-background text-foreground',
      header: 'z-30 h-14 border-0 bg-background px-0',
      main: 'min-w-0',
      footer: 'border-0 bg-muted p-0',
    }"
  >
    <template #header><AppHeader /></template>
    <slot />
    <template #footer><AppFooter /></template>
  </AppLayout>
</template>
