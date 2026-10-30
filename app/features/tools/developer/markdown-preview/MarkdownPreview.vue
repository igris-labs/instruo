<script setup lang="ts">
import StatusMessage from "~/components/adapters/StatusMessage.vue";
import Textarea from "~/components/adapters/Textarea.vue";
import ToolActions from "~/components/product/ToolActions.vue";
import ToolWorkspace from "~/components/product/ToolWorkspace.vue";
import { Button } from "~/components/ui/button";
import { Field } from "~/components/ui/field";
import { useToolTask } from "~/features/tools/useToolTask";
import { downloadBlob } from "~/utils/browser-tools";
const input = ref(
  "# Hello\n\nWrite **Markdown** here.\n\n- A list\n- With links and code\n\n| Name | Role |\n| --- | --- |\n| Ada | Engineer |",
);
const { output: rendered, error, busy, run } = useToolTask([input]);
let ready = false;
let timer: ReturnType<typeof setTimeout> | undefined;
function render() {
  return run(async () => {
    if (input.value.length > 200_000)
      throw new Error("Use Markdown shorter than 200,000 characters.");
    const source = input.value;
    const [{ marked }, { default: purify }] = await Promise.all([
      import("marked"),
      import("dompurify"),
    ]);
    return purify.sanitize(await marked.parse(source), {
      USE_PROFILES: { html: true },
      FORBID_TAGS: ["img", "iframe", "object", "embed", "style", "video", "audio", "source"],
    });
  });
}
watch(input, () => {
  clearTimeout(timer);
  if (ready) timer = setTimeout(render, 200);
});
onMounted(() => {
  ready = true;
  void render();
});
onBeforeUnmount(() => clearTimeout(timer));
const { copyText } = useCopyToClipboard();
function download() {
  if (rendered.value)
    downloadBlob(new Blob([rendered.value], { type: "text/html" }), "preview.html");
}
</script>
<template>
  <ToolWorkspace
    ><div class="grid items-start gap-5 @[48rem]:grid-cols-2">
      <Field
        v-slot="{ controlProps }"
        label="Markdown"
        ><Textarea
          v-bind="controlProps"
          v-model="input"
          language="md"
          :rows="12"
          class="h-80 w-full"
      /></Field>
      <Field
        label="Preview"
        class="min-w-0"
      >
        <p class="text-muted-foreground mb-2 flex min-h-6 items-center text-xs">
          Rendered Markdown
        </p>
        <section
          aria-label="Markdown preview"
          class="bg-muted/20 h-80 min-w-0 overflow-auto rounded-lg p-5"
        >
          <p
            v-if="busy"
            class="text-muted-foreground text-sm"
          >
            Rendering locally…
          </p>
          <div
            v-else-if="rendered"
            class="[&_pre]:bg-muted [&_td]:border-border [&_th]:border-border space-y-4 break-words [&_a]:underline [&_code]:font-mono [&_h1]:text-3xl [&_h1]:font-semibold [&_h2]:text-2xl [&_h2]:font-semibold [&_h3]:text-xl [&_h3]:font-semibold [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:leading-7 [&_pre]:overflow-auto [&_pre]:rounded-md [&_pre]:p-4 [&_table]:w-full [&_td]:border [&_td]:p-2 [&_th]:border [&_th]:p-2 [&_ul]:list-disc [&_ul]:pl-5"
            v-html="rendered"
          />
          <p
            v-else
            class="text-muted-foreground text-sm"
          >
            Preview appears here.
          </p>
        </section>
      </Field>
    </div>
    <StatusMessage
      v-if="error"
      tone="error"
      title="Could not render preview"
      :description="error"
    />
    <p class="text-muted-foreground text-xs">
      GitHub-flavored Markdown with sanitized HTML. External images and embedded media are disabled
      to avoid fetching your input's URLs.
    </p>
    <ToolActions
      ><Button
        color="secondary"
        variant="outline"
        :disabled="!rendered || busy"
        @click="download"
        >Download HTML</Button
      ><Button
        color="secondary"
        variant="outline"
        :disabled="!input"
        @click="copyText(input)"
        >Copy source</Button
      ></ToolActions
    ></ToolWorkspace
  >
</template>
