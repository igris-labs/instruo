<script setup lang="ts">
import { formatHex, parse } from "culori";
import Textarea from "~/components/adapters/Textarea.vue";
import ToolActions from "~/components/product/ToolActions.vue";
import ToolWorkspace from "~/components/product/ToolWorkspace.vue";
import { Button } from "~/components/ui/button";
import { Field } from "~/components/ui/field";
import { Input } from "~/components/ui/input";
import { relativeLuminance } from "~/utils/browser-tools";
const title = ref("A clear title for your page");
const description = ref("A short description that earns the click.");
const color = ref("#17324c");
const url = ref("https://example.com");
const imageUrl = ref("");
const background = computed(() => {
  const parsed = parse(color.value);
  return parsed ? formatHex(parsed) : "#17324c";
});
function escape(text: string) {
  return text.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
}
const validUrl = computed(() => {
  try {
    return [url.value, ...(imageUrl.value ? [imageUrl.value] : [])].every((value) =>
      ["https:", "http:"].includes(new URL(value).protocol),
    );
  } catch {
    return false;
  }
});
const output = computed(() =>
  validUrl.value
    ? Object.entries({
        title: title.value,
        description: description.value,
        url: url.value,
        type: "website",
        ...(imageUrl.value ? { image: imageUrl.value } : {}),
      })
        .map(([key, value]) => `<meta property="og:${key}" content="${escape(value)}">`)
        .join("\n")
    : "",
);
const { copyText } = useCopyToClipboard();
</script>
<template>
  <ToolWorkspace
    ><div class="grid items-start gap-6 @[48rem]:grid-cols-2">
      <div class="grid gap-4">
        <Field
          label="Page title"
          :description="`${title.length} characters`"
          ><Input
            v-model="title"
            class="w-full" /></Field
        ><Field
          v-slot="{ controlProps }"
          label="Description"
          :description="`${description.length} characters`"
          ><Textarea
            v-bind="controlProps"
            v-model="description"
            :rows="4"
            class="w-full" /></Field
        ><Field
          label="Page URL"
          :error="validUrl ? undefined : 'Use an http or https URL.'"
          ><Input
            v-model="url"
            class="w-full" /></Field
        ><Field
          label="Image URL (optional)"
          description="Included in the tags but not fetched."
          ><Input
            v-model="imageUrl"
            class="w-full" /></Field
        ><Field label="Preview background"
          ><Input
            v-model="color"
            class="w-full"
        /></Field>
      </div>
      <div>
        <p class="text-muted-foreground mb-3 text-xs">
          Illustrative social card. Real platforms may crop or truncate content differently.
        </p>
        <article
          class="grid aspect-[1.91] min-w-0 content-end gap-2 overflow-hidden rounded-lg p-6"
          :style="{
            background,
            color: relativeLuminance(background) > 0.179 ? '#111111' : '#ffffff',
          }"
        >
          <h2 class="line-clamp-3 text-2xl font-semibold break-words">{{ title }}</h2>
          <p class="line-clamp-3 text-sm break-words">{{ description }}</p>
        </article>
      </div>
    </div>
    <Field
      v-slot="{ controlProps }"
      label="Open Graph tags"
      ><Textarea
        v-bind="controlProps"
        :model-value="output"
        readonly
        language="html"
        :rows="7"
        class="w-full" /></Field
    ><ToolActions
      ><Button
        color="secondary"
        variant="outline"
        :disabled="!output"
        @click="copyText(output)"
        >Copy meta tags</Button
      ></ToolActions
    ></ToolWorkspace
  >
</template>
