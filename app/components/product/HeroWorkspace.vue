<script setup lang="ts">
import { computed, ref, resolveComponent } from "vue";
import CodeBlock from "../code/CodeBlock.vue";
import { Button } from "../ui/button";
import { Tabs } from "../ui/tabs";

defineProps<{ game?: { title: string; route: string; artwork?: string } }>();
const link = resolveComponent("NuxtLink");
const format = ref("json");
const colors = [
  { name: "Sage", hex: "#8fae9b", rgb: "143, 174, 155" },
  { name: "Sky", hex: "#87aaca", rgb: "135, 170, 202" },
  { name: "Apricot", hex: "#e6a37e", rgb: "230, 163, 126" },
];
const color = ref(colors[0]!);
const code = computed(() =>
  format.value === "json"
    ? '{\n  "name": "Instruo",\n  "local": true,\n  "signup": false\n}'
    : "name: Instruo\nlocal: true\nsignup: false",
);
</script>

<template>
  <div
    class="bg-muted/60 mt-12 w-full rounded-2xl p-3 sm:mt-28 sm:p-5"
    data-testid="hero-showcase"
    data-ui
  >
    <div class="text-left">
      <div
        class="grid grid-cols-2 gap-3 sm:grid-cols-[1.35fr_1fr] sm:gap-4 lg:grid-cols-[0.95fr_1.25fr_0.85fr]"
      >
        <article
          class="bg-background col-span-2 grid grid-rows-[auto_minmax(0,1fr)_auto] gap-4 rounded-xl p-4 sm:col-span-1 sm:row-span-2 sm:p-5 lg:col-start-2 lg:row-span-1"
          aria-labelledby="hero-code-title"
        >
          <div>
            <h2
              id="hero-code-title"
              class="text-highlighted text-xl leading-tight font-medium tracking-tight sm:text-2xl"
            >
              A little less busywork.
            </h2>
            <p class="text-muted-foreground mt-2 text-sm leading-6">Make messy data make sense.</p>
          </div>
          <Tabs
            v-model="format"
            :items="[
              { value: 'json', label: 'JSON' },
              { value: 'yaml', label: 'YAML' },
            ]"
            aria-label="Preview code format"
            :ui="{
              root: 'gap-3',
              panels: 'grid min-h-36',
              panel: 'hidden! data-[akaza-state=active]:grid!',
            }"
          >
            <template #panel-json
              ><CodeBlock
                :code="code"
                language="json"
                class="[&_textarea]:h-full [&_textarea]:min-h-36"
            /></template>
            <template #panel-yaml
              ><CodeBlock
                :code="code"
                language="yaml"
                class="[&_textarea]:h-full [&_textarea]:min-h-36"
            /></template>
          </Tabs>
          <div class="flex items-center justify-between gap-2">
            <span class="text-success inline-flex items-center gap-1.5 text-xs"
              ><Icon
                name="tabler:circle-check"
                mode="svg"
                class="size-4"
                aria-hidden="true"
              />Valid {{ format.toUpperCase() }}</span
            >
            <Button
              :as="link"
              :to="format === 'json' ? '/tools/json-formatter' : '/tools/json-yaml'"
              color="secondary"
              variant="outline"
              >Open {{ format === "json" ? "formatter" : "converter"
              }}<Icon
                name="tabler:arrow-up-right"
                mode="svg"
            /></Button>
          </div>
        </article>

        <NuxtLink
          v-if="game"
          :to="game.route"
          class="group focus-visible:outline-ring relative isolate row-start-2 min-h-48 overflow-hidden rounded-xl bg-neutral-950 text-white outline-offset-4 focus-visible:outline-2 sm:col-start-2 sm:row-start-1 lg:col-start-1 lg:row-start-1"
          :aria-label="`Play ${game.title}`"
        >
          <img
            :src="game.artwork"
            alt=""
            width="1280"
            height="720"
            fetchpriority="high"
            class="absolute inset-0 -z-20 size-full object-cover object-[42%_center] transition-transform duration-500 group-hover:scale-105 motion-reduce:transition-none"
          />
          <div
            class="absolute inset-0 -z-10 bg-linear-to-t from-black/90 via-black/10 to-black/35"
          />
          <div class="flex h-full min-h-48 flex-col justify-between gap-10 p-4 sm:p-5">
            <p class="max-w-36 text-lg leading-tight font-medium sm:text-xl">A little more play.</p>
            <div class="flex items-end justify-between gap-2">
              <div>
                <p class="text-sm font-semibold">{{ game.title }}</p>
                <p class="mt-1 text-xs text-white/80">Make time for a break.</p>
              </div>
              <Icon
                name="tabler:arrow-up-right"
                mode="svg"
                class="size-5 shrink-0"
                aria-hidden="true"
              />
            </div>
          </div>
        </NuxtLink>

        <div
          class="grid grid-rows-1 gap-3 sm:col-start-2 sm:row-start-2 sm:gap-4 lg:col-start-3 lg:row-start-1 lg:grid-rows-[auto_auto]"
        >
          <article
            class="bg-background grid grid-rows-[auto_minmax(0,1fr)_auto] gap-3 overflow-hidden rounded-xl p-4 sm:p-5"
            aria-label="Interactive color preview"
          >
            <div class="flex items-start justify-between gap-3">
              <div class="min-w-0">
                <p class="text-muted-foreground text-xs font-medium">Color converter</p>
                <p class="text-highlighted mt-2 text-base leading-none tracking-tight sm:text-lg">
                  {{ color.hex.toUpperCase() }}
                </p>
              </div>
              <span
                :style="{ backgroundColor: color.hex }"
                class="hidden size-10 shrink-0 rounded-md transition-colors duration-200 motion-reduce:transition-none sm:block"
                aria-hidden="true"
              />
            </div>
            <div class="space-y-3">
              <div
                class="-mx-1 flex flex-col gap-1 sm:flex-row sm:flex-wrap"
                role="group"
                aria-label="Preview colors"
              >
                <Button
                  v-for="sample in colors"
                  :key="sample.hex"
                  shape="icon"
                  color="secondary"
                  variant="ghost"
                  :aria-label="`Preview ${sample.name}`"
                  :aria-pressed="color.hex === sample.hex"
                  class="h-8 w-full justify-start rounded-md p-1 sm:size-8! sm:justify-center sm:rounded-full!"
                  :ui="{ content: 'gap-2' }"
                  :class="color.hex === sample.hex && 'ring-foreground/50 ring-1'"
                  @click="color = sample"
                >
                  <span
                    class="size-5 rounded-full"
                    :style="{ backgroundColor: sample.hex }"
                  />
                  <span class="text-muted-foreground text-xs sm:hidden">{{ sample.name }}</span>
                </Button>
              </div>
              <p class="text-muted-foreground hidden text-xs sm:block">rgb({{ color.rgb }})</p>
            </div>
            <Button
              :as="link"
              to="/tools/color-converter"
              color="secondary"
              variant="outline"
              class="justify-self-end"
              aria-label="Open color converter"
              >Convert<span class="hidden sm:inline"> colour</span
              ><Icon
                name="tabler:arrow-up-right"
                mode="svg"
            /></Button>
          </article>
          <div
            class="bg-background hidden content-start gap-2 rounded-xl p-5 lg:grid"
            aria-label="Local processing privacy"
          >
            <div class="flex items-center gap-2">
              <Icon
                name="tabler:shield-lock"
                mode="svg"
                class="text-muted-foreground size-4 shrink-0"
                aria-hidden="true"
              />
              <p class="text-highlighted text-sm font-medium">Your input stays yours.</p>
            </div>
            <p class="text-muted-foreground text-xs leading-5">
              Local tools. No uploads.<br />No account to create.
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
