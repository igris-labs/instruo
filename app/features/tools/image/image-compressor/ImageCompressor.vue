<script setup lang="ts">
import FilePicker from "~/components/adapters/FilePicker.vue";
import StatusMessage from "~/components/adapters/StatusMessage.vue";
import ToolActions from "~/components/product/ToolActions.vue";
import ToolWorkspace from "~/components/product/ToolWorkspace.vue";
import { Button } from "~/components/ui/button";
import { Field } from "~/components/ui/field";
import { NumberField } from "~/components/ui/number-field";
import { Select } from "~/components/ui/select";
import { selectOptions } from "~/features/tools/options";

const { file, sourceUrl, outputUrl, width, height, error, select, render, download, invalidate } =
  useLocalImage();
const format = ref("image/webp");
const quality = ref(0.82);
const processing = ref(false);
watch([format, quality], invalidate, { flush: "sync" });
async function process() {
  processing.value = true;
  try {
    await render({ mime: format.value, quality: quality.value });
  } finally {
    processing.value = false;
  }
}
</script>
<template>
  <ToolWorkspace>
    <div class="grid gap-5">
      <FilePicker
        :model-value="file"
        accept="image/*"
        label="Choose an image"
        description="Drop a JPEG, PNG, or WebP here, or browse this device. Up to 25 MB."
        @update:model-value="select"
      ></FilePicker
      ><StatusMessage
        v-if="error"
        tone="error"
        icon="tabler:alert-circle"
        title="Image not loaded"
        :description="error"
      ></StatusMessage>
      <div
        v-if="file"
        class="text-muted-foreground grid gap-3 text-sm"
      >
        <span>{{ file.name }} · {{ width }} × {{ height }} px</span
        ><img
          :src="sourceUrl"
          alt="Selected source"
          class="border-border max-h-64 w-fit rounded-md border object-contain"
        />
      </div>
      <div class="grid gap-4 @[30rem]:grid-cols-2">
        <Field label="Output format"
          ><Select
            v-model="format"
            :options="
              selectOptions([
                { label: 'WebP', value: 'image/webp' },
                { label: 'JPEG', value: 'image/jpeg' },
                { label: 'PNG', value: 'image/png' },
              ])
            "
            class="w-full"
          ></Select></Field
        ><Field label="Quality"
          ><NumberField
            v-model="quality"
            class="w-full"
            :step-snapping="false"
            :min="0.1"
            :max="1"
            :step="0.05"
          ></NumberField
        ></Field>
      </div>

      <img
        v-if="outputUrl"
        :src="outputUrl"
        alt="Compressed result"
        class="border-border max-h-64 w-fit rounded-md border object-contain"
      />
      <ToolActions>
        <Button
          :disabled="!outputUrl"
          color="secondary"
          variant="outline"
          @click="download(`compressed-image.${format.split('/')[1]}`)"
          >Download</Button
        >
        <Button
          :loading="processing"
          :disabled="!file"
          @click="process"
          ><Icon
            name="tabler:photo-down"
            mode="svg"
            class="mr-1.5"
            aria-hidden="true"
          />Compress image</Button
        >
      </ToolActions>
    </div>
  </ToolWorkspace>
</template>
