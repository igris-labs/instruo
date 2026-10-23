<script setup lang="ts">
const { file, outputUrl, width, height, select, render, download } = useLocalImage();
const x = ref(0);
const y = ref(0);
const cropWidth = ref(0);
const cropHeight = ref(0);
function syncSize() {
  cropWidth.value = width.value;
  cropHeight.value = height.value;
}
async function process() {
  await render({
    x: x.value,
    y: y.value,
    width: cropWidth.value,
    height: cropHeight.value,
    crop: true,
    mime: "image/png",
  });
}
</script>
<template>
  <ToolWorkbench description="Crop an image by pixel coordinates in your browser.">
    <div class="grid gap-5">
      <UiFileInput
        :model-value="file"
        accept="image/*"
        label="Choose an image"
        description="Drop an image here or browse this device. Up to 25 MB."
        @update:model-value="
          async (nextFile) => {
            await select(nextFile);
            syncSize();
          }
        "
      />
      <div class="grid gap-4 sm:grid-cols-2">
        <UiField label="X">
          <UiNumberField
            v-model="x"
            :step-snapping="false"
            :min="0"
          /> </UiField
        ><UiField label="Y">
          <UiNumberField
            v-model="y"
            :step-snapping="false"
            :min="0"
          /> </UiField
        ><UiField label="Width">
          <UiNumberField
            v-model="cropWidth"
            :step-snapping="false"
            :min="1"
          /> </UiField
        ><UiField label="Height">
          <UiNumberField
            v-model="cropHeight"
            :step-snapping="false"
            :min="1"
          />
        </UiField>
      </div>
      <div class="flex gap-2">
        <UiButton
          label="Crop"
          icon="i-tabler-crop"
          :disabled="!file"
          @click="process"
        /><UiButton
          color="neutral"
          variant="soft"
          label="Download"
          :disabled="!outputUrl"
          @click="download('cropped-image.png')"
        />
      </div>
      <img
        v-if="outputUrl"
        :src="outputUrl"
        alt="Cropped image"
        class="border-outline max-h-72 w-fit rounded-md border object-contain"
      />
    </div>
  </ToolWorkbench>
</template>
