<script setup lang="ts">
import type { YearPickerProps } from "akaza-ui";
import type { PrimitiveSize, PrimitiveVariant } from "../ui.types";
import { YearPicker as AkazaYearPicker } from "akaza-ui";
import { computed } from "vue";
import { yearPickerUi } from "./index";

defineOptions({ inheritAttrs: false });

const props = defineProps<
  YearPickerProps & {
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

const ui = computed(() => yearPickerUi(props.size, props.variant, props.class, props.ui));
</script>

<template>
  <AkazaYearPicker
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
  </AkazaYearPicker>
</template>
