<script setup lang="ts">
import type { CalendarProps } from "akaza-ui";
import type { PrimitiveSize, PrimitiveVariant } from "../ui.types";
import { Calendar as AkazaCalendar } from "akaza-ui";
import { computed } from "vue";
import { calendarUi } from "./index";

defineOptions({ inheritAttrs: false });

const props = defineProps<
  CalendarProps & {
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

const ui = computed(() => calendarUi(props.size, props.variant, props.class, props.ui));
</script>

<template>
  <AkazaCalendar
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
  </AkazaCalendar>
</template>
