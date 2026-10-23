<script setup lang="ts">
import type { MeterProps } from "akaza-ui";
import type { PrimitiveSize, PrimitiveVariant } from "../ui.types";
import { Meter as AkazaMeter } from "akaza-ui";
import { computed } from "vue";
import { meterUi } from "./index";

defineOptions({ inheritAttrs: false });

const props = defineProps<
  MeterProps & {
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

const ui = computed(() => meterUi(props.size, props.variant, props.class, props.ui));
</script>

<template>
  <AkazaMeter
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
  </AkazaMeter>
</template>
