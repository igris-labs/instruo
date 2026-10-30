<script setup lang="ts">
import Textarea from "~/components/adapters/Textarea.vue";
import ToolActions from "~/components/product/ToolActions.vue";
import ToolWorkspace from "~/components/product/ToolWorkspace.vue";
import { Button } from "~/components/ui/button";
import { Checkbox } from "~/components/ui/checkbox";

import { Field } from "~/components/ui/field";
import { transformText } from "~/features/tools/text/text-transformer/useTextTransformer";
const unicode = ref(true);
const input = ref("");
const result = computed(() => {
  try {
    if (input.value.length > 200_000) throw new Error("Use fewer than 200,000 characters.");
    return {
      output: input.value
        .split(/\r?\n/)
        .map(
          (line) =>
            transformText(line, "slug", {
              operation: "slug",
              insensitive: false,
              trim: true,
              descending: false,
              keepEmpty: true,
              unicode: unicode.value,
            }).output,
        )
        .join("\n"),
      error: "",
    };
  } catch (e) {
    return { output: "", error: (e as Error).message };
  }
});
const output = computed(() => result.value.output);
const { copyText } = useCopyToClipboard();
</script>
<template>
  <ToolWorkspace>
    <div class="grid gap-5 @[48rem]:grid-cols-2">
      <Field
        v-slot="{ controlProps }"
        label="Input"
        :error="result.error || undefined"
        class="min-w-0"
        ><Textarea
          v-bind="controlProps"
          v-model="input"
          class="w-full"
          :rows="12"
          placeholder="One title per line…"
        ></Textarea></Field
      ><Field
        v-slot="{ controlProps }"
        label="Output"
        class="min-w-0"
        ><Textarea
          v-bind="controlProps"
          class="w-full"
          :model-value="output"
          :rows="12"
          readonly
          placeholder="slug-output"
        ></Textarea
      ></Field>
      <Checkbox
        v-model="unicode"
        label="Preserve non-Latin letters"
      /><ToolActions class="@[48rem]:col-span-2">
        <Button
          :disabled="!output"
          color="secondary"
          variant="outline"
          @click="copyText(output)"
          ><Icon
            name="tabler:copy"
            mode="svg"
            class="mr-1.5"
            aria-hidden="true"
          />Copy slugs</Button
        >
      </ToolActions>
    </div>
  </ToolWorkspace>
</template>
