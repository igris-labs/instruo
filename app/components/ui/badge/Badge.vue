<script setup lang="ts">
import type { BadgeVariants } from ".";
import { computed } from "vue";
import { badgeDefaults, badgeVariants } from ".";
import { cn } from "../../../lib/utils";

interface Props {
  label?: string | number;
  tone?: string;
  variant?: BadgeVariants["variant"];
  size?: BadgeVariants["size"];
  class?: string;
  dot?: boolean;
}

const { label, tone, variant, size, class: customClass, dot = false } = defineProps<Props>();

const classes = computed(() =>
  cn(
    badgeVariants({ variant, size }),
    {
      "border-error/20 bg-error/10 text-error": tone === "error",
      "border-warning/20 bg-warning/10 text-warning": tone === "warning",
      "border-success/20 bg-success/10 text-success": tone === "success",
      "border-info/20 bg-info/10 text-info": tone === "info",
    },
    customClass,
  ),
);

const resolvedSize = computed(() => size ?? badgeDefaults.size);
</script>

<template>
  <span :class="classes"
    ><span
      v-if="dot && label"
      class="mr-1.5 shrink-0 rounded-full bg-current"
      :class="[resolvedSize === 'md' ? 'size-2' : 'size-1.5']"
      aria-hidden="true"
    /><slot>{{ label }}</slot></span
  >
</template>
