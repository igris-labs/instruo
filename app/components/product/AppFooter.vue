<script setup lang="ts">
import BrandLogo from "./BrandLogo.vue";

const groups = [
  {
    title: "Explore",
    links: [
      { label: "Tools", to: "/tools" },
      { label: "Games", to: "/games" },
    ],
  },
  {
    title: "Project",
    links: [
      { label: "GitHub", to: "https://github.com/igris-labs/instruo" },
      { label: "Report an issue", to: "https://github.com/igris-labs/instruo/issues" },
      { label: "Igris Labs", to: "https://igrislabs.com" },
    ],
  },
  {
    title: "Other products",
    links: [
      { label: "Initera", to: "https://initera.app" },
      { label: "Inspira UI", to: "https://inspira-ui.com" },
      { label: "Inspira UI Pro", to: "https://pro.inspira-ui.com" },
      { label: "Akaza UI", to: "https://akaza-ui.com" },
    ],
  },
];
</script>
<template>
  <div
    class="mx-auto grid w-full max-w-[90rem] gap-10 px-5 py-12 text-sm sm:px-8 lg:grid-cols-[1.3fr_2fr]"
  >
    <div>
      <NuxtLink
        to="/"
        aria-label="Instruo home"
        class="text-highlighted focus-visible:outline-ring inline-flex items-center gap-3 rounded-sm text-[2rem] leading-10 font-semibold tracking-tight focus-visible:outline-1"
        ><BrandLogo
          wordmark
          class="[&_svg]:size-9"
      /></NuxtLink>
      <p class="mt-3 text-sm leading-6">Tools for everyday work. Games for a break.</p>
      <p class="text-muted-foreground mt-2 max-w-72 text-[13px] leading-5">
        Free and open source. Built by Igris Labs.
      </p>
      <p class="text-muted-foreground mt-6 text-[13px] leading-6">
        Made by
        <a
          href="https://rahulv.dev"
          class="hover:text-highlighted focus-visible:outline-ring rounded-sm underline underline-offset-4 focus-visible:outline-1"
          >Rahul Vashishtha</a
        >.
      </p>
    </div>
    <nav
      class="grid grid-cols-2 gap-8 sm:grid-cols-3"
      aria-label="Footer navigation"
    >
      <div
        v-for="group in groups"
        :key="group.title"
      >
        <h2 class="text-highlighted mb-3 text-sm font-medium">{{ group.title }}</h2>
        <ul class="space-y-1">
          <li
            v-for="item in group.links"
            :key="item.to"
          >
            <NuxtLink
              :to="item.to"
              class="text-muted-foreground hover:text-highlighted focus-visible:outline-ring inline-flex min-h-8 items-center rounded-sm text-[13px] leading-5 transition-colors duration-150 focus-visible:outline-1 motion-reduce:transition-none pointer-coarse:min-h-11"
              >{{ item.label }}</NuxtLink
            >
          </li>
        </ul>
      </div>
    </nav>
  </div>
</template>
