<script setup lang="ts">
import type { RatingProps } from "akaza-ui";
import type { PrimitiveSize, PrimitiveVariant } from "../ui.types";
import { Rating as AkazaRating } from "akaza-ui";
import { computed } from "vue";
import { ratingUi } from "./index";

defineOptions({ inheritAttrs: false });

const {
  size,
  variant,
  class: customClass,
  ui: customUi,
  loop = true,
  ...forwardedProps
} = defineProps<
  RatingProps & {
    size?: PrimitiveSize;
    variant?: PrimitiveVariant;
    class?: string;
    ui?: Record<string, string>;
  }
>();

const akazaProps = computed(() => ({ ...forwardedProps, loop }));

const ui = computed(() => ratingUi(size, variant, customClass, customUi));
</script>

<template>
  <AkazaRating
    v-bind="{ ...akazaProps, ...$attrs }"
    :ui="ui"
  >
    <template
      v-for="(_, slotName) in $slots"
      #[slotName]="slotProps"
    >
      <slot
        :name="slotName"
        v-bind="slotProps || {}"
      />
    </template>
  </AkazaRating>
</template>
