<script setup lang="ts">
import type { SidebarItem } from "../components/ui/sidebar";
import { useSidebar } from "akaza-ui";
import AppHeader from "../components/product/AppHeader.vue";
import { AppLayout } from "../components/ui/app-layout";
import { Button } from "../components/ui/button";
import { Sidebar } from "../components/ui/sidebar";
import { categoryPresentation } from "../features/catalogue/presentation";

const { data: catalogue } = await useCatalogue();
const route = useRoute();
const layout = useTemplateRef<InstanceType<typeof AppLayout>>("layout");
const navigation = useTemplateRef<InstanceType<typeof Sidebar>>("navigation");
const nav = useTemplateRef<HTMLElement>("navigationRegion");
const sidebar = useSidebar(navigation);
const kind = computed(() => (route.path.startsWith("/games") ? "game" : "tool"));
const resource = computed(() => catalogue.value?.find((item) => item.route === route.path));
const currentSection = computed(() =>
  resource.value
    ? kind.value === "tool"
      ? (categoryPresentation[resource.value.category]?.label ?? resource.value.category)
      : resource.value.category
    : "Browse",
);
const currentTitle = computed(
  () => resource.value?.title ?? (kind.value === "tool" ? "All tools" : "All games"),
);
const link = resolveComponent("NuxtLink");
const icons = computed<Record<string, string>>(() => ({
  ...Object.fromEntries((catalogue.value ?? []).map((item) => [item.route, item.icon])),
  "/tools": "tabler:tools",
  "/games": "tabler:device-gamepad-2",
}));
const items = computed<SidebarItem[]>(() => {
  const resources = (catalogue.value ?? []).filter((item) => item.kind === kind.value);
  const categories = [...new Set(resources.map((item) => item.category))].sort((a, b) =>
    kind.value === "tool"
      ? Object.keys(categoryPresentation).indexOf(a) - Object.keys(categoryPresentation).indexOf(b)
      : a.localeCompare(b),
  );
  return [
    { label: "Browse", value: "browse", type: "label" },
    { label: "All tools", value: "/tools", to: "/tools", as: link },
    { label: "All games", value: "/games", to: "/games", as: link },
    ...categories.flatMap((category): SidebarItem[] => [
      {
        label:
          kind.value === "tool" ? (categoryPresentation[category]?.label ?? category) : category,
        value: `category:${category}`,
        type: "label",
      },
      ...resources
        .filter((item) => item.category === category)
        .map((item) => ({
          label: item.title,
          value: item.route,
          to: item.route,
          as: link,
        })),
    ]),
  ];
});
async function revealSelection() {
  await nextTick();
  nav.value?.querySelector('[aria-current="page"]')?.scrollIntoView({ block: "nearest" });
}
watch(
  () => route.path,
  async () => {
    await revealSelection();
    sidebar.closeMobile();
  },
);
onMounted(revealSelection);
</script>
<template>
  <AppLayout
    ref="layout"
    scroll="page"
    sticky-header
    sticky-sides
    :ui="{
      root: 'min-h-dvh bg-background text-foreground',
      header: 'z-20 h-14 border-b border-border/60 bg-background px-0',
      left: 'max-lg:w-0',
      main: 'min-w-0 outline-none',
    }"
  >
    <template #header
      ><AppHeader
        workspace
        :section="currentSection"
        :title="currentTitle"
        @navigation="sidebar.toggle()"
    /></template>
    <template #left>
      <div ref="navigationRegion">
        <Sidebar
          ref="navigation"
          variant="soft"
          mode="ungrouped"
          design="standard"
          :items="items"
          :model-value="route.path"
          navigation-label="Resources"
          :default-size="276"
          :mobile-size="288"
          :resizable="false"
          breakpoint="(max-width: 1023px)"
          aria-label="Resource navigation"
          :close-on-navigate="true"
          :ui="{
            root: 'h-[calc(100dvh-3.5rem)]',
            navigation: { track: 'hidden', list: '[--sidebar-group-gap:20px]' },
          }"
        >
          <template #header="{ isMobile, closeMobile }">
            <div class="flex w-full items-center justify-between gap-3">
              <span class="text-highlighted text-sm font-semibold">{{
                kind === "tool" ? "Tools" : "Games"
              }}</span>
              <Button
                v-if="isMobile"
                variant="ghost"
                shape="icon"
                aria-label="Close navigation"
                @click="closeMobile"
                ><Icon
                  name="tabler:x"
                  mode="svg"
              /></Button>
            </div>
          </template>
          <template #item-leading="{ item }"
            ><Icon
              :name="icons[String(item.value)] ?? 'tabler:folder'"
              mode="svg"
              class="size-4 shrink-0"
              aria-hidden="true"
          /></template>
          <template #item-label="{ item }"
            ><span
              :title="item.label"
              class="truncate"
              >{{ item.label }}</span
            ></template
          >
          <template #footer>
            <a
              href="https://igrislabs.com"
              target="_blank"
              rel="noopener noreferrer"
              class="hover:text-highlighted inline-flex items-center gap-2"
            >
              <Icon
                name="tabler:arrow-up-left"
                mode="svg"
                class="size-3.5"
                aria-hidden="true"
              />
              Igris Labs · Instruo
            </a>
          </template>
        </Sidebar>
      </div>
    </template>
    <div class="mx-auto min-h-[calc(100dvh-3.5rem)] w-full max-w-[78rem] px-5 pt-12 pb-24 sm:px-8">
      <slot />
    </div>
  </AppLayout>
</template>
