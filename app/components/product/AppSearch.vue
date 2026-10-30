<script setup lang="ts">
import type { ListboxOption } from "akaza-ui";
import { computed, nextTick, onBeforeUnmount, onMounted, ref, useTemplateRef, watch } from "vue";
import { categoryPresentation } from "../../features/catalogue/presentation";
import { matchesResource } from "../../features/catalogue/search";

import { Dialog } from "../ui/dialog";
import { Input } from "../ui/input";
import { Listbox } from "../ui/listbox";

interface SearchResult {
  id: string;
  title: string;
  detail: string;
  section: string;
  icon: string;
}
const open = defineModel<boolean>("open", { required: true });
const query = ref("");
const activeIndex = ref(0);
const searchField = useTemplateRef<InstanceType<typeof Input>>("searchField");
function pinDialog() {
  if (!open.value) return;
  const dialog = searchField.value?.$el?.closest('[role="dialog"]') as HTMLElement | null;
  if (!dialog) return;
  const viewport = window.visualViewport;
  const height = viewport?.height ?? window.innerHeight;
  dialog.style.top = `${(viewport?.offsetTop ?? 0) + Math.max(16, (height - dialog.offsetHeight) / 2)}px`;
  dialog.style.translate = "-50% 0";
}
const route = useRoute();
const { data: catalogue, status, error, refresh: execute } = await useCatalogue();
const pages = computed<SearchResult[]>(() =>
  (catalogue.value ?? [])
    .filter((resource) => matchesResource(resource, query.value))
    .map((resource) => ({
      id: resource.route,
      title: resource.title,
      detail: resource.description,
      section:
        resource.kind === "game"
          ? `Games · ${resource.category}`
          : (categoryPresentation[resource.category]?.label ?? resource.category),
      icon: resource.icon,
    })),
);
const results = computed(() => {
  return pages.value.sort(
    (a, b) => a.section.localeCompare(b.section) || a.title.localeCompare(b.title),
  );
});
const options = computed<ListboxOption[]>(() =>
  results.value.flatMap((result, index) => [
    ...(results.value[index - 1]?.section === result.section
      ? []
      : [{ type: "label" as const, label: result.section }]),
    { value: result.id, label: result.title },
  ]),
);
const active = computed(() => results.value[activeIndex.value]);
const activeId = computed(() => {
  const index = options.value.findIndex(
    (option) => option.value === active.value?.id && option.type !== "label",
  );
  return index < 0 ? undefined : `instruo-search-results-content-option-${index}`;
});
const resultMap = computed(() => new Map(results.value.map((result) => [result.id, result])));
async function choose(value: unknown) {
  if (typeof value !== "string" || !resultMap.value.has(value)) return;
  open.value = false;
  await navigateTo(value);
}
function highlight(option?: ListboxOption) {
  const index = results.value.findIndex((result) => result.id === option?.value);
  if (index >= 0) activeIndex.value = index;
}
function onInputKeydown(event: KeyboardEvent) {
  if (event.isComposing) return;
  if (event.key === "ArrowDown" || event.key === "ArrowUp") {
    event.preventDefault();
    if (results.value.length) {
      activeIndex.value =
        (activeIndex.value + (event.key === "ArrowDown" ? 1 : -1) + results.value.length) %
        results.value.length;
    }
  } else if (event.key === "Enter" && active.value) {
    event.preventDefault();
    void choose(active.value.id);
  }
}
function onShortcut(event: KeyboardEvent) {
  if (
    event.isComposing ||
    event.repeat ||
    event.altKey ||
    !(event.metaKey || event.ctrlKey) ||
    event.key.toLowerCase() !== "k"
  )
    return;
  event.preventDefault();
  open.value = !open.value;
}
watch(results, () => {
  activeIndex.value = 0;
});
watch(activeId, async (id) => {
  await nextTick();
  if (open.value && id) document.getElementById(id)?.scrollIntoView({ block: "nearest" });
});
watch(open, async (value) => {
  query.value = "";
  activeIndex.value = 0;
  if (value && status.value === "idle") void execute();
  await nextTick();
  // Keep the opening position while result changes resize only the lower edge.
  if (value) pinDialog();
});
watch(
  () => route.fullPath,
  () => {
    open.value = false;
  },
);
onMounted(() => {
  window.addEventListener("keydown", onShortcut);
  window.addEventListener("resize", pinDialog);
  window.visualViewport?.addEventListener("resize", pinDialog);
});
onBeforeUnmount(() => {
  window.removeEventListener("keydown", onShortcut);
  window.removeEventListener("resize", pinDialog);
  window.visualViewport?.removeEventListener("resize", pinDialog);
});
</script>

<template>
  <Dialog
    v-model="open"
    title="Search tools and games"
    width="lg"
    class="max-h-[calc(100dvh-2rem)] overflow-hidden rounded-xl"
    :ui="{ header: 'sr-only', body: 'p-0', footer: 'hidden' }"
  >
    <template #body>
      <div class="border-border flex items-center gap-2 border-b px-3">
        <Icon
          name="tabler:search"
          class="text-muted-foreground size-4 shrink-0"
          aria-hidden="true"
        />
        <Input
          ref="searchField"
          v-model="query"
          variant="bare"
          size="md"
          class="h-12 rounded-none border-0 bg-transparent px-0 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 data-akaza-focused:ring-0"
          aria-label="Search tools and games"
          placeholder="Search tools and games…"
          role="combobox"
          aria-autocomplete="list"
          :aria-expanded="open"
          aria-controls="instruo-search-results-content"
          :aria-activedescendant="activeId"
          autocomplete="off"
          @keydown="onInputKeydown"
        />
        <kbd class="border-border text-muted-foreground rounded border px-1.5 py-0.5 text-[10px]"
          >Esc</kbd
        >
      </div>
      <Listbox
        id="instruo-search-results"
        aria-label="Tools and games"
        :options="options"
        :model-value="active?.id ?? ''"
        :ui="{
          root: 'rounded-none border-0 bg-transparent',
          content: 'max-h-[min(26rem,52dvh)] p-1.5 outline-none',
          option:
            'min-h-8 gap-2.5 px-2 text-[13px] hover:before:bg-transparent data-akaza-highlighted:before:bg-transparent data-[akaza-state=checked]:bg-muted data-[akaza-state=checked]:before:bg-transparent',
          groupLabel: 'px-2 pt-3 pb-1 text-[11px] font-medium text-dimmed',
        }"
        @value-change="choose"
        @highlight-change="highlight"
      >
        <template #option="{ value }">
          <Icon
            :name="resultMap.get(String(value))?.icon ?? 'tabler:hash'"
            mode="svg"
            :size="16"
            class="text-muted-foreground size-4 shrink-0"
            aria-hidden="true"
          />
          <span class="min-w-0 flex-1 truncate">{{ resultMap.get(String(value))?.title }}</span>
          <span
            v-if="query"
            class="text-dimmed max-w-32 truncate text-xs"
            >{{ resultMap.get(String(value))?.detail }}</span
          >
        </template>
        <template #empty>
          <span role="status">{{
            status === "pending"
              ? "Loading tools and games…"
              : error
                ? "Search unavailable. Try again shortly."
                : "No matching tools or games"
          }}</span>
        </template>
      </Listbox>
      <div
        class="border-border text-muted-foreground flex items-center justify-between border-t px-3 py-2 text-[11px]"
      >
        <span><kbd>↑↓</kbd> Navigate <span class="mx-2">·</span> <kbd>↵</kbd> Open</span>
        <span><kbd>Esc</kbd> Close</span>
      </div>
    </template>
  </Dialog>
</template>
