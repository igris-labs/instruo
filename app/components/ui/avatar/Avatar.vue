<script setup lang="ts">
import type { AvatarProps } from "akaza-ui";
import type { PrimitiveSize, PrimitiveVariant } from "../ui.types";
import { Avatar as AkazaAvatar } from "akaza-ui";
import { computed } from "vue";
import { avatarUi } from "./index";

defineOptions({ inheritAttrs: false });

const props = defineProps<
  AvatarProps & {
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

const ui = computed(() => avatarUi(props.size, props.variant, props.class, props.ui));
</script>

<template>
  <AkazaAvatar
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
  </AkazaAvatar>
</template>
