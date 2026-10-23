<script setup lang="ts">
import type { RadioGroupProps } from "akaza-ui";
import type { PrimitiveSize, PrimitiveVariant } from "../ui.types";
import { RadioGroup as AkazaRadioGroup } from "akaza-ui";
import { computed } from "vue";
import { radioGroupUi } from "./index";

defineOptions({ inheritAttrs: false });

const {
  size,
  variant,
  class: customClass,
  ui: customUi,
  loop = true,
  ...forwardedProps
} = defineProps<
  RadioGroupProps & {
    size?: PrimitiveSize;
    variant?: PrimitiveVariant;
    class?: string;
    ui?: Record<string, string>;
  }
>();

const akazaProps = computed(() => ({ ...forwardedProps, loop }));

const ui = computed(() => radioGroupUi(size, variant, customClass, customUi));
</script>

<template>
  <AkazaRadioGroup
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
  </AkazaRadioGroup>
</template>
