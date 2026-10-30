<script setup lang="ts">
import FilePicker from "~/components/adapters/FilePicker.vue";
import StatusMessage from "~/components/adapters/StatusMessage.vue";
import ToolActions from "~/components/product/ToolActions.vue";
import ToolWorkspace from "~/components/product/ToolWorkspace.vue";
import { Button } from "~/components/ui/button";
import { Field } from "~/components/ui/field";
import { Input } from "~/components/ui/input";
import { Select } from "~/components/ui/select";
const { file, sourceUrl, outputUrl, error, select, render, download, invalidate } = useLocalImage();
const size = ref("64");
const busy = ref(false);
watch(size, invalidate, { flush: "sync" });
async function process() {
  busy.value = true;
  try {
    await render({ width: Number(size.value), height: Number(size.value), mime: "image/png" });
  } finally {
    busy.value = false;
  }
}
const markup = computed(() =>
  outputUrl.value
    ? `<link rel="icon" type="image/png" sizes="${size.value}x${size.value}" href="/favicon-${
        size.value
      }.png">`
    : "",
);
const { copyText } = useCopyToClipboard();
</script>
<template>
  <ToolWorkspace
    ><FilePicker
      :model-value="file"
      accept="image/*"
      label="Choose source artwork"
      description="Use square artwork for an undistorted icon. Up to 25 MB and 40 megapixels."
      @update:model-value="select"
    /><StatusMessage
      v-if="error"
      tone="error"
      title="Check artwork"
      :description="error"
    />
    <div class="grid items-start gap-6 @[48rem]:grid-cols-2">
      <Field label="PNG dimensions"
        ><Select
          v-model="size"
          class="w-full"
          :options="
            [32, 64, 180, 192, 512].map((value) => ({
              value: String(value),
              label: `${value} × ${value} px`,
            }))
          "
      /></Field>
      <section class="bg-muted/30 grid min-h-40 content-start gap-5 rounded-lg p-6">
        <h2 class="text-sm font-medium">Preview at common display sizes</h2>
        <div class="flex flex-wrap items-end gap-6">
          <figure
            v-for="pixels in [16, 32, 48, 64]"
            :key="pixels"
          >
            <img
              v-if="outputUrl || sourceUrl"
              :src="outputUrl || sourceUrl"
              :alt="`Favicon preview at ${pixels} pixels`"
              :style="{ width: `${pixels}px`, height: `${pixels}px` }"
              class="object-contain"
            />
            <figcaption class="text-muted-foreground mt-2 text-xs">{{ pixels }}px</figcaption>
          </figure>
        </div>
      </section>
    </div>
    <Field label="Installation markup"
      ><Input
        :model-value="markup"
        readonly
        class="w-full font-mono"
    /></Field>
    <p class="text-muted-foreground text-xs">
      Exports PNG, not ICO. Place the downloaded file at the path used in your link tag. Transparent
      artwork remains transparent.
    </p>
    <ToolActions
      ><Button
        color="secondary"
        variant="outline"
        :disabled="!markup"
        @click="copyText(markup)"
        >Copy link tag</Button
      ><Button
        color="secondary"
        variant="outline"
        :disabled="!outputUrl"
        @click="download(`favicon-${size}.png`)"
        >Download favicon</Button
      ><Button
        :disabled="!file || busy"
        @click="process"
        >{{ busy ? "Creating…" : "Create favicon" }}</Button
      ></ToolActions
    ></ToolWorkspace
  >
</template>
