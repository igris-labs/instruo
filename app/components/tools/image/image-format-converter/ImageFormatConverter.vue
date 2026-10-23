<script setup lang="ts">
const { file, outputUrl, select, render, download } = useLocalImage();
const format = ref("image/webp");
async function process() {
  await render({ mime: format.value, quality: 0.9 });
}
</script>
<template>
  <ToolWorkbench description="Convert images between PNG, JPEG, and WebP without uploading them.">
    <div class="grid gap-5">
      <UiFileInput
        :model-value="file"
        accept="image/*"
        label="Choose an image"
        description="Drop an image here or browse this device. Conversion stays in this browser."
        @update:model-value="select"
      />
      <UiField label="Output format">
        <UiSelect
          v-model="format"
          :items="[
            { label: 'WebP', value: 'image/webp' },
            { label: 'JPEG', value: 'image/jpeg' },
            { label: 'PNG', value: 'image/png' },
          ]"
          class="w-full sm:max-w-xs"
        />
      </UiField>
      <div class="flex gap-2">
        <UiButton
          label="Convert"
          icon="i-tabler-refresh"
          :disabled="!file"
          @click="process"
        /><UiButton
          color="neutral"
          variant="soft"
          label="Download"
          :disabled="!outputUrl"
          @click="download(`converted-image.${format.split('/')[1]}`)"
        />
      </div>
      <img
        v-if="outputUrl"
        :src="outputUrl"
        alt="Converted image"
        class="border-outline max-h-72 w-fit rounded-md border object-contain"
      />
    </div>
  </ToolWorkbench>
</template>
