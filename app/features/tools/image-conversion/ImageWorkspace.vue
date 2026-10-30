<script setup lang="ts">
import ToolActions from "~/components/product/ToolActions.vue";
import ToolWorkspace from "~/components/product/ToolWorkspace.vue";
import { Button } from "../../../components/ui/button";
import { Field } from "../../../components/ui/field";
import { Select } from "../../../components/ui/select";
import { useImageConversion } from "./useImageConversion";
const {
  file,
  source,
  result,
  width,
  height,
  format,
  error,
  reading,
  converting,
  select,
  convert,
  download,
} = useImageConversion();
const input = useTemplateRef<HTMLInputElement>("input");
const dragging = ref(false);
function choose(event: Event) {
  const target = event.target as HTMLInputElement;
  const next = target.files?.[0];
  target.value = "";
  if (next) void select(next);
}
function drop(event: DragEvent) {
  dragging.value = false;
  const next = event.dataTransfer?.files[0];
  if (next) void select(next);
}
const size = (bytes: number) =>
  bytes < 1024
    ? `${bytes} B`
    : bytes < 1048576
      ? `${(bytes / 1024).toFixed(1)} KB`
      : `${(bytes / 1048576).toFixed(1)} MB`;
</script>
<template>
  <ToolWorkspace>
    <input
      ref="input"
      type="file"
      accept="image/*"
      aria-label="Source image file"
      tabindex="-1"
      class="sr-only"
      @change="choose"
    />
    <div
      class="border-input bg-muted/40 rounded-lg border border-dashed p-6 text-center transition-colors"
      :class="dragging && 'bg-muted'"
      @dragover.prevent="dragging = true"
      @dragleave="dragging = false"
      @drop.prevent="drop"
    >
      <Icon
        name="tabler:photo-plus"
        mode="svg"
        class="text-muted-foreground mx-auto mb-3 size-6"
      />
      <h2 class="text-sm font-medium">{{ file ? file.name : "Start with an image" }}</h2>
      <p class="text-muted-foreground mt-2 text-[13px]">
        Drop a file here. Up to 25 MB and 40 megapixels. No upload.
      </p>
      <Button
        class="mt-4"
        color="secondary"
        variant="outline"
        @click="input?.click()"
        >{{ file ? "Choose another image" : "Choose an image" }}</Button
      >
      <Button
        v-if="file || reading"
        class="mt-4 ml-2"
        color="secondary"
        variant="ghost"
        @click="select(null)"
        >Remove image</Button
      >
    </div>
    <p
      v-if="reading"
      role="status"
      class="text-muted-foreground text-sm"
    >
      Reading your image…
    </p>
    <p
      v-if="error"
      role="alert"
      class="bg-destructive/5 text-destructive rounded-md p-3 text-sm"
    >
      {{ error }}
    </p>
    <div class="flex flex-wrap items-end gap-4">
      <Field
        v-slot="{ controlProps }"
        label="Output format"
        class="w-44"
      >
        <Select
          v-bind="controlProps"
          v-model="format"
          class="w-full"
          :options="[
            { label: 'WebP', value: 'image/webp' },
            { label: 'PNG', value: 'image/png' },
            { label: 'JPEG', value: 'image/jpeg' },
          ]"
        />
      </Field>
    </div>
    <ToolActions>
      <Button
        v-if="result"
        color="secondary"
        variant="outline"
        @click="download"
        ><Icon
          name="tabler:download"
          mode="svg"
        />Download
        {{
          result.mime === "image/jpeg" ? "JPEG" : result.mime.split("/")[1]?.toUpperCase()
        }}</Button
      >
      <Button
        :disabled="!file || reading"
        :loading="converting"
        @click="convert"
        >Convert image</Button
      >
    </ToolActions>
    <p
      v-if="format === 'image/jpeg'"
      class="text-muted-foreground text-xs"
    >
      Transparent areas become white in JPEG.
    </p>
    <div
      v-if="source"
      class="grid items-start gap-6 md:grid-cols-2"
    >
      <figure>
        <figcaption class="mb-3 flex justify-between text-[13px]">
          <span class="font-medium">Original</span
          ><span class="text-muted-foreground"
            >{{ width }} × {{ height }} · {{ file ? size(file.size) : "" }}</span
          >
        </figcaption>
        <img
          :src="source"
          alt="Original image"
          class="bg-muted max-h-80 w-full rounded-lg object-contain"
        />
      </figure>
      <figure v-if="result">
        <figcaption class="mb-3 flex justify-between text-[13px]">
          <span class="font-medium">Converted</span
          ><span class="text-muted-foreground">{{ size(result.bytes) }}</span>
        </figcaption>
        <img
          :src="result.url"
          alt="Converted image"
          class="bg-muted max-h-80 w-full rounded-lg object-contain"
        />
      </figure>
      <p
        v-else
        class="text-muted-foreground self-center text-sm leading-6"
      >
        Choose a format and convert to see your result.<br />The original file is never changed.
      </p>
    </div>
  </ToolWorkspace>
</template>
