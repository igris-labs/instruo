<script setup lang="ts">
import type { FieldProps } from "akaza-ui";
import type { PrimitiveSize, PrimitiveVariant } from "../ui.types";
import { Field as AkazaField } from "akaza-ui";
import { computed } from "vue";
import { fieldUi } from "./index";

defineOptions({ inheritAttrs: false });

const props = defineProps<
  FieldProps & {
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

const ui = computed(() => fieldUi(props.size, props.variant, props.class, props.ui));
</script>

<template>
  <AkazaField
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
  </AkazaField>
</template>
