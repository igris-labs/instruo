<script setup lang="ts">
import ToolWorkspace from "~/components/product/ToolWorkspace.vue";
import { Button } from "~/components/ui/button";
import { Field } from "~/components/ui/field";
import { Input, inputVariants } from "~/components/ui/input";
import { useColorConverter } from "./useColorConverter";
const { input, result, error } = useColorConverter();
const { copyText } = useCopyToClipboard();
</script>
<template>
  <ToolWorkspace>
    <div class="grid gap-6 @[48rem]:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
      <section
        class="grid content-start gap-5"
        aria-label="Color input and preview"
      >
        <Field
          label="Color"
          description="Paste HEX, RGB, HSL, OKLCH, LCH, Display P3, or a CSS color name."
          :error="error || undefined"
          ><Input
            v-model="input"
            class="w-full font-mono"
            placeholder="oklch(70% 0.18 45)"
            spellcheck="false"
        /></Field>
        <div
          class="border-border relative min-h-52 overflow-hidden rounded-lg border bg-white"
          role="img"
          :aria-label="result ? `Color preview: ${input}` : 'No valid color to preview'"
        >
          <div class="absolute inset-y-0 right-0 w-1/2 bg-neutral-300" />
          <div
            class="absolute inset-0"
            :style="{ backgroundColor: result?.css ?? 'transparent' }"
          />
        </div>
        <div class="flex items-center justify-between gap-4">
          <Field
            v-slot="{ controlProps }"
            label="Pick a color"
            ><input
              v-bind="controlProps"
              type="color"
              :value="result?.hex ?? '#000000'"
              class="h-9 w-16 cursor-pointer p-1"
              :class="inputVariants({ size: 'sm' }).root()"
              @input="input = ($event.target as HTMLInputElement).value"
          /></Field>
          <p class="text-muted-foreground text-right text-xs">
            Alpha {{ Math.round((result?.alpha ?? 1) * 100) }}%<br />{{
              result?.inSrgb
                ? "Within sRGB gamut"
                : result
                  ? "Outside sRGB gamut"
                  : "Waiting for a color"
            }}
          </p>
        </div>
        <div
          class="flex flex-wrap gap-2"
          role="group"
          aria-label="Example colors"
        >
          <Button
            v-for="sample in [
              '#f97316',
              'rebeccapurple',
              'oklch(70% 0.15 160)',
              'rgb(40 120 220 / 50%)',
            ]"
            :key="sample"
            color="secondary"
            variant="outline"
            @click="input = sample"
            ><span
              class="mr-1.5 size-3 rounded-full ring-1 ring-black/10 dark:ring-white/10"
              :style="{ backgroundColor: sample }"
            />Try
            {{
              sample.startsWith("#")
                ? "HEX"
                : sample.startsWith("oklch")
                  ? "OKLCH"
                  : sample.startsWith("rgb")
                    ? "alpha"
                    : "named"
            }}</Button
          >
        </div>
        <p
          v-if="result && !result.inSrgb"
          class="text-warning text-sm"
        >
          HEX, RGB, and HSL are clipped to sRGB. Wide-gamut formats keep the original color.
        </p>
      </section>
      <section
        class="border-border overflow-hidden rounded-lg border"
        aria-label="Color formats"
      >
        <header
          class="bg-muted/25 border-border flex items-center justify-between gap-4 border-b px-5 py-4"
        >
          <h2 class="font-semibold">Color values</h2>
          <Button
            color="secondary"
            variant="outline"
            :disabled="!result"
            @click="
              copyText(
                result?.formats.map((item) => `${item.label}: ${item.value}`).join('\n') ?? '',
              )
            "
            >Copy all</Button
          >
        </header>
        <dl>
          <div
            v-for="item in result?.formats ??
            ['HEX', 'RGB', 'HSL', 'OKLCH', 'LCH', 'OKLAB', 'LAB', 'Display P3'].map((label) => ({
              label,
              value: '—',
            }))"
            :key="item.label"
            class="border-border grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 border-b px-5 py-4 last:border-0"
          >
            <div class="min-w-0">
              <dt class="text-muted-foreground text-xs font-medium">{{ item.label }}</dt>
              <dd class="mt-1.5 font-mono text-sm break-words">{{ item.value }}</dd>
            </div>
            <Button
              color="secondary"
              variant="ghost"
              :aria-label="`Copy ${item.label}`"
              :disabled="!result"
              @click="copyText(item.value)"
              ><Icon name="tabler:copy"
            /></Button>
          </div>
        </dl>
      </section>
    </div>
  </ToolWorkspace>
</template>
