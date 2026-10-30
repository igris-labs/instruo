<script setup lang="ts">
import StatusMessage from "~/components/adapters/StatusMessage.vue";
import Textarea from "~/components/adapters/Textarea.vue";
import ToolActions from "~/components/product/ToolActions.vue";
import ToolWorkspace from "~/components/product/ToolWorkspace.vue";
import { Button } from "~/components/ui/button";
import { Field } from "~/components/ui/field";
import { useToolTask } from "~/features/tools/useToolTask";
import { downloadBlob } from "~/utils/browser-tools";
const source = ref(
  "flowchart TD\n  Start[Start] --> Review{Ready?}\n  Review -->|Yes| Ship[Ship]\n  Review -->|No| Start",
);
const colorMode = useColorMode();
const { output: rendered, error, busy, run } = useToolTask([source, () => colorMode.value]);
const id = useId().replace(/[^a-z0-9]/gi, "");
function render() {
  return run(async () => {
    const text = source.value;
    if (text.length > 20_000) throw new Error("Use a diagram shorter than 20,000 characters.");
    const [{ default: mermaid }, { default: purify }] = await Promise.all([
      import("mermaid"),
      import("dompurify"),
    ]);
    mermaid.initialize({
      startOnLoad: false,
      securityLevel: "strict",
      theme: colorMode.value === "dark" ? "dark" : "neutral",
      maxTextSize: 20000,
      maxEdges: 200,
      htmlLabels: false,
      suppressErrorRendering: true,
    });
    const result = await mermaid.render(`diagram${id}`, text);
    return purify.sanitize(result.svg, {
      USE_PROFILES: { svg: true, svgFilters: true },
      FORBID_TAGS: ["foreignObject", "script", "iframe"],
    });
  });
}
watch(
  () => colorMode.value,
  () => {
    void render();
  },
);
onMounted(() => {
  void render();
});
const { copyText } = useCopyToClipboard();
function download() {
  if (rendered.value)
    downloadBlob(new Blob([rendered.value], { type: "image/svg+xml" }), "diagram.svg");
}
</script>
<template>
  <ToolWorkspace
    ><div class="grid items-start gap-5 @[48rem]:grid-cols-2">
      <Field
        v-slot="{ controlProps }"
        label="Mermaid source"
        ><Textarea
          v-bind="controlProps"
          v-model="source"
          language="mermaid"
          :rows="12"
          class="h-80 w-full @[48rem]:h-96"
      /></Field>
      <Field
        label="Preview"
        class="min-w-0"
      >
        <p class="text-muted-foreground mb-2 flex min-h-6 items-center text-xs">Rendered diagram</p>
        <section
          aria-label="Diagram preview"
          class="bg-muted/20 h-80 min-w-0 overflow-auto rounded-lg p-5 @[48rem]:h-96"
        >
          <p
            v-if="busy"
            class="text-muted-foreground text-sm"
          >
            Rendering locally…
          </p>
          <div
            v-else-if="rendered"
            class="grid h-full place-items-center [&_svg]:mx-auto [&_svg]:h-full [&_svg]:max-h-full [&_svg]:max-w-full"
            v-html="rendered"
          />
          <p
            v-else
            class="text-muted-foreground text-sm"
          >
            Click Render diagram after editing.
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
      Real Mermaid diagrams, rendered locally in strict mode. Up to 20,000 characters and 200 edges;
      no remote renderer or saved account.
    </p>
    <ToolActions
      ><Button
        color="secondary"
        variant="outline"
        :disabled="!rendered || busy"
        @click="download"
        >Download SVG</Button
      ><Button
        color="secondary"
        variant="outline"
        :disabled="!source"
        @click="copyText(source)"
        >Copy source</Button
      ><Button
        :disabled="busy || !source"
        @click="render"
        >{{ busy ? "Rendering…" : "Render diagram" }}</Button
      ></ToolActions
    ></ToolWorkspace
  >
</template>
