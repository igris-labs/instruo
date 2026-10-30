<script setup lang="ts">
import { createToastManager, provideToastManager } from "akaza-ui";
import AppSearch from "./components/product/AppSearch.vue";
import { OverlayProvider } from "./components/ui/overlay-provider";
import { Toast } from "./components/ui/toast";

provideToastManager(createToastManager());
onMounted(() => {
  document.documentElement.dataset.instruoReady = "true";
});
const search = useState("instruo-search", () => false);
useHead({
  bodyAttrs: { class: "[&_.akaza-checkbox-wrapper]:gap-2" },
  htmlAttrs: { lang: "en" },
  titleTemplate: (title) => (title ? `${title} · Instruo` : "Instruo — tools for the task at hand"),
  link: [
    { rel: "icon", type: "image/png", sizes: "32x32", href: "/brand/favicon-32.png" },
    { rel: "icon", type: "image/svg+xml", sizes: "any", href: "/brand/favicon.svg" },
    { rel: "apple-touch-icon", sizes: "180x180", href: "/brand/apple-touch-icon.png" },
  ],
});
useSeoMeta({
  description: "Useful browser tools and games for a proper break. No account required.",
});
</script>

<template>
  <NuxtRouteAnnouncer />
  <NuxtLayout
    ><NuxtPage
      :transition="{
        mode: 'out-in',
        enterActiveClass:
          'transition-[opacity,transform] duration-180 ease-enter motion-reduce:transition-none',
        enterFromClass: 'motion-safe:opacity-0 motion-safe:translate-y-1',
        enterToClass: 'opacity-100 translate-y-0',
        leaveActiveClass: 'transition-opacity duration-100 motion-reduce:transition-none',
        leaveToClass: 'motion-safe:opacity-0',
      }"
  /></NuxtLayout>
  <!-- Closed global overlays have no server content; mount their shared teleport stack once. -->
  <ClientOnly>
    <AppSearch v-model:open="search" />
    <Toast />
    <OverlayProvider />
  </ClientOnly>
</template>
