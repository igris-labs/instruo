<script lang="ts" setup>
import { createToastManager, provideToastManager } from "akaza-ui";

provideToastManager(createToastManager());
const colorMode = useColorMode();
const title = "Instruo | Free browser tools for everyday tasks";
const description =
  "Use fast, private utilities for text, encoding, data, and quick browser games. No account or installation required.";

useSeoMeta({
  title,
  ogTitle: title,
  description,
  ogDescription: description,
});

useHead({
  htmlAttrs: { lang: "en" },
  titleTemplate: (pageTitle) => (pageTitle ? `${pageTitle} | Instruo` : title),
  link: [
    { rel: "icon", type: "image/svg+xml", href: "/logo.svg" },
    { rel: "icon", type: "image/x-icon", href: "/favicon.ico", sizes: "32x32" },
    { rel: "apple-touch-icon", href: "/apple-touch-icon.png", sizes: "180x180" },
  ],
  meta: [
    {
      name: "theme-color",
      content: computed(() => (colorMode.value === "dark" ? "#0a0a0a" : "#ffffff")),
    },
    { name: "color-scheme", content: "light dark" },
  ],
});
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
  <AppSearch />
  <UiToast />
  <UiOverlayProvider />
</template>
