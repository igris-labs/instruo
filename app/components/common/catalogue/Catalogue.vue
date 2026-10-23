<script setup lang="ts">
interface CatalogueEntry {
  id: string;
  path: string;
  title: string;
  description?: string;
  category: string;
  tags: string[];
  icon?: string;
  art?: string;
}
const props = defineProps<{
  items: CatalogueEntry[];
  kind: "tool" | "game";
  title: string;
  description: string;
  searchPlaceholder: string;
}>();
const route = useRoute();
const mounted = useMounted();
const search = ref(typeof route.query.q === "string" ? route.query.q : "");
const recentPaths = useLocalStorage<string[]>(`instruo-recent-${props.kind}s`, []);
const categoryOptions = computed(() => [
  { label: "All categories", value: "all" },
  ...[...new Set(props.items.map((item) => item.category))]
    .toSorted()
    .map((category) => ({ label: category, value: category })),
]);
const selectedCategory = computed({
  get: () =>
    categoryOptions.value.some((option) => option.value === route.query.category)
      ? String(route.query.category)
      : "all",
  set: (category: string) => {
    const query = { ...route.query };
    if (category === "all") delete query.category;
    else query.category = category;
    navigateTo({ path: route.path, query });
  },
});
const filteredItems = computed(() =>
  props.items
    .filter(
      (item) =>
        (selectedCategory.value === "all" || item.category === selectedCategory.value) &&
        [item.title, item.description, item.category, ...item.tags]
          .join(" ")
          .toLowerCase()
          .includes(search.value.trim().toLowerCase()),
    )
    .toSorted((a, b) => a.title.localeCompare(b.title)),
);
const recentItems = computed(() =>
  recentPaths.value
    .map((path) => props.items.find((item) => item.path === path))
    .filter((item): item is CatalogueEntry => Boolean(item))
    .slice(0, 4),
);
const startingPoints = computed(() =>
  [
    {
      path: "/tools/developer/json-formatter",
      category: "Developer",
      label: "Format JSON",
      detail: "Make data readable",
      icon: "i-tabler-braces",
    },
    {
      path: "/tools/image/image-resizer",
      category: "Image",
      label: "Resize an image",
      detail: "Get the right dimensions",
      icon: "i-tabler-photo",
    },
    {
      path: "/tools/security/password-generator",
      category: "Security",
      label: "Generate a password",
      detail: "Create a secure value",
      icon: "i-tabler-key",
    },
  ].filter((task) => props.items.some((item) => item.path === task.path)),
);
const categoryDetails: Record<string, string> = {
  Developer: "Inspect data, work with APIs, and prepare code.",
  "Encoder Decoder": "Move between formats without losing the meaning.",
  Everyday: "Work out dates, measurements, and everyday numbers.",
  Image: "Resize, convert, and prepare your images.",
  Productivity: "Make a decision and keep your day moving.",
  Security: "Generate, inspect, and verify sensitive values.",
  Text: "Clean up words, lines, and everything in between.",
};
const groups = computed(() =>
  categoryOptions.value.slice(1).flatMap((category) => {
    const matches = filteredItems.value.filter((item) => item.category === category.value);
    if (!matches.length) return [];
    const limited = selectedCategory.value === "all" && !search.value.trim();
    return [
      {
        category: category.label,
        total: matches.length,
        items: limited ? matches.slice(0, 6) : matches,
      },
    ];
  }),
);
function remember(item: Pick<CatalogueEntry, "path">) {
  recentPaths.value = [item.path, ...recentPaths.value.filter((path) => path !== item.path)].slice(
    0,
    8,
  );
}
function clearFilters() {
  search.value = "";
  selectedCategory.value = "all";
}
onKeyStroke("/", (event) => {
  if (
    event.metaKey ||
    event.ctrlKey ||
    event.altKey ||
    (event.target instanceof HTMLElement &&
      event.target.closest("input, textarea, select, [contenteditable]"))
  )
    return;
  event.preventDefault();
  document.getElementById(`catalogue-search-${props.kind}`)?.focus();
});
</script>

<template>
  <div class="mx-auto w-full max-w-6xl px-5 pt-10 pb-20 sm:px-8 sm:pt-14">
    <header class="max-w-2xl">
      <h1 class="text-3xl font-semibold tracking-[-0.035em]">{{ title }}</h1>
      <p class="text-foreground-muted mt-4 text-base leading-7">{{ description }}</p>
    </header>
    <section
      v-if="
        kind === 'tool' && selectedCategory === 'all' && !search.trim() && startingPoints.length
      "
      aria-label="Common tasks"
      class="bg-muted/70 mt-8 rounded-lg p-4 sm:p-5"
    >
      <h2 class="text-foreground-muted mb-4 text-xs font-medium">Start with a common task</h2>
      <div class="grid gap-2 sm:grid-cols-3 sm:gap-5">
        <NuxtLink
          v-for="task in startingPoints"
          :key="task.path"
          :to="task.path"
          class="group hover:bg-elevated focus-visible:outline-accent-foreground flex min-w-0 items-center gap-3 rounded-md p-2 transition-colors duration-150 focus-visible:outline-2 motion-reduce:transition-none"
          @click="remember(task)"
        >
          <UiIcon
            :name="task.icon"
            class="size-7 shrink-0"
            :class="toolIconClass(task.category)"
          />
          <span class="min-w-0"
            ><span class="block text-sm font-medium">{{ task.label }}</span
            ><span class="text-foreground-muted mt-1 block text-xs leading-5">{{
              task.detail
            }}</span></span
          >
        </NuxtLink>
      </div>
    </section>
    <div class="mt-10 grid items-start gap-8 lg:grid-cols-[11rem_minmax(0,1fr)] lg:gap-12">
      <nav
        :aria-label="kind === 'tool' ? 'Tool categories' : 'Game categories'"
        class="sticky top-6 hidden lg:block"
      >
        <p class="text-foreground-dimmed mb-3 px-2 text-xs">Browse by category</p>
        <UiButton
          v-for="category in categoryOptions"
          :key="category.value"
          variant="ghost"
          :aria-pressed="selectedCategory === category.value"
          :disabled="!mounted"
          class="mb-1 flex w-full justify-between gap-2 px-2 text-sm"
          :class="
            selectedCategory === category.value
              ? 'bg-muted text-foreground'
              : 'text-foreground-muted hover:bg-muted/60'
          "
          @click="selectedCategory = category.value"
        >
          {{ category.value === "all" ? `All ${kind}s` : category.label }}
          <span class="text-foreground-dimmed text-xs tabular-nums">{{
            category.value === "all"
              ? items.length
              : items.filter((item) => item.category === category.value).length
          }}</span>
        </UiButton>
      </nav>
      <div class="min-w-0">
        <div class="flex flex-wrap items-center gap-3">
          <UiInput
            :id="`catalogue-search-${kind}`"
            v-model="search"
            icon="i-tabler-search"
            :placeholder="searchPlaceholder"
            :aria-label="`Search ${kind}s`"
            class="min-w-0 flex-1 sm:max-w-sm"
            :ui="{ root: 'bg-muted' }"
          />
          <UiButton
            v-if="search || selectedCategory !== 'all'"
            variant="ghost"
            label="Clear"
            @click="clearFilters"
          />
          <span
            class="text-foreground-muted ml-auto text-xs tabular-nums"
            role="status"
            >{{ filteredItems.length }} {{ kind }}s</span
          >
          <UiSelect
            v-model="selectedCategory"
            :items="categoryOptions"
            aria-label="Category"
            class="w-full lg:hidden"
          />
        </div>
        <ClientOnly>
          <section
            v-if="recentItems.length && !search && selectedCategory === 'all'"
            aria-label="Recently opened"
            class="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2"
          >
            <h2 class="text-foreground-dimmed text-xs">Recent</h2>
            <NuxtLink
              v-for="item in recentItems"
              :key="item.id"
              :to="item.path"
              class="text-foreground-muted hover:text-foreground focus-visible:outline-accent-foreground rounded-sm text-xs leading-7 focus-visible:outline-2"
              @click="remember(item)"
              >{{ item.title }}</NuxtLink
            >
            <UiButton
              variant="ghost"
              icon="i-tabler-x"
              aria-label="Clear history"
              @click="recentPaths = []"
            />
          </section>
        </ClientOnly>
        <div
          v-if="filteredItems.length"
          class="mt-9 space-y-12"
        >
          <section
            v-for="group in groups"
            :key="group.category"
            :aria-label="group.category"
          >
            <header
              class="mb-5 flex items-start justify-between gap-4"
              :class="kind === 'tool' ? 'border-outline/60 border-b pb-5' : ''"
            >
              <div class="min-w-0">
                <h2
                  class="font-semibold tracking-tight"
                  :class="kind === 'tool' ? 'text-2xl' : 'text-lg'"
                >
                  {{ group.category }}
                  <span class="text-foreground-dimmed ml-1 text-xs font-normal tabular-nums"
                    >{{ group.total }} {{ group.total === 1 ? kind : `${kind}s` }}</span
                  >
                </h2>
                <p
                  v-if="kind === 'tool' && categoryDetails[group.category]"
                  class="text-foreground-muted mt-1 text-sm leading-6"
                >
                  {{ categoryDetails[group.category] }}
                </p>
              </div>
              <UiButton
                v-if="group.items.length < group.total"
                variant="ghost"
                :label="`View all ${group.total}`"
                :aria-label="`View all ${group.category} ${kind}s`"
                :disabled="!mounted"
                trailing-icon="i-tabler-arrow-right"
                @click="selectedCategory = group.category"
              />
            </header>
            <div
              class="grid gap-x-6"
              :class="
                kind === 'game' ? 'grid-cols-2 gap-y-7 xl:grid-cols-3' : 'gap-y-1 md:grid-cols-2'
              "
            >
              <NuxtLink
                v-for="item in group.items"
                :key="item.id"
                :to="item.path"
                :aria-label="kind === 'game' ? `Play ${item.title}` : undefined"
                class="group focus-visible:outline-accent-foreground min-w-0 rounded-md transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 motion-reduce:transition-none"
                :class="
                  kind === 'tool'
                    ? 'hover:bg-muted/60 -mx-2 flex min-h-24 items-start gap-4 px-2 py-4'
                    : ''
                "
                @click="remember(item)"
              >
                <GamePreview
                  v-if="kind === 'game'"
                  :path="item.path"
                  :title="item.title"
                  :category="item.category"
                  :art="item.art"
                  class="rounded-md"
                />
                <UiIcon
                  v-else
                  :name="item.icon || 'i-tabler-tool'"
                  class="mt-0.5 size-6 shrink-0"
                  :class="toolIconClass(item.category)"
                />
                <div
                  class="min-w-0 flex-1"
                  :class="kind === 'game' ? 'pt-3' : ''"
                >
                  <h3
                    class="decoration-outline text-sm font-medium underline-offset-4 group-hover:underline"
                  >
                    {{ item.title }}
                  </h3>
                  <p
                    class="text-foreground-muted mt-1 text-sm leading-6"
                    :class="kind === 'tool' ? 'line-clamp-2' : ''"
                  >
                    {{ kind === "game" ? item.category : item.description }}
                  </p>
                </div>
              </NuxtLink>
            </div>
          </section>
        </div>
        <div
          v-else
          class="bg-muted mt-9 rounded-lg px-6 py-12"
        >
          <h2 class="text-base font-medium">No matching {{ kind }}s</h2>
          <p class="text-foreground-muted mt-2 text-sm">Try another search or category.</p>
          <UiButton
            variant="outline"
            label="Clear filters"
            class="mt-4"
            @click="clearFilters"
          />
        </div>
      </div>
    </div>
  </div>
</template>
