<script setup lang="ts">
import type { HTMLAttributes } from "vue";
import type { IconVariants } from ".";
import { computed } from "vue";
import { Icon as NuxtIcon } from "#components";
import { iconVariants } from ".";
import { cn } from "../../../lib/utils";

const props = defineProps<{
  name: string;
  variant?: IconVariants["variant"];
  size?: IconVariants["size"];
  class?: HTMLAttributes["class"];
}>();
const classes = computed(() =>
  cn(iconVariants({ variant: props.variant, size: props.size }), props.class),
);
</script>

<template>
  <NuxtIcon
    :name="props.name"
    :class="classes"
    aria-hidden="true"
  />
</template>
