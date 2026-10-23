<script setup lang="ts">
import type { GamesCollectionItem } from "@nuxt/content";

const route = useRoute();

const { data: page } = await useAsyncData(
  route.path,
  () => queryCollection("games").path(route.path).first() as Promise<GamesCollectionItem>,
);

if (!page.value) {
  throw createError({ statusCode: 404, statusMessage: "Game not found", fatal: true });
}

useSeoMeta({
  title: page.value.title,
  description: page.value.description,
  ogTitle: page.value.title,
  ogDescription: page.value.description,
});
</script>

<template>
  <div
    v-if="page"
    class="mx-auto w-full max-w-[90rem] min-w-0 px-4 py-6 sm:px-6 lg:px-8 lg:py-8"
  >
    <header class="mb-6">
      <div class="flex flex-wrap items-baseline justify-between gap-x-5 gap-y-2">
        <h1
          id="game-title"
          class="text-foreground text-2xl leading-tight font-semibold tracking-tight"
        >
          {{ page.title }}
        </h1>
        <NuxtLink
          :to="{ path: '/games', query: { category: page.category } }"
          class="text-foreground-muted hover:text-foreground focus-visible:outline-info rounded-sm text-xs focus-visible:outline-2"
          >{{ page.category }}</NuxtLink
        >
      </div>
      <p class="text-foreground-muted mt-2 max-w-3xl text-sm leading-6">{{ page.description }}</p>
    </header>
    <article
      aria-labelledby="game-title"
      class="[&>div>p]:text-foreground-muted min-w-0 [&>div>h2]:mt-8 [&>div>h2]:mb-3 [&>div>h2]:text-base [&>div>h2]:font-semibold [&>div>p]:text-sm [&>div>p]:leading-7"
    >
      <ContentRenderer :value="page" />
    </article>
  </div>
</template>
