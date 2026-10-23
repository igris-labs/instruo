<script setup lang="ts">
import type { SliderProps } from "akaza-ui";
import type { PrimitiveSize, PrimitiveVariant } from "../ui.types";
import { Slider as AkazaSlider } from "akaza-ui";
import { computed } from "vue";
import { sliderUi } from "./index";

defineOptions({ inheritAttrs: false });

const props = defineProps<
  SliderProps & {
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

const ui = computed(() => sliderUi(props.size, props.variant, props.class, props.ui));
</script>

<template>
  <AkazaSlider
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
  </AkazaSlider>
</template>
