<script setup lang="ts">
import FilePicker from "~/components/adapters/FilePicker.vue";
import ToolActions from "~/components/product/ToolActions.vue";
import ToolWorkspace from "~/components/product/ToolWorkspace.vue";
import { Button } from "~/components/ui/button";
import { Field } from "~/components/ui/field";
import { NumberField } from "~/components/ui/number-field";
import { Select } from "~/components/ui/select";
import { selectOptions } from "~/features/tools/options";

type OutputFormat = "image/jpeg" | "image/png" | "image/webp";

const formatItems: { label: string; value: OutputFormat }[] = [
  { label: "WebP", value: "image/webp" },
  { label: "JPEG", value: "image/jpeg" },
  { label: "PNG", value: "image/png" },
];

const sourceFile = shallowRef<File | null>(null);
const outputBlob = shallowRef<Blob | null>(null);
const sourceUrl = ref("");
const outputUrl = ref("");
const sourceWidth = ref(0);
const sourceHeight = ref(0);
const targetWidth = ref(0);
const format = ref<OutputFormat>("image/webp");
const quality = ref(82);
const processing = ref(false);
const errorMessage = ref("");
let selection = 0;
let operation = 0;

const outputHeight = computed(() => {
  if (!sourceWidth.value || !sourceHeight.value || !targetWidth.value) return 0;
  return Math.max(1, Math.round((sourceHeight.value / sourceWidth.value) * targetWidth.value));
});
const outputExtension = computed(() => {
  return { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" }[format.value];
});
const downloadName = computed(() => {
  const baseName = sourceFile.value?.name.replace(/\.[^.]+$/, "") || "resized-image";
  return `${baseName}-${targetWidth.value}x${outputHeight.value}.${outputExtension.value}`;
});

function formatBytes(value: number) {
  if (value < 1_024) return `${value} B`;
  if (value < 1_048_576) return `${(value / 1_024).toFixed(1)} KB`;
  return `${(value / 1_048_576).toFixed(2)} MB`;
}

function loadImage(url: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("This image could not be decoded."));
    image.src = url;
  });
}

function releaseOutput() {
  operation++;
  processing.value = false;
  if (outputUrl.value) URL.revokeObjectURL(outputUrl.value);
  outputUrl.value = "";
  outputBlob.value = null;
}

async function selectImage(file: File | null | undefined) {
  const ticket = ++selection;
  if (!file) {
    if (sourceUrl.value) URL.revokeObjectURL(sourceUrl.value);
    releaseOutput();
    sourceFile.value = null;
    sourceUrl.value = "";
    sourceWidth.value = 0;
    sourceHeight.value = 0;
    targetWidth.value = 0;
    errorMessage.value = "";
    return;
  }

  if (sourceUrl.value) URL.revokeObjectURL(sourceUrl.value);
  releaseOutput();
  errorMessage.value = "";
  sourceWidth.value = sourceHeight.value = targetWidth.value = 0;
  if (!file.type.startsWith("image/") || file.size > 25_000_000) {
    sourceFile.value = null;
    sourceUrl.value = "";
    errorMessage.value = "Choose an image smaller than 25 MB.";
    return;
  }
  sourceFile.value = file;
  sourceUrl.value = URL.createObjectURL(file);

  try {
    const image = await loadImage(sourceUrl.value);
    if (ticket !== selection) return;
    if (image.naturalWidth * image.naturalHeight > 40_000_000)
      throw new Error("Choose an image smaller than 40 megapixels.");
    sourceWidth.value = image.naturalWidth;
    sourceHeight.value = image.naturalHeight;
    targetWidth.value = image.naturalWidth;
    await createImage();
  } catch (error) {
    if (ticket !== selection) return;
    errorMessage.value = error instanceof Error ? error.message : "This image could not be read.";
  }
}

function setWidth(value: number | null | undefined) {
  targetWidth.value = Math.min(8_192, Math.max(1, value ?? sourceWidth.value));
  releaseOutput();
}

function setQuality(value: number | null | undefined) {
  quality.value = Math.min(100, Math.max(10, value ?? 82));
  releaseOutput();
}

function setFormat(value: string | undefined) {
  if (!formatItems.some((item) => item.value === value)) return;
  format.value = value as OutputFormat;
  releaseOutput();
}

async function createImage() {
  if (!sourceUrl.value || !targetWidth.value || !outputHeight.value) return;
  errorMessage.value = "";
  releaseOutput();
  const ticket = operation;
  const selected = selection;
  const mime = format.value;
  const target = { width: targetWidth.value, height: outputHeight.value, quality: quality.value };
  processing.value = true;

  try {
    const image = await loadImage(sourceUrl.value);
    if (ticket !== operation || selected !== selection) return;
    if (
      ![target.width, target.height].every(Number.isFinite) ||
      target.width < 1 ||
      target.height < 1 ||
      target.width * target.height > 40_000_000
    )
      throw new Error("Choose valid output dimensions up to 40 megapixels.");
    const canvas = document.createElement("canvas");
    canvas.width = target.width;
    canvas.height = target.height;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Canvas is not available in this browser.");
    if (mime === "image/jpeg") {
      context.fillStyle = "#fff";
      context.fillRect(0, 0, canvas.width, canvas.height);
    }
    context.drawImage(image, 0, 0, canvas.width, canvas.height);

    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (value) => (value ? resolve(value) : reject(new Error("The image could not be exported."))),
        mime,
        mime === "image/png" ? undefined : target.quality / 100,
      );
    });
    if (ticket !== operation || selected !== selection) return;
    if (blob.type !== mime)
      throw new Error("Your browser cannot export the selected format. Try PNG.");
    outputBlob.value = blob;
    outputUrl.value = URL.createObjectURL(blob);
  } catch (error) {
    if (ticket !== operation || selected !== selection) return;
    errorMessage.value = error instanceof Error ? error.message : "The image could not be resized.";
  } finally {
    if (ticket === operation) processing.value = false;
  }
}

function downloadImage() {
  if (!outputUrl.value) return;
  const link = document.createElement("a");
  link.href = outputUrl.value;
  link.download = downloadName.value;
  link.click();
}

onUnmounted(() => {
  selection++;
  if (sourceUrl.value) URL.revokeObjectURL(sourceUrl.value);
  releaseOutput();
});
</script>
<template>
  <ToolWorkspace>
    <div class="grid gap-6">
      <Field
        v-slot="{ controlProps }"
        label="Source image"
        description="Choose a JPEG, PNG, or WebP file from this device."
        :error="errorMessage || undefined"
        ><FilePicker
          v-bind="controlProps"
          :model-value="sourceFile"
          accept="image/jpeg,image/png,image/webp"
          label="Choose an image"
          description="Drop a JPEG, PNG, or WebP here, or browse this device."
          @update:model-value="selectImage"
        ></FilePicker
      ></Field>
      <div
        v-if="sourceFile"
        class="grid gap-6 @[48rem]:grid-cols-[minmax(0,18rem)_1fr] @[48rem]:items-start"
      >
        <div class="grid gap-5">
          <Field
            label="Width"
            :description="`Height stays proportional: ${outputHeight || 0}px.`"
            ><NumberField
              :model-value="targetWidth"
              :min="1"
              :max="8192"
              class="w-full"
              @update:model-value="setWidth"
            ></NumberField></Field
          ><Field label="Output format"
            ><Select
              :model-value="format"
              class="w-full"
              :options="selectOptions(formatItems)"
              @update:model-value="setFormat"
            ></Select></Field
          ><Field
            label="Quality"
            :description="
              format === 'image/png'
                ? 'PNG is lossless, so quality is ignored.'
                : 'Lower values create smaller files with less detail.'
            "
            ><NumberField
              :model-value="quality"
              :min="10"
              :max="100"
              :disabled="format === 'image/png'"
              class="w-full"
              @update:model-value="setQuality"
            ></NumberField></Field
          ><ToolActions
            ><Button
              :loading="processing"
              @click="createImage"
              ><Icon
                name="tabler:photo-down"
                mode="svg"
                class="mr-1.5"
                aria-hidden="true"
              />Create resized image</Button
            ></ToolActions
          >
        </div>
        <div
          class="border-border/70 bg-muted/20 flex min-h-80 items-center justify-center rounded-lg border p-4"
        >
          <!-- eslint-disable vue/html-self-closing --><img
            v-if="outputUrl"
            :src="outputUrl"
            :alt="`Resized preview at ${targetWidth} by ${outputHeight} pixels`"
            class="max-h-[32rem] max-w-full object-contain"
          /><!-- eslint-enable vue/html-self-closing -->
          <div
            v-else
            class="text-muted-foreground grid justify-items-center gap-3 text-center text-sm"
          >
            <Icon
              name="tabler:photo"
              class="size-8"
            ></Icon>
            <p>Create the image to see its preview.</p>
          </div>
        </div>
      </div>
      <div
        v-if="sourceFile"
        class="border-border/70 grid gap-4 border-t pt-5 sm:items-center @[30rem]:grid-cols-[1fr_auto]"
      >
        <p class="text-muted-foreground text-sm leading-6">
          Source: {{ sourceWidth }} × {{ sourceHeight }}, {{ formatBytes(sourceFile.size) }}
          <template v-if="outputBlob">
            / Output: {{ targetWidth }} × {{ outputHeight }},
            {{ formatBytes(outputBlob.size) }}</template
          >
        </p>
        <Button
          :disabled="!outputUrl"
          color="secondary"
          variant="outline"
          @click="downloadImage"
          ><Icon
            name="tabler:download"
            mode="svg"
            class="mr-1.5"
            aria-hidden="true"
          />Download image</Button
        >
      </div>
    </div>
  </ToolWorkspace>
</template>
