<script setup lang="ts">
const { data: tools } = await useAsyncData("tools", () => queryCollection("tools").all());

useSeoMeta({
  title: "All browser tools",
  description:
    "Search free browser utilities for image resizing, password generation, hashing, timestamp conversion, text, and data.",
});
</script>

<template>
  <Catalogue
    :items="tools ?? []"
    kind="tool"
    title="Tools"
    description="Find the utility for your next task. Open it and get to work."
    search-placeholder="Search tools, categories, or tasks…"
  />
</template>
