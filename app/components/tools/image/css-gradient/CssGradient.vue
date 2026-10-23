<script setup lang="ts">
const start = ref("#4f46e5");
const end = ref("#06b6d4");
const angle = ref(135);
const output = computed(
  () => `background: linear-gradient(${angle.value}deg, ${start.value}, ${end.value});`,
);
const { copyText } = useCopyToClipboard();
</script>
<template>
  <ToolWorkbench description="Build a copy-ready linear-gradient declaration with a live preview.">
    <div class="grid gap-5">
      <div class="grid gap-4 sm:grid-cols-3">
        <UiField label="Start"><UiInput v-model="start" /></UiField
        ><UiField label="End"><UiInput v-model="end" /></UiField
        ><UiField label="Angle">
          <UiNumberField
            v-model="angle"
            :step-snapping="false"
          />
        </UiField>
      </div>
      <div
        class="border-outline min-h-40 rounded-lg border"
        :style="{ background: `linear-gradient(${angle}deg, ${start}, ${end})` }"
      />
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
