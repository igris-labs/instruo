<script setup lang="ts">
import type { NuxtError } from "#app";
import BrandLogo from "./components/product/BrandLogo.vue";
import { Button } from "./components/ui/button";
const props = defineProps<{ error: NuxtError }>();
const missing = computed(() => props.error.statusCode === 404);
useHead({
  title: computed(() =>
    missing.value ? "Page not found · Instruo" : "Something went wrong · Instruo",
  ),
});
</script>
<template>
  <main class="bg-background text-foreground grid min-h-dvh place-items-center px-6 py-16">
    <div class="w-full max-w-md">
      <NuxtLink
        to="/"
        aria-label="Instruo home"
        class="text-highlighted focus-visible:outline-ring mb-8 inline-flex rounded-sm text-xl focus-visible:outline-1"
        ><BrandLogo wordmark
      /></NuxtLink>
      <h1 class="text-3xl leading-tight font-medium tracking-tight">
        {{ missing ? "That page isn't here" : "Something went wrong" }}
      </h1>
      <p class="text-muted-foreground mt-5 text-sm leading-7">
        {{
          missing
            ? "Find the tool or game you need from the directory."
            : "Try opening the page again. If it keeps happening, please report it on GitHub."
        }}
      </p>
      <div class="mt-7 flex flex-wrap gap-2">
        <Button @click="clearError({ redirect: '/tools' })">Find a tool</Button
        ><Button
          color="secondary"
          variant="outline"
          @click="clearError({ redirect: '/' })"
          >Go home</Button
        >
      </div>
    </div>
  </main>
</template>
