<script setup lang="ts">
import type { ListboxOption, ListboxValue } from "akaza-ui";
const open = useState("app-search-open", () => false);
const search = ref("");
const { data: tools } = useAsyncData("search-tool-entries", () =>
  queryCollection("tools").select("path", "title", "description", "icon", "tags", "category").all(),
);
const { data: games } = useAsyncData("search-game-entries", () =>
  queryCollection("games").select("path", "title", "description", "icon", "tags", "category").all(),
);
const options = computed(() =>
  [
    { label: "Tools", items: tools.value ?? [] },
    { label: "Games", items: games.value ?? [] },
  ]
    .flatMap((group) => [
      { type: "label" as const, label: group.label },
      ...group.items
        .toSorted((a, b) => a.title.localeCompare(b.title))
        .filter((item) =>
          [item.title, item.description, ...item.tags]
            .join(" ")
            .toLowerCase()
            .includes(search.value.trim().toLowerCase()),
        )
        .map((item) => ({
          type: "item" as const,
          value: item.path,
          label: item.title,
          description: item.description,
          icon: item.icon,
          iconClass:
            group.label === "Tools" ? toolIconClass(item.category) : "text-foreground-muted",
          keywords: [item.title, item.description, ...item.tags].join(" ").toLowerCase(),
        })),
    ])
    .filter(
      (option, index, items) =>
        option.type !== "label" || (items[index + 1] && items[index + 1]?.type !== "label"),
    ),
);
function matches(option: ListboxOption, query: string) {
  return option.type === "label" || String(option.keywords).includes(query.trim().toLowerCase());
}
function select(value: ListboxValue | ListboxValue[]) {
  if (typeof value !== "string" || !value.startsWith("/")) return;
  open.value = false;
  search.value = "";
  navigateTo(value);
}
onKeyStroke(["k", "K"], (event) => {
  if (!(event.metaKey || event.ctrlKey)) return;
  event.preventDefault();
  open.value = !open.value;
});
watch(open, () => {
  search.value = "";
});
</script>
<template>
  <UiDialog
    v-model:open="open"
    title="Search tools and games"
    description="Find a tool or game by name or task."
    class="top-[12dvh] max-w-2xl translate-y-0 rounded-xl sm:top-[18dvh]"
    :ui="{
      header: 'sr-only min-h-0 border-0 p-0',
      body: 'p-0',
      footer: 'justify-between px-3 py-2 text-xs text-foreground-dimmed border-outline/60',
    }"
  >
    <template #header="{ titleId }"><h2 :id="titleId">Search tools and games</h2></template>
    <template #body>
      <div class="relative">
        <UiIcon
          name="i-tabler-search"
          class="text-foreground-dimmed pointer-events-none absolute top-4 left-4 size-5"
        />
        <UiListbox
          v-model:search="search"
          model-value=""
          :options="options"
          filterable
          auto-focus
          :filter="matches"
          filter-placeholder="Search tools and games…"
          aria-label="Search results"
          :ui="{
            filter:
              'w-full rounded-none border-0 border-b border-outline/60 bg-transparent py-4 pr-4 pl-10 text-sm text-foreground placeholder:text-foreground-dimmed outline-none focus-visible:ring-0',
            content:
              'max-h-[min(55dvh,26rem)] overflow-y-auto rounded-none border-0 bg-transparent p-2 shadow-none',
            groupLabel: 'px-2 pt-3 pb-2 text-xs text-foreground-dimmed',
            option: 'min-h-12 gap-3 px-2 py-2 data-akaza-highlighted:bg-accent-soft hover:bg-muted',
          }"
          @update:model-value="select"
        >
          <template #option="{ option }">
            <UiIcon
              :name="String(option.icon || 'i-tabler-code')"
              class="size-5 shrink-0"
              :class="String(option.iconClass)"
            />
            <span class="min-w-0"
              ><span class="block text-sm font-medium">{{ option.label }}</span
              ><span class="text-foreground-muted mt-0.5 block truncate text-xs">{{
                option.description
              }}</span></span
            >
          </template>
          <template #empty
            ><p class="text-foreground-muted px-3 py-8 text-center text-sm">
              No matches. Try another name or task.
            </p></template
          >
        </UiListbox>
      </div>
    </template>
    <template #footer>
      <span class="flex items-center gap-3"
        ><span><kbd>↑↓</kbd> Navigate</span><span><kbd>↵</kbd> Open</span></span
      >
      <span><kbd>Esc</kbd> Close</span>
    </template>
  </UiDialog>
</template>
