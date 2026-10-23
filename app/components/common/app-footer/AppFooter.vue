<script setup lang="ts">
const { footer } = useAppConfig();
</script>
<template>
  <footer>
    <div class="mx-auto grid max-w-6xl gap-10 px-5 py-10 sm:grid-cols-[1.3fr_2fr] sm:px-8 sm:py-14">
      <div>
        <NuxtLink
          to="/"
          class="focus-visible:outline-info inline-flex items-center gap-2 rounded-sm text-sm font-semibold focus-visible:outline-2"
        >
          <img
            src="/logo.svg"
            alt=""
            width="20"
            height="20"
          />
          Instruo
        </NuxtLink>
        <p class="text-foreground-muted mt-4 max-w-60 text-sm leading-6">
          Free tools for small jobs.<br />Good games for short breaks.
        </p>
        <p class="text-foreground-muted mt-5 text-sm">{{ footer.credits }}</p>
      </div>
      <nav
        aria-label="Footer"
        class="grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-3"
      >
        <div
          v-for="column in footer.columns"
          :key="column.label"
        >
          <h2 class="mb-3 text-sm font-medium">{{ column.label }}</h2>
          <ul class="space-y-2">
            <li
              v-for="link in column.children"
              :key="link.label"
            >
              <NuxtLink
                :to="link.to"
                :target="link.target"
                :rel="link.target === '_blank' ? 'noopener noreferrer' : undefined"
                class="text-foreground-muted hover:text-foreground focus-visible:outline-info inline-flex min-h-7 items-center rounded-sm text-sm focus-visible:outline-2"
                >{{ link.label }}</NuxtLink
              >
            </li>
          </ul>
        </div>
      </nav>
    </div>
  </footer>
</template>
