<script setup lang="ts">
import StatusMessage from "~/components/adapters/StatusMessage.vue";
import Textarea from "~/components/adapters/Textarea.vue";
import ToolActions from "~/components/product/ToolActions.vue";
import ToolWorkspace from "~/components/product/ToolWorkspace.vue";
import { Button } from "~/components/ui/button";
import { Field } from "~/components/ui/field";
import { Input } from "~/components/ui/input";
import { useToolTask } from "~/features/tools/useToolTask";
import { downloadBlob } from "~/utils/browser-tools";
const input = ref(
  '<svg viewBox="0 0 24 24"><path d="M4 4h16v16H4z"/></svg>\n<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8"/></svg>',
);
const prefix = ref("icon");
const { output, error, busy, run } = useToolTask([input, prefix]);
const { copyText } = useCopyToClipboard();
function generate() {
  return run(async () => {
    const source = input.value;
    const namespace = prefix.value;
    if (source.length > 200_000) throw new Error("Use SVG markup shorter than 200,000 characters.");
    if (!/^[a-z_][\w.-]*$/i.test(namespace))
      throw new Error(
        "Use a prefix starting with a letter or underscore, then letters, digits, periods, hyphens or underscores.",
      );
    const doc = new DOMParser().parseFromString(
      `<root>${source.replace(/^\s*<\?xml[^?]*\?>/gm, "")}</root>`,
      "application/xml",
    );
    if (doc.querySelector("parsererror")) throw new Error("Paste complete valid SVG elements.");
    const icons = Array.from(doc.documentElement.children);
    if (!icons.length || icons.length > 100 || icons.some((icon) => icon.localName !== "svg"))
      throw new Error("Paste 1–100 complete SVG elements, one after another.");
    const [{ optimize }, { default: purify }] = await Promise.all([
      import("svgo/browser"),
      import("dompurify"),
    ]);
    const result = document.implementation.createDocument("http://www.w3.org/2000/svg", "svg");
    for (const [index, icon] of icons.entries()) {
      const id = `${namespace}-${index + 1}`;
      const cleaned = purify.sanitize(new XMLSerializer().serializeToString(icon), {
        USE_PROFILES: { svg: true, svgFilters: true },
        FORBID_TAGS: ["script", "foreignObject"],
      });
      const optimized = optimize(cleaned, {
        plugins: [{ name: "prefixIds", params: { prefix: id } }],
      }).data;
      const svg = new DOMParser().parseFromString(optimized, "image/svg+xml").documentElement;
      const symbol = result.createElementNS("http://www.w3.org/2000/svg", "symbol");
      symbol.setAttribute("id", id);
      for (const attribute of Array.from(svg.attributes))
        if (!["id", "xmlns", "width", "height"].includes(attribute.name))
          symbol.setAttribute(attribute.name, attribute.value);
      for (const child of Array.from(svg.childNodes)) symbol.append(result.importNode(child, true));
      result.documentElement.append(symbol);
    }
    return new XMLSerializer().serializeToString(result);
  });
}
function download() {
  if (output.value) downloadBlob(new Blob([output.value], { type: "image/svg+xml" }), "sprite.svg");
}
onMounted(generate);
</script>
<template>
  <ToolWorkspace
    ><Field label="ID prefix"
      ><Input
        v-model="prefix"
        class="w-full"
    /></Field>
    <div class="grid gap-5 @[48rem]:grid-cols-2">
      <Field
        v-slot="{ controlProps }"
        label="SVG files"
        description="Complete SVG elements, one after another."
        ><Textarea
          v-bind="controlProps"
          v-model="input"
          language="xml"
          :rows="14"
          class="w-full" /></Field
      ><Field
        v-slot="{ controlProps }"
        label="Sprite output"
        ><Textarea
          v-bind="controlProps"
          :model-value="output"
          language="xml"
          :rows="14"
          readonly
          class="w-full"
      /></Field>
    </div>
    <StatusMessage
      v-if="error"
      tone="error"
      title="Check SVG markup"
      :description="error"
    />
    <p class="text-muted-foreground text-xs">
      Each icon gets a unique symbol and prefixed internal IDs. Preserve each icon's viewBox. Embed
      with &lt;svg&gt;&lt;use href="#icon-1" /&gt;&lt;/svg&gt; for an inline sprite.
    </p>
    <ToolActions
      ><Button
        color="secondary"
        variant="outline"
        :disabled="!output"
        @click="download"
        >Download SVG</Button
      ><Button
        color="secondary"
        variant="outline"
        :disabled="!output"
        @click="copyText(output)"
        >Copy sprite</Button
      ><Button
        :disabled="busy"
        @click="generate"
        >{{ busy ? "Building…" : "Build sprite" }}</Button
      ></ToolActions
    ></ToolWorkspace
  >
</template>
