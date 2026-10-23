<script setup lang="ts">
import type { NavigationMenuItem } from "akaza-ui";
interface ResourceItem {
  id: string;
  path: string;
  title: string;
  category: string;
  icon?: string;
}
const props = defineProps<{ items: ResourceItem[]; currentPath: string; kind: "game" | "tool" }>();
const open = useState("resource-sidebar-open", () => false);
const collapsed = ref(false);
const expanded = ref<string[]>([]);
const navigation = useTemplateRef<HTMLElement>("navigation");
const scrollTop = useState(`sidebar-scroll-${props.kind}`, () => 0);
const menuItems = computed<NavigationMenuItem[]>(() => {
  const groups = new Map<string, ResourceItem[]>();
  for (const item of props.items.toSorted((a, b) => a.title.localeCompare(b.title))) {
    groups.set(item.category, [...(groups.get(item.category) ?? []), item]);
  }
  return [...groups.entries()]
    .toSorted(([a], [b]) => a.localeCompare(b))
    .map(([category, items]) => ({
      label: category,
      value: category,
      children: items.map((item) => ({
        label: item.title,
        iconClass: props.kind === "tool" ? toolIconClass(item.category) : "text-foreground-muted",
        iconName:
          item.icon || (props.kind === "tool" ? "i-tabler-tool" : "i-tabler-device-gamepad-2"),
        value: item.path,
        to: item.path,
        active: item.path === props.currentPath,
        ariaCurrent: item.path === props.currentPath ? ("page" as const) : undefined,
      })),
    }));
});
watch(
  [() => props.currentPath, () => props.items],
  () => {
    const activeCategory = props.items.find((item) => item.path === props.currentPath)?.category;
    if (activeCategory && !expanded.value.includes(activeCategory))
      expanded.value = [...expanded.value, activeCategory];
  },
  { immediate: true },
);
function scrollContainer() {
  return navigation.value?.closest<HTMLElement>(".akaza-sidebar-body");
}
function rememberScroll() {
  scrollTop.value = scrollContainer()?.scrollTop ?? 0;
}
/** Preserve navigation position while keeping the active resource discoverable. */
function restoreScroll() {
  const container = scrollContainer();
  if (!container) return;
  container.scrollTop = scrollTop.value;
  const active = container.querySelector<HTMLElement>('[aria-current="page"]');
  if (!active) return;
  const bounds = container.getBoundingClientRect();
  const rect = active.getBoundingClientRect();
  if (rect.top < bounds.top || rect.bottom > bounds.bottom) {
    container.scrollTop +=
      rect.top - bounds.top - (container.clientHeight - active.clientHeight) / 2;
  }
}
onMounted(() => nextTick(restoreScroll));
watch(
  () => props.items,
  () => nextTick(restoreScroll),
);
onBeforeUnmount(rememberScroll);
watch(
  () => props.currentPath,
  () => nextTick(restoreScroll),
  { flush: "post" },
);
</script>
<template>
  <UiSidebar
    v-model:open="open"
    v-model:collapsed="collapsed"
    breakpoint="(max-width: 1023px)"
    :aria-label="`${kind === 'tool' ? 'Tool' : 'Game'} navigation`"
    class="h-full"
    :ui="{
      panel: 'border-r border-outline/60 bg-default',
      body: 'overscroll-contain px-2 pb-3',
      header: 'h-12 px-3',
      mobileContent: 'bg-default',
    }"
  >
    <template #header>
      <NuxtLink
        :to="kind === 'tool' ? '/tools' : '/games'"
        class="flex flex-1 items-center gap-2 text-xs font-semibold"
        ><UiIcon name="i-tabler-arrow-left" />All
        {{ kind === "tool" ? "tools" : "games" }}</NuxtLink
      >
      <UiButton
        class="lg:hidden"
        variant="ghost"
        icon="i-tabler-x"
        aria-label="Close navigation"
        @click="open = false"
      />
    </template>
    <div
      ref="navigation"
      @click="rememberScroll"
    >
      <UiNavigationMenu
        v-model:expanded="expanded"
        :model-value="currentPath"
        :items="menuItems"
        orientation="vertical"
        :aria-label="`${kind} list`"
        :ui="{
          list: 'flex-col items-stretch gap-0.5',
          link: 'min-h-8 gap-2 rounded-md px-2 text-sm text-foreground-muted hover:bg-muted aria-[current=page]:bg-muted aria-[current=page]:text-foreground-highlighted',
          trigger:
            'min-h-9 w-full justify-between px-2 text-xs text-foreground-muted hover:bg-muted data-akaza-active:text-foreground',
          inlineTrigger:
            'flex min-h-9 w-full items-center gap-2 rounded-md px-2 text-left text-xs font-medium text-foreground-muted hover:bg-muted data-akaza-active:text-foreground',
          itemLabel: 'min-w-0 flex-1 truncate text-left leading-5',
          itemLeading: 'empty:hidden',
          inlineLink:
            'h-8 min-w-0 gap-2 rounded-md px-2 text-xs text-foreground-muted hover:bg-muted aria-[current=page]:bg-muted aria-[current=page]:text-foreground-highlighted',
          inlineContent: 'p-0',
          inlineList: 'space-y-0.5 pt-1 pb-3',
          groupLabel: 'mt-5 px-2 pb-2 text-[11px] font-medium text-foreground-dimmed',
        }"
      >
        <template #item-leading="{ item }">
          <UiIcon
            v-if="item.iconName"
            :name="String(item.iconName)"
            class="size-5 shrink-0"
            :class="String(item.iconClass)"
          />
        </template>
        <template #item-label="{ item }">
          <span
            :title="item.label"
            class="block truncate"
            >{{ item.label }}</span
          >
        </template>
        <template #item-trailing="{ item }">
          <UiIcon
            v-if="item.children?.length"
            name="i-tabler-chevron-down"
            class="size-3 shrink-0 transition-transform duration-150 motion-reduce:transition-none"
            :class="expanded.includes(String(item.value)) ? '' : '-rotate-90'"
          />
        </template>
      </UiNavigationMenu>
    </div>
    <template #footer>
      <UiNavigationMenu
        :items="[
          { label: 'Home', to: '/' },
          { label: 'Tools', to: '/tools' },
          { label: 'Games', to: '/games' },
        ]"
        aria-label="Site destinations"
        class="lg:hidden"
        :ui="{ list: 'justify-between gap-2 px-2 py-3', link: 'text-xs text-foreground-muted' }"
      />
    </template>
  </UiSidebar>
</template>
