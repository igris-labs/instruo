<script setup lang="ts">
import type { FieldsetProps } from "akaza-ui";
import type { PrimitiveSize, PrimitiveVariant } from "../ui.types";
import { Fieldset as AkazaFieldset } from "akaza-ui";
import { computed } from "vue";
import { fieldsetUi } from "./index";

defineOptions({ inheritAttrs: false });

const props = defineProps<
  FieldsetProps & {
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

const ui = computed(() => fieldsetUi(props.size, props.variant, props.class, props.ui));
</script>

<template>
  <AkazaFieldset
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
  </AkazaFieldset>
</template>
