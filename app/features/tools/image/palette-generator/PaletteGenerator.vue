<script setup lang="ts">
import { clampRgb, converter, formatHex, parse } from "culori";
import Textarea from "~/components/adapters/Textarea.vue";
import ToolActions from "~/components/product/ToolActions.vue";
import ToolWorkspace from "~/components/product/ToolWorkspace.vue";
import { Button } from "~/components/ui/button";
import { Field } from "~/components/ui/field";
import { Input } from "~/components/ui/input";
import { Select } from "~/components/ui/select";
import { relativeLuminance } from "~/utils/browser-tools";
const color = ref("#3b82f6");
const harmony = ref("tones");
const palette = computed(() => {
  const parsed = parse(color.value);
  if (!parsed) return [];
  const base = converter("oklch")(parsed);
  return [0, 1, 2, 3, 4].map((index) => {
    const value =
      harmony.value === "tones"
        ? { ...base, l: [0.94, 0.78, base.l, 0.4, 0.23][index]! }
        : {
            ...base,
            l: harmony.value === "complement" ? [0.85, 0.72, base.l, 0.42, 0.3][index]! : base.l,
            h:
              (base.h ?? 0) +
              (harmony.value === "complement" ? (index % 2) * 180 : index * 30 - 60),
          };
    return formatHex(clampRgb(value));
  });
});
const { copyText } = useCopyToClipboard();
const css = computed(() =>
  palette.value.map((value, index) => `--color-${index + 1}: ${value};`).join("\n"),
);
</script>
<template>
  <ToolWorkspace
    ><div class="grid gap-4 @[30rem]:grid-cols-2">
      <Field
        label="Base color"
        :error="palette.length ? undefined : 'Enter a valid CSS color.'"
        ><Input
          v-model="color"
          class="w-full"
          placeholder="#3b82f6" /></Field
      ><Field label="Palette style"
        ><Select
          v-model="harmony"
          class="w-full"
          :options="[
            { value: 'tones', label: 'Light to dark tones' },
            { value: 'analogous', label: 'Analogous hues' },
            { value: 'complement', label: 'Complementary pair' },
          ]"
      /></Field>
    </div>
    <div class="grid grid-cols-2 gap-3 @[40rem]:grid-cols-5">
      <section
        v-for="(tone, index) in palette"
        :key="index"
        class="min-w-0"
      >
        <div
          class="grid min-h-40 place-items-center rounded-lg p-3 font-mono text-sm"
          :style="{
            background: tone,
            color: relativeLuminance(tone) > 0.179 ? '#111111' : '#ffffff',
          }"
        >
          {{ tone }}
        </div>
        <Button
          class="mt-3 w-full"
          color="secondary"
          variant="outline"
          :aria-label="`Copy color ${index + 1}`"
          @click="copyText(tone)"
          >Copy color</Button
        >
      </section>
    </div>
    <Field
      v-slot="{ controlProps }"
      label="CSS variables"
      ><Textarea
        v-bind="controlProps"
        :model-value="css"
        readonly
        language="css"
        :rows="6"
        class="w-full"
    /></Field>
    <p class="text-muted-foreground text-xs">
      OKLCH tones are mapped into displayable sRGB. Check contrast for your intended text and
      background pairs.
    </p>
    <ToolActions
      ><Button
        color="secondary"
        variant="outline"
        :disabled="!palette.length"
        @click="copyText(palette.join('\n'))"
        >Copy palette</Button
      ><Button
        color="secondary"
        variant="outline"
        :disabled="!css"
        @click="copyText(css)"
        >Copy CSS variables</Button
      ></ToolActions
    ></ToolWorkspace
  >
</template>
