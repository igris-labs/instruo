<script setup lang="ts">
import FilePicker from "~/components/adapters/FilePicker.vue";
import StatusMessage from "~/components/adapters/StatusMessage.vue";
import ToolActions from "~/components/product/ToolActions.vue";
import ToolWorkspace from "~/components/product/ToolWorkspace.vue";
import { Button } from "~/components/ui/button";
import { Field } from "~/components/ui/field";

import { NumberField } from "~/components/ui/number-field";
const { file, sourceUrl, outputUrl, width, height, error, select, render, download, invalidate } =
  useLocalImage();
const x = ref(0);
const y = ref(0);
const cropWidth = ref(0);
const cropHeight = ref(0);
watch([x, y, cropWidth, cropHeight], invalidate, { flush: "sync" });
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
  <ToolWorkspace>
    <div class="grid gap-5">
      <FilePicker
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
      ></FilePicker>
      <StatusMessage
        v-if="error"
        tone="error"
        title="Check image or crop"
        :description="error"
      />
      <div
        v-if="sourceUrl && width"
        class="bg-muted/20 relative mx-auto w-fit max-w-full overflow-hidden rounded-lg"
      >
        <img
          :src="sourceUrl"
          alt="Crop source"
          class="max-h-80 max-w-full object-contain"
        />
        <div
          class="border-info bg-info/10 pointer-events-none absolute border-2"
          :style="{
            left: `${(100 * x) / width}%`,
            top: `${(100 * y) / height}%`,
            width: `${(100 * cropWidth) / width}%`,
            height: `${(100 * cropHeight) / height}%`,
          }"
        />
      </div>
      <div class="grid gap-4 @[30rem]:grid-cols-2">
        <Field label="X"
          ><NumberField
            v-model="x"
            class="w-full"
            :step-snapping="false"
            :min="0"
          ></NumberField></Field
        ><Field label="Y"
          ><NumberField
            v-model="y"
            class="w-full"
            :step-snapping="false"
            :min="0"
          ></NumberField></Field
        ><Field label="Width"
          ><NumberField
            v-model="cropWidth"
            class="w-full"
            :step-snapping="false"
            :min="1"
          ></NumberField></Field
        ><Field label="Height"
          ><NumberField
            v-model="cropHeight"
            class="w-full"
            :step-snapping="false"
            :min="1"
          ></NumberField
        ></Field>
      </div>

      <img
        v-if="outputUrl"
        :src="outputUrl"
        alt="Cropped image"
        class="border-border max-h-72 w-fit rounded-md border object-contain"
      />
      <ToolActions>
        <Button
          :disabled="!outputUrl"
          color="secondary"
          variant="outline"
          @click="download('cropped-image.png')"
          >Download</Button
        >
        <Button
          :disabled="!file"
          @click="process"
          ><Icon
            name="tabler:crop"
            mode="svg"
            class="mr-1.5"
            aria-hidden="true"
          />Crop</Button
        >
      </ToolActions>
    </div>
  </ToolWorkspace>
</template>
