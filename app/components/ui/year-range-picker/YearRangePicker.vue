<script setup lang="ts">
import type { YearRangePickerProps } from "akaza-ui";
import type { PrimitiveSize, PrimitiveVariant } from "../ui.types";
import { YearRangePicker as AkazaYearRangePicker } from "akaza-ui";
import { computed } from "vue";
import { yearRangePickerUi } from "./index";

defineOptions({ inheritAttrs: false });

const props = defineProps<
  YearRangePickerProps & {
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

const ui = computed(() => yearRangePickerUi(props.size, props.variant, props.class, props.ui));
</script>

<template>
  <AkazaYearRangePicker
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
  </AkazaYearRangePicker>
</template>
