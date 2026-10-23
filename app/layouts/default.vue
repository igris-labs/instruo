<script setup lang="ts">
import { AppLayout as AkazaAppLayout } from "akaza-ui";
const route = useRoute();
const resourceKind = computed(() => {
  if (/^\/tools\/.+/.test(route.path)) return "tool";
  if (/^\/games\/.+/.test(route.path)) return "game";
  return null;
});
const sidebarOpen = useState("resource-sidebar-open", () => false);
const shell = useTemplateRef("shell");
const { data: tools } = useAsyncData("tool_navigation", () =>
  queryCollection("tools").select("id", "path", "title", "category", "icon").all(),
);
const { data: games } = useAsyncData("game_navigation", () =>
  queryCollection("games").select("id", "path", "title", "category", "icon").all(),
);
watch(
  () => route.path,
  async () => {
    sidebarOpen.value = false;
    await nextTick();
    shell.value?.main?.scrollTo({ top: 0 });
  },
);
</script>
<template>
  <AkazaAppLayout
    ref="shell"
    :scroll="resourceKind ? 'content' : 'page'"
    main-id="main-content"
    :ui="{
      root: 'bg-default text-foreground min-h-dvh w-full',
      header: 'z-30',
      main: 'min-w-0 outline-none',
      left: 'min-h-0',
      skipLink:
        'bg-inverted text-foreground-inverted rounded-md px-3 py-2 focus-visible:outline-2 focus-visible:outline-accent-foreground',
    }"
  >
    <template #header><AppHeader :workspace="Boolean(resourceKind)" /></template>
    <template
      v-if="resourceKind"
      #left
    >
      <ResourceSidebar
        :key="resourceKind"
        :items="(resourceKind === 'tool' ? tools : games) ?? []"
        :current-path="route.path"
        :kind="resourceKind"
      />
    </template>
    <slot />
    <template
      v-if="!resourceKind"
      #footer
      ><AppFooter
    /></template>
  </AkazaAppLayout>
</template>
