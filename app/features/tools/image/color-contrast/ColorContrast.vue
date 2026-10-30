<script setup lang="ts">
import { formatHex, parse } from "culori";
import StatusMessage from "~/components/adapters/StatusMessage.vue";
import ToolWorkspace from "~/components/product/ToolWorkspace.vue";
import { Field } from "~/components/ui/field";

import { Input } from "~/components/ui/input";
import { relativeLuminance } from "~/utils/browser-tools";
const foreground = ref("#17324c");
const background = ref("#ffffff");
const parsedForeground = computed(() => parse(foreground.value));
const parsedBackground = computed(() => parse(background.value));
const valid = computed(
  () =>
    !!parsedForeground.value &&
    !!parsedBackground.value &&
    (parsedForeground.value.alpha ?? 1) === 1 &&
    (parsedBackground.value.alpha ?? 1) === 1,
);
const ratio = computed(() => {
  if (!valid.value) return "";
  const a = relativeLuminance(formatHex(parsedForeground.value!));
  const b = relativeLuminance(formatHex(parsedBackground.value!));
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
});
</script>
<template>
  <ToolWorkspace>
    <div class="grid gap-5">
      <div class="grid gap-4 @[30rem]:grid-cols-2">
        <Field label="Foreground"
          ><Input
            v-model="foreground"
            class="w-full"
          ></Input></Field
        ><Field label="Background"
          ><Input
            v-model="background"
            class="w-full"
          ></Input
        ></Field>
      </div>
      <div
        class="border-border grid min-h-32 place-items-center rounded-lg border p-5 text-lg"
        :style="{ color: foreground, backgroundColor: background }"
      >
        Readable sample text
      </div>
      <StatusMessage
        v-if="valid"
        :tone="Number(ratio) >= 4.5 ? 'success' : 'warning'"
        :title="`${ratio}:1 contrast ratio`"
        :description="
          Number(ratio) >= 7
            ? 'AAA for body text.'
            : Number(ratio) >= 4.5
              ? 'AA for body text.'
              : 'Increase contrast for body text.'
        "
      ></StatusMessage>
      <StatusMessage
        v-else
        tone="error"
        title="Check colors"
        description="Enter two opaque CSS colors. Alpha blending is not included in this check."
      />
      <p
        v-if="valid"
        class="text-muted-foreground text-sm"
      >
        Large text and non-text UI (3:1): {{ Number(ratio) >= 3 ? "Pass" : "Fail" }} · Body text AA
        (4.5:1): {{ Number(ratio) >= 4.5 ? "Pass" : "Fail" }} · Body text AAA (7:1):
        {{ Number(ratio) >= 7 ? "Pass" : "Fail" }}
      </p>
    </div>
  </ToolWorkspace>
</template>
