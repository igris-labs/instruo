<script setup lang="ts">
import type { FormProps } from "akaza-ui";
import type { PrimitiveSize, PrimitiveVariant } from "../ui.types";
import { Form as AkazaForm } from "akaza-ui";
import { computed } from "vue";
import { formUi } from "./index";

defineOptions({ inheritAttrs: false });

const {
  size,
  variant,
  class: customClass,
  ui: customUi,
  preventDefault = true,
  ...forwardedProps
} = defineProps<
  FormProps & {
    size?: PrimitiveSize;
    variant?: PrimitiveVariant;
    class?: string;
    ui?: Record<string, string>;
  }
>();

const akazaProps = computed(() => ({ ...forwardedProps, preventDefault }));

const ui = computed(() => formUi(size, variant, customClass, customUi));
</script>

<template>
  <AkazaForm
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
  </AkazaForm>
</template>
