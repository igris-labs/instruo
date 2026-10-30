<script setup lang="ts">
import type { ResourceKind } from "../../features/catalogue/types";
import {
  categoryPresentation,
  directoryPage,
  directoryPageSize,
  quickStartSlugs,
} from "../../features/catalogue/presentation";
import { matchesResource } from "../../features/catalogue/search";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Pagination } from "../ui/pagination";
import { Select } from "../ui/select";
import ToolCard from "./ToolCard.vue";
const props = defineProps<{ kind: ResourceKind }>();
const { data: catalogue, status, error, refresh } = await useCatalogue();
const route = useRoute();
const router = useRouter();
const query = ref(typeof route.query.q === "string" ? route.query.q : "");
const category = ref(typeof route.query.category === "string" ? route.query.category : "all");
const requestedPage = ref(directoryPage(route.query.page, Number.MAX_SAFE_INTEGER));
const resultsHeading = useTemplateRef<HTMLElement>("resultsHeading");
const resources = computed(() =>
  (catalogue.value ?? []).filter((item) => item.kind === props.kind),
);
const categories = computed(() =>
  [...new Set(resources.value.map((item) => item.category))].sort((a, b) => {
    const order = Object.keys(categoryPresentation);
    return props.kind === "tool" ? order.indexOf(a) - order.indexOf(b) : a.localeCompare(b);
  }),
);
const categoryItems = computed(() => [
  {
    label: props.kind === "tool" ? "All tools" : "All games",
    value: "all",
    count: resources.value.length,
  },
  ...categories.value.map((name) => ({
    label: props.kind === "tool" ? (categoryPresentation[name]?.label ?? name) : name,
    value: name,
    count: resources.value.filter((item) => item.category === name).length,
  })),
]);
const results = computed(() =>
  resources.value
    .filter(
      (item) =>
        (category.value === "all" || category.value === item.category) &&
        matchesResource(item, query.value),
    )
    .sort((a, b) => {
      if (props.kind === "tool" && category.value === "all" && !query.value.trim()) {
        const rank = (slug: string) => {
          const index = quickStartSlugs.indexOf(slug);
          return index < 0 ? quickStartSlugs.length : index;
        };
        return rank(a.slug) - rank(b.slug) || a.title.localeCompare(b.title);
      }
      return a.title.localeCompare(b.title);
    }),
);
const page = computed({
  get: () => directoryPage(requestedPage.value, results.value.length),
  set: (value: number) => {
    requestedPage.value = value;
  },
});
const visible = computed(() =>
  results.value.slice((page.value - 1) * directoryPageSize, page.value * directoryPageSize),
);
const categoryTitle = computed(
  () => categoryItems.value.find((item) => item.value === category.value)?.label ?? category.value,
);
watch(
  () => route.query,
  (value) => {
    query.value = typeof value.q === "string" ? value.q : "";
    category.value = typeof value.category === "string" ? value.category : "all";
    requestedPage.value = directoryPage(value.page, Number.MAX_SAFE_INTEGER);
  },
);
watch([query, category, page], ([q, c, p]) => {
  const currentQuery = typeof route.query.q === "string" ? route.query.q : "";
  const currentCategory = typeof route.query.category === "string" ? route.query.category : "all";
  const currentPage = directoryPage(route.query.page, Number.MAX_SAFE_INTEGER);
  if (q === currentQuery && c === currentCategory && p === currentPage) return;
  void router.replace({
    query: {
      ...(q ? { q } : {}),
      ...(c !== "all" ? { category: c } : {}),
      ...(p > 1 ? { page: String(p) } : {}),
    },
  });
});
function clearFilters() {
  query.value = "";
  category.value = "all";
  requestedPage.value = 1;
}
function chooseCategory(value: unknown) {
  category.value = typeof value === "string" ? value : "all";
  requestedPage.value = 1;
}
async function changePage() {
  await nextTick();
  resultsHeading.value?.scrollIntoView({ block: "start" });
  resultsHeading.value?.focus({ preventScroll: true });
}
</script>
<template>
  <div class="w-full">
    <header class="mb-8 flex flex-wrap items-end justify-between gap-6">
      <div>
        <h1 class="text-highlighted text-2xl font-semibold tracking-tight sm:text-3xl">
          {{ kind === "game" ? "Pick your next break" : "Find the right tool" }}
        </h1>
        <p class="text-muted-foreground mt-3 max-w-xl text-sm leading-6">
          {{
            kind === "game"
              ? "Puzzles, quick rounds and familiar favourites. Pick one and play."
              : "Find what you need by task, or search for a tool by name."
          }}
        </p>
      </div>
      <div class="relative w-full sm:max-w-sm">
        <Icon
          name="tabler:search"
          mode="svg"
          class="text-muted-foreground pointer-events-none absolute top-1/2 left-3 z-1 size-4 -translate-y-1/2"
          aria-hidden="true"
        />
        <Input
          :model-value="query"
          variant="soft"
          :aria-label="kind === 'game' ? 'Search games' : 'Search tools'"
          :placeholder="kind === 'game' ? 'Search games…' : 'Try JSON, images, passwords…'"
          class="pl-9"
          @update:model-value="
            (value) => {
              query = String(value ?? '');
              requestedPage = 1;
            }
          "
        />
      </div>
    </header>
    <div>
      <section
        id="directory-results"
        class="[container-type:inline-size] min-w-0"
        aria-label="Directory results"
      >
        <div class="mb-5 flex flex-wrap items-center justify-between gap-3">
          <h2
            ref="resultsHeading"
            class="text-highlighted scroll-mt-24 text-xl font-semibold tracking-tight outline-none sm:text-2xl"
            tabindex="-1"
          >
            {{ query.trim() ? "Search results" : categoryTitle }}
          </h2>
          <span
            role="status"
            aria-label="Directory results"
            class="text-muted-foreground text-[13px]"
            >{{ results.length }} {{ kind }}{{ results.length === 1 ? "" : "s" }}</span
          >
          <Select
            :model-value="category"
            aria-label="Category"
            class="w-full sm:w-60"
            :options="categoryItems.map((item) => ({ label: item.label, value: item.value }))"
            @update:model-value="chooseCategory"
          />
        </div>
        <div
          v-if="error"
          role="alert"
          class="bg-muted rounded-lg p-5 text-sm"
        >
          The directory could not load.<Button
            variant="link"
            @click="refresh()"
            >Try again</Button
          >
        </div>
        <p
          v-else-if="status === 'pending'"
          role="status"
          class="text-muted-foreground py-10"
        >
          Loading directory…
        </p>
        <div
          v-else-if="!results.length"
          class="bg-muted rounded-xl p-8 text-center"
        >
          <Icon
            name="tabler:search-off"
            mode="svg"
            class="text-muted-foreground mx-auto mb-4 size-8"
            aria-hidden="true"
          />
          <h2 class="font-semibold">No matches</h2>
          <p class="text-muted-foreground mt-2 text-sm">
            Try another term or browse all categories.
          </p>
          <Button
            class="mt-5"
            color="secondary"
            variant="outline"
            @click="clearFilters"
            >Clear filters</Button
          >
        </div>
        <div
          v-else-if="kind === 'game'"
          class="grid min-h-(--results-height) grid-cols-2 content-start items-start gap-x-4 gap-y-7 [--columns:2] [--results-height:calc(var(--rows)*var(--row-height)+(var(--rows)-1)*1.75rem)] [--row-height:calc((100cqw-(var(--columns)-1)*1rem)/var(--columns)*9/16+4rem)] [--rows:round(up,calc(var(--result-count)/var(--columns)),1)] md:grid-cols-3 md:[--columns:3]"
          :style="{ '--result-count': Math.min(results.length, directoryPageSize) }"
        >
          <NuxtLink
            v-for="item in visible"
            :key="item.id"
            :to="item.route"
            class="group focus-visible:outline-ring rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4"
          >
            <img
              :src="item.artwork"
              :alt="`${item.title} artwork`"
              width="1280"
              height="720"
              loading="lazy"
              class="aspect-video w-full rounded-lg object-cover transition-[filter] duration-150 group-hover:brightness-110 motion-reduce:transition-none"
            />
            <h3 class="text-highlighted mt-3 text-sm font-semibold">{{ item.title }}</h3>
            <p class="text-muted-foreground mt-1 text-xs">{{ item.category }}</p>
          </NuxtLink>
        </div>
        <div
          v-else
          class="grid min-h-(--results-height) auto-rows-[minmax(12.5rem,auto)] content-start gap-3 [--columns:1] [--results-height:calc(var(--rows)*12.5rem+(var(--rows)-1)*0.75rem)] [--rows:round(up,calc(var(--result-count)/var(--columns)),1)] sm:grid-cols-2 sm:[--columns:2] xl:grid-cols-3 xl:[--columns:3]"
          :style="{ '--result-count': Math.min(results.length, directoryPageSize) }"
          aria-label="Tools"
        >
          <ToolCard
            v-for="item in visible"
            :key="item.id"
            :resource="item"
          />
        </div>
        <div
          v-if="results.length"
          class="mt-8 flex flex-wrap items-center justify-between gap-4"
        >
          <p class="text-muted-foreground text-[13px]">
            Showing {{ (page - 1) * directoryPageSize + 1 }}–{{
              Math.min(page * directoryPageSize, results.length)
            }}
            of {{ results.length }}
          </p>
          <Pagination
            v-if="results.length > directoryPageSize"
            :model-value="page"
            :total="results.length"
            :items-per-page="directoryPageSize"
            :sibling-count="1"
            :show-first-last="false"
            aria-label="Directory pages"
            @update:model-value="
              (value) => {
                page = value;
                changePage();
              }
            "
          />
        </div>
      </section>
    </div>
  </div>
</template>
