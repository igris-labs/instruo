<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    path: string;
    title: string;
    category: string;
    icon?: string;
    art?: string;
    featured?: boolean;
  }>(),
  { icon: "i-tabler-device-gamepad-2", featured: false },
);

const slug = computed(() => props.path.split("/").at(-1) ?? "");
const source = computed(() => props.art || `/game-arts/${slug.value}.jpg`);
</script>

<template>
  <div
    class="bg-muted relative isolate aspect-video w-full min-w-0 overflow-hidden"
    aria-hidden="true"
  >
    <NuxtImg
      :src="source"
      alt=""
      width="1280"
      height="720"
      :loading="featured ? 'eager' : 'lazy'"
      sizes="sm:100vw md:50vw lg:33vw xl:25vw"
      class="absolute inset-0 size-full object-cover transition-transform duration-300 ease-out group-hover:scale-[1.025] motion-reduce:transform-none motion-reduce:transition-none"
    />
  </div>
</template>
