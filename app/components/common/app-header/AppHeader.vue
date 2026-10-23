<script setup lang="ts">
defineProps<{ workspace?: boolean }>();
const route = useRoute();
const mounted = useMounted();
const searchOpen = useState("app-search-open", () => false);
const sidebarOpen = useState("resource-sidebar-open", () => false);
const menuOpen = ref(false);
const kind = computed(() => (route.path.startsWith("/tools") ? "tools" : "games"));
const items = computed(() =>
  [
    { label: "Home", to: "/" },
    { label: "Tools", to: "/tools" },
    { label: "Games", to: "/games" },
  ].map((item) => ({
    ...item,
    value: item.to,
    active: item.to === "/" ? route.path === "/" : route.path.startsWith(item.to),
  })),
);
</script>
<template>
  <div
    class="bg-default"
    :class="workspace ? 'border-outline/60 border-b' : ''"
  >
    <div
      class="flex items-center justify-between"
      :class="workspace ? 'h-12 pr-3' : 'mx-auto h-16 max-w-6xl px-5 sm:px-8'"
    >
      <div
        class="flex h-full items-center"
        :class="workspace ? '' : 'gap-10'"
      >
        <div
          class="flex h-full shrink-0 items-center gap-2"
          :class="workspace ? 'lg:border-outline/60 px-4 lg:w-62 lg:border-r' : ''"
        >
          <UiButton
            v-if="workspace"
            variant="ghost"
            icon="i-tabler-menu-2"
            :aria-label="`Browse ${kind}`"
            :aria-expanded="sidebarOpen"
            :disabled="!mounted"
            class="lg:hidden"
            @click="sidebarOpen = true"
          />
          <NuxtLink
            to="/"
            aria-label="Instruo home"
            class="focus-visible:outline-accent-foreground inline-flex items-center gap-2 rounded-md text-sm font-semibold focus-visible:outline-2"
          >
            <img
              src="/logo.svg"
              alt=""
              width="24"
              height="24"
              class="size-6"
            />Instruo
          </NuxtLink>
        </div>
        <UiNavigationMenu
          :items="items"
          aria-label="Main navigation"
          class="hidden sm:block"
          :class="workspace ? 'ml-5' : ''"
          :ui="{
            list: 'gap-5',
            link: 'text-sm text-foreground-muted data-akaza-active:text-accent-foreground aria-[current=page]:text-accent-foreground hover:text-accent-foreground hover:bg-transparent px-0 min-h-8 rounded-sm',
          }"
        />
      </div>
      <div class="flex items-center gap-2 sm:gap-3">
        <UiButton
          variant="ghost"
          icon="i-tabler-search"
          aria-label="Search tools and games"
          :disabled="!mounted"
          class="text-foreground-muted"
          @click="searchOpen = true"
        />
        <ThemeToggle />
        <a
          href="https://github.com/igris-labs/instruo"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Instruo on GitHub"
          class="text-foreground-muted hover:text-foreground focus-visible:outline-accent-foreground relative inline-flex size-7 items-center justify-center rounded-md focus-visible:outline-2 pointer-coarse:before:absolute pointer-coarse:before:size-11"
          ><UiIcon
            name="i-tabler-brand-github"
            class="size-5"
        /></a>
        <UiButton
          v-if="!workspace"
          variant="ghost"
          icon="i-tabler-menu-2"
          aria-label="Open navigation"
          :disabled="!mounted"
          class="sm:hidden"
          :aria-expanded="menuOpen"
          @click="menuOpen = true"
        />
      </div>
    </div>
    <UiDrawer
      v-model="menuOpen"
      side="right"
      title="Navigation"
      :ui="{ content: 'w-72 bg-default', body: 'p-4' }"
    >
      <template #header="{ close, titleId }">
        <div class="flex w-full items-center justify-between p-4">
          <h2
            :id="titleId"
            class="text-sm font-semibold"
          >
            Instruo
          </h2>
          <UiButton
            variant="ghost"
            icon="i-tabler-x"
            aria-label="Close navigation"
            @click="close"
          />
        </div>
      </template>
      <template #body>
        <UiNavigationMenu
          :items="items"
          orientation="vertical"
          aria-label="Mobile navigation"
          :ui="{
            list: 'flex-col items-stretch gap-2',
            link: 'min-h-11 px-3 text-sm data-akaza-active:bg-muted aria-[current=page]:bg-muted aria-[current=page]:text-foreground-highlighted',
          }"
          @click="menuOpen = false"
        />
      </template>
    </UiDrawer>
  </div>
</template>
