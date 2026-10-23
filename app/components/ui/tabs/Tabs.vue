<script setup lang="ts">
import type { TabsProps } from "akaza-ui";
import type { PrimitiveSize, PrimitiveVariant } from "../ui.types";
import { Tabs as AkazaTabs } from "akaza-ui";
import { computed } from "vue";
import { tabsUi } from "./index";

defineOptions({ inheritAttrs: false });

const props = defineProps<
  TabsProps & {
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

const ui = computed(() => tabsUi(props.size, props.variant, props.class, props.ui));
</script>

<template>
  <AkazaTabs
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
  </AkazaTabs>
</template>
