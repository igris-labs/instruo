<script setup lang="ts">
import FilePicker from "~/components/adapters/FilePicker.vue";
import StatusMessage from "~/components/adapters/StatusMessage.vue";
import ToolActions from "~/components/product/ToolActions.vue";
import ToolWorkspace from "~/components/product/ToolWorkspace.vue";
import { Button } from "~/components/ui/button";

import { Field } from "~/components/ui/field";
import { NumberField } from "~/components/ui/number-field";
const { file, sourceUrl, error, select } = useLocalImage();
const canvas = ref<HTMLCanvasElement | null>(null);
const image = ref<HTMLImageElement | null>(null);
const pixelSize = ref(8);
const status = ref("Choose an image to begin.");
function render() {
  const element = canvas.value;
  const source = image.value;
  if (!element || !source) return;
  const max = 1200;
  const scale = Math.min(1, max / Math.max(source.naturalWidth, source.naturalHeight));
  const width = Math.round(source.naturalWidth * scale);
  const height = Math.round(source.naturalHeight * scale);
  element.width = width;
  element.height = height;
  const context = element.getContext("2d");
  if (!context) return;
  const small = document.createElement("canvas");
  small.width = Math.max(1, Math.ceil(width / Math.max(1, pixelSize.value)));
  small.height = Math.max(1, Math.ceil(height / Math.max(1, pixelSize.value)));
  const smallContext = small.getContext("2d");
  if (!smallContext) return;
  smallContext.imageSmoothingEnabled = false;
  smallContext.drawImage(source, 0, 0, small.width, small.height);
  context.imageSmoothingEnabled = false;
  context.drawImage(small, 0, 0, small.width, small.height, 0, 0, width, height);
}
let selection = 0;
async function onFile(next: File | null | undefined) {
  const id = ++selection;
  image.value = null;
  if (canvas.value) canvas.value.width = 0;
  await select(next);
  if (id !== selection || !sourceUrl.value) return;
  const url = sourceUrl.value;
  const decoded = new Image();
  decoded.src = url;
  try {
    await decoded.decode();
    if (id !== selection || url !== sourceUrl.value) return;
    image.value = decoded;
    render();
    status.value =
      "Adjust pixel size, then download the result. Output is limited to 1,200 pixels on the longest edge.";
  } catch {
    status.value = "Could not decode this image.";
  }
}
watch(pixelSize, render);
onBeforeUnmount(() => selection++);
function download() {
  canvas.value?.toBlob((blob) => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "pixel-art.png";
    link.click();
    URL.revokeObjectURL(url);
  }, "image/png");
}
</script>
<template>
  <ToolWorkspace>
    <div class="grid gap-5">
      <StatusMessage
        v-if="error"
        tone="error"
        title="Check image"
        :description="error"
      />
      <div class="grid gap-4 @[30rem]:grid-cols-[minmax(0,1fr)_12rem] @[30rem]:items-end">
        <FilePicker
          :model-value="file"
          accept="image/*"
          label="Image"
          description="Up to 25 MB and 40 megapixels."
          @update:model-value="onFile"
        /><Field label="Pixel size"
          ><NumberField
            v-model="pixelSize"
            :step-snapping="false"
            :min="2"
            :max="64"
            class="w-full"
          ></NumberField
        ></Field>
      </div>
      <div class="border-border bg-muted/20 overflow-auto rounded-md border p-3">
        <canvas
          ref="canvas"
          class="mx-auto block max-h-[65vh] max-w-full"
        ></canvas>
        <p
          v-if="!image"
          class="text-muted-foreground py-16 text-center text-sm"
        >
          Pixel-art preview appears here.
        </p>
      </div>
      <ToolActions>
        <Button
          :disabled="!image"
          color="secondary"
          variant="outline"
          @click="download"
          ><Icon
            name="tabler:download"
            mode="svg"
            class="mr-1.5"
            aria-hidden="true"
          />Download PNG</Button
        >
      </ToolActions>
      <p
        class="text-muted-foreground text-sm"
        role="status"
      >
        {{ status }}
      </p>
    </div>
  </ToolWorkspace>
</template>
