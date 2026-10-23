<script setup lang="ts">
import type { MonthPickerProps } from "akaza-ui";
import type { PrimitiveSize, PrimitiveVariant } from "../ui.types";
import { MonthPicker as AkazaMonthPicker } from "akaza-ui";
import { computed } from "vue";
import { monthPickerUi } from "./index";

defineOptions({ inheritAttrs: false });

const props = defineProps<
  MonthPickerProps & {
    size?: PrimitiveSize;
    variant?: PrimitiveVariant;
    class?: string;
    ui?: Record<string, string>;
  }
>();

const akazaProps = computed(() => {
  const { size, variant, class: customClass, ui, ...rest } = props;
  return rest;
});

const ui = computed(() => monthPickerUi(props.size, props.variant, props.class, props.ui));
</script>

<template>
  <AkazaMonthPicker
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
  </AkazaMonthPicker>
</template>
