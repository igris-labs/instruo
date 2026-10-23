<script setup lang="ts">
import type { ListboxProps } from "akaza-ui";
import type { PrimitiveSize, PrimitiveVariant } from "../ui.types";
import { Listbox as AkazaListbox } from "akaza-ui";
import { computed } from "vue";
import { listboxUi } from "./index";

defineOptions({ inheritAttrs: false });

const {
  size,
  variant,
  class: customClass,
  ui: customUi,
  loop = true,
  highlightOnHover = true,
  ...forwardedProps
} = defineProps<
  ListboxProps & {
    size?: PrimitiveSize;
    variant?: PrimitiveVariant;
    class?: string;
    ui?: Record<string, string>;
  }
>();

const akazaProps = computed(() => ({ ...forwardedProps, loop, highlightOnHover }));

const ui = computed(() => listboxUi(size, variant, customClass, customUi));
</script>

<template>
  <AkazaListbox
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
  </AkazaListbox>
</template>
