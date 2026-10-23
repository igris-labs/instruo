<script setup lang="ts">
const x = ref(0);
const y = ref(8);
const blur = ref(24);
const spread = ref(0);
const color = ref("#00000033");
const output = computed(
  () => `box-shadow: ${x.value}px ${y.value}px ${blur.value}px ${spread.value}px ${color.value};`,
);
const { copyText } = useCopyToClipboard();
</script>
<template>
  <ToolWorkbench description="Build a copy-ready box-shadow declaration with a live preview.">
    <div class="grid gap-5">
      <div class="grid gap-4 sm:grid-cols-3">
        <UiField label="X">
          <UiNumberField
            v-model="x"
            :step-snapping="false"
          /> </UiField
        ><UiField label="Y">
          <UiNumberField
            v-model="y"
            :step-snapping="false"
          /> </UiField
        ><UiField label="Blur">
          <UiNumberField
            v-model="blur"
            :step-snapping="false"
          /> </UiField
        ><UiField label="Spread">
          <UiNumberField
            v-model="spread"
            :step-snapping="false"
          /> </UiField
        ><UiField label="Color"><UiInput v-model="color" /></UiField>
      </div>
      <div class="border-outline bg-elevated grid min-h-32 place-items-center rounded-lg border">
        <div
          class="bg-default size-24"
          :style="{ boxShadow: `${x}px ${y}px ${blur}px ${spread}px ${color}` }"
        />
      </div>
      <UiInput
        :model-value="output"
        readonly
        class="font-mono"
      /><UiButton
        color="neutral"
        variant="soft"
        label="Copy CSS"
        icon="i-tabler-copy"
        class="w-fit"
        @click="copyText(output)"
      />
    </div>
  </ToolWorkbench>
</template>
