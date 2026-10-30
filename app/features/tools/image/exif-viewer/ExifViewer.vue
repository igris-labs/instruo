<script setup lang="ts">
import FilePicker from "~/components/adapters/FilePicker.vue";
import StatusMessage from "~/components/adapters/StatusMessage.vue";
import ToolActions from "~/components/product/ToolActions.vue";
import ToolWorkspace from "~/components/product/ToolWorkspace.vue";
import { Button } from "~/components/ui/button";
const { file, sourceUrl, width, height, error, select, render, download } = useLocalImage();
const metadata = ref<Record<string, unknown>>({});
const inspecting = ref(false);
const exporting = ref(false);
const notice = ref("");
let selection = 0;
const json = computed(() => JSON.stringify(metadata.value, null, 2));
const { copyText: copy } = useCopyToClipboard();
async function choose(next: File | null | undefined) {
  const id = ++selection;
  metadata.value = {};
  notice.value = "";
  inspecting.value = true;
  try {
    await select(next);
    if (id !== selection || !file.value) return;
    const selected = file.value;
    metadata.value = {
      File: selected.name,
      Type: selected.type,
      Bytes: selected.size,
      Width: width.value,
      Height: height.value,
    };
    try {
      const exifr = await import("exifr");
      const tags = await exifr.parse(selected);
      if (id !== selection) return;
      metadata.value = { ...metadata.value, ...tags };
      if (!tags)
        notice.value = "No supported EXIF metadata was found. File details are shown below.";
    } catch {
      if (id === selection)
        notice.value = "EXIF could not be read. You can still export a clean PNG.";
    }
  } finally {
    if (id === selection) inspecting.value = false;
  }
}
async function clean() {
  if (!file.value) return;
  const name = file.value.name.replace(/\.[^.]+$/, "");
  exporting.value = true;
  try {
    const blob = await render({ mime: "image/png" });
    if (blob) download(`clean-${name}.png`);
  } finally {
    exporting.value = false;
  }
}
onBeforeUnmount(() => selection++);
</script>
<template>
  <ToolWorkspace
    ><div class="grid gap-6">
      <FilePicker
        :model-value="file"
        accept="image/*"
        label="Choose a photo"
        description="Local inspection. Up to 25 MB and 40 megapixels."
        @update:model-value="choose"
      />
      <StatusMessage
        v-if="error"
        tone="error"
        title="Check image"
        :description="error"
      />
      <StatusMessage
        v-if="notice"
        title="Metadata inspection"
        :description="notice"
      />
      <div class="grid min-w-0 gap-6 @[48rem]:grid-cols-2">
        <section class="bg-muted/20 grid min-h-64 place-items-center rounded-lg p-4">
          <img
            v-if="sourceUrl"
            :src="sourceUrl"
            alt="Selected image preview"
            class="max-h-96 max-w-full rounded-md object-contain"
          />
          <p
            v-else
            class="text-muted-foreground text-sm"
          >
            Choose a photo to inspect its metadata.
          </p>
        </section>
        <section class="min-w-0">
          <h2 class="mb-3 text-base font-semibold">Metadata</h2>
          <p
            v-if="inspecting"
            role="status"
          >
            Reading metadata…
          </p>
          <pre
            v-else
            class="bg-muted/30 max-h-96 overflow-auto rounded-md p-4 text-xs break-all whitespace-pre-wrap"
            >{{
              Object.keys(metadata).length
                ? json
                : "File, camera, date, and location details appear here when available."
            }}</pre>
        </section>
      </div>
      <ToolActions
        ><Button
          :disabled="!Object.keys(metadata).length || inspecting"
          color="secondary"
          variant="outline"
          @click="copy(json)"
          >{{ "Copy metadata" }}</Button
        ><Button
          :disabled="!file || inspecting || exporting"
          color="secondary"
          variant="outline"
          @click="clean"
          >{{ exporting ? "Exporting…" : "Download clean PNG" }}</Button
        ></ToolActions
      >
      <p class="text-muted-foreground text-sm">
        Photos can contain GPS coordinates and camera details. Clean export redraws the visible
        image into a new PNG without copying EXIF. Animation and original compression are not
        preserved. Nothing is uploaded.
      </p>
    </div></ToolWorkspace
  >
</template>
