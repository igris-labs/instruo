<script setup lang="ts">
import { resolveComponent } from "vue";
import ToolCard from "../components/product/ToolCard.vue";
import { Button } from "../components/ui/button";
import { quickStartSlugs } from "../features/catalogue/presentation";
definePageMeta({ layout: "marketing" });
useSeoMeta({
  title: "Instruo · Tools and browser games",
  description:
    "Find browser tools by task: work with code, data, images, text and everyday calculations. Free and open source, with games for a break.",
});
const link = resolveComponent("NuxtLink");
const { data: catalogue } = await useCatalogue();
const tools = computed(() => (catalogue.value ?? []).filter((item) => item.kind === "tool"));
const featured = computed(() =>
  quickStartSlugs.flatMap((slug) => tools.value.filter((item) => item.slug === slug)),
);
const games = computed(() =>
  ["lights-out", "flappy-bird", "solitaire", "minesweeper"].flatMap((slug) =>
    (catalogue.value ?? []).filter((item) => item.kind === "game" && item.slug === slug),
  ),
);
</script>
<template>
  <div class="mx-auto w-full max-w-[90rem] px-5 pb-16 sm:px-8">
    <section
      class="mx-auto flex max-w-4xl flex-col items-center pt-20 pb-20 text-center sm:pt-28 sm:pb-28"
      aria-labelledby="hero-title"
    >
      <h1
        id="hero-title"
        class="text-highlighted max-w-2xl text-[clamp(2rem,3.5vw,3rem)] leading-[1.08] font-semibold tracking-[-0.045em] text-balance"
      >
        Tools for everyday work.
      </h1>
      <p class="text-foreground mt-5 max-w-xl text-base leading-7 text-pretty sm:text-lg">
        Work with code, data, images and everyday numbers. Find the tool for your task and get
        straight to it.
      </p>
      <div
        class="mt-7 flex flex-wrap justify-center gap-3"
        data-ui
      >
        <Button
          :as="link"
          to="/tools"
          >Browse tools</Button
        >
        <Button
          :as="link"
          to="/games"
          color="secondary"
          variant="soft"
          >Explore games</Button
        >
      </div>
    </section>

    <section aria-labelledby="benefits-title">
      <h2
        id="benefits-title"
        class="sr-only"
      >
        Straight to the task.
      </h2>
      <div class="grid gap-4 sm:grid-cols-3">
        <article class="bg-muted/40 flex items-start gap-3 rounded-xl p-5">
          <Icon
            name="tabler:device-laptop"
            mode="svg"
            class="text-muted-foreground mt-0.5 size-5 shrink-0"
            aria-hidden="true"
          />
          <div>
            <h3 class="text-highlighted text-sm font-medium">Processed in your browser.</h3>
            <p class="text-muted-foreground mt-1 text-[13px] leading-6">
              Local tools keep input on your device.
            </p>
          </div>
        </article>
        <article class="bg-muted/40 flex items-start gap-3 rounded-xl p-5">
          <Icon
            name="tabler:login-2"
            mode="svg"
            class="text-muted-foreground mt-0.5 size-5 shrink-0"
            aria-hidden="true"
          />
          <div>
            <h3 class="text-highlighted text-sm font-medium">No signup. Just start.</h3>
            <p class="text-muted-foreground mt-1 text-[13px] leading-6">No account needed.</p>
          </div>
        </article>
        <article class="bg-muted/40 flex items-start gap-3 rounded-xl p-5">
          <Icon
            name="tabler:brand-github"
            mode="svg"
            class="text-muted-foreground mt-0.5 size-5 shrink-0"
            aria-hidden="true"
          />
          <div>
            <h3 class="text-highlighted text-sm font-medium">Free and open source</h3>
            <a
              href="https://github.com/igris-labs/instruo"
              target="_blank"
              rel="noopener noreferrer"
              class="text-muted-foreground hover:text-highlighted focus-visible:outline-ring mt-1 inline-block rounded-sm text-[13px] leading-6 underline underline-offset-4 focus-visible:outline-1"
              >MIT licensed. View the code.</a
            >
          </div>
        </article>
      </div>
    </section>
    <section
      class="pt-16 sm:pt-24"
      aria-labelledby="tools-title"
    >
      <div class="flex flex-wrap items-end justify-between gap-5">
        <div class="max-w-xl">
          <h2
            id="tools-title"
            class="text-highlighted text-2xl font-semibold tracking-tight sm:text-3xl"
          >
            Find your next tool.
          </h2>
          <p class="text-muted-foreground mt-3 text-base leading-7">
            Code, images, text and everyday calculations.
          </p>
        </div>
        <Button
          :as="link"
          to="/tools"
          color="secondary"
          variant="outline"
          >View all tools</Button
        >
      </div>
      <div class="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <ToolCard
          v-for="tool in featured"
          :key="tool.id"
          :resource="tool"
          compact
        />
      </div>
    </section>

    <section
      class="pt-16 sm:pt-24"
      aria-labelledby="games-title"
    >
      <div class="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2
            id="games-title"
            class="text-highlighted text-2xl font-semibold tracking-tight sm:text-3xl"
          >
            Take a break
          </h2>
          <p class="text-muted-foreground mt-3 max-w-xl text-base leading-7">
            Quick rounds, daily puzzles and familiar favourites.
          </p>
        </div>
        <Button
          :as="link"
          to="/games"
          color="secondary"
          variant="outline"
          >View all games</Button
        >
      </div>
      <div class="mt-6 grid grid-cols-2 gap-x-4 gap-y-6 lg:grid-cols-4">
        <NuxtLink
          v-for="game in games"
          :key="game.id"
          :to="game.route"
          class="group focus-visible:outline-ring rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4"
        >
          <img
            :src="game.artwork"
            :alt="`${game.title} game artwork`"
            width="1280"
            height="720"
            loading="lazy"
            class="aspect-video w-full rounded-lg object-cover transition-[filter] duration-150 group-hover:brightness-110 motion-reduce:transition-none"
          />
          <h3 class="text-highlighted mt-3 text-sm font-semibold">{{ game.title }}</h3>
          <p class="text-muted-foreground mt-1 text-xs">{{ game.category }}</p>
        </NuxtLink>
      </div>
    </section>

    <section
      class="bg-muted/50 mt-16 rounded-xl px-6 py-10 text-center sm:mt-24 sm:px-10 sm:py-14"
      aria-labelledby="start-title"
    >
      <div class="mx-auto max-w-2xl">
        <h2
          id="start-title"
          class="text-highlighted text-2xl font-semibold tracking-tight sm:text-3xl"
        >
          Ready when you are.
        </h2>
        <p class="text-muted-foreground mt-3 text-base leading-7">No account required.</p>
      </div>
      <div
        class="mt-7 flex flex-wrap justify-center gap-3"
        data-ui
      >
        <Button
          :as="link"
          to="/tools"
          >Get started</Button
        >
        <Button
          :as="link"
          to="/games"
          color="secondary"
          variant="outline"
          >Find a game</Button
        >
      </div>
    </section>
  </div>
</template>
