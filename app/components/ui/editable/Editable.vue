<script setup lang="ts">
import type { EditableProps } from "akaza-ui";
import type { PrimitiveSize, PrimitiveVariant } from "../ui.types";
import { Editable as AkazaEditable } from "akaza-ui";
import { computed } from "vue";
import { editableUi } from "./index";

defineOptions({ inheritAttrs: false });

const props = defineProps<
  EditableProps & {
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

const ui = computed(() => editableUi(props.size, props.variant, props.class, props.ui));
</script>

<template>
  <AkazaEditable
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
  </AkazaEditable>
</template>
