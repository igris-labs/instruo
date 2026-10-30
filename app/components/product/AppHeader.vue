<script setup lang="ts">
import { resolveComponent } from "vue";
import { Button } from "../ui/button";
import { NavigationMenu } from "../ui/navigation-menu";
import { Separator } from "../ui/separator";
import BrandLogo from "./BrandLogo.vue";
defineProps<{ workspace?: boolean; section?: string; title?: string }>();
defineEmits<{ navigation: [] }>();
const route = useRoute();
const mode = useColorMode();
const search = useState("instruo-search", () => false);
const link = resolveComponent("NuxtLink");
</script>

<template>
  <div
    class="mx-auto flex h-14 w-full items-center"
    :class="workspace ? '' : 'max-w-[90rem] gap-2 px-4 sm:gap-3 sm:px-8'"
  >
    <div
      :class="
        workspace
          ? 'flex h-full min-w-0 items-center gap-2 px-3 lg:w-[276px] lg:shrink-0'
          : 'contents'
      "
    >
      <Button
        v-if="workspace"
        variant="ghost"
        shape="icon"
        class="lg:hidden"
        aria-label="Toggle navigation"
        @click="$emit('navigation')"
        ><Icon
          name="tabler:layout-sidebar"
          mode="svg"
      /></Button>
      <NuxtLink
        to="/"
        aria-label="Instruo home"
        class="text-highlighted focus-visible:outline-ring flex shrink-0 items-center gap-2.5 rounded-sm text-lg font-semibold tracking-tight focus-visible:outline-1"
        :class="workspace ? '' : 'mr-2 md:mr-4'"
      >
        <BrandLogo
          wordmark
          class="gap-2 [&>span]:max-[380px]:hidden [&>svg]:size-6"
        />
      </NuxtLink>
      <span
        v-if="workspace"
        class="text-muted-foreground border-border hidden border-l pl-2 text-[13px] sm:inline"
        >{{ route.path.startsWith("/games") ? "Games" : "Tools" }}</span
      >
      <Button
        v-if="workspace"
        variant="ghost"
        shape="icon"
        class="ml-auto"
        aria-label="Search tools and games"
        aria-haspopup="dialog"
        aria-keyshortcuts="Control+K Meta+K"
        @click="search = true"
        ><Icon
          name="tabler:search"
          mode="svg"
          class="size-4"
      /></Button>
    </div>
    <nav
      v-if="workspace"
      class="text-muted-foreground hidden min-w-0 items-center gap-2 px-6 text-xs lg:flex"
      aria-label="Breadcrumb"
    >
      <span class="shrink-0">{{ section }}</span
      ><svg
        class="size-3 shrink-0"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.75"
        aria-hidden="true"
      >
        <path d="m9 5 7 7-7 7" /></svg
      ><span
        class="text-highlighted truncate"
        aria-current="page"
        >{{ title }}</span
      >
    </nav>
    <NavigationMenu
      aria-label="Main navigation"
      :class="workspace ? 'ml-auto hidden xl:block' : 'block'"
      :items="[
        { value: '/', to: '/', label: 'Home', as: link, active: route.path === '/' },
        {
          value: '/tools',
          to: '/tools',
          label: 'Tools',
          as: link,
          active: route.path.startsWith('/tools'),
        },
        {
          value: '/games',
          to: '/games',
          label: 'Games',
          as: link,
          active: route.path.startsWith('/games'),
        },
      ]"
      :model-value="
        route.path.startsWith('/tools')
          ? '/tools'
          : route.path.startsWith('/games')
            ? '/games'
            : '/'
      "
      highlight-mode="hover"
      :ui="{ item: 'first:hidden sm:first:block', list: 'gap-0.5' }"
    />
    <div
      class="flex items-center gap-1"
      :class="workspace ? 'mr-3 ml-auto xl:ml-0' : 'ml-auto'"
    >
      <Button
        v-if="!workspace"
        variant="soft"
        color="secondary"
        class="gap-2 max-lg:w-8 max-lg:p-0 lg:w-56 lg:justify-start"
        :ui="{ content: 'min-w-0 w-full' }"
        aria-label="Search tools and games"
        aria-haspopup="dialog"
        aria-keyshortcuts="Control+K Meta+K"
        @click="search = true"
        ><Icon
          name="tabler:search"
          mode="svg"
          class="size-4"
        /><span
          class="text-muted-foreground hidden min-w-0 truncate text-left text-[13px] lg:inline"
          >Search tools and games…</span
        ></Button
      >
      <Separator
        orientation="vertical"
        class="mx-1 hidden data-[akaza-orientation=vertical]:h-5 sm:block"
      />
      <Button
        variant="ghost"
        shape="icon"
        :aria-label="mode.value === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'"
        @click="mode.preference = mode.value === 'dark' ? 'light' : 'dark'"
        ><ClientOnly
          ><Icon
            :name="mode.value === 'dark' ? 'tabler:sun' : 'tabler:moon'"
            mode="svg" /><template #fallback><span class="size-3.5" /></template></ClientOnly
      ></Button>
      <Button
        as="a"
        href="https://github.com/igris-labs/instruo"
        target="_blank"
        rel="noopener noreferrer"
        variant="ghost"
        shape="icon"
        aria-label="Instruo on GitHub"
        class="hidden sm:inline-flex"
        ><Icon
          name="tabler:brand-github"
          mode="svg"
      /></Button>
    </div>
  </div>
</template>
