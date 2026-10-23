<script setup lang="ts">
import { NuxtLink } from "#components";
import JsonFormatter from "~/components/tools/developer/json-formatter/JsonFormatter.vue";

const landing = useTemplateRef<HTMLElement>("landing");
useLandingMotion(landing);
const [{ data: tools }, { data: games }] = await Promise.all([
  useAsyncData("home_tools", () =>
    queryCollection("tools")
      .select("id", "path", "title", "description", "category", "tags", "icon")
      .all(),
  ),
  useAsyncData("home_games", () =>
    queryCollection("games")
      .select("id", "path", "title", "description", "category", "tags", "icon")
      .all(),
  ),
]);
const toolPaths = [
  "/tools/developer/json-formatter",
  "/tools/image/image-resizer",
  "/tools/security/password-generator",
  "/tools/developer/timestamp-converter",
];
const gamePaths = [
  "/games/arcade/flappy-bird",
  "/games/number/2048",
  "/games/word/wordle",
  "/games/logic/lights-out",
];
const featuredTools = computed(() =>
  toolPaths.flatMap((path) => tools.value?.find((item) => item.path === path) ?? []),
);
const featuredGames = computed(() =>
  gamePaths.flatMap((path) => games.value?.find((item) => item.path === path) ?? []),
);
const sample =
  '{"project":"Instruo","tools":["format","convert","create"],"accountRequired":false}';
useSeoMeta({
  title: "Free browser tools and games",
  description:
    "Free tools for code, text, images, and everyday calculations. No account required. Plus browser games for your next break.",
});
</script>

<template>
  <div
    ref="landing"
    class="mx-auto w-full max-w-6xl px-5 sm:px-8"
  >
    <section
      aria-labelledby="home-heading"
      class="pt-14 sm:pt-20 lg:pt-24"
    >
      <h1
        id="home-heading"
        class="max-w-4xl text-[clamp(3.25rem,7.5vw,5.75rem)] leading-[1.04] font-semibold tracking-[-0.055em]"
      >
        <span class="block overflow-hidden pb-1"
          ><span
            data-line
            class="block"
            >Small tasks.</span
          ></span
        >
        <span class="block overflow-hidden pb-2"
          ><span
            data-line
            class="block"
            >Done well.</span
          ></span
        >
      </h1>
      <div
        data-reveal
        class="mt-6 flex flex-col justify-between gap-7 sm:mt-7 md:flex-row md:items-end"
      >
        <p class="text-foreground-muted max-w-lg text-base leading-7 sm:text-lg sm:leading-8">
          Free browser tools for code, text, images, and everyday calculations. Open a tool and get
          back to your day.
        </p>
        <div class="flex shrink-0 items-center gap-6 pb-1">
          <UiButton
            :as="NuxtLink"
            to="/tools"
            label="Browse tools"
            trailing-icon="i-tabler-arrow-right"
          />
          <NuxtLink
            to="/games"
            class="text-foreground-muted hover:text-foreground focus-visible:outline-info inline-flex min-h-11 items-center gap-2 rounded-sm text-sm focus-visible:outline-2"
          >
            Play a game
            <UiIcon
              name="i-tabler-arrow-up-right"
              class="size-4"
            />
          </NuxtLink>
        </div>
      </div>
      <section
        data-reveal
        aria-labelledby="demo-heading"
        class="mt-12 sm:mt-16"
      >
        <div class="mb-4 flex flex-wrap items-baseline justify-between gap-3">
          <h2
            id="demo-heading"
            class="text-sm font-medium"
          >
            Try it. Make messy JSON readable.
          </h2>
          <NuxtLink
            to="/tools/developer/json-formatter"
            class="text-foreground-muted hover:text-foreground focus-visible:outline-info inline-flex min-h-7 items-center gap-2 rounded-sm text-xs focus-visible:outline-2"
          >
            Open JSON Formatter <UiIcon name="i-tabler-arrow-up-right" />
          </NuxtLink>
        </div>
        <div data-ui>
          <JsonFormatter
            mode="format"
            :initial-value="sample"
            :rows="8"
          />
        </div>
      </section>
    </section>

    <section
      aria-labelledby="tools-heading"
      class="grid gap-8 py-20 sm:gap-12 sm:py-28 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.45fr)] lg:gap-20"
    >
      <div data-reveal>
        <h2
          id="tools-heading"
          class="max-w-sm text-3xl leading-tight font-semibold tracking-[-0.035em] sm:text-4xl"
        >
          Find the right tool.<br />Skip the setup.
        </h2>
        <p class="text-foreground-muted mt-5 max-w-sm text-base leading-7">
          A quick conversion. A cleaner file. A value you need right now. Useful things, without
          another account.
        </p>
        <NuxtLink
          to="/tools"
          class="hover:text-foreground-muted focus-visible:outline-info mt-6 inline-flex min-h-11 items-center gap-2 rounded-sm text-sm font-medium focus-visible:outline-2"
        >
          Explore all tools
          <UiIcon
            name="i-tabler-arrow-right"
            class="size-4"
          />
        </NuxtLink>
      </div>
      <div class="min-w-0">
        <NuxtLink
          v-for="item in featuredTools"
          :key="item.id"
          :to="item.path"
          data-reveal
          class="group hover:bg-muted/60 focus-visible:outline-info flex min-h-20 items-center gap-4 rounded-md px-1 py-4 transition-colors duration-150 focus-visible:outline-2 motion-reduce:transition-none"
        >
          <UiIcon
            :name="item.icon || 'i-tabler-tool'"
            class="size-5 shrink-0"
            :class="toolIconClass(item.category)"
          />
          <span class="min-w-0 flex-1">
            <span class="block text-sm font-medium">{{ item.title }}</span>
            <span class="text-foreground-muted mt-1 block text-base leading-7">{{
              item.description
            }}</span>
          </span>
          <UiIcon
            name="i-tabler-arrow-up-right"
            class="text-foreground-dimmed size-4 shrink-0 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 motion-reduce:transform-none"
          />
        </NuxtLink>
      </div>
    </section>

    <section
      aria-labelledby="games-heading"
      class="pb-20 sm:pb-28"
    >
      <header
        data-reveal
        class="mb-7 flex flex-wrap items-end justify-between gap-5 sm:mb-9"
      >
        <div>
          <h2
            id="games-heading"
            class="text-3xl font-semibold tracking-[-0.035em] sm:text-4xl"
          >
            A little room to play.
          </h2>
          <p class="text-foreground-muted mt-4 text-base leading-7">
            Close the spreadsheet. Open a game. Your next break is right here.
          </p>
        </div>
        <NuxtLink
          to="/games"
          class="hover:text-foreground-muted focus-visible:outline-info inline-flex min-h-11 items-center gap-2 rounded-sm text-sm font-medium focus-visible:outline-2"
        >
          All games
          <UiIcon
            name="i-tabler-arrow-right"
            class="size-4"
          />
        </NuxtLink>
      </header>
      <div class="grid grid-cols-2 gap-x-4 gap-y-7 sm:gap-x-6 sm:gap-y-9">
        <NuxtLink
          v-for="game in featuredGames"
          :key="game.id"
          :to="game.path"
          :aria-label="`Play ${game.title}`"
          data-reveal
          class="group focus-visible:outline-info min-w-0 rounded-md focus-visible:outline-2 focus-visible:outline-offset-4"
        >
          <GamePreview
            :path="game.path"
            :title="game.title"
            :category="game.category"
            class="rounded-md"
          />
          <h3 class="mt-3 text-base font-medium">{{ game.title }}</h3>
          <p class="text-foreground-muted mt-1 text-sm">{{ game.category }}</p>
        </NuxtLink>
      </div>
    </section>
  </div>
</template>
